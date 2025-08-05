"use client";

import { AnswerSource } from "@/types/qa";
import { cn } from "@/utils";

interface DocumentExcerptProps {
  source: AnswerSource;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClick?: () => void;
  className?: string;
  highlightQuery?: string;
}

export function DocumentExcerpt({
  source,
  isExpanded = false,
  onToggleExpand,
  onClick,
  className,
  highlightQuery,
}: DocumentExcerptProps) {
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const truncatedExcerpt =
    source.excerpt.length > 200
      ? `${source.excerpt.substring(0, 200)}...`
      : source.excerpt;

  const displayExcerpt = isExpanded ? source.excerpt : truncatedExcerpt;

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg p-4 space-y-3",
        onClick && "cursor-pointer hover:border-gray-300 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {/* Document Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <svg
              className="flex-shrink-0 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {source.documentTitle}
            </h4>
          </div>

          <div className="flex items-center space-x-3 mt-1">
            {source.pageNumber && (
              <span className="text-xs text-gray-500">
                Page {source.pageNumber}
              </span>
            )}
            {source.context && (
              <span className="text-xs text-gray-500">{source.context}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-3">
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              getRelevanceColor(source.relevanceScore)
            )}
          >
            {Math.round(source.relevanceScore * 100)}%
          </span>
        </div>
      </div>

      {/* Excerpt Content */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <div className="relative">
          {highlightText(displayExcerpt, highlightQuery)}

          {source.excerpt.length > 200 && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metadata */}
      {(source.startPosition || source.endPosition || source.chunkId) && (
        <div className="border-t pt-2 mt-3">
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              <span className="inline-flex items-center">
                Technical Details
                <svg
                  className="w-3 h-3 ml-1 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </summary>

            <div className="mt-2 space-y-1 text-xs text-gray-500">
              {source.chunkId && (
                <div>
                  <span className="font-medium">Chunk ID:</span>
                  <span className="ml-2 font-mono">{source.chunkId}</span>
                </div>
              )}
              {source.startPosition && source.endPosition && (
                <div>
                  <span className="font-medium">Position:</span>
                  <span className="ml-2 font-mono">
                    {source.startPosition}-{source.endPosition}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium">Document ID:</span>
                <span className="ml-2 font-mono">{source.documentId}</span>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
