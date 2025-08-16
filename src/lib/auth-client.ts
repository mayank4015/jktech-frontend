/**
 * Client-side authentication utilities
 */

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "access_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "refresh_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function isAuthenticatedClient(): boolean {
  const accessToken = getAccessTokenFromCookie();
  const refreshToken = getRefreshTokenFromCookie();
  return !!(accessToken || refreshToken);
}
