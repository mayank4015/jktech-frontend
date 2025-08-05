import {
  Ingestion,
  IngestionStep,
  IngestionConfiguration,
  CreateIngestionData,
  IngestionFilters,
  IngestionStats,
  IngestionBatch,
} from "@/types/ingestion";
import { PaginatedResponse } from "@/types/common";

// Mock ingestion steps
const createMockSteps = (status: Ingestion["status"]): IngestionStep[] => {
  const steps: IngestionStep[] = [
    {
      id: "1",
      name: "Document Parsing",
      status: "completed",
      progress: 100,
      startedAt: "2024-01-15T10:00:00Z",
      completedAt: "2024-01-15T10:02:00Z",
      details: "Extracted text and metadata from document",
    },
    {
      id: "2",
      name: "Text Chunking",
      status: status === "failed" ? "failed" : "completed",
      progress: status === "failed" ? 45 : 100,
      startedAt: "2024-01-15T10:02:00Z",
      completedAt: status === "failed" ? undefined : "2024-01-15T10:05:00Z",
      error:
        status === "failed"
          ? "Failed to process large table on page 15"
          : undefined,
      details: "Split document into semantic chunks",
    },
    {
      id: "3",
      name: "Embedding Generation",
      status:
        status === "completed"
          ? "completed"
          : status === "processing"
            ? "processing"
            : "pending",
      progress: status === "completed" ? 100 : status === "processing" ? 75 : 0,
      startedAt:
        status === "completed" || status === "processing"
          ? "2024-01-15T10:05:00Z"
          : undefined,
      completedAt: status === "completed" ? "2024-01-15T10:08:00Z" : undefined,
      details: "Generate vector embeddings for semantic search",
    },
    {
      id: "4",
      name: "Index Storage",
      status: status === "completed" ? "completed" : "pending",
      progress: status === "completed" ? 100 : 0,
      startedAt: status === "completed" ? "2024-01-15T10:08:00Z" : undefined,
      completedAt: status === "completed" ? "2024-01-15T10:10:00Z" : undefined,
      details: "Store embeddings in vector database",
    },
  ];

  return steps;
};

// Mock ingestion data
const mockIngestions: Ingestion[] = [
  {
    id: "ing-1",
    documentId: "doc-1",
    documentTitle: "Annual Report 2023.pdf",
    status: "completed",
    progress: 100,
    startedAt: "2024-01-15T10:00:00Z",
    completedAt: "2024-01-15T10:10:00Z",
    processingSteps: createMockSteps("completed"),
    configuration: {
      chunkSize: 1000,
      chunkOverlap: 200,
      extractImages: true,
      extractTables: true,
      language: "en",
      processingMode: "enhanced",
    },
    createdBy: "user-1",
    createdByName: "John Doe",
  },
  {
    id: "ing-2",
    documentId: "doc-2",
    documentTitle: "Technical Specification.docx",
    status: "processing",
    progress: 75,
    startedAt: "2024-01-15T11:00:00Z",
    processingSteps: createMockSteps("processing"),
    configuration: {
      chunkSize: 800,
      chunkOverlap: 150,
      extractImages: false,
      extractTables: true,
      language: "en",
      processingMode: "standard",
    },
    createdBy: "user-2",
    createdByName: "Jane Smith",
  },
  {
    id: "ing-3",
    documentId: "doc-3",
    documentTitle: "Research Paper.pdf",
    status: "failed",
    progress: 45,
    startedAt: "2024-01-15T09:00:00Z",
    error: "Failed to process large table on page 15",
    processingSteps: createMockSteps("failed"),
    configuration: {
      chunkSize: 1200,
      chunkOverlap: 100,
      extractImages: true,
      extractTables: true,
      language: "en",
      processingMode: "enhanced",
    },
    createdBy: "user-1",
    createdByName: "John Doe",
  },
  {
    id: "ing-4",
    documentId: "doc-4",
    documentTitle: "User Manual.pdf",
    status: "queued",
    progress: 0,
    startedAt: "2024-01-15T12:00:00Z",
    processingSteps: createMockSteps("queued"),
    configuration: {
      chunkSize: 1000,
      chunkOverlap: 200,
      extractImages: false,
      extractTables: false,
      language: "en",
      processingMode: "standard",
    },
    createdBy: "user-3",
    createdByName: "Bob Wilson",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Filter and sort ingestions
const filterIngestions = (
  ingestions: Ingestion[],
  filters: IngestionFilters
): Ingestion[] => {
  let filtered = [...ingestions];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (ing) =>
        ing.documentTitle.toLowerCase().includes(searchLower) ||
        ing.createdByName.toLowerCase().includes(searchLower) ||
        ing.id.toLowerCase().includes(searchLower)
    );
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((ing) => ing.status === filters.status);
  }

  if (filters.documentId) {
    filtered = filtered.filter((ing) => ing.documentId === filters.documentId);
  }

  if (filters.createdBy) {
    filtered = filtered.filter((ing) => ing.createdBy === filters.createdBy);
  }

  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter((ing) => {
      const createdAt = new Date(ing.startedAt);
      return createdAt >= start && createdAt <= end;
    });
  }

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case "documentTitle":
          aValue = a.documentTitle;
          bValue = b.documentTitle;
          break;
        case "startedAt":
          aValue = new Date(a.startedAt);
          bValue = new Date(b.startedAt);
          break;
        case "completedAt":
          aValue = a.completedAt ? new Date(a.completedAt) : new Date(0);
          bValue = b.completedAt ? new Date(b.completedAt) : new Date(0);
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        default:
          aValue = new Date(a.startedAt);
          bValue = new Date(b.startedAt);
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  return filtered;
};

export const mockIngestionService = {
  // Get paginated ingestions
  getIngestions: async (
    page: number = 1,
    limit: number = 10,
    filters: IngestionFilters = {}
  ): Promise<PaginatedResponse<Ingestion>> => {
    await delay(800);

    const filtered = filterIngestions(mockIngestions, filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // Get single ingestion
  getIngestion: async (id: string): Promise<Ingestion | null> => {
    await delay(500);

    const ingestion = mockIngestions.find((ing) => ing.id === id);
    return ingestion || null;
  },

  // Create new ingestion
  createIngestion: async (data: CreateIngestionData): Promise<Ingestion> => {
    await delay(1000);

    // Simulate validation
    if (!data.documentId) {
      throw new Error("Document ID is required");
    }

    const newIngestion: Ingestion = {
      id: `ing-${Date.now()}`,
      documentId: data.documentId,
      documentTitle: `Document ${data.documentId}.pdf`,
      status: "queued",
      progress: 0,
      startedAt: new Date().toISOString(),
      processingSteps: createMockSteps("queued"),
      configuration: {
        chunkSize: 1000,
        chunkOverlap: 200,
        extractImages: true,
        extractTables: true,
        language: "en",
        processingMode: "standard",
        ...data.configuration,
      },
      createdBy: "current-user",
      createdByName: "Current User",
    };

    // Add to mock data
    mockIngestions.unshift(newIngestion);

    return newIngestion;
  },

  // Retry failed ingestion
  retryIngestion: async (id: string): Promise<Ingestion> => {
    await delay(800);

    const ingestion = mockIngestions.find((ing) => ing.id === id);
    if (!ingestion) {
      throw new Error("Ingestion not found");
    }

    if (ingestion.status !== "failed") {
      throw new Error("Only failed ingestions can be retried");
    }

    // Reset ingestion status
    ingestion.status = "queued";
    ingestion.progress = 0;
    ingestion.error = undefined;
    ingestion.startedAt = new Date().toISOString();
    ingestion.completedAt = undefined;
    ingestion.processingSteps = createMockSteps("queued");

    return ingestion;
  },

  // Cancel ingestion
  cancelIngestion: async (id: string): Promise<void> => {
    await delay(500);

    const ingestion = mockIngestions.find((ing) => ing.id === id);
    if (!ingestion) {
      throw new Error("Ingestion not found");
    }

    if (ingestion.status === "completed") {
      throw new Error("Cannot cancel completed ingestion");
    }

    ingestion.status = "failed";
    ingestion.error = "Cancelled by user";
  },

  // Get ingestion statistics
  getIngestionStats: async (): Promise<IngestionStats> => {
    await delay(600);

    const total = mockIngestions.length;
    const queued = mockIngestions.filter(
      (ing) => ing.status === "queued"
    ).length;
    const processing = mockIngestions.filter(
      (ing) => ing.status === "processing"
    ).length;
    const completed = mockIngestions.filter(
      (ing) => ing.status === "completed"
    ).length;
    const failed = mockIngestions.filter(
      (ing) => ing.status === "failed"
    ).length;

    // Calculate average processing time for completed ingestions
    const completedIngestions = mockIngestions.filter(
      (ing) => ing.status === "completed" && ing.completedAt
    );
    const averageProcessingTime =
      completedIngestions.length > 0
        ? completedIngestions.reduce((sum, ing) => {
            const start = new Date(ing.startedAt).getTime();
            const end = new Date(ing.completedAt!).getTime();
            return sum + (end - start);
          }, 0) / completedIngestions.length
        : 0;

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      queued,
      processing,
      completed,
      failed,
      averageProcessingTime: Math.round(averageProcessingTime / 1000), // Convert to seconds
      successRate: Math.round(successRate * 100) / 100,
    };
  },

  // Get default configuration
  getDefaultConfiguration: async (): Promise<IngestionConfiguration> => {
    await delay(300);

    return {
      chunkSize: 1000,
      chunkOverlap: 200,
      extractImages: true,
      extractTables: true,
      language: "en",
      processingMode: "standard",
    };
  },
};

// Service factory
export const getIngestionService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockIngestionService;
  }

  // In Phase 2, we'll implement the real service
  return mockIngestionService;
};
