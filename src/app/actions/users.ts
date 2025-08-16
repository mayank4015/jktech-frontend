"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { config } from "@/config/env";
import { User, UserFilters } from "@/types/user";
import { PaginatedResponse } from "@/types/common";
import { getAuthHeaders } from "./auth";

export interface UserActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: User;
}

// Fetch users (for server component)
export async function fetchUsers(
  page: number = 1,
  limit: number = 10,
  filters: UserFilters = {}
): Promise<PaginatedResponse<User>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) {
      params.append("search", filters.search);
    }

    if (filters.role && filters.role !== "all") {
      params.append("role", filters.role);
    }

    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }

    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }
    const response = await fetch(
      `${config.api.baseUrl}/users?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Create user action
export async function createUserAction(
  prevState: UserActionResponse | null,
  formData: FormData
): Promise<UserActionResponse> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "admin" | "editor" | "viewer";

  // Basic validation
  if (!name || !email || !password || !role) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    };
  }

  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }
    const response = await fetch(`${config.api.baseUrl}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to create user",
      };
    }

    const data = await response.json();

    // Revalidate the users page to show the new user
    revalidatePath("/users");

    return {
      success: true,
      message: "User created successfully",
      data: data.user,
    };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Update user action
export async function updateUserAction(
  userId: string,
  prevState: UserActionResponse | null,
  formData: FormData
): Promise<UserActionResponse> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "admin" | "editor" | "viewer";
  const status = formData.get("status") as "active" | "inactive";

  // Basic validation
  if (!name || !email || !role) {
    return {
      success: false,
      error: "Name, email, and role are required",
    };
  }

  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }
    const response = await fetch(`${config.api.baseUrl}/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ name, email, role, status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to update user",
      };
    }

    const data = await response.json();

    // Revalidate the users page to show the updated user
    revalidatePath("/users");

    return {
      success: true,
      message: "User updated successfully",
      data: data,
    };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Delete user action
export async function deleteUserAction(
  userId: string
): Promise<UserActionResponse> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }
    const response = await fetch(`${config.api.baseUrl}/users/${userId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to delete user",
      };
    }

    // Revalidate the users page to remove the deleted user
    revalidatePath("/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Toggle user status action
export async function toggleUserStatusAction(
  userId: string
): Promise<UserActionResponse> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }
    const response = await fetch(
      `${config.api.baseUrl}/users/${userId}/toggle-status`,
      {
        method: "PUT",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to toggle user status",
      };
    }

    const data = await response.json();

    // Revalidate the users page to show the updated status
    revalidatePath("/users");

    // If backend returns { user: ... }, use data.user, else use data
    let userObj = data.user ? data.user : data;
    // Normalize status to 'active'/'inactive' string for frontend
    userObj = {
      ...userObj,
      status:
        userObj.status === true
          ? "active"
          : userObj.status === false
            ? "inactive"
            : userObj.status,
    };

    return {
      success: true,
      message: `User ${userObj.status === "active" ? "activated" : "deactivated"} successfully`,
      data: userObj,
    };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Search/filter users action (for URL-based filtering)
export async function searchUsersAction(formData: FormData) {
  const search = formData.get("search") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;
  const sortBy = formData.get("sortBy") as string;
  const sortOrder = formData.get("sortOrder") as string;

  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (role && role !== "all") params.set("role", role);
  if (status && status !== "all") params.set("status", status);
  if (sortBy) params.set("sortBy", sortBy);
  if (sortOrder) params.set("sortOrder", sortOrder);

  const queryString = params.toString();
  redirect(`/users${queryString ? `?${queryString}` : ""}`);
}
