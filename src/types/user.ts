export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
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
  status?: "active" | "inactive";
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "editor" | "viewer" | "all";
  isActive?: boolean;
  status?: "active" | "inactive" | "all";
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}
