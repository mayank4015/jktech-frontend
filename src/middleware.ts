import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RefreshTokenData {
  accessToken: string;
  refreshToken?: string;
}

// Define public paths that don't require authentication
const publicPaths = [
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/",
  "/contact",
  "/api",
];

// Define paths that should bypass onboarding check
// const bypassOnboardingCheckPaths = [
//   "/logout",
//   "/api",
//   "/_next",
//   "/favicon.ico",
//   "/images",
//   "/static",
//   "/assets",
//   ".json",
//   ".js",
//   ".css",
//   ".svg",
//   ".png",
//   ".jpg",
//   ".ico",
// ];

/**
 * Enhanced middleware to handle authentication and onboarding redirection
 * This runs on every request before the page is rendered
 */
export async function middleware(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Log middleware execution (only in development)
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    console.log(`[${timestamp}] MIDDLEWARE EXECUTED:`);
    console.log(`  - Path: ${path}`);
  }

  // Prevent infinite redirects to login page
  if (path.includes("/login") && request.nextUrl.searchParams.has("expired")) {
    if (isDev) console.log(`  - ACTION: Avoiding repeated redirect to login`);
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // If it's a public path, allow access without checking authentication
  if (isPublicPath) {
    if (isDev) console.log(`  - ACTION: Allowing public path`);
    return NextResponse.next();
  }

  // Check if token exists
  const token = request.cookies.get("access_token")?.value;

  // If no token and not a public path, redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", path);
    return NextResponse.redirect(url);
  }

  // Skip token validation for static assets and API routes
  const shouldValidateToken =
    !path.includes("/_next/") &&
    !path.includes("/static/") &&
    !path.includes("/assets/") &&
    !path.endsWith(".json") &&
    !path.endsWith(".js") &&
    !path.endsWith(".css") &&
    !path.endsWith(".svg") &&
    !path.endsWith(".png") &&
    !path.endsWith(".jpg") &&
    !path.endsWith(".ico");

  // We'll store the user data here if we need to validate the token
  let userData = null;
  let currentAccessToken = token; // Track the current valid access token
  let refreshedTokenData: RefreshTokenData | null = null; // Store refresh data for cookie setting

  if (shouldValidateToken) {
    try {
      const validateTokenResponse = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      // If token is valid, store user data and continue
      if (validateTokenResponse.ok) {
        userData = await validateTokenResponse.json();
      } else {
        // Token is invalid/expired, try to refresh it
        if (isDev)
          console.log(`  - Token invalid/expired, attempting refresh...`);

        try {
          // Get refresh token from cookies
          const refreshToken = request.cookies.get("refresh_token")?.value;

          if (isDev) {
            console.log(
              `  - Refresh token found: ${refreshToken ? "YES" : "NO"}`
            );
          }

          if (!refreshToken) {
            if (isDev)
              console.log(`  - No refresh token found, redirecting to login`);
            const url = new URL("/login", request.url);
            url.searchParams.set("returnUrl", path);
            url.searchParams.set("expired", "true");
            return NextResponse.redirect(url);
          }

          // Attempt to refresh the token - backend reads from cookies automatically
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `refresh_token=${refreshToken}`, // Explicitly pass the cookie
            },
            cache: "no-store",
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();

            if (isDev) console.log(`  - Token refresh successful`);

            // Validate the new token to get user data
            const newValidateResponse = await fetch(`${API_URL}/auth/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshData.accessToken}`,
              },
              cache: "no-store",
            });

            if (newValidateResponse.ok) {
              userData = await newValidateResponse.json();
              currentAccessToken = refreshData.accessToken; // Update current token

              // Store refresh data for later cookie setting
              refreshedTokenData = refreshData as RefreshTokenData;
            } else {
              // New token validation failed, redirect to login
              if (isDev)
                console.log(
                  `  - New token validation failed, redirecting to login`
                );
              const url = new URL("/login", request.url);
              url.searchParams.set("returnUrl", path);
              url.searchParams.set("expired", "true");
              return NextResponse.redirect(url);
            }
          } else {
            // If refresh failed, redirect to login
            if (isDev)
              console.log(`  - Token refresh failed, redirecting to login`);
            const url = new URL("/login", request.url);
            url.searchParams.set("returnUrl", path);
            url.searchParams.set("expired", "true");
            return NextResponse.redirect(url);
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          if (isDev)
            console.log(`  - Token refresh error, redirecting to login`);
          const url = new URL("/login", request.url);
          url.searchParams.set("returnUrl", path);
          url.searchParams.set("expired", "true");
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error("Error validating token in middleware:", error);
      // Redirect to login if there's an error validating the token
      const url = new URL("/login", request.url);
      url.searchParams.set("returnUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // Create response and set cookies if needed
  const response = NextResponse.next();

  // Set cookies if token was refreshed
  if (refreshedTokenData) {
    if (isDev) console.log(`  - Setting refreshed token cookies`);

    const tokenData = refreshedTokenData as RefreshTokenData;
    response.cookies.set("access_token", tokenData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour to match backend JWT expiration
    });

    // Note: The refresh token is already set by the backend in the refresh response
    // and will be automatically included in subsequent requests
  }

  return response;
}

// Configure the middleware to run on all paths except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones that should be excluded:
     *
     * EXCLUDED PATHS:
     * - api/*                    -> API routes (handled separately)
     * - _next/static/*          -> Next.js static files
     * - _next/image/*           -> Next.js image optimization
     *
     * EXCLUDED FILES:
     * - SEO files: robots.txt, sitemap.xml, manifest.json
     * - Icons: favicon.ico, *.ico
     * - Images: *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp
     * - Fonts: *.woff, *.woff2, *.ttf, *.otf, *.eot
     * - Styles: *.css
     * - Scripts: *.js
     * - Source maps: *.map
     *
     * INCLUDED PATHS:
     * - All application routes (/, /login, /dashboard, /subscriptions, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|eot|map)$).*)",
  ],
};
