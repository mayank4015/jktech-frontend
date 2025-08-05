import {
  Document,
  DocumentUpload,
  DocumentFilters,
  DocumentStats,
} from "@/types/document";
import { PaginatedResponse } from "@/types/common";

// Mock document data
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Annual Report 2023",
    description:
      "Comprehensive annual report covering financial performance and strategic initiatives",
    fileName: "annual-report-2023.pdf",
    fileUrl: "/mock-files/annual-report-2023.pdf",
    fileType: "application/pdf",
    fileSize: 2547832, // ~2.5MB
    uploadedBy: "1",
    uploadedByName: "John Admin",
    createdAt: "2023-12-01T10:30:00Z",
    updatedAt: "2023-12-01T10:35:00Z",
    status: "processed",
    tags: ["annual", "report", "financial", "2023"],
    category: "Reports",
    processingProgress: 100,
  },
  {
    id: "2",
    title: "Product Specifications v2.1",
    description: "Technical specifications for the new product line",
    fileName: "product-specs-v2.1.docx",
    fileUrl: "/mock-files/product-specs-v2.1.docx",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 1234567, // ~1.2MB
    uploadedBy: "2",
    uploadedByName: "Jane Doe",
    createdAt: "2023-11-28T14:20:00Z",
    updatedAt: "2023-11-28T14:25:00Z",
    status: "processed",
    tags: ["product", "specifications", "technical"],
    category: "Documentation",
    processingProgress: 100,
  },
  {
    id: "3",
    title: "Market Analysis Q4 2023",
    description: "Quarterly market analysis and competitive landscape review",
    fileName: "market-analysis-q4-2023.pptx",
    fileUrl: "/mock-files/market-analysis-q4-2023.pptx",
    fileType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    fileSize: 3456789, // ~3.5MB
    uploadedBy: "3",
    uploadedByName: "Mike Wilson",
    createdAt: "2023-11-25T09:15:00Z",
    updatedAt: "2023-11-25T09:20:00Z",
    status: "pending",
    tags: ["market", "analysis", "q4", "competitive"],
    category: "Analysis",
    processingProgress: 45,
  },
  {
    id: "4",
    title: "Customer Feedback Summary",
    description: "Compilation of customer feedback from Q3 2023",
    fileName: "customer-feedback-q3.xlsx",
    fileUrl: "/mock-files/customer-feedback-q3.xlsx",
    fileType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 987654, // ~1MB
    uploadedBy: "2",
    uploadedByName: "Jane Doe",
    createdAt: "2023-11-20T16:45:00Z",
    updatedAt: "2023-11-20T16:50:00Z",
    status: "processed",
    tags: ["customer", "feedback", "q3", "survey"],
    category: "Feedback",
    processingProgress: 100,
  },
  {
    id: "5",
    title: "Training Manual v1.0",
    description: "Employee training manual for new hires",
    fileName: "training-manual-v1.0.pdf",
    fileUrl: "/mock-files/training-manual-v1.0.pdf",
    fileType: "application/pdf",
    fileSize: 4567890, // ~4.5MB
    uploadedBy: "5",
    uploadedByName: "David Brown",
    createdAt: "2023-11-15T11:20:00Z",
    updatedAt: "2023-11-15T11:30:00Z",
    status: "failed",
    tags: ["training", "manual", "employees", "onboarding"],
    category: "Training",
    processingProgress: 0,
    errorMessage: "File format not supported for processing",
  },
];

// Available categories and tags for filtering
export const documentCategories = [
  "Reports",
  "Documentation",
  "Analysis",
  "Feedback",
  "Training",
  "Legal",
  "Marketing",
  "Technical",
];

export const commonTags = [
  "annual",
  "report",
  "financial",
  "product",
  "specifications",
  "technical",
  "market",
  "analysis",
  "competitive",
  "customer",
  "feedback",
  "survey",
  "training",
  "manual",
  "employees",
  "onboarding",
  "legal",
  "marketing",
  "q1",
  "q2",
  "q3",
  "q4",
  "2023",
  "2024",
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDocumentService = {
  getDocuments: async (
    page: number = 1,
    limit: number = 10,
    filters: DocumentFilters = {}
  ): Promise<PaginatedResponse<Document>> => {
    await delay(800);

    let filteredDocuments = [...mockDocuments];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search) ||
          doc.description?.toLowerCase().includes(search) ||
          doc.fileName.toLowerCase().includes(search) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.status === filters.status
      );
    }

    if (filters.category) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.category === filters.category
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        filters.tags!.some((tag) => doc.tags.includes(tag))
      );
    }

    if (filters.uploadedBy) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.uploadedBy === filters.uploadedBy
      );
    }

    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredDocuments = filteredDocuments.filter((doc) => {
        const docDate = new Date(doc.createdAt);
        return docDate >= startDate && docDate <= endDate;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredDocuments.sort((a, b) => {
        let aValue: any = a[filters.sortBy!];
        let bValue: any = b[filters.sortBy!];

        // Handle date sorting
        if (filters.sortBy === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (filters.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    return {
      data: paginatedDocuments,
      total: filteredDocuments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredDocuments.length / limit),
    };
  },

  getDocumentById: async (id: string): Promise<Document | null> => {
    await delay(600);
    return mockDocuments.find((doc) => doc.id === id) || null;
  },

  uploadDocument: async (uploadData: DocumentUpload): Promise<Document> => {
    await delay(2000); // Simulate longer upload time

    const newDocument: Document = {
      id: `${mockDocuments.length + 1}`,
      title: uploadData.title,
      description: uploadData.description,
      fileName: uploadData.file.name,
      fileUrl: `/mock-files/${uploadData.file.name}`,
      fileType: uploadData.file.type,
      fileSize: uploadData.file.size,
      uploadedBy: "1", // Current user ID (would come from auth context)
      uploadedByName: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      tags: uploadData.tags,
      category: uploadData.category,
      processingProgress: 0,
    };

    // In real implementation, this would be saved to database
    mockDocuments.push(newDocument);

    // Simulate processing progress
    setTimeout(() => {
      const docIndex = mockDocuments.findIndex((d) => d.id === newDocument.id);
      if (docIndex !== -1) {
        mockDocuments[docIndex].processingProgress = 100;
        mockDocuments[docIndex].status = "processed";
        mockDocuments[docIndex].updatedAt = new Date().toISOString();
      }
    }, 3000);

    return newDocument;
  },

  updateDocument: async (
    id: string,
    updateData: Partial<
      Pick<Document, "title" | "description" | "tags" | "category">
    >
  ): Promise<Document> => {
    await delay(800);

    const docIndex = mockDocuments.findIndex((doc) => doc.id === id);
    if (docIndex === -1) {
      throw new Error("Document not found");
    }

    const updatedDocument: Document = {
      ...mockDocuments[docIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    mockDocuments[docIndex] = updatedDocument;
    return updatedDocument;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await delay(600);

    const docIndex = mockDocuments.findIndex((doc) => doc.id === id);
    if (docIndex === -1) {
      throw new Error("Document not found");
    }

    // In real implementation, this would delete from database and file storage
    mockDocuments.splice(docIndex, 1);
  },

  getDocumentStats: async (): Promise<DocumentStats> => {
    await delay(500);

    const stats = mockDocuments.reduce(
      (acc, doc) => {
        acc.total++;
        acc[doc.status]++;
        acc.totalSize += doc.fileSize;
        return acc;
      },
      {
        total: 0,
        processed: 0,
        pending: 0,
        failed: 0,
        totalSize: 0,
      }
    );

    return stats;
  },

  reprocessDocument: async (id: string): Promise<Document> => {
    await delay(1000);

    const docIndex = mockDocuments.findIndex((doc) => doc.id === id);
    if (docIndex === -1) {
      throw new Error("Document not found");
    }

    // Reset processing status
    mockDocuments[docIndex].status = "pending";
    mockDocuments[docIndex].processingProgress = 0;
    mockDocuments[docIndex].errorMessage = undefined;
    mockDocuments[docIndex].updatedAt = new Date().toISOString();

    // Simulate reprocessing
    setTimeout(() => {
      const currentDocIndex = mockDocuments.findIndex((d) => d.id === id);
      if (currentDocIndex !== -1) {
        mockDocuments[currentDocIndex].processingProgress = 100;
        mockDocuments[currentDocIndex].status = "processed";
        mockDocuments[currentDocIndex].updatedAt = new Date().toISOString();
      }
    }, 2000);

    return mockDocuments[docIndex];
  },
};

// Service factory
export const getDocumentService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockDocumentService;
  }
  // In Phase 2, we'll implement the real service
  return mockDocumentService;
};
