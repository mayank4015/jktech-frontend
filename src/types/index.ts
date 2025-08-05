// Re-export all types from their respective modules
export * from "./auth";
export * from "./common";
export * from "./user";
export * from "./document";
export * from "./ingestion";
export * from "./qa";

// Legacy AuthState interface for backward compatibility
export interface AuthState {
  user: import("./user").User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form validation types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
