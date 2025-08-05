"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ingestion,
  IngestionFilters,
  IngestionStats,
  CreateIngestionData,
  IngestionConfiguration,
} from "@/types/ingestion";
import { PaginatedResponse } from "@/types/common";
import { getIngestionService } from "@/lib/mockServices/ingestionService";

interface UseIngestionsOptions {
  initialFilters?: IngestionFilters;
  initialPage?: number;
  initialLimit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseIngestionsReturn {
  // Data
  ingestions: Ingestion[];
  stats: IngestionStats | null;
  defaultConfig: IngestionConfiguration | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: IngestionFilters;

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isCreating: boolean;
  isRetrying: boolean;
  isCancelling: boolean;

  // Error states
  error: string | null;

  // Actions
  setFilters: (filters: IngestionFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => Promise<void>;
  createIngestion: (data: CreateIngestionData) => Promise<Ingestion>;
  retryIngestion: (id: string) => Promise<void>;
  cancelIngestion: (id: string) => Promise<void>;
  getIngestion: (id: string) => Promise<Ingestion | null>;
  resetFilters: () => void;
}

export function useIngestions(
  options: UseIngestionsOptions = {}
): UseIngestionsReturn {
  const {
    initialFilters = {},
    initialPage = 1,
    initialLimit = 10,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const ingestionService = getIngestionService();

  // State
  const [ingestions, setIngestions] = useState<Ingestion[]>([]);
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [defaultConfig, setDefaultConfig] =
    useState<IngestionConfiguration | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<IngestionFilters>(initialFilters);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch ingestions
  const fetchIngestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: PaginatedResponse<Ingestion> =
        await ingestionService.getIngestions(
          pagination.page,
          pagination.limit,
          filters
        );

      setIngestions(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch ingestions"
      );
      setIngestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, ingestionService]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const statsData = await ingestionService.getIngestionStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch ingestion stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [ingestionService]);

  // Fetch default configuration
  const fetchDefaultConfig = useCallback(async () => {
    try {
      const config = await ingestionService.getDefaultConfiguration();
      setDefaultConfig(config);
    } catch (err) {
      console.error("Failed to fetch default configuration:", err);
    }
  }, [ingestionService]);

  // Initial data fetch
  useEffect(() => {
    fetchIngestions();
  }, [fetchIngestions]);

  useEffect(() => {
    fetchStats();
    fetchDefaultConfig();
  }, [fetchStats, fetchDefaultConfig]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchIngestions();
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchIngestions, fetchStats]);

  // Actions
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchIngestions(), fetchStats()]);
  }, [fetchIngestions, fetchStats]);

  const createIngestion = useCallback(
    async (data: CreateIngestionData): Promise<Ingestion> => {
      try {
        setIsCreating(true);
        setError(null);

        const newIngestion = await ingestionService.createIngestion(data);

        // Refresh data to show the new ingestion
        await refresh();

        return newIngestion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create ingestion";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    },
    [ingestionService, refresh]
  );

  const retryIngestion = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsRetrying(true);
        setError(null);

        await ingestionService.retryIngestion(id);

        // Refresh data to show updated status
        await refresh();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to retry ingestion";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsRetrying(false);
      }
    },
    [ingestionService, refresh]
  );

  const cancelIngestion = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsCancelling(true);
        setError(null);

        await ingestionService.cancelIngestion(id);

        // Refresh data to show updated status
        await refresh();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel ingestion";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsCancelling(false);
      }
    },
    [ingestionService, refresh]
  );

  const getIngestion = useCallback(
    async (id: string): Promise<Ingestion | null> => {
      try {
        return await ingestionService.getIngestion(id);
      } catch (err) {
        console.error("Failed to fetch ingestion:", err);
        return null;
      }
    },
    [ingestionService]
  );

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: IngestionFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    // Data
    ingestions,
    stats,
    defaultConfig,

    // Pagination
    pagination,

    // Filters
    filters,

    // Loading states
    isLoading,
    isLoadingStats,
    isCreating,
    isRetrying,
    isCancelling,

    // Error state
    error,

    // Actions
    setFilters: updateFilters,
    setPage,
    setLimit,
    refresh,
    createIngestion,
    retryIngestion,
    cancelIngestion,
    getIngestion,
    resetFilters,
  };
}

// Hook for single ingestion with real-time updates
export function useIngestion(id: string, autoRefresh = true) {
  const [ingestion, setIngestion] = useState<Ingestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ingestionService = getIngestionService();

  const fetchIngestion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await ingestionService.getIngestion(id);
      setIngestion(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch ingestion"
      );
      setIngestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, ingestionService]);

  useEffect(() => {
    fetchIngestion();
  }, [fetchIngestion]);

  // Auto-refresh for processing ingestions
  useEffect(() => {
    if (
      !autoRefresh ||
      !ingestion ||
      ingestion.status === "completed" ||
      ingestion.status === "failed"
    ) {
      return;
    }

    const interval = setInterval(fetchIngestion, 5000); // 5 seconds for active ingestions
    return () => clearInterval(interval);
  }, [autoRefresh, ingestion, fetchIngestion]);

  return {
    ingestion,
    isLoading,
    error,
    refresh: fetchIngestion,
  };
}
