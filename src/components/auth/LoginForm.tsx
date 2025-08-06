"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthActionResponse } from "@/types";
import { loginAction } from "@/app/actions";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Initial form state
const initialState: AuthActionResponse = {
  success: false,
  message: "",
};

// Submit Button Component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Logging in..." : "Log In"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();

  // Extract errors from state
  const errors: FormErrors = {};
  if (state?.error) {
    errors.general = state.error;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

      <form action={formAction} className="space-y-4">
        {/* Show session expired message */}
        {searchParams.get("expired") === "true" && (
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            Your session has expired. Please log in again.
          </div>
        )}

        {errors.general && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            error={errors.email}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            error={errors.password}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <SubmitButton />
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
