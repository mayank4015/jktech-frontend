import { z } from "zod";

/**
 * Base environment schema for all environments
 */
const baseEnvSchema = z.object({
  // Public API Configuration
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL format"),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Optional API Token
  API_TOKEN: z.string().optional(),
});

/**
 * Production-specific environment schema
 */
const productionEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal("production"),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .refine(
      (url) => url.startsWith("https://"),
      "API URL must use HTTPS in production"
    ),
});

/**
 * Development-specific environment schema
 */
const developmentEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test"]),
});

/**
 * Validated environment configuration interface
 */
export interface ValidatedEnvConfig {
  api: {
    baseUrl: string;
    token?: string;
  };
  app: {
    env: "development" | "production" | "test";
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  };
}

/**
 * Validate environment variables based on NODE_ENV
 */
function validateEnv(): ValidatedEnvConfig {
  const rawEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_TOKEN: process.env.API_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };

  const nodeEnv = rawEnv.NODE_ENV || "development";

  try {
    let validatedEnv: z.infer<typeof baseEnvSchema>;

    if (nodeEnv === "production") {
      console.log("🏭 Validating production environment...");
      validatedEnv = productionEnvSchema.parse(rawEnv);
      validateProductionSecurity(validatedEnv);
    } else {
      console.log("🛠️ Validating development environment...");
      validatedEnv = developmentEnvSchema.parse(rawEnv);
    }

    console.log("✅ Frontend environment configuration validated successfully");

    return transformToValidatedConfig(validatedEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("❌ Frontend environment validation failed:");
      errorMessages.forEach((msg) => console.error(`  - ${msg}`));

      // In development, show helpful error message
      if (typeof window !== "undefined" && nodeEnv === "development") {
        const errorMsg = `Environment validation failed:\n${errorMessages.join("\n")}`;
        alert(
          `⚠️ Configuration Error\n\n${errorMsg}\n\nCheck your .env.local file and restart the development server.`
        );
      }

      throw new Error(
        `Frontend environment validation failed:\n${errorMessages.join("\n")}`
      );
    }
    throw error;
  }
}

/**
 * Additional production security validations
 */
function validateProductionSecurity(env: z.infer<typeof baseEnvSchema>): void {
  const securityIssues: string[] = [];

  // Check for localhost URLs in production
  if (env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    securityIssues.push("API URL should not use localhost in production");
  }

  // Check for development ports
  if (
    env.NEXT_PUBLIC_API_URL.includes(":3000") ||
    env.NEXT_PUBLIC_API_URL.includes(":8080")
  ) {
    securityIssues.push(
      "API URL should not use development ports in production"
    );
  }

  if (securityIssues.length > 0) {
    console.warn("⚠️ Frontend production security warnings:");
    securityIssues.forEach((issue) => console.warn(`  - ${issue}`));
  }
}

/**
 * Transform validated environment to structured config
 */
function transformToValidatedConfig(
  env: z.infer<typeof baseEnvSchema>
): ValidatedEnvConfig {
  return {
    api: {
      baseUrl: env.NEXT_PUBLIC_API_URL,
      token: env.API_TOKEN,
    },
    app: {
      env: env.NODE_ENV,
      isDevelopment: env.NODE_ENV === "development",
      isProduction: env.NODE_ENV === "production",
      isTest: env.NODE_ENV === "test",
    },
  };
}

// Validate and export configuration
export const env = validateEnv();

// Legacy export for backward compatibility
export const config = env;
