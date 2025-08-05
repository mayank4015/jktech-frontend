"use client";

import React from "react";
import { User } from "@/types/user";
import { Table, TableColumn, Button } from "@/components/ui";

export interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onSort?: (key: string, order: "asc" | "desc") => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onSort,
  sortKey,
  sortOrder,
}: UserTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: TableColumn<User>[] = [
    {
      key: "avatar",
      title: "",
      width: "60px",
      render: (_, user) => (
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              className="h-10 w-10 rounded-full"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (_, user) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
      render: (role) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            role === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {role === "admin" ? "Administrator" : "User"}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (isActive) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      title: "Last Login",
      sortable: true,
      render: (lastLoginAt) => (
        <div className="text-sm text-gray-900">
          {lastLoginAt ? formatDate(lastLoginAt) : "Never"}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (createdAt) => (
        <div className="text-sm text-gray-900">{formatDate(createdAt)}</div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "200px",
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-700"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            className={
              user.isActive
                ? "text-orange-600 hover:text-orange-700"
                : "text-green-600 hover:text-green-700"
            }
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      loading={loading}
      onSort={onSort}
      sortKey={sortKey}
      sortOrder={sortOrder}
      emptyText="No users found"
    />
  );
}
