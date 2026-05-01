"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createDoctorAction } from "@/actions/doctor.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  doctorCreateSchema,
  type DoctorCreateInput,
} from "@/lib/validations/doctor.schema";

export function DoctorForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<DoctorCreateInput>({
    resolver: zodResolver(doctorCreateSchema),
    defaultValues: {
      fullName: "",
      profile: "",
      intlCertification: "",
      techAdvantages: "",
    },
  });

  const onSubmit = (values: DoctorCreateInput) => {
    startTransition(async () => {
      const result = await createDoctorAction(values);

      if (!result.ok) {
        toast.error(result.error ?? "Failed to save doctor profile.");
        return;
      }

      toast.success("Doctor profile saved to SQLite.");
      form.reset();
      router.refresh();
    });
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>Add Doctor Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Doctor Name</Label>
            <Input
              id="fullName"
              placeholder="Dr. Jane Doe"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intlCertification">International Certification</Label>
            <Input
              id="intlCertification"
              placeholder="US Board Certified, MRCP(UK), etc."
              {...form.register("intlCertification")}
            />
            {form.formState.errors.intlCertification ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.intlCertification.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="techAdvantages">Technical Advantages</Label>
            <Textarea
              id="techAdvantages"
              placeholder="Advanced minimally invasive surgery, AI-assisted diagnosis..."
              rows={4}
              {...form.register("techAdvantages")}
            />
            {form.formState.errors.techAdvantages ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.techAdvantages.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Profile</Label>
            <Textarea
              id="profile"
              placeholder="Doctor profile and clinical background"
              rows={6}
              {...form.register("profile")}
            />
            {form.formState.errors.profile ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.profile.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Doctor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
