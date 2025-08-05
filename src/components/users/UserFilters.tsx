"use client";

import React from "react";
import { UserFilters as UserFiltersType } from "@/types/user";
import { Input, Select, Button } from "@/components/ui";

export interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function UserFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}: UserFiltersProps) {
  const handleFilterChange = (
    key: keyof UserFiltersType,
    value: string | boolean | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== "all"
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search users..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          disabled={loading}
        />

        <Select
          placeholder="All roles"
          value={filters.role || "all"}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          disabled={loading}
          options={[
            { value: "all", label: "All Roles" },
            { value: "admin", label: "Administrator" },
            { value: "user", label: "User" },
          ]}
        />

        <Select
          placeholder="All statuses"
          value={
            filters.isActive === undefined
              ? "all"
              : filters.isActive
                ? "active"
                : "inactive"
          }
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange(
              "isActive",
              value === "all" ? undefined : value === "active"
            );
          }}
          disabled={loading}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={loading || !hasActiveFilters}
            className="flex-1"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: &quot;{filters.search}&quot;
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  onClick={() => handleFilterChange("search", "")}
                >
                  ×
                </button>
              </span>
            )}
            {filters.role && filters.role !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Role: {filters.role === "admin" ? "Administrator" : "User"}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                  onClick={() => handleFilterChange("role", "all")}
                >
                  ×
                </button>
              </span>
            )}
            {filters.isActive !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filters.isActive ? "Active" : "Inactive"}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                  onClick={() => handleFilterChange("isActive", undefined)}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
