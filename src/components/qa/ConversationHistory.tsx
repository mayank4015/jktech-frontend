"use client";

import { QAMessage, AnswerSource } from "@/types/qa";
import { AnswerDisplay } from "./AnswerDisplay";
import { cn, formatDateTime } from "@/utils";

interface ConversationHistoryProps {
  messages: QAMessage[];
  onSaveAnswer?: (answerId: string) => void;
  onSourceClick?: (source: AnswerSource) => void;
  className?: string;
  showTimestamps?: boolean;
  isSaving?: boolean;
}

export function ConversationHistory({
  messages,
  onSaveAnswer,
  onSourceClick,
  className,
  showTimestamps = true,
  isSaving = false,
}: ConversationHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
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
          No messages yet
        </h3>
        <p className="text-gray-500">
          Start a conversation by asking a question.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {messages.map((message, index) => (
        <div key={message.id} className="relative">
          {/* Timestamp separator */}
          {showTimestamps && index === 0 && (
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                {formatDateTime(message.timestamp)}
              </div>
            </div>
          )}

          {showTimestamps &&
            index > 0 &&
            (() => {
              const currentTime = new Date(message.timestamp);
              const previousTime = new Date(messages[index - 1].timestamp);
              const timeDiff = currentTime.getTime() - previousTime.getTime();
              const hoursDiff = timeDiff / (1000 * 60 * 60);

              if (hoursDiff > 1) {
                return (
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {formatDateTime(message.timestamp)}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          {message.type === "question" ? (
            <QuestionMessage message={message} />
          ) : (
            <AnswerMessage
              message={message}
              onSaveAnswer={onSaveAnswer}
              onSourceClick={onSourceClick}
              isSaving={isSaving}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function QuestionMessage({ message }: { message: QAMessage }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-gray-900">You</span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="bg-blue-50 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function AnswerMessage({
  message,
  onSaveAnswer,
  onSourceClick,
  isSaving,
}: {
  message: QAMessage;
  onSaveAnswer?: (answerId: string) => void;
  onSourceClick?: (source: AnswerSource) => void;
  isSaving?: boolean;
}) {
  if (message.isLoading) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              AI Assistant
            </span>
            <span className="text-xs text-gray-500">Thinking...</span>
          </div>

          <div className="bg-white border rounded-lg px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                Analyzing your question...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
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
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              AI Assistant
            </span>
            <span className="text-xs text-red-500">Error</span>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{message.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert message to Answer format for AnswerDisplay
  const answer = {
    id: message.id,
    questionId: "", // Not available in message
    text: message.content,
    createdAt: message.timestamp,
    sources: message.sources || [],
    confidence: message.confidence || 0.8,
    processingTime: 1000, // Default value
    model: "gpt-4-turbo", // Default value
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-1 min-w-0">
        <AnswerDisplay
          answer={answer}
          onSave={onSaveAnswer}
          onSourceClick={onSourceClick}
          isSaving={isSaving}
          showMetadata={false}
        />
      </div>
    </div>
  );
}
