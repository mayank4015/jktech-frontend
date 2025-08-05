"use client";

import { useState } from "react";
import { useQA, useConversation } from "@/hooks/useQA";
import { QASearch } from "@/components/qa/QASearch";
import { ConversationList } from "@/components/qa/ConversationList";
import { Button } from "@/components/ui/Button";
import { Conversation } from "@/types/qa";
import { cn } from "@/utils";

export default function QAPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    conversations,
    pagination,
    isLoading,
    error,
    setPage,
    setFilters,
    deleteConversation,
    updateConversation,
  } = useQA();

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  const handleConversationDelete = async (id: string) => {
    try {
      await deleteConversation(id);
      if (selectedConversationId === id) {
        setSelectedConversationId(undefined);
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300",
          showSidebar ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversations
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="lg:hidden"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onConversationSelect={handleConversationSelect}
              onConversationDelete={handleConversationDelete}
              onConversationBookmark={handleConversationBookmark}
              onFiltersChange={setFilters}
              pagination={pagination}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile sidebar toggle */}
        {!showSidebar && (
          <div className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Show Conversations
            </Button>
          </div>
        )}

        {/* Q&A Interface */}
        <div className="flex-1">
          <QASearch
            conversationId={selectedConversationId}
            onNewConversation={handleNewConversation}
          />
        </div>
      </div>
    </div>
  );
}
