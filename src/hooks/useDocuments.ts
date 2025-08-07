"use client";

import { useState } from "react";
import {
  Document,
  DocumentUpload,
  DocumentFilters,
  DocumentStats,
} from "@/types/document";

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
  setFilters: (filters: DocumentFilters) => void;

  // Sorting
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Refresh
  refresh: () => Promise<void>;
}

// Simple stub implementation for compatibility with ingestion pages
// This should be replaced with proper backend integration when needed
export function useDocuments(
  options: UseDocumentsOptions = {}
): UseDocumentsReturn {
  const [documents] = useState<Document[]>([]);
  const [loading] = useState(false);

  return {
    // Data
    documents,
    totalDocuments: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10,
    stats: null,

    // Loading states
    loading,
    uploading: false,
    updating: false,
    deleting: false,
    reprocessing: false,
    statsLoading: false,

    // Error states
    error: null,

    // Actions - all no-ops for now
    fetchDocuments: async () => {},
    uploadDocument: async () => ({}) as Document,
    updateDocument: async () => ({}) as Document,
    deleteDocument: async () => {},
    reprocessDocument: async () => ({}) as Document,
    fetchStats: async () => {},

    // Pagination
    setPage: () => {},
    setLimit: () => {},

    // Filtering
    setFilters: () => {},

    // Sorting
    setSorting: () => {},

    // Refresh
    refresh: async () => {},
  };
}
