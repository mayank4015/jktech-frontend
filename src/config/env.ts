// Simple environment export (no validation)

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    token: process.env.API_TOKEN,
  },
  app: {
    env: process.env.NODE_ENV as "development" | "production" | "test",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },
};

export const env = config;
