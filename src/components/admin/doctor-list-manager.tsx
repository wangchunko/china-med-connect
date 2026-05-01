"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Search, Trash2 } from "lucide-react";

import { deleteDoctorAdminAction } from "@/actions/admin.actions";
import { AddDoctorModal } from "@/components/admin/add-doctor-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DoctorListItem = {
  id: string;
  fullName: string;
  title: string | null;
  avatarUrl: string | null;
  primaryCategory: string;
  tags: string;
};

export function DoctorListManager({
  initialDoctors,
}: {
  initialDoctors: DoctorListItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState<DoctorListItem[]>(initialDoctors);
  const [pendingDelete, setPendingDelete] = useState<DoctorListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => {
      const name = d.fullName.toLowerCase();
      const tags = (d.tags ?? "").toLowerCase();
      return name.includes(q) || tags.includes(q);
    });
  }, [doctors, query]);

  const onDelete = (doctor: DoctorListItem) => {
    setPendingDelete(doctor);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;

    startTransition(async () => {
      const result = await deleteDoctorAdminAction(id);
      if (!result.ok) {
        toast.error(result.error ?? "删除失败");
        return;
      }
      toast.success("已删除医生");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索：医生姓名 / 专科标签"
            className="pl-9"
          />
        </div>

        <AddDoctorModal />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card/40 p-6 text-sm text-muted-foreground">
          {query.trim()
            ? "未找到匹配的医生，请调整搜索关键词。"
            : "暂无医生数据，请点击右上角“新增医生”。"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card/40">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">医生</th>
                <th className="px-4 py-3 text-left font-medium">一级分类</th>
                <th className="px-4 py-3 text-left font-medium">专科标签</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                        {d.avatarUrl ? (
                          <Image
                            src={d.avatarUrl}
                            alt={d.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{d.fullName}</div>
                        {d.title ? (
                          <div className="text-xs text-muted-foreground">
                            {d.title}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md border bg-background px-2 py-0.5 text-xs">
                      {d.primaryCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.tags || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/boss-panel/doctors/${d.id}/knowledge`)
                        }
                      >
                        <BookOpen className="mr-2 size-4" />
                        知识库
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(d)}
                        className={cn("bg-destructive/10 text-destructive hover:bg-destructive/20")}
                      >
                        <Trash2 className="mr-2 size-4" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!pendingDelete} onOpenChange={(o) => (!o ? setPendingDelete(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定要删除该医生吗？</DialogTitle>
            <DialogDescription>
              删除后将无法恢复，同时该医生关联的知识库与预约数据也会一并删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="button" onClick={confirmDelete} disabled={isPending}>
              {isPending ? "删除中..." : "确定删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

