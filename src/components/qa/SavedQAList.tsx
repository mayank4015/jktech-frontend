"use client";

import { useState } from "react";
import { SavedQA, SavedQAFilters } from "@/types/qa";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { AnswerDisplay } from "./AnswerDisplay";
import { cn, formatDateTime, truncate } from "@/utils";

interface SavedQAListProps {
  savedQAs: SavedQA[];
  onRemove?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onFiltersChange?: (filters: SavedQAFilters) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function SavedQAList({
  savedQAs,
  onRemove,
  onUpdateNotes,
  onUpdateTags,
  onFiltersChange,
  pagination,
  onPageChange,
  isLoading = false,
  className,
}: SavedQAListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"savedAt" | "createdAt">("savedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  // Get all unique tags from saved QAs
  const allTags = Array.from(new Set(savedQAs.flatMap((qa) => qa.tags))).sort();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange?.({
      search: value || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);
    onFiltersChange?.({
      search: searchQuery || undefined,
      tags: newSelectedTags.length > 0 ? newSelectedTags : undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    const newSortOrder =
      newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onFiltersChange?.({
      search: searchQuery || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Saved Q&As</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total || savedQAs.length} saved questions and answers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </Button>
          <Button
            variant={viewMode === "cards" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Search saved Q&As..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="flex items-center justify-between">
          {/* Tags Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    selectedTags.includes(tag)
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <svg
                      className="w-3 h-3 ml-1"
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
                  )}
                </button>
              ))}
              {allTags.length > 8 && (
                <span className="text-xs text-gray-500">
                  +{allTags.length - 8} more
                </span>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-1">
            <Button
              variant={sortBy === "savedAt" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("savedAt")}
            >
              Saved Date
              {sortBy === "savedAt" && (
                <svg
                  className={cn(
                    "w-3 h-3 ml-1 transition-transform",
                    sortOrder === "asc" && "rotate-180"
                  )}
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
              )}
            </Button>

            <Button
              variant={sortBy === "createdAt" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("createdAt")}
            >
              Question Date
              {sortBy === "createdAt" && (
                <svg
                  className={cn(
                    "w-3 h-3 ml-1 transition-transform",
                    sortOrder === "asc" && "rotate-180"
                  )}
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
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {savedQAs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved Q&As found
          </h3>
          <p className="text-gray-500">
            {searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters."
              : "Save questions and answers to access them later."}
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {savedQAs.map((savedQA) => (
            <SavedQACard
              key={savedQA.id}
              savedQA={savedQA}
              onRemove={onRemove}
              onUpdateNotes={onUpdateNotes}
              onUpdateTags={onUpdateTags}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {savedQAs.map((savedQA) => (
            <SavedQAListItem
              key={savedQA.id}
              savedQA={savedQA}
              onRemove={onRemove}
              onUpdateNotes={onUpdateNotes}
              onUpdateTags={onUpdateTags}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={onPageChange || (() => {})}
          />
        </div>
      )}
    </div>
  );
}

interface SavedQACardProps {
  savedQA: SavedQA;
  onRemove?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
}

function SavedQACard({
  savedQA,
  onRemove,
  onUpdateNotes,
  onUpdateTags,
}: SavedQACardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(savedQA.notes || "");
  const [tags, setTags] = useState(savedQA.tags.join(", "));

  const handleSave = () => {
    onUpdateNotes?.(savedQA.id, notes);
    onUpdateTags?.(
      savedQA.id,
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    );
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
            <span>Saved {formatDateTime(savedQA.savedAt)}</span>
            <span>•</span>
            <span>Asked {formatDateTime(savedQA.question.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  confirm("Are you sure you want to remove this saved Q&A?")
                ) {
                  onRemove(savedQA.id);
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Question</span>
        </div>
        <p className="text-sm text-gray-700 ml-8">{savedQA.question.text}</p>
      </div>

      {/* Answer */}
      <div className="ml-8">
        <AnswerDisplay answer={savedQA.answer} showMetadata={false} />
      </div>

      {/* Notes and Tags */}
      {isEditing ? (
        <div className="space-y-3 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t space-y-2">
          {savedQA.notes && (
            <div>
              <span className="text-sm font-medium text-gray-700">Notes: </span>
              <span className="text-sm text-gray-600">{savedQA.notes}</span>
            </div>
          )}

          {savedQA.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {savedQA.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SavedQAListItem({ savedQA, onRemove }: SavedQACardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {truncate(savedQA.question.text, 100)}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Saved {formatDateTime(savedQA.savedAt)}</span>
            <span>{savedQA.answer.sources.length} sources</span>
            <span>
              {Math.round(savedQA.answer.confidence * 100)}% confidence
            </span>
          </div>
          {savedQA.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {savedQA.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to remove this saved Q&A?")) {
                onRemove(savedQA.id);
              }
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
