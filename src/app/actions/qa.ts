"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/config/env";
import {
  Question,
  Answer,
  Conversation,
  ConversationWithQuestions,
  SavedQA,
  QAFilters,
  QAStats,
  QuestionSuggestion,
  QASearchResult,
} from "@/types/qa";
import { PaginatedResponse } from "@/types/common";

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
): Promise<{
  question: Question & { answer: Answer };
  conversationId: string;
}> {
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

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to ask question:", error);
    throw error;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(title: string): Promise<Conversation> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${config.api.baseUrl}/qa/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title }),
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to create conversation:", error);
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
 * Get a specific conversation with its questions and answers
 */
export async function getConversation(
  id: string
): Promise<ConversationWithQuestions> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${config.api.baseUrl}/qa/conversations/${id}`,
      {
        method: "GET",
        headers,
      }
    );

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to get conversation:", error);
    throw error;
  }
}

/**
 * Update a conversation
 */
export async function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${config.api.baseUrl}/qa/conversations/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      }
    );

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to update conversation:", error);
    throw error;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${config.api.baseUrl}/qa/conversations/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    await handleApiResponse(response);
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw error;
  }
}

/**
 * Save a Q&A pair for future reference
 */
export async function saveQA(
  questionId: string,
  answerId: string,
  notes?: string,
  tags?: string[]
): Promise<SavedQA> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${config.api.baseUrl}/qa/save`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        questionId,
        answerId,
        notes,
        tags,
      }),
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to save Q&A:", error);
    throw error;
  }
}

/**
 * Get paginated list of saved Q&As
 */
export async function getSavedQAs(
  page: number = 1,
  limit: number = 10,
  filters: QAFilters = {}
): Promise<PaginatedResponse<SavedQA>> {
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
    if (filters.dateStart) {
      params.append("dateStart", filters.dateStart);
    }
    if (filters.dateEnd) {
      params.append("dateEnd", filters.dateEnd);
    }
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => params.append("tags", tag));
    }

    const response = await fetch(`${config.api.baseUrl}/qa/saved?${params}`, {
      method: "GET",
      headers,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error("Failed to get saved Q&As:", error);
    throw error;
  }
}

/**
 * Delete a saved Q&A
 */
export async function deleteSavedQA(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${config.api.baseUrl}/qa/saved/${id}`, {
      method: "DELETE",
      headers,
    });

    await handleApiResponse(response);
  } catch (error) {
    console.error("Failed to delete saved Q&A:", error);
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
 * Get question suggestions
 */
export async function getQuestionSuggestions(
  category?: string
): Promise<QuestionSuggestion[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const params = new URLSearchParams();
    if (category) params.append("category", category);

    const response = await fetch(
      `${config.api.baseUrl}/qa/suggestions?${params}`,
      {
        method: "GET",
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
    return result.data;
  } catch (error) {
    return handleApiError(error);
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
