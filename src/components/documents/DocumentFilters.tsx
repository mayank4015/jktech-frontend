"use client";

import React, { useState, useRef } from "react";
import { DocumentFilters as DocumentFiltersType } from "@/types/document";
import { Input, Select, Button } from "@/components/ui";

// Mock data - in a real app, this would come from an API
const documentCategories = [
  "Technical Documentation",
  "User Manual",
  "Policy Document",
  "Report",
  "Presentation",
  "Contract",
  "Invoice",
  "Other",
];

const commonTags = [
  "important",
  "draft",
  "review",
  "approved",
  "confidential",
  "public",
  "internal",
  "external",
  "archived",
  "active",
];

export interface DocumentFiltersProps {
  filters: DocumentFiltersType;
  onSearch: (formData: FormData) => Promise<void>;
  loading?: boolean;
}

export function DocumentFilters({
  filters,
  onSearch,
  loading = false,
}: DocumentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    await onSearch(formData);
  };

  const handleClearFilters = async () => {
    if (formRef.current) {
      formRef.current.reset();
      const formData = new FormData(formRef.current);
      await onSearch(formData);
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const isSelected = currentTags.includes(tag);

    // Create a new form data with updated tags
    if (formRef.current) {
      const formData = new FormData(formRef.current);

      if (isSelected) {
        // Remove tag
        const newTags = currentTags.filter((t) => t !== tag);
        formData.set("tags", JSON.stringify(newTags));
      } else {
        // Add tag
        const newTags = [...currentTags, tag];
        formData.set("tags", JSON.stringify(newTags));
      }

      onSearch(formData);
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
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            name="search"
            placeholder="Search documents..."
            defaultValue={filters.search || ""}
            disabled={loading}
          />

          <Select
            name="status"
            placeholder="All statuses"
            defaultValue={filters.status || "all"}
            disabled={loading}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "processed", label: "Processed" },
              { value: "processing", label: "Processing" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />

          <Select
            name="category"
            placeholder="All categories"
            defaultValue={filters.category || ""}
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
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={loading}
              className="flex-1"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
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
                name="dateStart"
                type="date"
                label="From Date"
                defaultValue={filters.dateRange?.start || ""}
                disabled={loading}
              />
              <Input
                name="dateEnd"
                type="date"
                label="To Date"
                defaultValue={filters.dateRange?.end || ""}
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
              {/* Hidden input for tags */}
              <input
                type="hidden"
                name="tags"
                value={JSON.stringify(filters.tags || [])}
              />
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="sortBy"
                label="Sort By"
                defaultValue={filters.sortBy || "createdAt"}
                disabled={loading}
                options={[
                  { value: "createdAt", label: "Date Created" },
                  { value: "title", label: "Title" },
                  { value: "fileSize", label: "File Size" },
                  { value: "status", label: "Status" },
                ]}
              />
              <Select
                name="sortOrder"
                label="Sort Order"
                defaultValue={filters.sortOrder || "desc"}
                disabled={loading}
                options={[
                  { value: "desc", label: "Descending" },
                  { value: "asc", label: "Ascending" },
                ]}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button type="submit" isLoading={loading} disabled={loading}>
            Apply Filters
          </Button>
        </div>
      </form>

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: &quot;{filters.search}&quot;
              </span>
            )}
            {filters.status && filters.status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Status: {filters.status}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Category: {filters.category}
              </span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tags: {filters.tags.join(", ")}
              </span>
            )}
            {filters.dateRange &&
              (filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Date: {filters.dateRange.start || "..."} to{" "}
                  {filters.dateRange.end || "..."}
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
