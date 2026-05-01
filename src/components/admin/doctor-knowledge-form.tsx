"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileUp, Trash2 } from "lucide-react";

import {
  updateDoctorPrompt,
  updateKnowledgeFiles,
} from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function KnowledgeBaseForm({
  doctorId,
  initialPrompt,
  initialFiles,
}: {
  doctorId: string;
  initialPrompt: string;
  initialFiles: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialPrompt ?? "");
  const [lastSavedValue, setLastSavedValue] = useState(initialPrompt ?? "");
  const [files, setFiles] = useState<string[]>(initialFiles ?? []);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const result = await updateDoctorPrompt(doctorId, value);
      if (!result.ok) {
        toast.error(result.error ?? "保存失败");
        return;
      }

      toast.success("提示词已保存");
      setLastSavedValue(value);
      router.refresh();
    });
  };

  const persistFiles = (nextFiles: string[]) => {
    const csv = nextFiles.join(",");
    startTransition(async () => {
      const result = await updateKnowledgeFiles(doctorId, csv);
      if (!result.ok) {
        toast.error(result.error ?? "文件保存失败");
        return;
      }
      setFiles(nextFiles);
      toast.success("文件列表已更新");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="在此编辑医生的专属提示词（用于指导 AI 回答风格、范围、拒答规则等）…"
        rows={10}
        className="min-h-[260px] leading-relaxed"
        disabled={isPending}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {value === lastSavedValue ? "已保存" : "未保存修改"}
        </div>
        <Button type="button" onClick={onSave} disabled={isPending}>
          {isPending ? "保存中..." : "保存提示词"}
        </Button>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border bg-card/40 p-4">
        <div className="text-sm font-medium">知识库文件管理（MVP）</div>
        <p className="text-xs text-muted-foreground">
          当前仅保存 PDF 文件名到数据库，不做解析；后续可接入真实 RAG。
        </p>

        <label className="inline-flex w-fit cursor-pointer items-center rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
          <FileUp className="mr-2 size-4" />
          上传本地 PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const name = file.name.trim();
              if (!name) return;
              if (files.includes(name)) {
                toast.message("该文件已存在");
                return;
              }
              persistFiles([...files, name]);
            }}
          />
        </label>

        <div className="space-y-2">
          <div className="text-sm font-medium">已上传文件</div>
          {files.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无文件</div>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li
                  key={f}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <span className="truncate">{f}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`确定要删除文件「${f}」吗？`)) return;
                      persistFiles(files.filter((x) => x !== f));
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 size-4" />
                    删除
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

