"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { User } from "@/types/user";
import { Input, Select, Button } from "@/components/ui";
import { createUserAction, updateUserAction } from "@/app/actions/users";

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedUser?: User) => void;
  user?: User | null;
  loading?: boolean;
  title?: string;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  loading = false,
  title,
}: UserFormModalProps) {
  const isEditing = !!user;
  const modalTitle = title || (isEditing ? "Edit User" : "Create New User");
  const formRef = useRef<HTMLFormElement>(null);

  // Use server actions with useActionState
  const [createState, createAction, createPending] = useActionState(
    createUserAction,
    null
  );

  const [updateState, updateAction, updatePending] = useActionState(
    isEditing ? updateUserAction.bind(null, user.id) : createUserAction,
    null
  );

  const currentState = isEditing ? updateState : createState;
  const currentAction = isEditing ? updateAction : createAction;
  const isPending = isEditing ? updatePending : createPending;

  // Handle successful submission
  useEffect(() => {
    if (currentState?.success) {
      onSubmit(currentState.data);
      formRef.current?.reset();
    }
  }, [currentState?.success, currentState?.data, onSubmit]);

  // Get role options based on context
  const getRoleOptions = () => {
    if (isEditing) {
      return [
        { value: "admin", label: "Administrator" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ];
    } else {
      return [
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-gray-200">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {modalTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing
                ? "Update user information and permissions"
                : "Create a new user account"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending || loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Error Message */}
          {currentState?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{currentState.error}</p>
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {isEditing
                    ? "Update user account"
                    : "Create new user account"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {isEditing
                    ? "Modify user details and permissions as needed"
                    : "User will be automatically activated and can log in immediately"}
                </p>
              </div>
            </div>
          </div>

          <form ref={formRef} action={currentAction} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              defaultValue={user?.name || ""}
              placeholder="Enter full name"
              disabled={isPending || loading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              defaultValue={user?.email || ""}
              placeholder="Enter email address"
              disabled={isPending || loading}
              required
            />

            {!isEditing && (
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Enter password (min. 8 characters)"
                disabled={isPending || loading}
                required
              />
            )}

            <Select
              label="Role"
              name="role"
              defaultValue={user?.role || "editor"}
              fullWidth
              disabled={isPending || loading}
              options={getRoleOptions()}
              required
            />

            {isEditing && (
              <Select
                label="Status"
                name="isActive"
                defaultValue={user?.isActive ? "true" : "false"}
                fullWidth
                disabled={isPending || loading}
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
                required
              />
            )}

            {isEditing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Password cannot be changed through this form. Use the
                      password reset feature if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden submit button for form submission */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending || loading}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            isLoading={isPending || loading}
            disabled={isPending || loading}
            size="lg"
          >
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}
