"use client";

import { useState } from "react";
import { IngestionFilters as IIngestionFilters } from "@/types/ingestion";
import { Input, Select, Button } from "@/components/ui";

interface IngestionFiltersProps {
  filters: IIngestionFilters;
  onFiltersChange: (filters: IIngestionFilters) => void;
  onReset?: () => void;
  availableUsers?: Array<{ id: string; name: string }>;
  availableDocuments?: Array<{ id: string; title: string }>;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "queued", label: "Queued" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const sortByOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "startedAt", label: "Started Date" },
  { value: "completedAt", label: "Completed Date" },
  { value: "progress", label: "Progress" },
  { value: "documentTitle", label: "Document Title" },
];

const sortOrderOptions = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

export function IngestionFilters({
  filters,
  onFiltersChange,
  onReset,
  availableUsers = [],
  availableDocuments = [],
}: IngestionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (
    key: keyof IIngestionFilters,
    value: string | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updateDateRange = (field: "start" | "end", value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: filters.dateRange?.start || "",
        end: filters.dateRange?.end || "",
        [field]: value,
      },
    });
  };

  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: undefined,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      (filters.status && filters.status !== "all") ||
      filters.documentId ||
      filters.createdBy ||
      filters.dateRange
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search ingestions..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            options={statusOptions}
            value={filters.status || "all"}
            onChange={(e) =>
              updateFilter(
                "status",
                e.target.value === "all" ? undefined : e.target.value
              )
            }
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <Select
            options={sortByOptions}
            value={filters.sortBy || "createdAt"}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <Select
            options={sortOrderOptions}
            value={filters.sortOrder || "desc"}
            onChange={(e) => updateFilter("sortOrder", e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <span>Advanced Filters</span>
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters() && onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-gray-600"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Document Filter */}
            {availableDocuments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document
                </label>
                <Select
                  options={[
                    { value: "", label: "All Documents" },
                    ...availableDocuments.map((doc) => ({
                      value: doc.id,
                      label: doc.title,
                    })),
                  ]}
                  value={filters.documentId || ""}
                  onChange={(e) =>
                    updateFilter("documentId", e.target.value || undefined)
                  }
                />
              </div>
            )}

            {/* Created By Filter */}
            {availableUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <Select
                  options={[
                    { value: "", label: "All Users" },
                    ...availableUsers.map((user) => ({
                      value: user.id,
                      label: user.name,
                    })),
                  ]}
                  value={filters.createdBy || ""}
                  onChange={(e) =>
                    updateFilter("createdBy", e.target.value || undefined)
                  }
                />
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <Input
                  type="date"
                  value={filters.dateRange?.start || ""}
                  onChange={(e) => updateDateRange("start", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <Input
                  type="date"
                  value={filters.dateRange?.end || ""}
                  onChange={(e) => updateDateRange("end", e.target.value)}
                />
              </div>
              <div>
                {filters.dateRange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDateRange}
                    className="w-full"
                  >
                    Clear Dates
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>

            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: &quot;{filters.search}&quot;
                <button
                  onClick={() => updateFilter("search", undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.status && filters.status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => updateFilter("status", undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.documentId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Document:{" "}
                {availableDocuments.find((d) => d.id === filters.documentId)
                  ?.title || filters.documentId}
                <button
                  onClick={() => updateFilter("documentId", undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.createdBy && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Created by:{" "}
                {availableUsers.find((u) => u.id === filters.createdBy)?.name ||
                  filters.createdBy}
                <button
                  onClick={() => updateFilter("createdBy", undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.dateRange && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Date: {filters.dateRange.start} to {filters.dateRange.end}
                <button
                  onClick={clearDateRange}
                  className="ml-1 text-blue-600 hover:text-blue-800"
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
