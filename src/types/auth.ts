import { User } from "./user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Response interface for auth actions
 */
export interface AuthActionResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
  requiresEmailVerification?: boolean;
  onboardingComplete?: boolean;
  currentStep?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface BackendAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
