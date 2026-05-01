"use server";

import { prisma } from "@/lib/prisma";
import {
  knowledgeCreateSchema,
  type KnowledgeCreateInput,
} from "@/lib/validations/knowledge.schema";

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function createKnowledgeDocumentAction(
  rawInput: KnowledgeCreateInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = knowledgeCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid knowledge payload.",
    };
  }

  try {
    const doc = await prisma.knowledgeDocument.create({
      data: {
        doctorId: parsed.data.doctorId,
        title: parsed.data.title,
        content: parsed.data.content,
        ...(parsed.data.language ? { language: parsed.data.language } : {}),
      },
      select: { id: true },
    });

    return { ok: true, data: doc };
  } catch (error) {
    console.error("createKnowledgeDocumentAction failed:", error);
    return { ok: false, error: "Unable to save knowledge document right now." };
  }
}

