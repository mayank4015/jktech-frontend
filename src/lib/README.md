# Authentication Utilities

This directory contains various authentication utilities for different contexts in the Next.js application.

## Authentication Files

- `auth-client.ts`: Client-side authentication utilities for use in client components
- `auth-server.ts`: Universal server-side authentication utilities that work in both app/ and pages/ directories
- `auth-app-server.ts`: Server-side authentication utilities specifically for app/ directory components
- `auth-utils.ts`: Shared authentication utilities that work in any context

## Usage Guidelines

### For Client Components

Use the client-side utilities from `auth-client.ts` or the AuthContext:

```tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
// or
import { isAuthenticatedClient } from "@/lib/auth-client";

export default function MyClientComponent() {
  const { user, isAuthenticated } = useAuth();
  // or
  const isLoggedIn = isAuthenticatedClient();

  // ...
}
```

### For Server Components in app/ Directory

Use the app-specific server utilities from `auth-app-server.ts`:

```tsx
import { getCurrentUserApp } from "@/lib/auth-app-server";

export default async function MyServerComponent() {
  const user = await getCurrentUserApp();

  // ...
}
```

### For API Routes or Pages Directory

Use the universal server utilities from `auth-server.ts`:

```tsx
import { getCurrentUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await getCurrentUser(req);

  // ...
}
```

## Important Notes

- Never use `next/headers` in the pages directory or client components
- Always pass the request object to `getCurrentUser()` when using it in API routes
- For client-side authentication state management, use the AuthContext
