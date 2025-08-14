"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Ingestion,
  IngestionFilters,
  IngestionStats,
  CreateIngestionData,
  IngestionConfiguration,
} from "@/types/ingestion";
import { PaginatedResponse } from "@/types/common";
import { config } from "@/config/env";
import { getAuthHeaders } from "./auth";

// Helper function to handle API errors
function handleApiError<T = unknown>(error: unknown): never {
  console.error("Ingestion API Error:", error);

  let errorMessage = "An unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  }

  throw new Error(errorMessage);
}

export async function getIngestions(
  page: number = 1,
  limit: number = 10,
  filters: IngestionFilters = {}
): Promise<PaginatedResponse<Ingestion>> {
  try {
    console.log("🔍 Starting getIngestions with params:", {
      page,
      limit,
      filters,
    });

    const headers = await getAuthHeaders();
    if (!headers) {
      console.log("❌ No auth headers available, redirecting to login");
      redirect("/login?expired=true");
    }

    console.log("✅ Auth headers obtained successfully");

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.documentId) params.append("documentId", filters.documentId);
    if (filters.createdBy) params.append("createdBy", filters.createdBy);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.dateRange?.start)
      params.append("dateStart", filters.dateRange.start);
    if (filters.dateRange?.end) params.append("dateEnd", filters.dateRange.end);

    const url = `${config.api.baseUrl}/ingestions?${params}`;
    console.log("🌐 Making request to:", url);
    console.log("📋 Request headers:", headers);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log("❌ Error response data:", errorData);
      } catch (parseError) {
        console.log("❌ Failed to parse error response as JSON:", parseError);
        errorData = {};
      }

      const errorMessage =
        errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.log("❌ Throwing error:", errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Success response:", result);

    // Transform backend response to match frontend PaginatedResponse type
    const backendData = result.data;
    return {
      data: backendData.ingestions || [],
      total: backendData.pagination?.total || 0,
      page: backendData.pagination?.page || page,
      limit: backendData.pagination?.limit || limit,
      totalPages: backendData.pagination?.totalPages || 0,
    };
  } catch (error) {
    console.log("💥 Exception caught in getIngestions:", error);
    return handleApiError(error);
  }
}

export async function getIngestion(id: string): Promise<Ingestion | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(`${config.api.baseUrl}/ingestions/${id}`, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createIngestion(
  data: CreateIngestionData
): Promise<Ingestion> {
  try {
    console.log("🚀 Creating ingestion with data:", data);

    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    console.log("✅ Auth headers obtained for ingestion creation");

    const response = await fetch(`${config.api.baseUrl}/ingestions`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    console.log("📡 Create ingestion response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ Create ingestion error data:", errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Revalidate the ingestion page
    revalidatePath("/ingestion");

    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function retryIngestion(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(
      `${config.api.baseUrl}/ingestions/${id}/retry`,
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

    // Revalidate the ingestion page
    revalidatePath("/ingestion");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function cancelIngestion(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(
      `${config.api.baseUrl}/ingestions/${id}/cancel`,
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

    // Revalidate the ingestion page
    revalidatePath("/ingestion");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getIngestionStats(): Promise<IngestionStats> {
  try {
    console.log("📊 Starting getIngestionStats");

    const headers = await getAuthHeaders();
    if (!headers) {
      console.log(
        "❌ No auth headers available for stats, redirecting to login"
      );
      redirect("/login?expired=true");
    }

    console.log("✅ Auth headers obtained for stats");

    const url = `${config.api.baseUrl}/ingestions/stats`;
    console.log("🌐 Making stats request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Stats response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log("❌ Stats error response data:", errorData);
      } catch (parseError) {
        console.log(
          "❌ Failed to parse stats error response as JSON:",
          parseError
        );
        errorData = {};
      }

      const errorMessage =
        errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.log("❌ Throwing stats error:", errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Stats success response:", result);
    return result.data;
  } catch (error) {
    console.log("💥 Exception caught in getIngestionStats:", error);
    return handleApiError(error);
  }
}

export async function getDefaultConfiguration(): Promise<IngestionConfiguration> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      redirect("/login?expired=true");
    }

    const response = await fetch(
      `${config.api.baseUrl}/ingestions/default-config`,
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
