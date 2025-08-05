"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "@/types/user";
import { PaginatedResponse } from "@/types/common";
import { getUserService } from "@/lib/mockServices/userService";

export interface UseUsersOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: UserFilters;
  autoFetch?: boolean;
}

export interface UseUsersReturn {
  // Data
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<User>;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Filtering
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  clearFilters: () => void;

  // Sorting
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Refresh
  refresh: () => Promise<void>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
    autoFetch = true,
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimitState] = useState(initialLimit);
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userService = getUserService();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<User> = await userService.getUsers(
        currentPage,
        limit,
        filters
      );

      setUsers(response.data);
      setTotalUsers(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters, userService]);

  const createUser = useCallback(
    async (userData: CreateUserData): Promise<User> => {
      try {
        setCreating(true);
        setError(null);

        const newUser = await userService.createUser(userData);

        // Refresh the list to show the new user
        await fetchUsers();

        return newUser;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create user";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setCreating(false);
      }
    },
    [userService, fetchUsers]
  );

  const updateUser = useCallback(
    async (id: string, userData: UpdateUserData): Promise<User> => {
      try {
        setUpdating(true);
        setError(null);

        const updatedUser = await userService.updateUser(id, userData);

        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === id ? updatedUser : user))
        );

        return updatedUser;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update user";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUpdating(false);
      }
    },
    [userService]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      try {
        setDeleting(true);
        setError(null);

        await userService.deleteUser(id);

        // Remove the user from local state
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        setTotalUsers((prev) => prev - 1);

        // If current page becomes empty and it's not the first page, go to previous page
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete user";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setDeleting(false);
      }
    },
    [userService, users.length, currentPage]
  );

  const toggleUserStatus = useCallback(
    async (id: string): Promise<User> => {
      try {
        setUpdating(true);
        setError(null);

        const updatedUser = await userService.toggleUserStatus(id);

        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === id ? updatedUser : user))
        );

        return updatedUser;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to toggle user status";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUpdating(false);
      }
    },
    [userService]
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setCurrentPage(1);
  }, []);

  const setSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setFiltersState((prev) => ({
        ...prev,
        sortBy: sortBy as UserFilters["sortBy"],
        sortOrder,
      }));
    },
    []
  );

  const refresh = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [fetchUsers, autoFetch]);

  return {
    // Data
    users,
    totalUsers,
    currentPage,
    totalPages,
    limit,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error states
    error,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,

    // Pagination
    setPage,
    setLimit,

    // Filtering
    filters,
    setFilters,
    clearFilters,

    // Sorting
    setSorting,

    // Refresh
    refresh,
  };
}
