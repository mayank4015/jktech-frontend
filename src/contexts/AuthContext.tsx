"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types/user";
import { AuthState } from "@/types/auth";
import { getAuthService } from "@/lib/mockServices/authService";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const authService = getAuthService();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();

        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login({ email, password });

      // Store token in localStorage (in real app, consider using cookies for better security)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token);
      }

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.register({ name, email, password });

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token);
      }

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  };

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();

      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
