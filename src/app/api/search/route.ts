import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, cosineSimilarity } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { query, categoryId, topK = 5 } = await req.json();

    if (!query || !categoryId) {
      return NextResponse.json(
        { error: "query dan categoryId wajib diisi" },
        { status: 400 }
      );
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Fetch all chunks for this category
    const chunks = await prisma.chunk.findMany({
      where: {
        document: {
          categoryId,
          status: "ready",
        },
      },
      select: {
        id: true,
        content: true,
        embedding: true,
        document: { select: { fileName: true } },
      },
    });

    if (chunks.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Compute cosine similarity for each chunk
    const scored = chunks
      .map((chunk: any) => {
        const embeddingArr = JSON.parse(chunk.embedding as string);
        const score = cosineSimilarity(queryEmbedding, embeddingArr);
        return {
          id: chunk.id as string,
          content: chunk.content as string,
          fileName: chunk.document.fileName as string,
          score,
        };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, topK);

    return NextResponse.json({ results: scored });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat pencarian" },
      { status: 500 }
    );
  }
}
