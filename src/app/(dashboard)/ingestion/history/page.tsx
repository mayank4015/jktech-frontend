"use client";

import { useState } from "react";
import Link from "next/link";
import { useIngestions } from "@/hooks/useIngestion";
import { useDocuments } from "@/hooks/useDocuments";
import { useUsers } from "@/hooks/useUsers";
import { IngestionTable, IngestionFilters } from "@/components/ingestion";
import { Button, Pagination } from "@/components/ui";

export default function IngestionHistoryPage() {
  const [selectedIngestions, setSelectedIngestions] = useState<string[]>([]);

  // Hooks
  const {
    ingestions,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    setPage,
    setLimit,
    refresh,
    retryIngestion,
    resetFilters,
  } = useIngestions({
    initialFilters: {
      sortBy: "startedAt",
      sortOrder: "desc",
    },
  });

  const { documents } = useDocuments();
  const { users } = useUsers();

  // Handlers
  const handleRetry = async (id: string) => {
    try {
      await retryIngestion(id);
    } catch (error) {
      console.error("Failed to retry ingestion:", error);
    }
  };

  const handleViewDetails = (id: string) => {
    window.location.href = `/ingestion/${id}`;
  };

  const handleBulkRetry = async () => {
    const failedIngestions = selectedIngestions.filter((id) => {
      const ingestion = ingestions.find((ing) => ing.id === id);
      return ingestion?.status === "failed";
    });

    for (const id of failedIngestions) {
      try {
        await retryIngestion(id);
      } catch (error) {
        console.error(`Failed to retry ingestion ${id}:`, error);
      }
    }

    setSelectedIngestions([]);
  };

  const handleSelectAll = () => {
    if (selectedIngestions.length === ingestions.length) {
      setSelectedIngestions([]);
    } else {
      setSelectedIngestions(ingestions.map((ing) => ing.id));
    }
  };

  const handleSelectIngestion = (id: string) => {
    setSelectedIngestions((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // Get available data for filters
  const availableUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
  }));

  const availableDocuments = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
  }));

  const selectedFailedCount = selectedIngestions.filter((id) => {
    const ingestion = ingestions.find((ing) => ing.id === id);
    return ingestion?.status === "failed";
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/ingestion"
              className="text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Ingestion History
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Complete history of all ingestion processes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Link href="/ingestion">
            <Button>Back to Overview</Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400 mr-2 mt-0.5"
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <IngestionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        availableUsers={availableUsers}
        availableDocuments={availableDocuments}
      />

      {/* Bulk Actions */}
      {selectedIngestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedIngestions.length} ingestion
                {selectedIngestions.length !== 1 ? "s" : ""} selected
              </span>
              {selectedFailedCount > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({selectedFailedCount} failed)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIngestions([])}
              >
                Clear Selection
              </Button>
              {selectedFailedCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleBulkRetry}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Retry Failed ({selectedFailedCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={
                selectedIngestions.length === ingestions.length &&
                ingestions.length > 0
              }
              onChange={handleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Select All</span>
          </label>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={pagination.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        </div>

        <div className="text-sm text-gray-700">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} ingestions
        </div>
      </div>

      {/* Table with Selection */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIngestions.length === ingestions.length &&
                      ingestions.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingestions.map((ingestion) => (
                <tr
                  key={ingestion.id}
                  className={
                    selectedIngestions.includes(ingestion.id)
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIngestions.includes(ingestion.id)}
                      onChange={() => handleSelectIngestion(ingestion.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ingestion.documentTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {ingestion.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ingestion.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ingestion.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : ingestion.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {ingestion.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {ingestion.progress}% complete
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>Mode: {ingestion.configuration.processingMode}</div>
                    <div>Chunk: {ingestion.configuration.chunkSize}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>
                      {new Date(ingestion.startedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {new Date(ingestion.startedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingestion.createdByName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(ingestion.id)}
                      >
                        Details
                      </Button>
                      {ingestion.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(ingestion.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading ingestions...</p>
          </div>
        )}

        {!isLoading && ingestions.length === 0 && (
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
              No ingestion jobs match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
