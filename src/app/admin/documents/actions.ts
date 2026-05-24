"use server";

import { prisma } from "@/lib/prisma";
import { generateEmbedding, chunkText } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// ─── Text Extraction ──────────────────────────────────────────────────────────
async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();

  // Plain text
  if (mimeType === "text/plain" || lowerName.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  // PDF — pdf-parse v2 uses PDFParse class with data option
  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const uint8 = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    return result.text;
  }

  // DOCX
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Format file tidak didukung: ${fileName}`);
}

// ─── Upload Document Action ───────────────────────────────────────────────────
export async function uploadDocument(formData: FormData) {
  const file = formData.get("file") as File | null;
  const categoryId = formData.get("categoryId") as string | null;

  if (!file || !categoryId) {
    throw new Error("File dan kategori wajib dipilih.");
  }

  const allowedExtensions = [".pdf", ".docx", ".txt"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error("Hanya file PDF, DOCX, dan TXT yang diizinkan.");
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    throw new Error("Kategori tidak ditemukan.");
  }

  // ─── Save file to disk ────────────────────────────────────────────────────
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadsDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${safeName}`;

  // ─── Create document record ───────────────────────────────────────────────
  const doc = await prisma.document.create({
    data: {
      categoryId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type || "text/plain",
      status: "processing",
    },
  });

  // ─── Extract text ─────────────────────────────────────────────────────────
  let text: string;
  try {
    text = await extractTextFromFile(buffer, file.type, file.name);
  } catch (e) {
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "error" },
    });
    throw e;
  }

  if (!text.trim()) {
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "error" },
    });
    throw new Error("Teks tidak bisa diekstrak dari file ini.");
  }

  // ─── Chunk & embed ────────────────────────────────────────────────────────
  const chunks = chunkText(text, 1000, 200);
  let successCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await generateEmbedding(chunks[i]);
      await prisma.chunk.create({
        data: {
          documentId: doc.id,
          content: chunks[i],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          embedding: embedding as any,
          chunkIndex: i,
        },
      });
      successCount++;
    } catch (err) {
      console.error(`Embedding error chunk ${i}:`, err);
    }
  }

  if (successCount === 0 && chunks.length > 0) {
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "error" },
    });
    throw new Error("Gagal membuat embedding untuk dokumen ini. Pastikan GEMINI_API_KEY sudah dikonfigurasi.");
  }

  await prisma.document.update({
    where: { id: doc.id },
    data: { status: "ready" },
  });

  revalidatePath("/admin/documents");
  revalidatePath("/browse");
}

// ─── Delete Document Action ───────────────────────────────────────────────────
export async function deleteDocument(id: string) {
  // Chunks are cascade-deleted by the DB foreign key constraint
  await prisma.document.delete({ where: { id } });
  revalidatePath("/admin/documents");
  revalidatePath("/browse");
}
