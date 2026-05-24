import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ categoryId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { title: true },
    });
    if (category) {
      return {
        title: `Chat — ${category.title}`,
        description: `Berdialog dengan AI tentang koleksi dokumen "${category.title}" menggunakan Zero Hallucination Protocol.`,
      };
    }
  } catch {
    // DB not ready
  }
  return {
    title: "Chat",
  };
}

export default async function ChatPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { categoryId } = await params;

  let category: { id: string; title: string; description: string | null } | null = null;
  let docCount = 0;

  try {
    [category, docCount] = await Promise.all([
      prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, title: true, description: true },
      }),
      prisma.document.count({
        where: { categoryId, status: "ready" },
      }),
    ]);
  } catch {
    // DB not ready
  }

  if (!category) {
    redirect("/browse");
  }

  return (
    <ChatClient
      category={category}
      docCount={docCount}
      userImage={session.user?.image || null}
      userName={session.user?.name || "User"}
    />
  );
}
