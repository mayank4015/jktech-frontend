"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle errors
 * Specifically handles 401 Unauthorized errors by redirecting to login
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo): Promise<string> {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Check if it's an unauthorized error
    if (
      error.message.includes("401") ||
      error.message.includes("unauthorized") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("session expired") ||
      error.message.includes("not logged in")
    ) {
      // Log the user out and redirect to login page
      await logoutAction();
      return "Your session has expired. Please log in again.";
    }
    return "message" in error && error.message
      ? error.message
      : "An unexpected error occurred";
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if it's an unauthorized error
      const isAuthError =
        this.state.error?.message.includes("401") ||
        this.state.error?.message.includes("unauthorized") ||
        this.state.error?.message.includes("Unauthorized") ||
        this.state.error?.message.includes("session expired") ||
        this.state.error?.message.includes("not logged in");

      if (isAuthError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
            <div className="bg-red-900/20 p-8 rounded-lg border border-red-800/30 max-w-md w-full text-center">
              <h2 className="text-xl font-semibold mb-4">Session Expired</h2>
              <p className="mb-6 text-gray-300">
                Your session has expired or you are not authorized to access
                this page. You will be redirected to the login page.
              </p>
              <div className="animate-pulse">Redirecting to login...</div>
            </div>
          </div>
        );
      }

      // For other errors, use the provided fallback or a default error message
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
            <div className="bg-red-900/20 p-8 rounded-lg border border-red-800/30 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                Something went wrong
              </h2>
              <p className="mb-6 text-gray-300">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
