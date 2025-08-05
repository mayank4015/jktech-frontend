"use client";

import { useState } from "react";
import { Conversation, QAFilters } from "@/types/qa";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { cn, formatDateTime, truncate } from "@/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  onConversationDelete?: (id: string) => void;
  onConversationBookmark?: (id: string, bookmarked: boolean) => void;
  onFiltersChange?: (filters: QAFilters) => void;
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

export function ConversationList({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onConversationDelete,
  onConversationBookmark,
  onFiltersChange,
  pagination,
  onPageChange,
  isLoading = false,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "confidence" | "relevance" | "popularity"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange?.({
      search: value || undefined,
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
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });
  };

  const handleBookmarkFilter = (bookmarkedOnly: boolean) => {
    setShowBookmarkedOnly(bookmarkedOnly);
    // This would need to be implemented in the filters
    onFiltersChange?.({
      search: searchQuery || undefined,
      sortBy,
      sortOrder,
      // Add bookmarked filter when available in QAFilters
    });
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Search */}
      <div className="space-y-3">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={showBookmarkedOnly ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleBookmarkFilter(!showBookmarkedOnly)}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill={showBookmarkedOnly ? "currentColor" : "none"}
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
              Bookmarked
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant={sortBy === "createdAt" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("createdAt")}
            >
              Created
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

            <Button
              variant={sortBy === "relevance" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("relevance")}
            >
              Relevance
              {sortBy === "relevance" && (
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
              variant={sortBy === "popularity" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange("popularity")}
            >
              Popular
              {sortBy === "popularity" && (
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

      {/* Conversations List */}
      {conversations.length === 0 ? (
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No conversations found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Start a new conversation to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={() => onConversationSelect(conversation)}
              onDelete={onConversationDelete}
              onBookmark={onConversationBookmark}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
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

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (id: string) => void;
  onBookmark?: (id: string, bookmarked: boolean) => void;
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onBookmark,
}: ConversationItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "group relative border rounded-lg p-4 cursor-pointer transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {truncate(conversation.title, 60)}
            </h3>
            {conversation.isBookmarked && (
              <svg
                className="w-4 h-4 text-yellow-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{conversation.questionCount} questions</span>
            <span>by {conversation.userName}</span>
            <span>{formatDateTime(conversation.updatedAt)}</span>
          </div>

          {conversation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {conversation.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {conversation.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{conversation.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {conversation.summary && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              {conversation.summary}
            </p>
          )}
        </div>

        {/* Actions */}
        {(showActions || isSelected) && (
          <div className="flex items-center space-x-1 ml-3">
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(conversation.id, !conversation.isBookmarked);
                }}
                className="h-8 w-8 p-0"
              >
                <svg
                  className="w-4 h-4"
                  fill={conversation.isBookmarked ? "currentColor" : "none"}
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
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      "Are you sure you want to delete this conversation?"
                    )
                  ) {
                    onDelete(conversation.id);
                  }
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
        )}
      </div>
    </div>
  );
}
