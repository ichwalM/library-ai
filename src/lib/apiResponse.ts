/**
 * Shared API Response Utilities
 * Provides consistent response format for all mobile API endpoints.
 */

import { NextResponse } from "next/server";

// ─── Response Types ────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

// ─── Builders ─────────────────────────────────────────────────────────────────

/**
 * Build a successful JSON response.
 */
export function successResponse<T>(
  data: T,
  meta?: PaginationMeta | Record<string, unknown>,
  status = 200
): NextResponse {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  if (meta !== undefined) body.meta = meta;

  return NextResponse.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Build an error JSON response.
 */
export function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Handle OPTIONS preflight requests for CORS.
 */
export function optionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Build pagination meta from count, page, and limit.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse and validate pagination query params.
 * Returns safe defaults if values are missing/invalid.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  maxLimit = 50
): { page: number; limit: number; skip: number } {
  let page = parseInt(searchParams.get("page") ?? "1", 10);
  let limit = parseInt(searchParams.get("limit") ?? "10", 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
}
