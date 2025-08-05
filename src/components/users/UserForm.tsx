"use client";

import React, { useState, useEffect } from "react";
import { User, CreateUserData, UpdateUserData } from "@/types/user";
import { Input, Select, Button, Modal } from "@/components/ui";

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  user?: User | null;
  loading?: boolean;
  title?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  loading = false,
  title,
}: UserFormProps) {
  const isEditing = !!user;
  const modalTitle = title || (isEditing ? "Edit User" : "Create New User");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: "", // Don't populate password for editing
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "user",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await onSubmit(createData);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
          disabled={isSubmitting || loading}
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          disabled={isSubmitting || loading}
        />

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            error={errors.password}
            placeholder="Enter password (min. 6 characters)"
            disabled={isSubmitting || loading}
          />
        )}

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) =>
            handleInputChange("role", e.target.value as "admin" | "user")
          }
          error={errors.role}
          fullWidth
          disabled={isSubmitting || loading}
          options={[
            { value: "user", label: "User" },
            { value: "admin", label: "Administrator" },
          ]}
        />

        {isEditing && (
          <Select
            label="Status"
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) =>
              handleInputChange("isActive", e.target.value === "active")
            }
            fullWidth
            disabled={isSubmitting || loading}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
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
                  Password cannot be changed through this form. Use the password
                  reset feature if needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
