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
 * GET /api/v1/categories/:id
 *
 * Returns category detail plus its list of documents.
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: { select: { documents: true } },
      },
    });

    if (!category) {
      return errorResponse("NOT_FOUND", `Kategori dengan id '${id}' tidak ditemukan.`, 404);
    }

    return successResponse({
      id: category.id,
      title: category.title,
      description: category.description,
      documentCount: category._count.documents,
      documents: category.documents,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (err) {
    console.error("[GET /api/v1/categories/:id] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Gagal mengambil data kategori.", 500);
  }
}
