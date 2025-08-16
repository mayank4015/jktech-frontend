export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  avatar?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "admin" | "editor" | "viewer";
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "editor" | "viewer" | "all";
  isActive?: boolean;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}
