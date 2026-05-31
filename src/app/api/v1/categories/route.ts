import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyAuth";
import {
  successResponse,
  errorResponse,
  optionsResponse,
  buildPaginationMeta,
  parsePagination,
} from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/v1/categories
 *
 * Query params:
 *  - page    (default: 1)
 *  - limit   (default: 10, max: 50)
 *  - search  (optional, filter by title)
 */
export async function GET(request: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const auth = validateApiKey(request);
  if (!auth.valid) {
    return errorResponse("UNAUTHORIZED", auth.error!, 401);
  }

  try {
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    // Optional search filter
    const search = searchParams.get("search")?.trim() ?? "";
    const where = search
      ? { title: { contains: search } }
      : {};

    // Run count + data in parallel for performance
    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { documents: true } },
        },
      }),
    ]);

    // Transform _count to documentCount
    const data = categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      description: cat.description,
      documentCount: cat._count.documents,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return successResponse(data, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error("[GET /api/v1/categories] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Gagal mengambil data kategori.", 500);
  }
}
