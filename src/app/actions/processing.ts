"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ProcessingConfig {
  extractText?: boolean;
  performOCR?: boolean;
  extractKeywords?: boolean;
  generateSummary?: boolean;
  detectLanguage?: boolean;
  enableSearch?: boolean;
  priority?: number;
}

interface ProcessingStatus {
  status: "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";
  progress: number;
  error?: string;
  jobId?: string;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
}

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function triggerProcessing(
  ingestionId: string,
  config?: ProcessingConfig
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/ingestions/${ingestionId}/process`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ config }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Revalidate the ingestion pages
    revalidatePath("/dashboard/ingestion");
    revalidatePath("/dashboard/documents");

    return {
      success: true,
      jobId: data.jobId,
    };
  } catch (error) {
    console.error("Failed to trigger processing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getProcessingStatus(
  ingestionId: string
): Promise<{ success: boolean; status?: ProcessingStatus; error?: string }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/ingestions/${ingestionId}/status`,
      {
        method: "GET",
        headers,
        cache: "no-store", // Always fetch fresh data for status
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const status = await response.json();

    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error("Failed to get processing status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function cancelProcessing(
  ingestionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/ingestions/${ingestionId}/cancel`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Revalidate the ingestion pages
    revalidatePath("/dashboard/ingestion");
    revalidatePath("/dashboard/documents");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to cancel processing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function retryProcessing(
  ingestionId: string
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/ingestions/${ingestionId}/retry`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Revalidate the ingestion pages
    revalidatePath("/dashboard/ingestion");
    revalidatePath("/dashboard/documents");

    return {
      success: true,
      jobId: data.jobId,
    };
  } catch (error) {
    console.error("Failed to retry processing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getQueueStats(): Promise<{
  success: boolean;
  stats?: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  error?: string;
}> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/processing/queue/stats`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const stats = await response.json();

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
