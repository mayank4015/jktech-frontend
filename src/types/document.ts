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
  status: "pending" | "processed" | "failed";
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
  status?: "all" | "pending" | "processed" | "failed";
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
  processed: number;
  pending: number;
  failed: number;
  totalSize: number;
}
