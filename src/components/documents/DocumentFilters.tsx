"use client";

import React, { useState } from "react";
import { DocumentFilters as DocumentFiltersType } from "@/types/document";
import { Input, Select, Button } from "@/components/ui";
import {
  documentCategories,
  commonTags,
} from "@/lib/mockServices/documentService";

export interface DocumentFiltersProps {
  filters: DocumentFiltersType;
  onFiltersChange: (filters: DocumentFiltersType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function DocumentFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}: DocumentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (
    key: keyof DocumentFiltersType,
    value: string | string[] | { start: string; end: string } | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    handleFilterChange("tags", newTags.length > 0 ? newTags : undefined);
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    const currentRange = filters.dateRange || { start: "", end: "" };
    const newRange = { ...currentRange, [field]: value };

    if (!newRange.start && !newRange.end) {
      handleFilterChange("dateRange", undefined);
    } else {
      handleFilterChange("dateRange", newRange);
    }
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (value === undefined || value === "" || value === "all") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== "");
    }
    return true;
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search documents..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          disabled={loading}
        />

        <Select
          placeholder="All statuses"
          value={filters.status || "all"}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          disabled={loading}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "processed", label: "Processed" },
            { value: "pending", label: "Processing" },
            { value: "failed", label: "Failed" },
          ]}
        />

        <Select
          placeholder="All categories"
          value={filters.category || ""}
          onChange={(e) =>
            handleFilterChange("category", e.target.value || undefined)
          }
          disabled={loading}
          options={[
            { value: "", label: "All Categories" },
            ...documentCategories.map((category) => ({
              value: category,
              label: category,
            })),
          ]}
        />

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={loading}
            className="flex-1"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
          </Button>
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={loading || !hasActiveFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="From Date"
              value={filters.dateRange?.start || ""}
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
              disabled={loading}
            />
            <Input
              type="date"
              label="To Date"
              value={filters.dateRange?.end || ""}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => {
                const isSelected = filters.tags?.includes(tag) || false;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    disabled={loading}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
            {filters.status && filters.status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Status: {filters.status}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-600"
                  onClick={() => handleFilterChange("status", "all")}
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Category: {filters.category}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                  onClick={() => handleFilterChange("category", undefined)}
                >
                  ×
                </button>
              </span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tags: {filters.tags.join(", ")}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                  onClick={() => handleFilterChange("tags", undefined)}
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateRange &&
              (filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Date: {filters.dateRange.start || "..."} to{" "}
                  {filters.dateRange.end || "..."}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-600"
                    onClick={() => handleFilterChange("dateRange", undefined)}
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
