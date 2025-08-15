"use client";

import { Ingestion } from "@/types/ingestion";
import { Table, Button, type TableColumn } from "@/components/ui";

interface IngestionTableProps {
  ingestions: Ingestion[];
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

const getStatusBadge = (status: Ingestion["status"]) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case "completed":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "processing":
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case "failed":
      return `${baseClasses} bg-red-100 text-red-800`;
    case "queued":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
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

export function IngestionTable({
  ingestions,
  onRetry,
  onCancel,
  onViewDetails,
  isLoading = false,
}: IngestionTableProps) {
  const columns: TableColumn<Ingestion>[] = [
    {
      key: "document",
      title: "Document",
      render: (_, ingestion) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {ingestion.documentTitle}
          </div>
          <div className="text-sm text-gray-500 truncate">
            ID: {ingestion.id}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, ingestion) => (
        <div className="space-y-1">
          <span className={getStatusBadge(ingestion.status)}>
            {ingestion.status}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
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
          <div className="text-xs text-gray-500">
            {ingestion.progress}% complete
          </div>
        </div>
      ),
    },
    {
      key: "configuration",
      title: "Configuration",
      render: (_, ingestion) => (
        <div className="text-sm text-gray-600 space-y-1">
          <div>Mode: {ingestion.configuration.processingMode}</div>
          <div>Chunk: {ingestion.configuration.chunkSize}</div>
          <div>Lang: {ingestion.configuration.language}</div>
        </div>
      ),
    },
    {
      key: "timing",
      title: "Timing",
      render: (_, ingestion) => (
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            Started: {new Date(ingestion.startedAt).toLocaleDateString()}
          </div>
          <div className="text-xs">
            {new Date(ingestion.startedAt).toLocaleTimeString()}
          </div>
          {ingestion.completedAt ? (
            <div className="text-xs text-green-600">
              Duration:{" "}
              {formatDuration(ingestion.startedAt, ingestion.completedAt)}
            </div>
          ) : ingestion.status === "processing" ? (
            <div className="text-xs text-blue-600">
              Running: {formatDuration(ingestion.startedAt)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "createdBy",
      title: "Created By",
      render: (_, ingestion) => (
        <div className="text-sm text-gray-900">{ingestion.createdByName}</div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, ingestion) => (
        <div className="flex gap-1">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(ingestion.id)}
              className="text-xs"
            >
              Details
            </Button>
          )}

          {ingestion.status === "failed" && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(ingestion.id)}
              className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Retry
            </Button>
          )}

          {(ingestion.status === "queued" ||
            ingestion.status === "processing") &&
            onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(ingestion.id)}
                className="text-xs text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading ingestions...</p>
        </div>
      </div>
    );
  }

  if (ingestions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ingestions found
          </h3>
          <p className="text-gray-500">
            No ingestion jobs match your current filters. Try adjusting your
            search criteria or create a new ingestion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table<Ingestion>
        columns={columns}
        data={ingestions}
        className="min-w-full"
      />
    </div>
  );
}
