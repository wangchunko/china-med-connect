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
        "你是一个极其专业的医疗分诊 AI 助手。",
        "请根据用户提供的具体症状描述给出个性化的、温和的健康安抚建议，并使用中文回复。",
        "严禁编造不存在的疾病信息。",
        "你必须严格输出一个 JSON 字符串，不要使用 Markdown 包裹，不要输出任何额外文本。",
        'JSON Schema: { "message": "comforting advice", "suggestedTags": ["tag1","tag2"] }',
        "suggestedTags 只能使用中文标签/科室，例如：呼吸内科, 消化内科, 心血管内科, 妇产科, 儿科, 皮肤科, 整形外科, 心理咨询, 骨科, 针灸推拿。",
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
      "抱歉，我暂时无法解析导诊结果。请尝试更具体地描述症状（例如持续时间、部位、是否发热等），或稍后再试。";
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
    return { ok: false, error: "暂时无法进行导诊，请稍后再试。" };
  }
}

