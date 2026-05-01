"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDoctorAdminAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "常规病症咨询",
  "医疗美容与皮肤",
  "心理与精神健康",
  "康复与中医理疗",
] as const;

const createDoctorFormSchema = z.object({
  fullName: z.string().trim().min(2, "请输入医生姓名"),
  avatarUrl: z.string().trim().optional(),
  title: z.string().trim().optional(),
  primaryCategory: z.enum(categories),
  tags: z.string().trim().optional(),
});

type CreateDoctorFormValues = z.infer<typeof createDoctorFormSchema>;

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function CreateDoctorForm({
  onSuccess,
  onCancel,
  submitLabel = "保存提交",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateDoctorFormValues>({
    resolver: zodResolver(createDoctorFormSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
      title: "",
      primaryCategory: "常规病症咨询",
      tags: "",
    },
  });

  const onSubmit = (values: CreateDoctorFormValues) => {
    startTransition(async () => {
      const result = await createDoctorAdminAction(values);
      if (!result.ok) {
        toast.error(result.error ?? "创建失败");
        return;
      }

      toast.success("医生已创建");
      form.reset({
        fullName: "",
        avatarUrl: "",
        title: "",
        primaryCategory: "常规病症咨询",
        tags: "",
      });
      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">医生姓名</Label>
            <Input
              id="fullName"
              placeholder="例如：张明华"
              {...form.register("fullName")}
              disabled={isPending}
            />
            {form.formState.errors.fullName ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">头像链接</Label>
            <Input
              id="avatarUrl"
              placeholder="https://...（可选）"
              {...form.register("avatarUrl")}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">职称</Label>
            <Input
              id="title"
              placeholder="主任医师 / 副主任医师"
              {...form.register("title")}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>一级分类</Label>
            <Controller
              control={form.control}
              name="primaryCategory"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">专科标签（请用英文逗号分隔）</Label>
            <Input
              id="tags"
              placeholder="消化内科,儿科（用逗号分隔）"
              {...form.register("tags")}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              用英文或中文逗号分隔标签，例如：消化内科,儿科
            </p>
          </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            取消
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

