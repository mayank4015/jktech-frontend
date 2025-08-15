"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ingestion,
  IngestionStats,
  IngestionFilters,
  CreateIngestionData,
} from "@/types/ingestion";
import {
  IngestionStatusCard,
  IngestionTable,
  IngestionFilters as IngestionFiltersComponent,
  IngestionStats as IngestionStatsComponent,
} from "@/components/ingestion";
import { Button, Pagination } from "@/components/ui";
import { IngestionConfigForm } from "@/components/ingestion/IngestionConfigForm";
import { ProcessingHistory } from "@/components/processing/ProcessingHistory";
import {
  createIngestion,
  retryIngestion,
  cancelIngestion,
} from "@/app/actions/ingestion";

interface IngestionPageClientProps {
  initialIngestions: Ingestion[];
  initialStats: IngestionStats;
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialFilters: IngestionFilters;
  availableDocuments: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  availableUsers: Array<{
    id: string;
    name: string;
  }>;
  availableDocumentsForFilter: Array<{
    id: string;
    title: string;
  }>;
}

export function IngestionPageClient({
  initialIngestions,
  initialStats,
  initialPagination,
  initialFilters,
  availableDocuments,
  availableUsers,
  availableDocumentsForFilter,
}: IngestionPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleCreateIngestion = async (data: CreateIngestionData) => {
    try {
      setIsCreating(true);
      setError(null);

      await createIngestion(data);
      setShowCreateModal(false);

      // Refresh the page to show new data
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create ingestion"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      setError(null);
      await retryIngestion(id);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to retry ingestion"
      );
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setError(null);
      await cancelIngestion(id);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to cancel ingestion"
      );
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/ingestion/${id}`);
  };

  const handleFiltersChange = (filters: IngestionFilters) => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters.documentId) params.set("documentId", filters.documentId);
    if (filters.createdBy) params.set("createdBy", filters.createdBy);
    if (filters.dateRange?.start)
      params.set("dateStart", filters.dateRange.start);
    if (filters.dateRange?.end) params.set("dateEnd", filters.dateRange.end);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    // Reset to first page when filtering
    params.set("page", "1");

    const queryString = params.toString();
    const url = queryString ? `/ingestion?${queryString}` : "/ingestion";

    startTransition(() => {
      router.push(url);
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push("/ingestion");
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/ingestion?${params.toString()}`);
    });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <>
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

      {/* Header Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/ingestion/history">
          <Button variant="outline">View History</Button>
        </Link>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={availableDocuments.length === 0}
        >
          New Ingestion
        </Button>
      </div>

      {/* Stats and Processing Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IngestionStatsComponent stats={initialStats} isLoading={false} />
        </div>
        <div>
          <ProcessingHistory />
        </div>
      </div>

      {/* Filters */}
      <IngestionFiltersComponent
        filters={initialFilters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        availableUsers={availableUsers}
        availableDocuments={availableDocumentsForFilter}
      />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">View:</span>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === "cards"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === "table"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Table
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            {initialPagination.total} total ingestions
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
          >
            {isPending ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialIngestions.map((ingestion) => (
            <IngestionStatusCard
              key={ingestion.id}
              ingestion={ingestion}
              onRetry={handleRetry}
              onCancel={handleCancel}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <IngestionTable
          ingestions={initialIngestions}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onViewDetails={handleViewDetails}
          isLoading={isPending}
        />
      )}

      {/* Pagination */}
      {initialPagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={initialPagination.page}
            totalPages={initialPagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Create Ingestion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Ingestion
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure and start a new document ingestion process
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <IngestionConfigForm
                onSubmit={handleCreateIngestion}
                onCancel={() => setShowCreateModal(false)}
                availableDocuments={availableDocuments}
                isLoading={isCreating}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
