"use client";

import { Ingestion } from "@/types/ingestion";
import { Button } from "@/components/ui";

interface IngestionStatusCardProps {
  ingestion: Ingestion;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const getStatusColor = (status: Ingestion["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "queued":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: Ingestion["status"]) => {
  switch (status) {
    case "completed":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "processing":
      return (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    case "failed":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "queued":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

const formatDuration = (startTime: string, endTime?: string) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  if (diffMins > 0) {
    return `${diffMins}m ${diffSecs}s`;
  }
  return `${diffSecs}s`;
};

export function IngestionStatusCard({
  ingestion,
  onRetry,
  onCancel,
  onViewDetails,
}: IngestionStatusCardProps) {
  const statusColor = getStatusColor(ingestion.status);
  const statusIcon = getStatusIcon(ingestion.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {ingestion.documentTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {ingestion.id}</p>
        </div>
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}
        >
          {statusIcon}
          <span className="ml-1 capitalize">{ingestion.status}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{ingestion.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              ingestion.status === "completed"
                ? "bg-green-500"
                : ingestion.status === "failed"
                  ? "bg-red-500"
                  : ingestion.status === "processing"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
            }`}
            style={{ width: `${ingestion.progress}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Started:</span>
          <span>{new Date(ingestion.startedAt).toLocaleString()}</span>
        </div>
        {ingestion.completedAt && (
          <div className="flex justify-between">
            <span>Completed:</span>
            <span>{new Date(ingestion.completedAt).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Duration:</span>
          <span>
            {formatDuration(ingestion.startedAt, ingestion.completedAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Created by:</span>
          <span>{ingestion.createdByName}</span>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 rounded-md p-3 mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Configuration
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Chunk Size: {ingestion.configuration.chunkSize}</div>
          <div>Overlap: {ingestion.configuration.chunkOverlap}</div>
          <div>Mode: {ingestion.configuration.processingMode}</div>
          <div>Language: {ingestion.configuration.language}</div>
        </div>
      </div>

      {/* Error Message */}
      {ingestion.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{ingestion.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(ingestion.id)}
            className="flex-1"
          >
            View Details
          </Button>
        )}

        {ingestion.status === "failed" && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(ingestion.id)}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Retry
          </Button>
        )}

        {(ingestion.status === "queued" || ingestion.status === "processing") &&
          onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(ingestion.id)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel
            </Button>
          )}
      </div>
    </div>
  );
}
