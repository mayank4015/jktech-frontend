"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Document,
  DocumentFilters,
  DocumentStats,
  PaginatedDocumentsResponse,
} from "@/types/document";
import { config } from "@/config/env";
import { getAuthHeaders } from "./auth";

// Types for server actions
export interface DocumentActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DocumentUploadFormData {
  title: string;
  description?: string;
  tags?: string;
  category?: string;
  file: File;
}

export interface DocumentUpdateFormData {
  title: string;
  description?: string;
  tags?: string;
  category?: string;
}

export interface DocumentSearchFormData {
  search?: string;
  status?: string;
  category?: string;
  tags?: string;
  uploadedBy?: string;
  dateStart?: string;
  dateEnd?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

// Helper function to handle API errors
function handleApiError<T = unknown>(
  error: unknown
): DocumentActionResponse<T> {
  console.error("API Error:", error);

  let errorMessage = "An unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  }

  return {
    success: false,
    error: errorMessage,
  };
}

// Helper function to parse tags
function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  try {
    return JSON.parse(tagsString);
  } catch {
    return tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

// Fetch documents with filters and pagination
export async function fetchDocuments(
  page: number = 1,
  limit: number = 10,
  filters: DocumentFilters = {}
): Promise<DocumentActionResponse<PaginatedDocumentsResponse>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.uploadedBy) params.append("uploadedBy", filters.uploadedBy);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.tags?.length) {
      filters.tags.forEach((tag) => params.append("tags", tag));
    }
    if (filters.dateRange?.start)
      params.append("dateStart", filters.dateRange.start);
    if (filters.dateRange?.end) params.append("dateEnd", filters.dateRange.end);

    const response = await fetch(`${config.api.baseUrl}/documents?${params}`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError<PaginatedDocumentsResponse>(error);
  }
}

// Upload document action
export async function uploadDocumentAction(
  formData: FormData
): Promise<DocumentActionResponse<Document>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsString = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return {
        success: false,
        error: "Title and file are required",
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 10MB",
      };
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error:
          "File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, or image files (JPEG, PNG, GIF).",
      };
    }

    // Prepare form data for API
    const apiFormData = new FormData();
    apiFormData.append("file", file);
    apiFormData.append("title", title);
    if (description) apiFormData.append("description", description);
    if (category) apiFormData.append("category", category);

    // Handle tags
    const tags = parseTags(tagsString);
    if (tags.length > 0) {
      apiFormData.append("tags", JSON.stringify(tags));
    }

    // Remove Content-Type from headers for FormData uploads
    const { "Content-Type": _, ...uploadHeaders } = headers;

    const response = await fetch(`${config.api.baseUrl}/documents/upload`, {
      method: "POST",
      headers: {
        ...uploadHeaders,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: apiFormData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Revalidate the documents page
    revalidatePath("/documents");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

// Update document action
export async function updateDocumentAction(
  id: string,
  formData: FormData
): Promise<DocumentActionResponse<Document>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsString = formData.get("tags") as string;
    const category = formData.get("category") as string;

    if (!title) {
      return {
        success: false,
        error: "Title is required",
      };
    }

    const updateData: Record<string, unknown> = { title };
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    const tags = parseTags(tagsString);
    if (tags.length > 0) {
      updateData.tags = tags;
    }

    const response = await fetch(`${config.api.baseUrl}/documents/${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Revalidate the documents page
    revalidatePath("/documents");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete document action
export async function deleteDocumentAction(
  id: string
): Promise<DocumentActionResponse<void>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(`${config.api.baseUrl}/documents/${id}`, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Revalidate the documents page
    revalidatePath("/documents");

    return {
      success: true,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

// Reprocess document action
export async function reprocessDocumentAction(
  id: string
): Promise<DocumentActionResponse<Document>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(
      `${config.api.baseUrl}/documents/${id}/reprocess`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Revalidate the documents page
    revalidatePath("/documents");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

// Search documents action (for URL-based filtering)
export async function searchDocumentsAction(formData: FormData): Promise<void> {
  const searchParams = new URLSearchParams();

  const search = formData.get("search") as string;
  const status = formData.get("status") as string;
  const category = formData.get("category") as string;
  const tagsString = formData.get("tags") as string;
  const uploadedBy = formData.get("uploadedBy") as string;
  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;
  const sortBy = formData.get("sortBy") as string;
  const sortOrder = formData.get("sortOrder") as string;

  if (search) searchParams.set("search", search);
  if (status && status !== "all") searchParams.set("status", status);
  if (category) searchParams.set("category", category);
  if (uploadedBy) searchParams.set("uploadedBy", uploadedBy);
  if (dateStart) searchParams.set("dateStart", dateStart);
  if (dateEnd) searchParams.set("dateEnd", dateEnd);
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (sortOrder) searchParams.set("sortOrder", sortOrder);

  // Handle tags
  const tags = parseTags(tagsString);
  if (tags.length > 0) {
    tags.forEach((tag) => searchParams.append("tags", tag));
  }

  // Reset to first page when searching
  searchParams.set("page", "1");

  const queryString = searchParams.toString();
  const url = queryString ? `/documents?${queryString}` : "/documents";

  redirect(url);
}

// Fetch document stats
export async function fetchDocumentStats(): Promise<
  DocumentActionResponse<DocumentStats>
> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(`${config.api.baseUrl}/documents/stats`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

// Get single document
export async function fetchDocument(
  id: string
): Promise<DocumentActionResponse<Document>> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(`${config.api.baseUrl}/documents/${id}`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
}
