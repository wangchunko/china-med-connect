"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateDoctorForm } from "@/components/admin/create-doctor-form";

export function AddDoctorModal() {
  const [open, setOpen] = useState(false);
  const [isOpening, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            onClick={() => startTransition(() => setOpen(true))}
            disabled={isOpening}
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 size-4" /> 新增医生
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新增医生</DialogTitle>
          <DialogDescription>
            请填写医生的基础信息、一级分类与专科标签（用英文逗号分隔）。
          </DialogDescription>
        </DialogHeader>

        <CreateDoctorForm
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
          submitLabel="保存提交"
        />
      </DialogContent>
    </Dialog>
  );
}

