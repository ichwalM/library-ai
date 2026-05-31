import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionsResponse, successResponse } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(_request: NextRequest) {
  // Check DB connectivity
  let dbStatus: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return successResponse({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    version: "v1",
    services: {
      database: dbStatus,
      ai: process.env.GEMINI_API_KEY ? "configured" : "missing_key",
    },
    uptime: process.uptime(),
  });
}
