"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/config/env";
import {
  Question,
  Answer,
  Conversation,
  QAFilters,
  QAStats,
  QASearchResult,
  DocumentSearchResult,
  EnhancedQAResult,
} from "@/types/qa";
import { PaginatedResponse } from "@/types/common";

// Type for the Q&A API response
interface QAApiResponse {
  question: Question & { answer: Answer };
  conversationId: string;
}

/**
 * Get authentication headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Handle API response and errors
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message if JSON parsing fails
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Handle API errors for functions that return data directly
 */
function handleApiError<T = unknown>(error: unknown): T {
  console.error("API Error:", error);

  let errorMessage = "An unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  }

  // For functions that should return data, we'll throw the error
  // This maintains consistency with the existing error handling pattern
  throw new Error(errorMessage);
}

/**
 * Ask a question and get an AI-generated answer
 */
export async function askQuestion(
  text: string,
  conversationId?: string
): Promise<QAApiResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${config.api.baseUrl}/qa/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        conversationId,
      }),
    });

    return handleApiResponse<QAApiResponse>(response);
  } catch (error) {
    console.error("Failed to ask question:", error);
    throw error;
  }
}

/**
 * Get paginated list of conversations
 */
export async function getConversations(
  page: number = 1,
  limit: number = 10,
  filters: QAFilters = {}
): Promise<PaginatedResponse<Conversation>> {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to params
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.isBookmarked !== undefined) {
      params.append("isBookmarked", filters.isBookmarked.toString());
    }
    if (filters.dateStart) {
      params.append("dateStart", filters.dateStart);
    }
    if (filters.dateEnd) {
      params.append("dateEnd", filters.dateEnd);
    }
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => params.append("tags", tag));
    }

    const response = await fetch(
      `${config.api.baseUrl}/qa/conversations?${params}`,
      {
        method: "GET",
        headers,
      }
    );

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to get conversations:", error);
    throw error;
  }
}

/**
 * Get Q&A statistics
 */
export async function getQAStats(): Promise<QAStats> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(`${config.api.baseUrl}/qa/stats`, {
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
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Enhanced document search using server action
 */
export async function searchDocuments(
  query: string,
  limit: number = 10
): Promise<DocumentSearchResult[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await fetch(`${config.api.baseUrl}/qa/search?${params}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const sources = data?.sources || [];

    // Transform backend response to match frontend DocumentSearchResult interface
    return sources.map((source: any) => ({
      documentId: source.documentId,
      documentTitle: source.title,
      excerpt: source.excerpt,
      relevanceScore: source.relevanceScore,
      context: source.summary || source.description || "",
      matchType: source.matchType,
    }));
  } catch (error) {
    console.error("Failed to search documents:", error);
    throw error; // Re-throw to handle in component
  }
}

/**
 * Server action for document search using form data
 */
interface SearchActionState {
  success: boolean;
  data?: DocumentSearchResult[];
  error?: string;
}

export async function searchDocumentsForQAAction(
  prevState: SearchActionState,
  formData: FormData
): Promise<SearchActionState> {
  try {
    const query = formData.get("query") as string;
    const limit = parseInt(formData.get("limit") as string) || 10;

    if (!query?.trim()) {
      return {
        success: false,
        error: "Search query is required",
      };
    }

    const results = await searchDocuments(query, limit);

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Search action failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

/**
 * Enhanced Q&A with rich responses (replaces basic askQuestion for enhanced features)
 */
export async function askEnhancedQuestion(
  question: string,
  documentId?: string
): Promise<EnhancedQAResult | null> {
  try {
    const headers = await getAuthHeaders();

    // Note: Backend doesn't support document-specific queries yet
    // The system searches across all user documents automatically
    const response = await fetch(`${config.api.baseUrl}/qa/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text: question }),
      cache: "no-store", // Don't cache Q&A responses
    });

    const result = await handleApiResponse<QAApiResponse>(response);

    // Transform standard Q&A response to EnhancedQAResult format
    if (result?.question?.answer) {
      return {
        answer: result.question.answer.text,
        confidence: result.question.answer.confidence,
        sources: (result.question.answer.sources || []).map((source) => ({
          documentId: source.documentId,
          title: source.documentTitle,
          excerpt: source.excerpt,
          relevanceScore: source.relevanceScore,
        })),
        processingTime: result.question.answer.processingTime || 0,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get enhanced answer:", error);
    return null;
  }
}

/**
 * Get document details for context
 */
export async function getDocumentDetails(documentId: string) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${config.api.baseUrl}/documents/${documentId}`,
      {
        method: "GET",
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to get document details:", error);
    return null;
  }
}

/**
 * Form action for document search
 */
export async function handleDocumentSearch(formData: FormData) {
  const query = formData.get("query") as string;
  const limit = parseInt(formData.get("limit") as string) || 10;

  if (!query?.trim()) {
    return { error: "Please enter a search query" };
  }

  try {
    const results = await searchDocuments(query, limit);
    return { success: true, results, query };
  } catch {
    return { error: "Search failed. Please try again." };
  }
}

/**
 * Form action for enhanced Q&A
 */
export async function handleEnhancedQuestion(formData: FormData) {
  const question = formData.get("question") as string;
  const documentId = (formData.get("documentId") as string) || undefined;

  if (!question?.trim()) {
    return { error: "Please enter a question" };
  }

  try {
    const result = await askEnhancedQuestion(question, documentId);

    if (!result) {
      return { error: "Failed to get answer. Please try again." };
    }

    return { success: true, result, question, documentId };
  } catch {
    return { error: "Failed to get answer. Please try again." };
  }
}

/**
 * Search through Q&As
 */
export async function searchQAs(
  query: string,
  filters: QAFilters = {}
): Promise<QASearchResult[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const params = new URLSearchParams({ query });

    if (filters.userId) params.append("userId", filters.userId);
    if (filters.hasAnswers !== undefined)
      params.append("hasAnswers", filters.hasAnswers.toString());
    if (filters.minConfidence)
      params.append("minConfidence", filters.minConfidence.toString());
    if (filters.documentIds?.length) {
      filters.documentIds.forEach((id) => params.append("documentIds", id));
    }
    if (filters.tags?.length) {
      filters.tags.forEach((tag) => params.append("tags", tag));
    }
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await fetch(`${config.api.baseUrl}/qa/search?${params}`, {
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
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}
