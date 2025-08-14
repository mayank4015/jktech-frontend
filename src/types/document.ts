export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
  status: "uploaded" | "pending" | "processing" | "processed" | "failed";
  tags: string[];
  category?: string;
  processingProgress?: number;
  errorMessage?: string;
}

export interface DocumentUpload {
  file: File;
  title: string;
  description?: string;
  tags: string[];
  category?: string;
}

export interface DocumentFilters {
  search?: string;
  status?:
    | "all"
    | "uploaded"
    | "pending"
    | "processing"
    | "processed"
    | "failed";
  category?: string;
  tags?: string[];
  uploadedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: "title" | "createdAt" | "fileSize" | "status";
  sortOrder?: "asc" | "desc";
}

export interface DocumentStats {
  total: number;
  uploaded: number;
  pending: number;
  processed: number;
  failed: number;
  totalSize: number;
}

export interface PaginatedDocumentsResponse {
  documents: Document[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: DocumentStats;
}

// Server action response types
export interface DocumentActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form data types for server actions
export interface DocumentFormData {
  title: string;
  description?: string;
  tags?: string; // JSON string or comma-separated
  category?: string;
}

export interface DocumentUploadFormData extends DocumentFormData {
  file: File;
}

// Search params type for URL-based filtering
export interface DocumentSearchParams {
  search?: string;
  status?: string;
  category?: string;
  tags?: string | string[];
  uploadedBy?: string;
  dateStart?: string;
  dateEnd?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}
