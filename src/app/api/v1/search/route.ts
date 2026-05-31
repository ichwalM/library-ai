import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, cosineSimilarity } from "@/lib/ai";
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
 * GET /api/v1/search
 *
 * Performs semantic vector search across documents in a category.
 *
 * Query params:
 *  - q          (required) — search query text
 *  - categoryId (required) — which category to search in
 *  - topK       (optional, default: 5, max: 20) — number of results to return
 */
export async function GET(request: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const auth = validateApiKey(request);
  if (!auth.valid) {
    return errorResponse("UNAUTHORIZED", auth.error!, 401);
  }

  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId")?.trim();
  let topK = parseInt(searchParams.get("topK") ?? "5", 10);

  // ─── Validate inputs ──────────────────────────────────────────────────────
  if (!query) {
    return errorResponse("BAD_REQUEST", "Parameter 'q' wajib diisi.", 400);
  }
  if (!categoryId) {
    return errorResponse("BAD_REQUEST", "Parameter 'categoryId' wajib diisi.", 400);
  }
  if (query.length > 1000) {
    return errorResponse("BAD_REQUEST", "Query terlalu panjang. Maksimal 1000 karakter.", 400);
  }
  if (isNaN(topK) || topK < 1) topK = 5;
  if (topK > 20) topK = 20;

  try {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, title: true },
    });
    if (!category) {
      return errorResponse("NOT_FOUND", `Kategori dengan id '${categoryId}' tidak ditemukan.`, 404);
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Fetch all ready chunks in this category (embeddings are needed for scoring)
    const chunks = await prisma.chunk.findMany({
      where: {
        document: { categoryId, status: "ready" },
      },
      select: {
        id: true,
        content: true,
        chunkIndex: true,
        embedding: true,
        document: {
          select: { id: true, fileName: true },
        },
      },
    });

    if (chunks.length === 0) {
      return successResponse({
        query,
        categoryId,
        categoryTitle: category.title,
        results: [],
        totalChunksSearched: 0,
      });
    }

    // Score each chunk
    const scored = chunks
      .map((chunk) => {
        const embeddingArr = JSON.parse(chunk.embedding as string) as number[];
        const score = cosineSimilarity(queryEmbedding, embeddingArr);
        return {
          chunkId: chunk.id,
          documentId: chunk.document.id,
          fileName: chunk.document.fileName,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          relevanceScore: parseFloat(score.toFixed(4)),
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);

    return successResponse({
      query,
      categoryId,
      categoryTitle: category.title,
      results: scored,
      totalChunksSearched: chunks.length,
    });
  } catch (err) {
    console.error("[GET /api/v1/search] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Terjadi kesalahan saat pencarian semantik.", 500);
  }
}
