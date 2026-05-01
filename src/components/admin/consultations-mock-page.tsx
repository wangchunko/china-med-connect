"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock,
  Copy,
  Dot,
  MessageSquareText,
  PhoneCall,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ConsultStatus = "进行中" | "已结束";

type ChatMsg = { role: "patient" | "ai"; content: string };

type Consult = {
  id: string;
  patientName: string;
  department: string;
  status: ConsultStatus;
  time: string;
  summary: string;
  messages: ChatMsg[];
};

const mockConsults: Consult[] = [
  {
    id: "c1",
    patientName: "王女士（化名）",
    department: "皮肤科",
    status: "进行中",
    time: "今天 19:42",
    summary: "面部泛红、瘙痒，怀疑过敏",
    messages: [
      {
        role: "patient",
        content:
          "医生您好，我最近两天脸颊泛红发热，还有点痒，洗完脸更明显。之前用过一款新面霜，会不会是过敏？需要马上停用吗？",
      },
      {
        role: "ai",
        content:
          "理解你的不适。根据描述，确实要优先考虑接触性刺激/过敏的可能。建议先立即停用新面霜与刺激性护肤（酒精、去角质、酸类），温和清洁，短期只做基础保湿与防晒。若出现明显肿胀、渗出、大片风团或呼吸不适，请及时线下就医。此回复仅作健康建议，不构成诊断。",
      },
    ],
  },
  {
    id: "c2",
    patientName: "陈先生（化名）",
    department: "针灸推拿",
    status: "已结束",
    time: "昨天 21:05",
    summary: "久坐后腰酸、右侧臀腿放射痛",
    messages: [
      {
        role: "patient",
        content:
          "我办公室久坐，最近一周腰酸，右侧臀部到大腿有点放射痛，站起来会缓一下。是不是腰椎间盘突出？需要做什么检查？",
      },
      {
        role: "ai",
        content:
          "这种“久坐+腰臀腿放射痛”的描述确实需要警惕坐骨神经受刺激，但不一定就是椎间盘突出。建议先做 3–5 天的减负：避免久坐久弯，使用小靠垫支撑腰部；每天进行轻柔的髋屈肌与臀肌拉伸；若出现进行性麻木无力、大小便异常、夜间痛明显或发热，请尽快线下骨科/康复科评估并考虑影像学检查。此回复仅作健康建议，不构成诊断。",
      },
    ],
  },
  {
    id: "c3",
    patientName: "刘同学（化名）",
    department: "心理咨询",
    status: "已结束",
    time: "4/28 22:18",
    summary: "焦虑、胸闷，睡眠困难",
    messages: [
      {
        role: "patient",
        content:
          "最近总是心慌、胸闷，晚上很难入睡，脑子停不下来。白天工作也容易走神。我是不是焦虑症？",
      },
      {
        role: "ai",
        content:
          "你描述的“心慌胸闷+反复担忧+入睡困难”确实常见于焦虑状态，但也建议先排除躯体原因（如甲状腺、心律等）。你可以先尝试：固定作息、睡前减少刺激（咖啡因/手机）、用 4-7-8 呼吸法帮助放松；白天把担忧写下来安排“担忧时间”，减少反刍。若出现持续加重、明显惊恐发作或自伤想法，请及时线下就医或寻求紧急帮助。此回复仅作健康建议，不构成诊断。",
      },
    ],
  },
];

function Bubble({
  role,
  content,
}: {
  role: "patient" | "ai";
  content: string;
}) {
  const isPatient = role === "patient";
  return (
    <div className={cn("flex items-end gap-2", isPatient ? "justify-end" : "")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isPatient
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground ring-1 ring-foreground/10"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}

export function ConsultationsMockPage() {
  const [activeId, setActiveId] = useState(mockConsults[0]?.id ?? "");
  const active = useMemo(
    () => mockConsults.find((c) => c.id === activeId) ?? mockConsults[0],
    [activeId]
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">问诊会话</h1>
            <p className="text-sm text-muted-foreground">
              历史问诊记录与实时监控（Demo Mock 数据）。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.message("功能演示：导出会话", {
                description: "导出能力稍后接入。",
              })
            }
          >
            <Copy className="mr-2 size-4" />
            导出
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-card/40">
            <CardTitle className="text-base">最近问诊</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[640px] overflow-y-auto">
              {mockConsults.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full border-b px-4 py-3 text-left transition last:border-0",
                      isActive ? "bg-muted/30" : "hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{c.patientName}</div>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                          c.status === "进行中"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        <Dot className="size-4" />
                        {c.status}
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="size-3.5" />
                        {c.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {c.time}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      {c.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-card/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base">对话详情</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {active.patientName} · {active.department}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.message("功能演示：发起电话回访", {
                      description: "回访流程稍后接入。",
                    })
                  }
                >
                  <PhoneCall className="mr-2 size-4" />
                  回访
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.message("功能演示：标记为已处理", {
                      description: "处理流转稍后接入。",
                    })
                  }
                >
                  <BadgeCheck className="mr-2 size-4" />
                  标记
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex h-[640px] flex-col">
              <div className="flex-1 overflow-y-auto bg-muted/10 px-4 py-4">
                <div className="mb-4 rounded-xl border bg-background p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-amber-600" />
                    此为 Demo 对话示例，展示“问诊监控大屏”的交互与信息层级。
                  </div>
                </div>

                <div className="space-y-3">
                  {active.messages.map((m, idx) => (
                    <Bubble key={`${active.id}-${idx}`} role={m.role} content={m.content} />
                  ))}
                </div>
              </div>

              <div className="border-t bg-background p-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    rows={2}
                    placeholder="（Demo）运营人员可在此输入备注或追加引导话术…"
                    className="min-h-[52px] resize-none rounded-2xl bg-muted/20 px-3 py-3"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      toast.message("功能演示：发送运营备注", {
                        description: "发送与协同能力稍后接入。",
                      })
                    }
                    className="h-11 rounded-2xl px-4"
                  >
                    <MessageSquareText className="mr-2 size-4" />
                    发送
                  </Button>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  提示：此区域为演示“客服/运营协同”，不写入数据库。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

