"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) throw new Error("Judul kategori wajib diisi.");

  await prisma.category.create({
    data: { title: title.trim(), description: description?.trim() || null },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
}

export async function updateCategory(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) throw new Error("Judul kategori wajib diisi.");

  await prisma.category.update({
    where: { id },
    data: { title: title.trim(), description: description?.trim() || null },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/browse");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/browse");
}
