"use client";

import { toast } from "sonner";
import {
  Calendar,
  Eye,
  FilePlus2,
  Sparkles,
  Stethoscope,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  departmentTags: string[];
  views: number;
  publishedAt: string;
  doctor: string;
  coverTone: "cyan" | "violet" | "emerald" | "amber" | "rose" | "blue";
};

const mockArticles: Article[] = [
  {
    id: "a1",
    title: "《春季防过敏指南》",
    departmentTags: ["皮肤科", "呼吸内科"],
    views: 12840,
    publishedAt: "2026-04-12",
    doctor: "李思雨",
    coverTone: "cyan",
  },
  {
    id: "a2",
    title: "《颈椎病的日常保养：3 个动作缓解酸痛》",
    departmentTags: ["骨科", "康复理疗"],
    views: 9621,
    publishedAt: "2026-04-08",
    doctor: "陈子昂",
    coverTone: "emerald",
  },
  {
    id: "a3",
    title: "《反酸烧心别硬扛：胃食管反流的正确处理》",
    departmentTags: ["消化内科"],
    views: 14302,
    publishedAt: "2026-03-29",
    doctor: "赵欣然",
    coverTone: "violet",
  },
  {
    id: "a4",
    title: "《焦虑睡不好怎么办？先从这份睡眠清单开始》",
    departmentTags: ["心理咨询"],
    views: 7760,
    publishedAt: "2026-03-17",
    doctor: "王若彤",
    coverTone: "blue",
  },
  {
    id: "a5",
    title: "《高血压人群的饮食要点：控盐不是唯一》",
    departmentTags: ["心血管内科", "常规病症咨询"],
    views: 18455,
    publishedAt: "2026-02-26",
    doctor: "张明华",
    coverTone: "amber",
  },
  {
    id: "a6",
    title: "《儿童发热分诊：家长最常忽略的 4 个信号》",
    departmentTags: ["儿科"],
    views: 21013,
    publishedAt: "2026-02-10",
    doctor: "周沐辰",
    coverTone: "rose",
  },
];

const toneMap: Record<Article["coverTone"], string> = {
  cyan: "from-cyan-500/25 via-sky-500/15 to-transparent",
  violet: "from-violet-500/25 via-fuchsia-500/15 to-transparent",
  emerald: "from-emerald-500/25 via-teal-500/15 to-transparent",
  amber: "from-amber-500/25 via-orange-500/15 to-transparent",
  rose: "from-rose-500/25 via-pink-500/15 to-transparent",
  blue: "from-blue-500/25 via-indigo-500/15 to-transparent",
};

function formatViews(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toString();
}

export function ContentMockPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">健康内容</h1>
            <p className="text-sm text-muted-foreground">
              医学科普文章管理（Demo Mock 数据，用于路演展示）。
            </p>
          </div>
          <Button
            type="button"
            className="h-9"
            onClick={() =>
              toast.message("功能演示：发布新文章", {
                description: "当前为 Demo 页面，发布流程稍后接入。",
              })
            }
          >
            <FilePlus2 className="mr-2 size-4" />
            发布新文章
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-card/40">
            <CardTitle className="text-base">文章列表</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mockArticles.map((a) => (
                <Card
                  key={a.id}
                  className="group overflow-hidden border-border/80 bg-card/60"
                >
                  <div className="relative h-28 overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        toneMap[a.coverTone]
                      )}
                    />
                    <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]" />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border bg-background/70 px-2.5 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                      <Sparkles className="size-3.5" />
                      科普内容
                    </div>
                  </div>

                  <CardContent className="space-y-3 p-4">
                    <div className="space-y-1">
                      <div className="line-clamp-2 text-sm font-semibold leading-snug">
                        {a.title}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {a.departmentTags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            <Tag className="size-3" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="size-3.5" />
                        {formatViews(a.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {a.publishedAt}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Stethoscope className="size-3.5" />
                        {a.doctor}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        状态：已发布
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.message("功能演示：查看文章", {
                            description: "详情页稍后接入。",
                          })
                        }
                      >
                        查看
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-card/40">
            <CardTitle className="text-base">内容运营看板（Mock）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-xl border bg-muted/10 p-4">
              <div className="text-sm font-medium">本周浏览总量</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">
                12.4万
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                环比 +18%（模拟数据）
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { k: "新增文章", v: "6 篇" },
                { k: "高转化科室", v: "消化内科" },
                { k: "平均阅读时长", v: "3分12秒" },
                { k: "热门关键词", v: "过敏 / 颈椎 / 反流" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{row.k}</span>
                  <span className="font-medium">{row.v}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
              提示：此页为 Demo UI，后续可接入文章发布、审核、SEO 与多语言。
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

