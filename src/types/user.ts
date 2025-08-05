export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  avatar?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "admin" | "user";
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "user" | "all";
  isActive?: boolean;
  sortBy?: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}
