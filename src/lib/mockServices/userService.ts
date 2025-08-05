import {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "@/types/user";
import { PaginatedResponse } from "@/types/common";

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@jktech.com",
    name: "John Admin",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-12-01T00:00:00Z",
    lastLoginAt: "2023-12-15T10:30:00Z",
    isActive: true,
    avatar:
      "https://ui-avatars.com/api/?name=John+Admin&background=3b82f6&color=fff",
  },
  {
    id: "2",
    email: "jane.doe@jktech.com",
    name: "Jane Doe",
    role: "user",
    createdAt: "2023-02-15T00:00:00Z",
    updatedAt: "2023-11-20T00:00:00Z",
    lastLoginAt: "2023-12-14T14:20:00Z",
    isActive: true,
    avatar:
      "https://ui-avatars.com/api/?name=Jane+Doe&background=10b981&color=fff",
  },
  {
    id: "3",
    email: "mike.wilson@jktech.com",
    name: "Mike Wilson",
    role: "user",
    createdAt: "2023-03-10T00:00:00Z",
    updatedAt: "2023-12-10T00:00:00Z",
    lastLoginAt: "2023-12-12T09:15:00Z",
    isActive: true,
    avatar:
      "https://ui-avatars.com/api/?name=Mike+Wilson&background=f59e0b&color=fff",
  },
  {
    id: "4",
    email: "sarah.johnson@jktech.com",
    name: "Sarah Johnson",
    role: "user",
    createdAt: "2023-04-05T00:00:00Z",
    updatedAt: "2023-10-15T00:00:00Z",
    lastLoginAt: "2023-11-30T16:45:00Z",
    isActive: false,
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Johnson&background=ef4444&color=fff",
  },
  {
    id: "5",
    email: "david.brown@jktech.com",
    name: "David Brown",
    role: "admin",
    createdAt: "2023-05-20T00:00:00Z",
    updatedAt: "2023-12-05T00:00:00Z",
    lastLoginAt: "2023-12-13T11:20:00Z",
    isActive: true,
    avatar:
      "https://ui-avatars.com/api/?name=David+Brown&background=8b5cf6&color=fff",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockUserService = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> => {
    await delay(800);

    let filteredUsers = [...mockUsers];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    if (filters.role && filters.role !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === filters.role
      );
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === filters.isActive
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredUsers.sort((a, b) => {
        const aValue = a[filters.sortBy!];
        const bValue = b[filters.sortBy!];

        // Handle undefined values (e.g., lastLoginAt might be undefined)
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1; // undefined values go to the end
        if (bValue === undefined) return -1;

        if (filters.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
    };
  },

  getUserById: async (id: string): Promise<User | null> => {
    await delay(600);
    return mockUsers.find((user) => user.id === id) || null;
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    await delay(1000);

    // Check if email already exists
    if (mockUsers.some((user) => user.email === userData.email)) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3b82f6&color=fff`,
    };

    // In real implementation, this would be saved to database
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    await delay(800);

    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Check if email already exists (if email is being updated)
    if (userData.email && userData.email !== mockUsers[userIndex].email) {
      if (
        mockUsers.some(
          (user) => user.email === userData.email && user.id !== id
        )
      ) {
        throw new Error("User with this email already exists");
      }
    }

    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay(600);

    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // In real implementation, this would delete from database
    mockUsers.splice(userIndex, 1);
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    await delay(500);

    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    mockUsers[userIndex].isActive = !mockUsers[userIndex].isActive;
    mockUsers[userIndex].updatedAt = new Date().toISOString();

    return mockUsers[userIndex];
  },
};

// Service factory
export const getUserService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockUserService;
  }
  // In Phase 2, we'll implement the real service
  return mockUserService;
};
