"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const primaryCategorySchema = z.enum([
  "常规病症咨询",
  "医疗美容与皮肤",
  "心理与精神健康",
  "康复与中医理疗",
]);

const createDoctorAdminSchema = z.object({
  fullName: z.string().trim().min(2, "姓名不能为空"),
  avatarUrl: z.string().trim().url("头像 URL 不合法").optional().or(z.literal("")),
  title: z.string().trim().optional().or(z.literal("")),
  primaryCategory: primaryCategorySchema.default("常规病症咨询"),
  tags: z.string().trim().optional().or(z.literal("")),
});

export type CreateDoctorAdminInput = z.infer<typeof createDoctorAdminSchema>;

export async function listDoctorsAdminAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      fullName: string;
      title: string | null;
      avatarUrl: string | null;
      primaryCategory: string;
      tags: string;
      createdAt: Date;
    }>
  >
> {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        fullName: true,
        title: true,
        avatarUrl: true,
        primaryCategory: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: doctors };
  } catch (error) {
    console.error("listDoctorsAdminAction failed:", error);
    return { ok: false, error: "无法获取医生列表" };
  }
}

export async function createDoctorAdminAction(
  rawInput: CreateDoctorAdminInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createDoctorAdminSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "参数不合法",
    };
  }

  const { fullName, avatarUrl, title, primaryCategory, tags } = parsed.data;

  try {
    const doctor = await prisma.doctor.create({
      data: {
        fullName,
        avatarUrl: avatarUrl?.trim() ? avatarUrl.trim() : undefined,
        title: title?.trim() ? title.trim() : undefined,
        primaryCategory,
        tags: tags?.trim() ? tags.trim() : "",
      },
      select: { id: true },
    });
    return { ok: true, data: doctor };
  } catch (error) {
    console.error("createDoctorAdminAction failed:", error);
    return { ok: false, error: "创建医生失败（可能姓名重复）" };
  }
}

const deleteDoctorSchema = z.object({
  doctorId: z.string().trim().min(1, "doctorId 不能为空"),
});

export async function deleteDoctorAdminAction(
  doctorId: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteDoctorSchema.safeParse({ doctorId });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "参数不合法",
    };
  }

  try {
    const deleted = await prisma.doctor.delete({
      where: { id: parsed.data.doctorId },
      select: { id: true },
    });
    return { ok: true, data: deleted };
  } catch (error) {
    console.error("deleteDoctorAdminAction failed:", error);
    return { ok: false, error: "删除失败（可能该医生不存在）" };
  }
}

const updateDoctorPromptSchema = z.object({
  doctorId: z.string().trim().min(1, "doctorId 不能为空"),
  customPrompt: z.string().trim().max(20_000, "提示词过长"),
});

export async function updateDoctorPromptAdminAction(
  doctorId: string,
  customPrompt: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateDoctorPromptSchema.safeParse({ doctorId, customPrompt });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "参数不合法",
    };
  }

  try {
    const updated = await prisma.doctor.update({
      where: { id: parsed.data.doctorId },
      data: { customPrompt: parsed.data.customPrompt || null },
      select: { id: true },
    });
    return { ok: true, data: updated };
  } catch (error) {
    console.error("updateDoctorPromptAdminAction failed:", error);
    return { ok: false, error: "保存失败（可能该医生不存在）" };
  }
}

const updateKnowledgeFilesSchema = z.object({
  doctorId: z.string().trim().min(1, "doctorId 不能为空"),
  knowledgeFiles: z.string().trim().max(10_000, "文件列表过长"),
});

export async function updateKnowledgeFilesAdminAction(
  doctorId: string,
  knowledgeFiles: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateKnowledgeFilesSchema.safeParse({ doctorId, knowledgeFiles });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "参数不合法",
    };
  }

  try {
    const updated = await prisma.doctor.update({
      where: { id: parsed.data.doctorId },
      data: { knowledgeFiles: parsed.data.knowledgeFiles },
      select: { id: true },
    });
    return { ok: true, data: updated };
  } catch (error) {
    console.error("updateKnowledgeFilesAdminAction failed:", error);
    return { ok: false, error: "保存失败（可能该医生不存在）" };
  }
}

// Aliases requested by spec (keep existing AdminAction names intact).
export async function updateDoctorPrompt(
  doctorId: string,
  customPrompt: string
): Promise<ActionResult<{ id: string }>> {
  return await updateDoctorPromptAdminAction(doctorId, customPrompt);
}

export async function updateKnowledgeFiles(
  doctorId: string,
  knowledgeFiles: string
): Promise<ActionResult<{ id: string }>> {
  return await updateKnowledgeFilesAdminAction(doctorId, knowledgeFiles);
}

