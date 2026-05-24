import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: {
    id: string;
    title: string;
    description: string | null;
    _count: { documents: number };
  }[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documents: true } } },
    });
  } catch {
    // DB not ready
  }

  return (
    <div className="p-8">
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
