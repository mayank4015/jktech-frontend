import { z } from "zod";

// Environment variables schema
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  API_TOKEN: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      API_TOKEN: process.env.API_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment variables");
  }
}

export const env = validateEnv();

export const config = {
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    token: env.API_TOKEN,
  },
  app: {
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
  },
} as const;
