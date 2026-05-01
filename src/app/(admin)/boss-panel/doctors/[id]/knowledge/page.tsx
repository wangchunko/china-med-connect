import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KnowledgeBaseForm } from "@/components/admin/doctor-knowledge-form";

const paramsSchema = z.object({
  id: z.string().min(1),
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function DoctorKnowledgePage({ params }: PageProps) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) notFound();

  let doctor:
    | {
        id: string;
        fullName: string;
        customPrompt: string | null;
        knowledgeFiles: string;
      }
    | null = null;

  try {
    doctor = await prisma.doctor.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        fullName: true,
        customPrompt: true,
        knowledgeFiles: true,
      },
    });
  } catch (error) {
    console.error("DoctorKnowledgePage: failed to fetch doctor:", error);
    doctor = null;
  }

  if (!doctor) notFound();

  const files = doctor.knowledgeFiles
    ? doctor.knowledgeFiles
        .split(/[,，]/g)
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/boss-panel/doctors"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 返回医生列表
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          配置 {doctor.fullName} 的专属知识库
        </h1>
        <p className="text-sm text-muted-foreground">
          配置医生专属提示词，并管理绑定的知识库文件（PDF 上传功能稍后实现）。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">专属提示词（customPrompt）</CardTitle>
          </CardHeader>
          <CardContent>
            <KnowledgeBaseForm
              doctorId={doctor.id}
              initialPrompt={doctor.customPrompt ?? ""}
              initialFiles={files}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">知识库文件管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">已绑定文件</div>
              {files.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无绑定文件</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {files.map((f) => (
                    <li key={f} className="rounded-lg border bg-background px-3 py-2">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

