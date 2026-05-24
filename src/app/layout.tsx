import type { Metadata, Viewport } from "next";
import "./globals.css";

// ─── SEO & Metadata ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    template: "%s | LibrariAI",
    default: "LibrariAI — Private Library AI Chat",
  },
  description:
    "Tanya dokumenmu seperti kamu bertanya kepada ahlinya. RAG-powered private library chat dengan Zero Hallucination Protocol dan desain Neo-Brutalism.",
  keywords: [
    "AI",
    "RAG",
    "library",
    "chat",
    "documents",
    "embeddings",
    "Gemini",
    "MySQL",
    "Next.js",
    "perpustakaan digital",
  ],
  authors: [{ name: "LibrariAI" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "LibrariAI — Private Library AI Chat",
    description: "RAG-powered private library chat berbasis Gemini AI",
    type: "website",
    locale: "id_ID",
    siteName: "LibrariAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "LibrariAI",
    description: "Tanya dokumenmu dengan AI. Zero Hallucination.",
  },
};

// ─── Viewport ────────────────────────────────────────────────────────────────
// Performance: Prevents font size adjustment on mobile (reduces reflows)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFDE03",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/*
          Performance: Preconnect to Google Fonts to establish early connections,
          reducing font loading latency (reduces FCP).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          Performance: dns-prefetch as fallback for browsers that don't support preconnect.
        */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
