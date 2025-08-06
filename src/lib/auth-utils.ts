/**
 * Utility functions for authentication
 */

import { config } from "@/config/env";

export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${config.api.baseUrl}/auth/me`, {
      method: "GET",
      credentials: "include", // This will send the HTTP-only cookie
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        isAuthenticated: true,
        user: userData,
      };
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
  }

  return {
    isAuthenticated: false,
    user: null,
  };
};

export const logoutUser = async () => {
  try {
    await fetch(`${config.api.baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
