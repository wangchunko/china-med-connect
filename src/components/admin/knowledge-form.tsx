"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

import { createKnowledgeDocumentAction } from "@/actions/knowledge.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  knowledgeCreateSchema,
  type KnowledgeCreateInput,
} from "@/lib/validations/knowledge.schema";

type DoctorOption = { id: string; fullName: string };

export function KnowledgeBaseForm({ doctors }: { doctors: DoctorOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<KnowledgeCreateInput>({
    resolver: zodResolver(knowledgeCreateSchema),
    defaultValues: {
      doctorId: "",
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: KnowledgeCreateInput) => {
    startTransition(async () => {
      const result = await createKnowledgeDocumentAction(values);
      if (!result.ok) {
        toast.error(result.error ?? "Failed to save knowledge document.");
        return;
      }

      toast.success("Knowledge document saved.");
      form.reset();
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Knowledge Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>Link to Doctor</Label>
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.doctorId ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.doctorId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Hypertension clinical guideline (2026)"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              placeholder="Paste your clinical guideline / paper text here..."
              rows={12}
              className="min-h-[320px] leading-relaxed"
              {...form.register("content")}
            />
            {form.formState.errors.content ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Knowledge Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

