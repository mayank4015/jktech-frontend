"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { QuestionSuggestion } from "@/types/qa";
import { cn } from "@/utils";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  suggestions?: QuestionSuggestion[];
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function QuestionInput({
  onSubmit,
  suggestions = [],
  isLoading = false,
  placeholder = "Ask a question...",
  className,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    QuestionSuggestion[]
  >([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (question.trim().length > 2) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(question.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [question, suggestions]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        selectedSuggestionIndex >= 0 &&
        filteredSuggestions[selectedSuggestionIndex]
      ) {
        selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const selectSuggestion = (suggestion: QuestionSuggestion) => {
    setQuestion(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "w-full min-h-[44px] max-h-[120px] px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              "placeholder:text-gray-400"
            )}
            rows={1}
          />

          <Button
            type="submit"
            size="sm"
            disabled={!question.trim() || isLoading}
            isLoading={isLoading}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            {!isLoading && (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  "border-b border-gray-100 last:border-b-0",
                  selectedSuggestionIndex === index &&
                    "bg-blue-50 text-blue-700"
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="flex-1 text-gray-900">
                    {suggestion.text}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {suggestion.category}
                  </span>
                </div>
                {suggestion.popularity > 70 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Popular question
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Quick suggestions when input is empty */}
      {!question && suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion.text.length > 50
                  ? `${suggestion.text.substring(0, 50)}...`
                  : suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
