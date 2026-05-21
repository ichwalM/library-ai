import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set");
}

export const genai = new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * Generate embedding vector for a text using Gemini embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await genai.models.embedContent({
    model: "gemini-embedding-exp-03-07",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  return embedding;
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Split text into chunks of approximately `chunkSize` characters
 * with `overlap` characters of overlap between chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }
  return chunks.filter((c) => c.length > 50);
}
