"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Document,
  DocumentUpload,
  DocumentFilters,
  DocumentStats,
} from "@/types/document";
import { PaginatedResponse } from "@/types/common";
import { getDocumentService } from "@/lib/mockServices/documentService";

export interface UseDocumentsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: DocumentFilters;
  autoFetch?: boolean;
}

export interface UseDocumentsReturn {
  // Data
  documents: Document[];
  totalDocuments: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  stats: DocumentStats | null;

  // Loading states
  loading: boolean;
  uploading: boolean;
  updating: boolean;
  deleting: boolean;
  reprocessing: boolean;
  statsLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (uploadData: DocumentUpload) => Promise<Document>;
  updateDocument: (
    id: string,
    updateData: Partial<
      Pick<Document, "title" | "description" | "tags" | "category">
    >
  ) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  reprocessDocument: (id: string) => Promise<Document>;
  fetchStats: () => Promise<void>;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Filtering
  filters: DocumentFilters;
  setFilters: (filters: DocumentFilters) => void;
  clearFilters: () => void;

  // Sorting
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Refresh
  refresh: () => Promise<void>;
}

export function useDocuments(
  options: UseDocumentsOptions = {}
): UseDocumentsReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
    autoFetch = true,
  } = options;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimitState] = useState(initialLimit);
  const [filters, setFiltersState] = useState<DocumentFilters>(initialFilters);
  const [stats, setStats] = useState<DocumentStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentService = getDocumentService();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<Document> =
        await documentService.getDocuments(currentPage, limit, filters);

      setDocuments(response.data);
      setTotalDocuments(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
      setDocuments([]);
      setTotalDocuments(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters, documentService]);

  const uploadDocument = useCallback(
    async (uploadData: DocumentUpload): Promise<Document> => {
      try {
        setUploading(true);
        setError(null);

        const newDocument = await documentService.uploadDocument(uploadData);

        // Refresh the list to show the new document
        await fetchDocuments();

        return newDocument;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload document";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [documentService, fetchDocuments]
  );

  const updateDocument = useCallback(
    async (
      id: string,
      updateData: Partial<
        Pick<Document, "title" | "description" | "tags" | "category">
      >
    ): Promise<Document> => {
      try {
        setUpdating(true);
        setError(null);

        const updatedDocument = await documentService.updateDocument(
          id,
          updateData
        );

        // Update the document in the local state
        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) => (doc.id === id ? updatedDocument : doc))
        );

        return updatedDocument;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update document";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUpdating(false);
      }
    },
    [documentService]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      try {
        setDeleting(true);
        setError(null);

        await documentService.deleteDocument(id);

        // Remove the document from local state
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.id !== id)
        );
        setTotalDocuments((prev) => prev - 1);

        // If current page becomes empty and it's not the first page, go to previous page
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete document";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setDeleting(false);
      }
    },
    [documentService, documents.length, currentPage]
  );

  const reprocessDocument = useCallback(
    async (id: string): Promise<Document> => {
      try {
        setReprocessing(true);
        setError(null);

        const reprocessedDocument = await documentService.reprocessDocument(id);

        // Update the document in the local state
        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc.id === id ? reprocessedDocument : doc
          )
        );

        return reprocessedDocument;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reprocess document";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setReprocessing(false);
      }
    },
    [documentService]
  );

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const documentStats = await documentService.getDocumentStats();
      setStats(documentStats);
    } catch (err) {
      console.error("Failed to fetch document stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [documentService]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  const setFilters = useCallback((newFilters: DocumentFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setCurrentPage(1);
  }, []);

  const setSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setFiltersState((prev) => ({
        ...prev,
        sortBy: sortBy as DocumentFilters["sortBy"],
        sortOrder,
      }));
    },
    []
  );

  const refresh = useCallback(async () => {
    await Promise.all([fetchDocuments(), fetchStats()]);
  }, [fetchDocuments, fetchStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
      fetchStats();
    }
  }, [fetchDocuments, fetchStats, autoFetch]);

  return {
    // Data
    documents,
    totalDocuments,
    currentPage,
    totalPages,
    limit,
    stats,

    // Loading states
    loading,
    uploading,
    updating,
    deleting,
    reprocessing,
    statsLoading,

    // Error states
    error,

    // Actions
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    reprocessDocument,
    fetchStats,

    // Pagination
    setPage,
    setLimit,

    // Filtering
    filters,
    setFilters,
    clearFilters,

    // Sorting
    setSorting,

    // Refresh
    refresh,
  };
}
