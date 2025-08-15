"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Conversation, QAFilters } from "@/types/qa";
import { Pagination } from "@/components/ui/Pagination";

interface ConversationHistoryProps {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: QAFilters;
}

export function ConversationHistory({
  conversations,
  pagination,
  filters,
}: ConversationHistoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );

  const handleBookmarkToggle = async (conversation: Conversation) => {
    setLoadingActions((prev) => ({ ...prev, [conversation.id]: true }));

    try {
      // Mock API call (until backend is implemented)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show success message
      alert(
        `Conversation ${conversation.isBookmarked ? "unbookmarked" : "bookmarked"} successfully! (Mock action - backend not yet implemented)`
      );

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [conversation.id]: false }));
    }
  };

  const handleDelete = async (conversation: Conversation) => {
    if (
      !confirm(
        `Are you sure you want to delete the conversation "${conversation.title}"? (This is a mock action - backend not yet implemented)`
      )
    ) {
      return;
    }

    setLoadingActions((prev) => ({ ...prev, [conversation.id]: true }));

    try {
      // Mock API call (until backend is implemented)
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert(
        "Conversation deleted successfully! (Mock action - backend not yet implemented)"
      );

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("Failed to delete conversation. Please try again.");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [conversation.id]: false }));
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/qa/history?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Conversations List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No conversations found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filters.search ||
              filters.isBookmarked ||
              filters.dateStart ||
              filters.dateEnd ||
              filters.tags?.length
                ? "Try adjusting your filters or search terms."
                : "Start asking questions to see your conversation history here."}
            </p>
            <div className="mt-6">
              <Link
                href="/qa"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Conversations ({pagination.total})
              </h3>
            </div>

            <ul className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="block">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.title}
                              </p>

                              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center text-sm text-gray-500 space-x-4">
                                  <span className="flex items-center">
                                    <svg
                                      className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {conversation.questionCount} question
                                    {conversation.questionCount !== 1
                                      ? "s"
                                      : ""}
                                  </span>

                                  <span className="flex items-center">
                                    <svg
                                      className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {new Date(
                                      conversation.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                {conversation.tags.length > 0 && (
                                  <div className="mt-2 sm:mt-0 flex flex-wrap gap-1">
                                    {conversation.tags
                                      .slice(0, 3)
                                      .map((tag) => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    {conversation.tags.length > 3 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        +{conversation.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {conversation.summary && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {conversation.summary}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleBookmarkToggle(conversation)}
                          disabled={loadingActions[conversation.id]}
                          className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            conversation.isBookmarked
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                          title={
                            conversation.isBookmarked
                              ? "Remove bookmark"
                              : "Add bookmark"
                          }
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(conversation)}
                          disabled={loadingActions[conversation.id]}
                          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete conversation"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
