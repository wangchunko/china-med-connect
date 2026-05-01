import { prisma } from "@/lib/prisma";
import { KnowledgeBaseForm } from "@/components/admin/knowledge-form";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  let doctors: Array<{ id: string; fullName: string }> = [];

  try {
    doctors = await prisma.doctor.findMany({
      select: { id: true, fullName: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("AdminKnowledgePage: failed to fetch doctors:", error);
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Knowledge Base
        </h1>
        <p className="text-sm text-muted-foreground">
          Add medical guidelines/papers and link them to a specific doctor.
        </p>
      </header>

      <KnowledgeBaseForm doctors={doctors} />
    </section>
  );
}

