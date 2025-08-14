export interface Ingestion {
  id: string;
  documentId: string;
  documentTitle: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  processingSteps: IngestionStep[];
  configuration: IngestionConfiguration;
  createdBy: string;
  createdByName: string;
}

export interface IngestionStep {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  details?: string;
}

export interface IngestionConfiguration {
  chunkSize: number;
  chunkOverlap: number;
  extractImages: boolean;
  extractTables: boolean;
  language: string;
  processingMode: "standard" | "enhanced" | "custom";
  customSettings?: Record<string, any>;
}

export interface CreateIngestionData {
  documentId: string;
  config?: Partial<IngestionConfiguration>;
}

export interface IngestionFilters {
  search?: string;
  status?: "all" | "queued" | "processing" | "completed" | "failed";
  documentId?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?:
    | "createdAt"
    | "startedAt"
    | "completedAt"
    | "progress"
    | "documentTitle";
  sortOrder?: "asc" | "desc";
}

export interface IngestionStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface IngestionBatch {
  id: string;
  name: string;
  documentIds: string[];
  configuration: IngestionConfiguration;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  ingestions: Ingestion[];
}
