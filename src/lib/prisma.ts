import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@/generated/prisma/client";

const prismaFile = fileURLToPath(import.meta.url);
// src/lib/prisma.ts -> src -> project root
const projectRoot = path.resolve(path.dirname(prismaFile), "..", "..");
const sqliteUrl = `file:${path.join(projectRoot, "prisma", "dev.db")}`;

// Prisma relies on DATABASE_URL for the sqlite file location.
// In some Next.js dev environments, `.env` may not be loaded into the process env early enough.
// Provide a safe fallback so server components don't crash.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sqliteUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        // Explicitly override to avoid any environment-path resolution issues.
        url: sqliteUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
