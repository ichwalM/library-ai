import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKeyAuth";
import {
  successResponse,
  errorResponse,
  optionsResponse,
} from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/v1/documents/:id
 *
 * Returns a single document with its category info.
 * Embedding vectors are excluded from the response for security/size reasons.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const auth = validateApiKey(request);
  if (!auth.valid) {
    return errorResponse("UNAUTHORIZED", auth.error!, 401);
  }

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return errorResponse("BAD_REQUEST", "Parameter id tidak valid.", 400);
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, title: true, description: true },
        },
        _count: { select: { chunks: true } },
      },
    });

    if (!document) {
      return errorResponse("NOT_FOUND", `Dokumen dengan id '${id}' tidak ditemukan.`, 404);
    }

    return successResponse({
      id: document.id,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      status: document.status,
      chunkCount: document._count.chunks,
      category: document.category,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  } catch (err) {
    console.error("[GET /api/v1/documents/:id] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Gagal mengambil data dokumen.", 500);
  }
}
