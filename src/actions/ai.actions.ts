"use server";

import { z } from "zod";
import OpenAI from "openai";

import { prisma } from "@/lib/prisma";

const aiConsultationInputSchema = z.object({
  doctorId: z.string().trim().optional(),
  locale: z.string().trim().default("en-US"),
  language: z.string().trim().default("en"),
  message: z.string().trim().min(3, "Message must be at least 3 characters."),
  userDisplayName: z.string().trim().optional(),
});

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function toChunks(text: string): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  const chunkSize = 28;
  const chunks: string[] = [];

  for (let i = 0; i < normalized.length; i += chunkSize) {
    chunks.push(normalized.slice(i, i + chunkSize));
  }

  return chunks.length > 0 ? chunks : [normalized];
}

function getQianfanClient(): OpenAI {
  const apiKey = process.env.BAIDU_V2_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BAIDU_V2_API_KEY in environment variables.");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://qianfan.baidubce.com/v2",
  });
}

export async function streamConsultationResponseAction(
  rawInput: z.input<typeof aiConsultationInputSchema>
): Promise<
  ActionResult<{
    sessionId: string;
    chunks: string[];
    fullResponse: string;
    supportingDocumentIds: string[];
  }>
> {
  const parsed = aiConsultationInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid consultation payload.",
    };
  }

  const input = parsed.data;

  try {
    // 0) Fetch current doctor's specialty boundaries.
    if (!input.doctorId) {
      return { ok: false, error: "Missing doctorId." };
    }

    let doctor: { primaryCategory: string; tags: string } | null = null;
    try {
      doctor = await prisma.doctor.findUnique({
        where: { id: input.doctorId },
        select: { primaryCategory: true, tags: true },
      });
    } catch (error) {
      console.error(
        "streamConsultationResponseAction: doctor fetch failed:",
        error
      );
      doctor = null;
    }

    if (!doctor) {
      return { ok: false, error: "Doctor not found." };
    }

    // 1) Fetch supporting knowledge (optional) from SQLite.
    let knowledgeDocuments: Array<{ id: string; title: string; content: string }> =
      [];
    try {
      knowledgeDocuments = await prisma.knowledgeDocument.findMany({
        where: {
          doctorId: input.doctorId,
          language: input.language,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
        },
      });
    } catch (error) {
      console.error("streamConsultationResponseAction: knowledge fetch failed:", error);
      knowledgeDocuments = [];
    }

    const knowledgeContext =
      knowledgeDocuments.length > 0
        ? knowledgeDocuments
            .map((doc) => `【${doc.title}】${doc.content.slice(0, 400)}`)
            .join("\n\n")
        : "";

    // 2) Call Qianfan V2 via OpenAI-compatible SDK.
    const client = getQianfanClient();
    const systemPrompt = [
      `你是一位专业的在线咨询专家。你的领域方向是：${doctor.primaryCategory}，你的标签是：${doctor.tags}。`,
      "【重要规则】：",
      "1. 你只能基于你的【标签】范围回答用户的问题；超出范围时请明确说明，并给出替代思路或建议用户寻找更合适的专业渠道。",
      "2. 请避免输出高风险或不可逆的指令；不确定时请给出可验证的下一步与风险提示。",
      "3. 遇到明显需要线下专业介入的情况，请温和建议用户联系对应机构或专业人士。",
      "4. 请始终保持专业、同理心，并使用中文回复。",
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "ernie-4.0-8k",
      messages: [
        { role: "system", content: systemPrompt },
        ...(knowledgeContext
          ? [
              {
                role: "system" as const,
                content: `以下为该医生的知识库片段（仅供参考）：\n${knowledgeContext}`,
              },
            ]
          : []),
        { role: "user", content: input.message },
      ],
    });

    const fullResponse = completion.choices?.[0]?.message?.content?.trim();
    if (!fullResponse) {
      throw new Error("Empty completion from Qianfan V2.");
    }

    const chunks = toChunks(fullResponse);

    // 3) Persist chat to SQLite.
    let sessionId = "";
    try {
      const session = await prisma.consultationSession.create({
        data: {
          doctorId: input.doctorId,
          userDisplayName: input.userDisplayName,
          userLocale: input.locale,
          messageHistoryJson: JSON.stringify([
            { role: "user", content: input.message },
            { role: "assistant", content: fullResponse },
          ]),
        },
        select: { id: true },
      });
      sessionId = session.id;
    } catch (error) {
      console.error(
        "streamConsultationResponseAction: session create failed:",
        error
      );
      // If saving fails, still return the AI response (best-effort UX).
      sessionId = "unsaved";
    }

    return {
      ok: true,
      data: {
        sessionId,
        chunks,
        fullResponse,
        supportingDocumentIds: knowledgeDocuments.map((doc) => doc.id),
      },
    };
  } catch (error) {
    console.error("streamConsultationResponseAction failed:", error);
    return { ok: false, error: "Unable to generate AI response right now." };
  }
}

// Intentionally not exported from this "use server" module.
// Next.js only allows exporting async functions from server action files.
