"use server";

import { z } from "zod";
import OpenAI from "openai";

import { prisma } from "@/lib/prisma";

const triageInputSchema = z.object({
  symptoms: z.string().trim().min(3, "Please describe your symptoms."),
  patientName: z.string().trim().min(2).optional(),
});

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

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

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

type TriageJson = {
  message: string;
  suggestedTags: string[];
};

function safeParseTriageJson(raw: string): TriageJson | null {
  const cleaned = stripJsonFences(raw);
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : cleaned;

  try {
    const parsed = JSON.parse(jsonText) as Partial<TriageJson>;
    if (typeof parsed.message !== "string") return null;
    const suggestedTags = Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags.filter((t): t is string => typeof t === "string")
      : [];
    return { message: parsed.message, suggestedTags };
  } catch {
    return null;
  }
}

function normalizeTag(tag: string): string {
  return tag.replace(/[，]/g, ",").trim();
}

export async function triageAction(
  rawInput: z.input<typeof triageInputSchema>
): Promise<
  ActionResult<{
    message: string;
    recommendedDoctors: Array<{
      id: string;
      fullName: string;
      intlCertification: string;
      profile: string;
    }>;
  }>
> {
  const parsed = triageInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid triage payload.",
    };
  }

  try {
    const client = getQianfanClient();

    const systemPrompt =
      [
        "你是一个专业、友好的通用 AI 对话助手。",
        "请根据用户的描述给出清晰、可执行的建议与下一步行动，并使用中文回复。",
        "严禁编造具体事实；不确定时请明确说明，并给出可验证的建议。",
        "你必须严格输出一个 JSON 字符串，不要使用 Markdown 包裹，不要输出任何额外文本。",
        'JSON Schema: { "message": "actionable advice", "suggestedTags": ["tag1","tag2"] }',
        "suggestedTags 用于推荐合适的探索方向标签（中文短标签），例如：学习方法, 计划拆解, 写作润色, 效率提升, 职业规划, 生活建议。",
      ].join("\n");

    const symptoms = parsed.data.symptoms;

    const completion = await client.chat.completions.create({
      model: "ernie-4.0-8k",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: symptoms },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      throw new Error("Empty completion from Qianfan V2.");
    }

    const parsedJson = safeParseTriageJson(raw);
    const message =
      parsedJson?.message ??
      "抱歉，我暂时无法解析返回结果。请尝试更具体地描述你的问题与目标（例如背景、约束、希望的结果），或稍后再试。";
    const suggestedTags = (parsedJson?.suggestedTags ?? [])
      .map(normalizeTag)
      .filter(Boolean);

    const allDoctors = await prisma.doctor.findMany({
      select: {
        id: true,
        fullName: true,
        intlCertification: true,
        profile: true,
        primaryCategory: true,
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const matches = allDoctors.filter((d) => {
      const categoryMatch = suggestedTags.includes(d.primaryCategory);
      const doctorTags = d.tags
        .split(/[,，]/g)
        .map((t) => t.trim())
        .filter(Boolean);
      const tagMatch = doctorTags.some((t) => suggestedTags.includes(t));
      return categoryMatch || tagMatch;
    });

    const recommendedDoctors =
      matches.length > 0
        ? matches
        : allDoctors.filter((d) => d.primaryCategory === "常规病症咨询").slice(0, 2);

    return {
      ok: true,
      data: {
        message,
        recommendedDoctors: recommendedDoctors.map((d) => ({
          id: d.id,
          fullName: d.fullName,
          intlCertification: d.intlCertification,
          profile: d.profile,
        })),
      },
    };
  } catch (error) {
    console.error("triageAction failed:", error);
    return { ok: false, error: "暂时无法提供建议，请稍后再试。" };
  }
}

