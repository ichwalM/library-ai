/**
 * API Key Authentication for Mobile API
 *
 * Reads API_KEY_MOBILE from environment. All /api/v1/* endpoints
 * (except /api/v1/health) must call this before processing.
 */

import { NextRequest } from "next/server";

export interface AuthResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate the API key from request headers or query params.
 *
 * Priority:
 *  1. Header:      X-API-Key: <key>
 *  2. Query param: ?apiKey=<key>  (for easy dev/testing)
 */
export function validateApiKey(request: NextRequest): AuthResult {
  const configuredKey = process.env.API_KEY_MOBILE;

  // If no key is configured in env, block all requests (fail safe)
  if (!configuredKey || configuredKey.trim() === "") {
    return {
      valid: false,
      error: "API key not configured on the server. Set API_KEY_MOBILE in environment.",
    };
  }

  // Read from header first, then query param
  const headerKey = request.headers.get("X-API-Key");
  const queryKey = request.nextUrl.searchParams.get("apiKey");
  const providedKey = headerKey ?? queryKey;

  if (!providedKey) {
    return {
      valid: false,
      error: "Missing API key. Provide it via X-API-Key header or ?apiKey= query param.",
    };
  }

  // Constant-time comparison to prevent timing attacks
  const configuredBuf = Buffer.from(configuredKey, "utf8");
  const providedBuf = Buffer.from(providedKey, "utf8");

  if (
    configuredBuf.length !== providedBuf.length ||
    !require("crypto").timingSafeEqual(configuredBuf, providedBuf)
  ) {
    return { valid: false, error: "Invalid API key." };
  }

  return { valid: true };
}
