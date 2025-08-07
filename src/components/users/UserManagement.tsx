"use client";

import React, { useState, useTransition, useCallback } from "react";
import { User } from "@/types/user";
import { UserTable, UserFilters } from "@/components/users";
import { UserFormModal } from "./UserFormModal";
import { Button, Pagination, ConfirmModal } from "@/components/ui";
import {
  deleteUserAction,
  toggleUserStatusAction,
  searchUsersAction,
} from "@/app/actions/users";

interface UserManagementProps {
  initialUsers: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  filters: {
    search?: string;
    role?: "admin" | "editor" | "viewer" | "all";
    isActive?: boolean;
    sortBy?: "name" | "email" | "createdAt";
    sortOrder?: "asc" | "desc";
  };
}

export function UserManagement({
  initialUsers,
  totalUsers,
  currentPage,
  totalPages,
  limit,
  filters,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [currentSortKey, setCurrentSortKey] = useState<string | undefined>(
    filters.sortBy
  );
  const [currentSortOrder, setCurrentSortOrder] = useState<
    "asc" | "desc" | undefined
  >(filters.sortOrder);
  const [isPending, startTransition] = useTransition();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    startTransition(async () => {
      try {
        const result = await deleteUserAction(deletingUser.id);
        if (result.success) {
          showToast(result.message || "User deleted successfully");
          // Remove user from local state for immediate feedback
          setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        } else {
          showToast(result.error || "Failed to delete user");
        }
      } catch (error) {
        console.error("Delete user error:", error);
        showToast("An error occurred while deleting the user");
      } finally {
        // Always close the modal after the operation completes
        setDeletingUser(null);
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    startTransition(async () => {
      try {
        const result = await toggleUserStatusAction(user.id);
        if (result.success) {
          showToast(result.message || "User status updated successfully");
          // Update user in local state for immediate feedback
          if (result.data) {
            setUsers((prev) =>
              prev.map((u) => (u.id === user.id ? result.data! : u))
            );
          }
        } else {
          showToast(result.error || "Failed to update user status");
        }
      } catch (error) {
        showToast("An error occurred while updating user status");
      }
    });
  };

  const handleSort = (key: string, order: "asc" | "desc") => {
    // Sort users locally for immediate feedback
    const sortedUsers = [...users].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (key) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "role":
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setUsers(sortedUsers);
    setCurrentSortKey(key);
    setCurrentSortOrder(order);

    // Update URL parameters for persistence (optional - runs in background)
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("sortBy", key);
      params.set("sortOrder", order);

      // Update URL without page reload
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    window.location.href = `/users?${params.toString()}`;
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("limit", newLimit.toString());
    params.set("page", "1"); // Reset to first page
    window.location.href = `/users?${params.toString()}`;
  };

  const handleUserFormSubmit = useCallback(
    (updatedUser?: User) => {
      setShowUserForm(false);

      if (editingUser && updatedUser) {
        // Update the user in local state for immediate feedback
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
        );
        showToast("User updated successfully");
      } else if (updatedUser) {
        // Add new user to local state for immediate feedback
        setUsers((prev) => [updatedUser, ...prev]);
        showToast("User created successfully");
      } else {
        showToast(
          editingUser
            ? "User updated successfully"
            : "User created successfully"
        );
      }

      setEditingUser(null);
    },
    [editingUser]
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleCreateUser} disabled={isPending}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Editors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter((u) => u.role === "editor").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Viewers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter((u) => u.role === "viewer").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          startTransition(() => {
            const formData = new FormData();
            formData.append("search", newFilters.search || "");
            formData.append("role", newFilters.role || "all");
            formData.append(
              "isActive",
              newFilters.isActive?.toString() || "all"
            );
            formData.append("sortBy", newFilters.sortBy || "");
            formData.append("sortOrder", newFilters.sortOrder || "");

            searchUsersAction(formData);
          });
        }}
        onClearFilters={() => {
          startTransition(() => {
            window.location.href = "/users";
          });
        }}
        loading={isPending}
      />

      {/* Table */}
      <UserTable
        users={users}
        loading={isPending}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onSort={handleSort}
        sortKey={currentSortKey}
        sortOrder={currentSortOrder}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalUsers}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSubmit={handleUserFormSubmit}
        user={editingUser}
        loading={isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={isPending}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-40">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}
