"use client";

import { useState, useEffect } from "react";
import { useQA } from "@/hooks/useQA";
import { QuestionInput } from "./QuestionInput";
import { ConversationHistory } from "./ConversationHistory";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QAMessage, AnswerSource, QASearchResult } from "@/types/qa";
import { cn, debounce } from "@/utils";

interface QASearchProps {
  conversationId?: string;
  className?: string;
  onNewConversation?: () => void;
}

export function QASearch({
  conversationId,
  className,
  onNewConversation,
}: QASearchProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const {
    suggestions,
    searchResults,
    isAsking,
    isSearching,
    isSaving,
    error,
    askQuestion,
    searchQAs,
    saveQA,
  } = useQA();

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim().length > 2) {
      await searchQAs(query);
    }
  }, 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  const handleAskQuestion = async (questionText: string) => {
    // Add question message immediately
    const questionMessage: QAMessage = {
      id: `q-${Date.now()}`,
      type: "question",
      content: questionText,
      timestamp: new Date().toISOString(),
    };

    // Add loading answer message
    const loadingMessage: QAMessage = {
      id: `a-${Date.now()}`,
      type: "answer",
      content: "",
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, questionMessage, loadingMessage]);

    try {
      const { answer } = await askQuestion(questionText, conversationId);

      // Replace loading message with actual answer
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: answer.text,
                sources: answer.sources,
                confidence: answer.confidence,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (err) {
      // Replace loading message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                isLoading: false,
                error:
                  err instanceof Error ? err.message : "Failed to get answer",
              }
            : msg
        )
      );
    }
  };

  const handleSaveAnswer = async (answerId: string) => {
    try {
      // Find the answer message
      const answerMessage = messages.find((msg) => msg.id === answerId);
      if (!answerMessage) return;

      // For now, we'll use the message ID as both question and answer ID
      // In a real implementation, you'd have proper IDs from the backend
      await saveQA(answerId, answerId, "Saved from conversation");
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  const handleSourceClick = (source: AnswerSource) => {
    // Handle source click - could open document viewer, navigate to document, etc.
    console.log("Source clicked:", source);
  };

  const handleNewConversation = () => {
    setMessages([]);
    onNewConversation?.();
  };

  const handleSearchResultClick = (result: QASearchResult) => {
    if (result.type === "question") {
      // Auto-fill the question input with the selected question
      handleAskQuestion(result.title);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Q&A Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Ask questions about your documents and get AI-powered answers
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className={cn(showSearch && "bg-gray-100")}
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Button>

            <Button variant="outline" size="sm" onClick={handleNewConversation}>
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

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Search previous questions and answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="bg-white border rounded-lg shadow-sm max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              result.type === "question"
                                ? "bg-blue-100 text-blue-800"
                                : result.type === "answer"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {result.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {result.excerpt}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}

            {isSearching && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Searching...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-6 py-3">
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

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <ConversationHistory
            messages={messages}
            onSaveAnswer={handleSaveAnswer}
            onSourceClick={handleSourceClick}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Question Input */}
      <div className="flex-shrink-0 border-t bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <QuestionInput
            onSubmit={handleAskQuestion}
            suggestions={suggestions}
            isLoading={isAsking}
            placeholder="Ask a question about your documents..."
          />
        </div>
      </div>
    </div>
  );
}
