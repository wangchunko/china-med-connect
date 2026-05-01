"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { z } from "zod";
import { Sparkles, Stethoscope, User } from "lucide-react";

import { triageAction } from "@/actions/triage.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const triageFormSchema = z.object({
  symptoms: z.string().trim().min(3, "请描述您的症状或问题。"),
});

type RecommendedDoctor = {
  id: string;
  fullName: string;
  intlCertification: string;
  profile: string;
};

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  recommendedDoctors?: RecommendedDoctor[];
};

const welcomeMessage = `您好！我是华医连智能导诊助手。您可以向我描述您或家人的症状，我会为您初步分析并推荐合适的专家。

您可以这样问我：
- 描述具体症状、持续时间和感受
- 询问特定疾病的日常护理建议
- 咨询应该挂哪个科室

⚠️ 提示：本系统仅提供导诊与健康咨询，不作为最终诊断依据。如遇突发急症，请立即拨打 120。`;

const starterChips = [
  "我家西可最近晚上总是不爱吃饭，肚肚有点胀，需要去医院吗？",
  "平时经常久坐办公，最近低头时觉得颈椎酸痛，偶尔手麻...",
  "春季换季，脸颊容易泛红起皮，这属于皮肤过敏吗？",
  "我最近经常熬夜加班，偶尔觉得胸闷气短，应该挂什么科？",
];

export function TriageChat() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", role: "assistant", content: welcomeMessage },
  ]);

  const formRef = useRef<HTMLFormElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatId = useId().replace(/:/g, "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = triageFormSchema.safeParse({ symptoms: draft });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "输入内容不合法。");
      return;
    }

    const userText = parsed.data.symptoms;
    const userMsgId = `${chatId}-u-${Date.now()}`;
    const assistantMsgId = `${chatId}-a-${Date.now() + 1}`;

    appendMessage({ id: userMsgId, role: "user", content: userText });
    appendMessage({ id: assistantMsgId, role: "assistant", content: "…" });

    startTransition(async () => {
      const result = await triageAction({ symptoms: userText });
      if (!result.ok || !result.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: result.error ?? "暂时无法进行导诊，请稍后再试。",
                  recommendedDoctors: [],
                }
              : m
          )
        );
        return;
      }

      const data = result.data;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: data.message,
                recommendedDoctors: data.recommendedDoctors,
              }
            : m
        )
      );
      setDraft("");
    });
  };

  return (
    <div className="lg:h-full lg:min-h-0">
      <div className="mx-auto max-w-4xl lg:h-full lg:min-h-0">
        <div className="rounded-3xl bg-white/70 p-6 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] lg:h-full lg:min-h-0 lg:flex lg:flex-col">
          <Card className="overflow-hidden border-0 shadow-none lg:h-full lg:min-h-0 lg:flex lg:flex-col">
            <CardHeader className="border-b border-white/30 bg-teal-50/40 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-white text-teal-700 ring-1 ring-teal-100">
                  <Sparkles className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <CardTitle className="text-base">AI 智能导诊</CardTitle>
                <p className="text-xs text-muted-foreground">
                  描述症状，获得初步建议与专家推荐。
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 lg:flex-1 lg:min-h-0">
            <div className="flex h-[620px] flex-col lg:h-full lg:min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto bg-transparent px-4 py-4">
                <div className="mx-auto max-w-xl rounded-3xl border border-white/40 bg-white/70 p-4 text-sm text-slate-600 backdrop-blur-md shadow-[0_10px_40px_-18px_rgba(15,23,42,0.18)]">
                  这是用于 MVP 的 AI 智能导诊演示。若遇紧急情况，请立即联系当地急救服务。
                </div>

                <div className="mt-4 space-y-3">
                  {messages.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex items-end gap-2",
                          isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isUser ? (
                          <Avatar size="sm" className="mb-1">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              <Stethoscope className="size-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : null}

                        <div
                          className={cn(
                            "max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                            isUser
                              ? "bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-[0_16px_40px_-22px_rgba(13,148,136,0.55)]"
                              : "bg-white/75 text-slate-900 backdrop-blur-md ring-1 ring-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_40px_-26px_rgba(15,23,42,0.35)]"
                          )}
                        >
                          <div className="whitespace-pre-wrap">{m.content}</div>

                          {!isUser && m.recommendedDoctors?.length ? (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {m.recommendedDoctors.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-3 backdrop-blur-md shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_22px_60px_-28px_rgba(15,23,42,0.45)] animate-[slide-up-soft_420ms_ease-out]"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-3 top-3"
                                  >
                                    <span className="absolute inset-[-6px] rounded-full bg-teal-400/25 blur-[2px] animate-[breathe-ring_2.8s_ease-in-out_infinite]" />
                                    <span className="relative block size-2 rounded-full bg-teal-500/80 ring-1 ring-white/60" />
                                  </span>
                                  <div className="text-sm font-medium">
                                    {doc.fullName}
                                  </div>
                                  <div className="mt-0.5 text-xs text-muted-foreground">
                                    {doc.intlCertification}
                                  </div>
                                  <div className="mt-2 text-xs text-muted-foreground line-clamp-3">
                                    {doc.profile}
                                  </div>
                                  <Link
                                    href={`/doctor/${doc.id}`}
                                    className={cn(
                                      buttonVariants({ size: "sm" }),
                                      "mt-3 w-fit bg-teal-600 text-white hover:bg-teal-700"
                                    )}
                                  >
                                    去问诊
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {isUser ? (
                          <Avatar size="sm" className="mb-1">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              <User className="size-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div ref={bottomRef} />
              </div>

              <div className="border-t bg-background px-4 py-3">
                <form ref={formRef} onSubmit={onSubmit} className="space-y-2">
                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}

                  {messages.length <= 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:[&::-webkit-scrollbar]:hidden lg:[scrollbar-width:none] lg:[-ms-overflow-style:none]">
                      {starterChips.map((text) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => {
                            setDraft(text);
                            requestAnimationFrame(() => {
                              textareaRef.current?.focus();
                            });
                          }}
                          className="text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-full px-4 py-2 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                      <Textarea
                        ref={textareaRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            formRef.current?.requestSubmit();
                          }
                        }}
                        placeholder="描述您的症状或问题...（回车发送，Shift+Enter 换行）"
                        rows={2}
                        className="min-h-[52px] w-full resize-none rounded-full bg-white/70 px-4 py-3 leading-relaxed backdrop-blur-md ring-1 ring-white/60 shadow-inner shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-teal-200"
                        disabled={isPending}
                      />
                    </div>

                    <button
                      type="submit"
                      className={cn(
                        buttonVariants(),
                        "shrink-0 h-[52px] rounded-full px-5 bg-teal-600 text-white hover:bg-teal-700 transition-all duration-300 ease-in-out hover:shadow-[0_12px_30px_-12px_rgba(0,128,128,0.25)] hover:scale-[1.01]",
                        isPending ? "opacity-70" : ""
                      )}
                      disabled={isPending || !draft.trim()}
                    >
                      {isPending ? "导诊中…" : "开始导诊"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

