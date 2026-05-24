import { prisma } from "@/lib/prisma";
import DocumentsClient from "./DocumentsClient";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  let docs: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    status: string;
    createdAt: Date;
    category: { title: string };
    _count: { chunks: number };
  }[] = [];
  let categories: { id: string; title: string }[] = [];

  try {
    [docs, categories] = await Promise.all([
      prisma.document.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { title: true } },
          _count: { select: { chunks: true } },
        },
      }),
      prisma.category.findMany({ orderBy: { title: "asc" } }),
    ]);
  } catch {
    // DB not ready
  }

  return (
    <div className="p-8">
      <DocumentsClient initialDocs={docs} categories={categories} />
    </div>
  );
}
