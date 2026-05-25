import { NextRequest, NextResponse } from "next/server";
import { genai, generateEmbedding, cosineSimilarity } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, categoryId } = await req.json();

    if (!messages || !categoryId) {
      return NextResponse.json({ error: "messages dan categoryId diperlukan" }, { status: 400 });
    }

    // Get last user message for vector search
    const lastUserMessage = [...messages].reverse().find(
      (m: { role: string; content: string }) => m.role === "user"
    );

    if (!lastUserMessage) {
      return NextResponse.json({ error: "Tidak ada pesan user" }, { status: 400 });
    }

    // Vector search: retrieve relevant chunks
    let contextText = "";
    try {
      const queryEmbedding = await generateEmbedding(lastUserMessage.content);
      const chunks = await prisma.chunk.findMany({
        where: { document: { categoryId, status: "ready" } },
        select: { content: true, embedding: true, document: { select: { fileName: true } } },
      });

      if (chunks.length > 0) {
        const scored = chunks
          .map((c: any) => ({
            content: c.content as string,
            fileName: c.document.fileName as string,
            score: cosineSimilarity(queryEmbedding, JSON.parse(c.embedding as string)),
          }))
          .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
          .slice(0, 5);

        contextText = scored
          .map((c: { fileName: string; content: string }) => `[Sumber: ${c.fileName}]\n${c.content}`)
          .join("\n\n---\n\n");
      }
    } catch (searchErr) {
      console.error("Vector search error:", searchErr);
    }

    // Build system instruction with Zero Hallucination Protocol
    const systemInstruction = `Kamu adalah asisten perpustakaan cerdas bernama LibrariAI.

ATURAN PENTING — ZERO HALLUCINATION PROTOCOL:
- Kamu HANYA boleh menjawab berdasarkan konteks dokumen yang diberikan di bawah ini.
- DILARANG mengarang informasi yang tidak ada dalam konteks.
- DILARANG menggunakan pengetahuan di luar konteks yang diberikan.
- Jika jawaban tidak tersedia dalam konteks, balas dengan: "Maaf, informasi tidak tersedia dalam dokumen koleksi ini."
- Saat menjawab, kamu boleh menjelaskan dengan bahasa yang jelas dan terstruktur, selama berpijak pada konteks.
- Gunakan Bahasa Indonesia yang baik dan mudah dipahami.

KONTEKS DOKUMEN:
${contextText || "Tidak ada dokumen yang relevan ditemukan untuk pertanyaan ini."}`;

    // Build conversation history for Gemini
    const history = messages
      .slice(0, -1) // Exclude last message (it's the current user prompt)
      .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    const chat = genai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      },
      history,
    });

    const response = await chat.sendMessage({
      message: lastUserMessage.content,
    });

    const responseText = response.text || "Maaf, saya tidak dapat memproses permintaan ini.";

    return NextResponse.json({
      role: "assistant",
      content: responseText,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server AI" },
      { status: 500 }
    );
  }
}
