"use client";

import { z } from "zod";
import {
  type FormEvent,
  useId,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { CalendarPlus, Mic, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

import { createAppointment } from "@/actions/appointment.actions";
import { streamConsultationResponseAction } from "@/actions/ai.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const consultationMessageSchema = z.object({
  message: z.string().trim().min(3, "请输入至少 3 个字符。"),
});

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type Props = {
  doctorId: string;
  doctorName: string;
};

export function AIConsultationRoom({ doctorId, doctorName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isTyping, setIsTyping] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBookingPending, startBookingTransition] = useTransition();

  const formRef = useRef<HTMLFormElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatId = useId().replace(/:/g, "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const updateMessage = (messageId: string, updater: (c: string) => string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: updater(m.content) } : m))
    );
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = consultationMessageSchema.safeParse({ message: draft });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "消息内容不合法。");
      return;
    }

    const userMessage = parsed.data.message;
    const userMsgId = `${chatId}-u-${Date.now()}`;
    const assistantMsgId = `${chatId}-a-${Date.now() + 1}`;

    appendMessage({ id: userMsgId, role: "user", content: userMessage });
    appendMessage({ id: assistantMsgId, role: "assistant", content: "" });
    setDraft("");

    setIsTyping(true);
    startTransition(async () => {
      const result = await streamConsultationResponseAction({
        doctorId,
        message: userMessage,
        locale: "en-US",
        language: "en",
        userDisplayName: "访客",
      });

      if (!result.ok || !result.data) {
        updateMessage(
          assistantMsgId,
          () => result.error ?? "抱歉，我暂时无法生成回复，请稍后再试。"
        );
        setIsTyping(false);
        return;
      }

      const { chunks } = result.data;
      // Simulate streaming by appending small chunks with a short delay.
      for (const chunk of chunks) {
        await new Promise((r) => setTimeout(r, 90));
        updateMessage(assistantMsgId, (c) => c + chunk);
      }

      setIsTyping(false);
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-card/40 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <Stethoscope className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <CardTitle className="text-sm">{doctorName}</CardTitle>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex size-1.5 rounded-full bg-emerald-500" />
                在线
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger
                render={
                  <Button type="button" size="sm" className="h-8">
                    <CalendarPlus className="mr-2 size-4" />
                    预约咨询
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>预约咨询</DialogTitle>
                  <DialogDescription>
                    提交您的信息，我们会与您确认具体时间。
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formEl = e.currentTarget;
                    const fd = new FormData(formEl);

                    startBookingTransition(async () => {
                      const result = await createAppointment(fd, doctorId);
                      if (!result.ok) {
                        toast.error(
                          result.error ?? "暂时无法提交预约，请稍后再试。"
                        );
                        return;
                      }

                      toast.success("预约已提交！");
                      formEl.reset();
                      setIsBookingOpen(false);
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="patientName">联系人姓名</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      placeholder="例如：李伟"
                      disabled={isBookingPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">问题 / 备注</Label>
                    <Textarea
                      id="symptoms"
                      name="symptoms"
                      placeholder="请简要描述您的问题、背景与相关备注…"
                      rows={5}
                      className="min-h-[140px]"
                      disabled={isBookingPending}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isBookingPending}
                      className="w-full sm:w-auto"
                    >
                      {isBookingPending ? "预约中…" : "确认预约"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                toast.message("语音输入即将上线", {
                  description: "麦克风输入能力正在规划中。",
                })
              }
              aria-label="语音输入（即将上线）"
            >
              <Mic className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-[520px] flex-col">
          <div className="flex-1 overflow-y-auto bg-muted/10 px-4 py-4">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-sm rounded-xl border bg-background p-4 text-sm text-muted-foreground shadow-sm">
                可以聊聊你的问题与目标。我会尽量给出清晰的建议与下一步行动（仅供参考）。
              </div>
            ) : null}

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
                        "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground ring-1 ring-foreground/10"
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </div>
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

              {isTyping ? (
                <div className="flex items-end gap-2">
                  <Avatar size="sm" className="mb-1">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <Stethoscope className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[82%] rounded-2xl bg-background px-3.5 py-2.5 text-sm text-muted-foreground ring-1 ring-foreground/10 shadow-sm">
                    正在输入…
                  </div>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t bg-background px-4 py-3">
            <form ref={formRef} onSubmit={onSend} className="space-y-2">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        formRef.current?.requestSubmit();
                      }
                    }}
                    placeholder="描述您的症状或问题..."
                    rows={1}
                    className="min-h-[44px] resize-none rounded-2xl bg-muted/20 px-3 py-2.5 leading-relaxed focus-visible:ring-2"
                    disabled={isPending || isTyping}
                  />
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    回车发送 • Shift+Enter 换行
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || isTyping || !draft.trim()}
                  className="h-11 rounded-2xl px-4"
                >
                  {isPending || isTyping ? "发送中…" : "发送"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

