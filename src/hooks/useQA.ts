"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Question,
  Answer,
  Conversation,
  QASession,
  QAMessage,
  QuestionSuggestion,
  QAFilters,
  QAStats,
  SavedQA,
  QASearchResult,
} from "@/types/qa";
import { PaginatedResponse } from "@/types/common";
import { getQAService } from "@/lib/mockServices/qaService";

interface UseQAOptions {
  initialFilters?: QAFilters;
  initialPage?: number;
  initialLimit?: number;
}

interface UseQAReturn {
  // Data
  conversations: Conversation[];
  savedQAs: SavedQA[];
  stats: QAStats | null;
  suggestions: QuestionSuggestion[];
  searchResults: QASearchResult[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: QAFilters;

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isAsking: boolean;
  isSearching: boolean;
  isSaving: boolean;

  // Error states
  error: string | null;

  // Actions
  setFilters: (filters: QAFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  askQuestion: (
    text: string,
    conversationId?: string
  ) => Promise<{ question: Question; answer: Answer }>;
  searchQAs: (query: string, filters?: QAFilters) => Promise<void>;
  saveQA: (
    questionId: string,
    answerId: string,
    notes?: string,
    tags?: string[]
  ) => Promise<SavedQA>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (
    id: string,
    updates: Partial<Conversation>
  ) => Promise<void>;
  refresh: () => Promise<void>;
  resetFilters: () => void;
}

export function useQA(options: UseQAOptions = {}): UseQAReturn {
  const { initialFilters = {}, initialPage = 1, initialLimit = 10 } = options;

  const qaService = getQAService();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedQAs, setSavedQAs] = useState<SavedQA[]>([]);
  const [stats, setStats] = useState<QAStats | null>(null);
  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<QASearchResult[]>([]);

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<QAFilters>(initialFilters);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: PaginatedResponse<Conversation> =
        await qaService.getConversations(
          pagination.page,
          pagination.limit,
          filters
        );

      setConversations(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch conversations"
      );
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, qaService]);

  // Fetch saved Q&As
  const fetchSavedQAs = useCallback(async () => {
    try {
      const response: PaginatedResponse<SavedQA> = await qaService.getSavedQAs(
        pagination.page,
        pagination.limit,
        filters
      );

      setSavedQAs(response.data);
    } catch (err) {
      console.error("Failed to fetch saved Q&As:", err);
    }
  }, [pagination.page, pagination.limit, filters, qaService]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const statsData = await qaService.getQAStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch Q&A stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [qaService]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      const suggestionsData = await qaService.getQuestionSuggestions();
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  }, [qaService]);

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    fetchSavedQAs();
  }, [fetchConversations, fetchSavedQAs]);

  useEffect(() => {
    fetchStats();
    fetchSuggestions();
  }, [fetchStats, fetchSuggestions]);

  // Actions
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const askQuestion = useCallback(
    async (
      text: string,
      conversationId?: string
    ): Promise<{ question: Question; answer: Answer }> => {
      try {
        setIsAsking(true);
        setError(null);

        const result = await qaService.askQuestion(text, conversationId);

        // Refresh conversations to show the new/updated conversation
        await fetchConversations();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to ask question";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsAsking(false);
      }
    },
    [qaService, fetchConversations]
  );

  const searchQAs = useCallback(
    async (query: string, searchFilters?: QAFilters): Promise<void> => {
      try {
        setIsSearching(true);
        setError(null);

        const results = await qaService.searchQAs(
          query,
          searchFilters || filters
        );
        setSearchResults(results);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search Q&As";
        setError(errorMessage);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [qaService, filters]
  );

  const saveQA = useCallback(
    async (
      questionId: string,
      answerId: string,
      notes?: string,
      tags?: string[]
    ): Promise<SavedQA> => {
      try {
        setIsSaving(true);
        setError(null);

        const savedQA = await qaService.saveQA(
          questionId,
          answerId,
          notes,
          tags
        );

        // Refresh saved Q&As
        await fetchSavedQAs();

        return savedQA;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save Q&A";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [qaService, fetchSavedQAs]
  );

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        await qaService.deleteConversation(id);

        // Refresh conversations
        await fetchConversations();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete conversation";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [qaService, fetchConversations]
  );

  const updateConversation = useCallback(
    async (id: string, updates: Partial<Conversation>): Promise<void> => {
      try {
        setError(null);

        await qaService.updateConversation(id, updates);

        // Refresh conversations
        await fetchConversations();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update conversation";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [qaService, fetchConversations]
  );

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchConversations(),
      fetchSavedQAs(),
      fetchStats(),
      fetchSuggestions(),
    ]);
  }, [fetchConversations, fetchSavedQAs, fetchStats, fetchSuggestions]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: QAFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    // Data
    conversations,
    savedQAs,
    stats,
    suggestions,
    searchResults,

    // Pagination
    pagination,

    // Filters
    filters,

    // Loading states
    isLoading,
    isLoadingStats,
    isAsking,
    isSearching,
    isSaving,

    // Error state
    error,

    // Actions
    setFilters: updateFilters,
    setPage,
    setLimit,
    askQuestion,
    searchQAs,
    saveQA,
    deleteConversation,
    updateConversation,
    refresh,
    resetFilters,
  };
}

// Hook for single conversation with real-time updates
export function useConversation(id: string) {
  const [session, setSession] = useState<QASession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qaService = getQAService();

  const fetchConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await qaService.getConversation(id);
      setSession(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch conversation"
      );
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, qaService]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const addMessage = useCallback((message: QAMessage) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<QAMessage>) => {
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        };
      });
    },
    []
  );

  return {
    session,
    isLoading,
    error,
    refresh: fetchConversation,
    addMessage,
    updateMessage,
  };
}
