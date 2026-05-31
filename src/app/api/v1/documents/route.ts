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
 * GET /api/v1/documents
 *
 * Query params:
 *  - categoryId  (optional, filter by category)
 *  - status      (optional: "processing" | "ready" | "error")
 *  - page        (default: 1)
 *  - limit       (default: 10, max: 50)
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

    const categoryId = searchParams.get("categoryId")?.trim();
    const status = searchParams.get("status")?.trim();

    // Validate status if provided
    const validStatuses = ["processing", "ready", "error"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(
        "BAD_REQUEST",
        `Status tidak valid. Nilai yang diizinkan: ${validStatuses.join(", ")}.`,
        400
      );
    }

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          categoryId: true,
          fileName: true,
          fileUrl: true,
          fileSize: true,
          mimeType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, title: true },
          },
          _count: { select: { chunks: true } },
        },
      }),
    ]);

    const data = documents.map((doc) => ({
      id: doc.id,
      categoryId: doc.categoryId,
      category: doc.category,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      status: doc.status,
      chunkCount: doc._count.chunks,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return successResponse(data, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error("[GET /api/v1/documents] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Gagal mengambil data dokumen.", 500);
  }
}
