"use client";

import React, { useState, useTransition, useOptimistic } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Document, DocumentFilters, DocumentStats } from "@/types/document";
import {
  uploadDocumentAction,
  updateDocumentAction,
  deleteDocumentAction,
  reprocessDocumentAction,
  searchDocumentsAction,
} from "@/app/actions/documents";
import {
  DocumentTable,
  DocumentFilters as DocumentFiltersComponent,
  DocumentUploadModal,
  DocumentEditModal,
} from "@/components/documents";
import { Button, Pagination } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface DocumentManagementProps {
  initialDocuments: Document[];
  initialTotalDocuments: number;
  initialCurrentPage: number;
  initialTotalPages: number;
  initialLimit: number;
  initialStats: DocumentStats | null;
  initialFilters: DocumentFilters;
  initialError: string | null;
  statsError: string | null;
}

export function DocumentManagement({
  initialDocuments,
  initialTotalDocuments,
  initialCurrentPage,
  initialTotalPages,
  initialLimit,
  initialStats,
  initialFilters,
  initialError,
  statsError,
}: DocumentManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for UI interactions
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<{
    upload: boolean;
    update: boolean;
    delete: boolean;
    reprocess: boolean;
  }>({
    upload: false,
    update: false,
    delete: false,
    reprocess: false,
  });

  // Optimistic updates for documents
  const [optimisticDocuments, addOptimisticDocument] = useOptimistic(
    initialDocuments,
    (
      state: Document[],
      action: { type: string; document?: Document; id?: string }
    ) => {
      switch (action.type) {
        case "delete":
          return state.filter((doc) => doc.id !== action.id);
        case "update":
          return state.map((doc) =>
            doc.id === action.document?.id ? action.document : doc
          );
        case "reprocess":
          return state.map((doc) =>
            doc.id === action.id
              ? { ...doc, status: "pending" as const, processingProgress: 0 }
              : doc
          );
        default:
          return state;
      }
    }
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowEditModal(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setDeletingDocument(document);
  };

  const handlePreviewDocument = (document: Document) => {
    // In a real implementation, this would open a document preview
    showToast(`Preview for "${document.title}" would open here`);
  };

  const handleUploadSubmit = async (formData: FormData) => {
    setActionLoading((prev) => ({ ...prev, upload: true }));

    try {
      const result = await uploadDocumentAction(formData);

      if (result.success) {
        showToast("Document uploaded successfully");
        setShowUploadModal(false);
        // Refresh the page to show the new document
        router.refresh();
      } else {
        showToast(result.error || "Failed to upload document");
      }
    } catch (error) {
      showToast("Failed to upload document");
    } finally {
      setActionLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingDocument) return;

    setActionLoading((prev) => ({ ...prev, update: true }));

    try {
      const result = await updateDocumentAction(editingDocument.id, formData);

      if (result.success) {
        // Optimistic update
        addOptimisticDocument({ type: "update", document: result.data });
        showToast("Document updated successfully");
        setShowEditModal(false);
        setEditingDocument(null);
        router.refresh();
      } else {
        showToast(result.error || "Failed to update document");
      }
    } catch (error) {
      showToast("Failed to update document");
    } finally {
      setActionLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDocument) return;

    setActionLoading((prev) => ({ ...prev, delete: true }));

    try {
      // Optimistic update
      addOptimisticDocument({ type: "delete", id: deletingDocument.id });

      const result = await deleteDocumentAction(deletingDocument.id);

      if (result.success) {
        showToast("Document deleted successfully");
        setDeletingDocument(null);
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete document");
        // Revert optimistic update by refreshing
        router.refresh();
      }
    } catch (error) {
      showToast("Failed to delete document");
      router.refresh();
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleReprocess = async (document: Document) => {
    setActionLoading((prev) => ({ ...prev, reprocess: true }));

    try {
      // Optimistic update
      addOptimisticDocument({ type: "reprocess", id: document.id });

      const result = await reprocessDocumentAction(document.id);

      if (result.success) {
        showToast("Document reprocessing started");
        router.refresh();
      } else {
        showToast(result.error || "Failed to reprocess document");
        router.refresh();
      }
    } catch (error) {
      showToast("Failed to reprocess document");
      router.refresh();
    } finally {
      setActionLoading((prev) => ({ ...prev, reprocess: false }));
    }
  };

  const handleSort = (key: string, order: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", key);
    params.set("sortOrder", order);
    params.set("page", "1"); // Reset to first page

    startTransition(() => {
      router.push(`/documents?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/documents?${params.toString()}`);
    });
  };

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1"); // Reset to first page

    startTransition(() => {
      router.push(`/documents?${params.toString()}`);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-end">
        <Button onClick={handleUploadDocument} isLoading={actionLoading.upload}>
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      {initialStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {initialStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {initialStats.processed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {initialStats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {initialStats.failed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatFileSize(initialStats.totalSize)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {initialError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{initialError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="text-red-400 hover:text-red-600"
                onClick={() => router.refresh()}
              >
                <span className="sr-only">Retry</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {statsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{statsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <DocumentFiltersComponent
        filters={initialFilters}
        onSearch={searchDocumentsAction}
        loading={isPending}
      />

      {/* Table */}
      <DocumentTable
        documents={optimisticDocuments}
        loading={isPending}
        onEdit={handleEditDocument}
        onDelete={handleDeleteDocument}
        onReprocess={handleReprocess}
        onPreview={handlePreviewDocument}
        onSort={handleSort}
        sortKey={initialFilters.sortBy}
        sortOrder={initialFilters.sortOrder}
        reprocessingIds={actionLoading.reprocess ? [] : []}
      />

      {/* Pagination */}
      {initialTotalPages > 1 && (
        <Pagination
          currentPage={initialCurrentPage}
          totalPages={initialTotalPages}
          totalItems={initialTotalDocuments}
          itemsPerPage={initialLimit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          loading={isPending}
        />
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
        loading={actionLoading.upload}
      />

      {/* Edit Modal */}
      <DocumentEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDocument(null);
        }}
        document={editingDocument}
        onSubmit={handleEditSubmit}
        loading={actionLoading.update}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDocument}
        onClose={() => setDeletingDocument(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deletingDocument?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={actionLoading.delete}
      />
    </div>
  );
}
