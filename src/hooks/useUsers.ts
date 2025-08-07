"use client";

import { useState } from "react";
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "@/types/user";

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
  setFilters: (filters: UserFilters) => void;

  // Sorting
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Refresh
  refresh: () => Promise<void>;
}

// Simple stub implementation for compatibility with ingestion pages
// This should be replaced with proper backend integration when needed
export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const [users] = useState<User[]>([]);

  return {
    // Data
    users,
    totalUsers: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10,

    // Loading states
    loading: false,
    creating: false,
    updating: false,
    deleting: false,

    // Error states
    error: null,

    // Actions - all no-ops for now
    fetchUsers: async () => {},
    createUser: async () => ({}) as User,
    updateUser: async () => ({}) as User,
    deleteUser: async () => {},
    toggleUserStatus: async () => ({}) as User,

    // Pagination
    setPage: () => {},
    setLimit: () => {},

    // Filtering
    setFilters: () => {},

    // Sorting
    setSorting: () => {},

    // Refresh
    refresh: async () => {},
  };
}
