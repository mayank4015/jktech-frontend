"use client";

import { useState } from "react";
import { useQA } from "@/hooks/useQA";
import { ConversationList } from "@/components/qa/ConversationList";
import { QAStats } from "@/components/qa/QAStats";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Conversation, QAFilters } from "@/types/qa";
import { cn } from "@/utils";

export default function QAHistoryPage() {
  const [viewMode, setViewMode] = useState<"conversations" | "stats">(
    "conversations"
  );
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const {
    conversations,
    stats,
    pagination,
    filters,
    isLoading,
    isLoadingStats,
    error,
    setPage,
    setFilters,
    deleteConversation,
    updateConversation,
  } = useQA();

  const handleFiltersChange = (newFilters: QAFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Navigate to main Q&A page with this conversation
    window.location.href = `/qa?conversation=${conversation.id}`;
  };

  const handleConversationDelete = async (id: string) => {
    try {
      await deleteConversation(id);
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleConversationBookmark = async (
    id: string,
    bookmarked: boolean
  ) => {
    try {
      await updateConversation(id, { isBookmarked: bookmarked });
    } catch (err) {
      console.error("Failed to update conversation:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Q&A History</h1>
          <p className="text-gray-600 mt-1">
            Browse your conversation history and view analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === "conversations" ? "primary" : "ghost"}
            onClick={() => setViewMode("conversations")}
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Conversations
          </Button>

          <Button
            variant={viewMode === "stats" ? "primary" : "ghost"}
            onClick={() => setViewMode("stats")}
          >
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/qa")}
          >
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
            New Chat
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === "conversations" ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <ConversationList
              conversations={conversations}
              onConversationSelect={handleConversationSelect}
              onConversationDelete={handleConversationDelete}
              onConversationBookmark={handleConversationBookmark}
              onFiltersChange={handleFiltersChange}
              pagination={pagination}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <QAStats stats={stats} isLoading={isLoadingStats} />
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      {viewMode === "conversations" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Conversations
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.totalConversations.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Questions
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.totalQuestions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Avg. Confidence
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(stats.averageConfidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Avg. Response Time
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.averageResponseTime < 1000
                    ? `${stats.averageResponseTime}ms`
                    : `${(stats.averageResponseTime / 1000).toFixed(1)}s`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
