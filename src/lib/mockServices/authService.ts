import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/types/auth";

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate network delay
    await delay(800);

    const user = mockUsers.find((u) => u.email === credentials.email);

    if (!user || credentials.password !== "password") {
      throw new Error("Invalid email or password");
    }

    return {
      user,
      token: "mock-jwt-token",
    };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Simulate network delay
    await delay(1000);

    // Check if user already exists
    if (mockUsers.some((u) => u.email === data.email)) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      email: data.email,
      name: data.name,
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real implementation, we would add the user to the database
    // For mock, we'll just return the new user
    return {
      user: newUser,
      token: "mock-jwt-token",
    };
  },

  logout: async (): Promise<void> => {
    // Simulate network delay
    await delay(500);
    // In a real implementation, we would invalidate the token
    return;
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Simulate network delay
    await delay(600);

    // For mock purposes, we'll return the admin user
    // In a real implementation, this would verify the token and return the user
    return mockUsers[0];
  },
};

// Service factory
export const getAuthService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockAuthService;
  }

  // In Phase 2, we'll implement the real service
  return mockAuthService;
};
