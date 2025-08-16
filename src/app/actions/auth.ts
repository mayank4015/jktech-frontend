"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { config } from "@/config/env";
import { User } from "@/types/user";
import { AuthActionResponse } from "@/types";

// In-memory cache to prevent concurrent refresh attempts
const refreshInProgress = new Map<
  string,
  Promise<Record<string, string> | null>
>();

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface AuthActionState {
  success: boolean;
  error?: AuthError;
  data?: AuthResponse;
}

export async function registerAction(
  prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Basic validation
  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      error: { message: "All fields are required" },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: { message: "Passwords don't match", field: "confirmPassword" },
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: {
        message: "Password must be at least 8 characters",
        field: "password",
      },
    };
  }

  try {
    const response = await fetch(`${config.api.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          message:
            errorData.message ||
            "Registration failed. This email may already be in use.",
        },
      };
    }

    const data: AuthResponse = await response.json();

    // Set cookies from the backend response
    const cookieStore = await cookies();

    // Extract and set cookies from the backend response
    const setCookieHeaders = response.headers.get("set-cookie");
    if (setCookieHeaders) {
      // Parse Set-Cookie headers and set them in Next.js
      const cookies_from_backend = setCookieHeaders
        .split(",")
        .map((cookie) => cookie.trim());

      for (const cookieString of cookies_from_backend) {
        const [nameValue] = cookieString.split(";").map((part) => part.trim());
        const [name, value] = nameValue.split("=", 2);

        if (name === "refresh_token") {
          cookieStore.set({
            name: "refresh_token",
            value: value,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days to match backend
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          });
        }
      }
    }

    // Set access token cookie
    cookieStore.set({
      name: "access_token",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour to match backend JWT expiration
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    // Redirect to dashboard on successful registration
    redirect("/dashboard");
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: { message: "Network error. Please try again." },
    };
  }
}

export async function loginAction(
  prevState: AuthActionResponse | null,
  formData: FormData
): Promise<AuthActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required",
      error: "Missing credentials",
    };
  }

  try {
    const response = await fetch(`${config.api.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Important for cookies
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Invalid email or password",
        error: data.message || "Authentication failed",
      };
    }
    // Set cookies from the backend response
    const cookieStore = await cookies();

    // Extract and set cookies from the backend response
    const setCookieHeaders = response.headers.get("set-cookie");
    if (setCookieHeaders) {
      // Parse Set-Cookie headers and set them in Next.js
      const cookies_from_backend = setCookieHeaders
        .split(",")
        .map((cookie) => cookie.trim());

      for (const cookieString of cookies_from_backend) {
        const [nameValue] = cookieString.split(";").map((part) => part.trim());
        const [name, value] = nameValue.split("=", 2);

        if (name === "refresh_token") {
          cookieStore.set({
            name: "refresh_token",
            value: value,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days to match backend
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          });
        }
      }
    }

    // Set access token cookie
    cookieStore.set({
      name: "access_token",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour to match backend JWT expiration
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    // Redirect to dashboard on successful login
    redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during login",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await fetch(`${config.api.baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Clear cookies on the frontend as well
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  redirect("/login");
}

// Server-side authentication utilities
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Use the auth headers function that handles token refresh
    const headers = await getAuthHeadersOrNull();

    if (!headers) {
      return null;
    }

    // Try to get user data from backend
    const response = await fetch(`${config.api.baseUrl}/auth/me`, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const userRes = await response.json();
      const userData = userRes.user;
      const role = userData.role;

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        avatar: userData.avatar,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get auth headers for server actions with automatic token refresh
 * This is the ONLY place where token refresh should happen for server actions
 * since middleware doesn't run for server actions
 */
export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // If we have an access token, try to use it first
  if (accessToken) {
    // Test if the access token is still valid by making a quick request
    try {
      const testResponse = await fetch(`${config.api.baseUrl}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (testResponse.ok) {
        // Token is valid, return headers
        return {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: cookieStore.toString(),
        };
      }
    } catch {
      console.log("Access token validation failed, attempting refresh...");
    }
  }

  // Access token is invalid/expired or missing, try to refresh
  if (refreshToken) {
    // Check if there's already a refresh in progress for this token
    if (refreshInProgress.has(refreshToken)) {
      console.log("[REFRESH] Refresh already in progress, waiting...");
      try {
        // Wait for the existing refresh to complete
        const result = await refreshInProgress.get(refreshToken);
        return result ?? null;
      } catch {
        console.log("[REFRESH] Existing refresh failed, starting new one");
        refreshInProgress.delete(refreshToken);
      }
    }
  }

  // Both access token and refresh token are invalid/missing
  return null;
}

/**
 * Alias for getAuthHeaders - same functionality
 * Returns null if no valid token is available instead of redirecting
 */
export async function getAuthHeadersOrNull(): Promise<Record<
  string,
  string
> | null> {
  return getAuthHeaders();
}
