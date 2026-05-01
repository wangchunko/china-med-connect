"use server";

import { prisma } from "@/lib/prisma";
import {
  doctorCreateSchema,
  doctorQuerySchema,
  type DoctorCreateInput,
  type DoctorQueryInput,
} from "@/lib/validations/doctor.schema";

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function createDoctorAction(
  rawInput: DoctorCreateInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = doctorCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid doctor payload.",
    };
  }

  try {
    const doctor = await prisma.doctor.create({
      data: parsed.data,
      select: { id: true },
    });

    return { ok: true, data: doctor };
  } catch (error) {
    console.error("createDoctorAction failed:", error);
    return { ok: false, error: "Unable to create doctor right now." };
  }
}

export async function getDoctorsAction(
  rawInput?: Partial<DoctorQueryInput>
): Promise<
  ActionResult<
    Array<{
      id: string;
      fullName: string;
      profile: string;
      intlCertification: string;
      techAdvantages: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  >
> {
  const parsed = doctorQuerySchema.safeParse(rawInput ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid doctor query.",
    };
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: parsed.data.search
        ? {
            OR: [
              {
                fullName: {
                  contains: parsed.data.search,
                },
              },
              {
                profile: {
                  contains: parsed.data.search,
                },
              },
              {
                techAdvantages: {
                  contains: parsed.data.search,
                },
              },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: parsed.data.limit,
    });

    return { ok: true, data: doctors };
  } catch (error) {
    console.error("getDoctorsAction failed:", error);
    return { ok: false, error: "Unable to fetch doctors right now." };
  }
}
