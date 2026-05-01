"use server";

import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/lib/validations/appointment.schema";

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function createAppointment(
  formData: FormData,
  doctorId: string
): Promise<ActionResult<{ id: string }>> {
  const rawPatientName = formData.get("patientName");
  const rawSymptoms = formData.get("symptoms");

  const parsed = createAppointmentSchema.safeParse({
    patientName: typeof rawPatientName === "string" ? rawPatientName : "",
    symptoms: typeof rawSymptoms === "string" ? rawSymptoms : "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid appointment payload.",
    };
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName: parsed.data.patientName,
        symptoms: parsed.data.symptoms,
        // status defaults to PENDING in Prisma schema
      },
      select: { id: true },
    });

    return { ok: true, data: appointment };
  } catch (error) {
    console.error("createAppointment failed:", error);
    return { ok: false, error: "Unable to book appointment right now." };
  }
}

