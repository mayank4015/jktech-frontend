"use client";

import { useState } from "react";
import Link from "next/link";
import { useIngestions } from "@/hooks/useIngestion";
import { useDocuments } from "@/hooks/useDocuments";
import { useUsers } from "@/hooks/useUsers";
import {
  IngestionStatusCard,
  IngestionTable,
  IngestionFilters,
  IngestionStats,
} from "@/components/ingestion";
import { Button, Pagination, Modal } from "@/components/ui";
import { IngestionConfigForm } from "@/components/ingestion/IngestionConfigForm";
import { CreateIngestionData } from "@/types/ingestion";

export default function IngestionPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hooks
  const {
    ingestions,
    stats,
    pagination,
    filters,
    isLoading,
    isLoadingStats,
    isCreating,
    error,
    setFilters,
    setPage,
    refresh,
    createIngestion,
    retryIngestion,
    cancelIngestion,
    resetFilters,
  } = useIngestions({
    autoRefresh: true,
    refreshInterval: 10000, // 10 seconds
  });

  const { documents, loading: documentsLoading } = useDocuments({
    autoFetch: true,
    initialLimit: 100, // Get more documents for the dropdown
  });

  const { users } = useUsers();

  // Handlers
  const handleCreateIngestion = async (data: CreateIngestionData) => {
    try {
      await createIngestion(data);
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await retryIngestion(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelIngestion(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleViewDetails = (id: string) => {
    // Navigate to ingestion details page
    window.location.href = `/ingestion/${id}`;
  };

  // Get available documents for the form
  const availableDocuments = documents
    .filter((doc) => doc.status === "processed")
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      status: doc.status,
    }));

  // Get available users for filters
  const availableUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
  }));

  // Get available documents for filters
  const availableDocumentsForFilter = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ingestion Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage document ingestion processes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href="/ingestion/history">
            <Button variant="outline">View History</Button>
          </Link>
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={documentsLoading || availableDocuments.length === 0}
          >
            {documentsLoading ? "Loading..." : "New Ingestion"}
          </Button>
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

      {/* Stats */}
      {stats && <IngestionStats stats={stats} isLoading={isLoadingStats} />}

      {/* Filters */}
      <IngestionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
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
            {pagination.total} total ingestions
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingestions.map((ingestion) => (
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
          ingestions={ingestions}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      )}

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
    </div>
  );
}
