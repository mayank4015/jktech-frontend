"use client";

import { useState } from "react";
import { Answer, AnswerSource } from "@/types/qa";
import { Button } from "@/components/ui/Button";
import { DocumentExcerpt } from "./DocumentExcerpt";
import { cn, formatDateTime } from "@/utils";

interface AnswerDisplayProps {
  answer: Answer;
  onSave?: (answerId: string) => void;
  onSourceClick?: (source: AnswerSource) => void;
  className?: string;
  showMetadata?: boolean;
  isSaving?: boolean;
}

export function AnswerDisplay({
  answer,
  onSave,
  onSourceClick,
  className,
  showMetadata = true,
  isSaving = false,
}: AnswerDisplayProps) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );
  const [showAllSources, setShowAllSources] = useState(false);

  const toggleSourceExpansion = (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const visibleSources = showAllSources
    ? answer.sources
    : answer.sources.slice(0, 3);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Answer Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                AI Assistant
              </span>
              {showMetadata && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    getConfidenceColor(answer.confidence)
                  )}
                >
                  {getConfidenceLabel(answer.confidence)} confidence
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formatDateTime(answer.createdAt)}
            </p>
          </div>
        </div>

        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(answer.id)}
            isLoading={isSaving}
            className="flex-shrink-0"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Save
          </Button>
        )}
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm max-w-none">
        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {answer.text}
        </div>
      </div>

      {/* Sources Section */}
      {answer.sources.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Sources ({answer.sources.length})
            </h4>
            {answer.sources.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSources(!showAllSources)}
              >
                {showAllSources
                  ? "Show less"
                  : `Show all ${answer.sources.length}`}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {visibleSources.map((source, index) => (
              <DocumentExcerpt
                key={`${source.documentId}-${source.chunkId || index}`}
                source={source}
                isExpanded={expandedSources.has(source.documentId)}
                onToggleExpand={() => toggleSourceExpansion(source.documentId)}
                onClick={() => onSourceClick?.(source)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {showMetadata && answer.metadata && (
        <div className="border-t pt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              <span className="inline-flex items-center">
                Technical Details
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-open:rotate-90"
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

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Processing Time:</span>
                  <span className="ml-2">{answer.processingTime}ms</span>
                </div>
                <div>
                  <span className="font-medium">Model:</span>
                  <span className="ml-2">{answer.model || "Unknown"}</span>
                </div>
                {answer.metadata.tokenCount && (
                  <div>
                    <span className="font-medium">Token Count:</span>
                    <span className="ml-2">{answer.metadata.tokenCount}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2">
                    {Math.round(answer.confidence * 100)}%
                  </span>
                </div>
              </div>

              {answer.metadata.reasoning && (
                <div className="mt-3">
                  <span className="font-medium">Reasoning:</span>
                  <p className="mt-1 text-gray-600">
                    {answer.metadata.reasoning}
                  </p>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
