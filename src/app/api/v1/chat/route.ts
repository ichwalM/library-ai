import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { genai, generateEmbedding, cosineSimilarity } from "@/lib/ai";
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
 * GET /api/v1/chat
 *
 * AI chat with RAG (Retrieval-Augmented Generation) over category documents.
 *
 * Query params:
 *  - message    (required) — the user's message / question
 *  - categoryId (required) — which category's documents to use as context
 *  - history    (optional) — base64-encoded JSON array of prior messages
 *                            Format: [{ role: "user"|"assistant", content: string }, ...]
 *
 * Note: For long ongoing conversations, prefer the existing POST /api/chat
 * which accepts the full message array in the request body.
 */
export async function GET(request: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const auth = validateApiKey(request);
  if (!auth.valid) {
    return errorResponse("UNAUTHORIZED", auth.error!, 401);
  }

  const { searchParams } = request.nextUrl;
  const message = searchParams.get("message")?.trim();
  const categoryId = searchParams.get("categoryId")?.trim();
  const historyEncoded = searchParams.get("history");

  // ─── Validate inputs ──────────────────────────────────────────────────────
  if (!message) {
    return errorResponse("BAD_REQUEST", "Parameter 'message' wajib diisi.", 400);
  }
  if (!categoryId) {
    return errorResponse("BAD_REQUEST", "Parameter 'categoryId' wajib diisi.", 400);
  }
  if (message.length > 2000) {
    return errorResponse("BAD_REQUEST", "Pesan terlalu panjang. Maksimal 2000 karakter.", 400);
  }

  // Parse conversation history (optional)
  type ChatMessage = { role: "user" | "assistant"; content: string };
  let history: ChatMessage[] = [];

  if (historyEncoded) {
    try {
      const decoded = Buffer.from(historyEncoded, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        history = parsed
          .filter(
            (m): m is ChatMessage =>
              m &&
              typeof m === "object" &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string"
          )
          .slice(-20); // Limit history to last 20 messages to save tokens
      }
    } catch {
      return errorResponse(
        "BAD_REQUEST",
        "Parameter 'history' tidak valid. Harus berupa base64-encoded JSON array.",
        400
      );
    }
  }

  try {
    // ─── Verify category exists ──────────────────────────────────────────────
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, title: true },
    });
    if (!category) {
      return errorResponse("NOT_FOUND", `Kategori dengan id '${categoryId}' tidak ditemukan.`, 404);
    }

    // ─── Vector search: retrieve top-5 relevant chunks ──────────────────────
    let contextText = "";
    let sourcesUsed: string[] = [];

    try {
      const queryEmbedding = await generateEmbedding(message);
      const chunks = await prisma.chunk.findMany({
        where: { document: { categoryId, status: "ready" } },
        select: {
          content: true,
          embedding: true,
          document: { select: { fileName: true } },
        },
      });

      if (chunks.length > 0) {
        const scored = chunks
          .map((c) => ({
            content: c.content as string,
            fileName: c.document.fileName as string,
            score: cosineSimilarity(
              queryEmbedding,
              JSON.parse(c.embedding as string) as number[]
            ),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        contextText = scored
          .map((c) => `[Sumber: ${c.fileName}]\n${c.content}`)
          .join("\n\n---\n\n");

        sourcesUsed = [...new Set(scored.map((c) => c.fileName))];
      }
    } catch (searchErr) {
      console.error("[chat] Vector search error:", searchErr);
    }

    // ─── Build system instruction ────────────────────────────────────────────
    const systemInstruction = `Kamu adalah asisten perpustakaan cerdas bernama LibrariAI.

ATURAN PENTING — ZERO HALLUCINATION PROTOCOL:
- Kamu HANYA boleh menjawab berdasarkan konteks dokumen yang diberikan di bawah ini.
- DILARANG mengarang informasi yang tidak ada dalam konteks.
- DILARANG menggunakan pengetahuan di luar konteks yang diberikan.
- Jika jawaban tidak tersedia dalam konteks, balas dengan: "Maaf, informasi tidak tersedia dalam dokumen koleksi ini."
- Gunakan Bahasa Indonesia yang baik dan mudah dipahami.

KONTEKS DOKUMEN:
${contextText || "Tidak ada dokumen yang relevan ditemukan untuk pertanyaan ini."}`;

    // ─── Build Gemini conversation history ──────────────────────────────────
    const geminiHistory = history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = genai.chats.create({
      model: "gemini-3.5-flash",
      config: { systemInstruction },
      history: geminiHistory,
    });

    const response = await chat.sendMessage({ message });
    const replyText =
      response.text || "Maaf, saya tidak dapat memproses permintaan ini.";

    return successResponse({
      message: replyText,
      role: "assistant",
      categoryId,
      categoryTitle: category.title,
      sourcesUsed,
      // Return encoded history so mobile client can pass it back in next request
      historyForNextRequest: Buffer.from(
        JSON.stringify([...history, { role: "user", content: message }, { role: "assistant", content: replyText }])
      ).toString("base64"),
    });
  } catch (err) {
    console.error("[GET /api/v1/chat] Error:", err);
    return errorResponse("INTERNAL_ERROR", "Terjadi kesalahan pada server AI.", 500);
  }
}
