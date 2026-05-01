import { z } from "zod";

export const doctorCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  profile: z.string().trim().min(20, "Profile must be at least 20 characters."),
  intlCertification: z
    .string()
    .trim()
    .min(2, "International certification is required."),
  techAdvantages: z
    .string()
    .trim()
    .min(10, "Technical advantages must be at least 10 characters."),
});

export const doctorQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorQueryInput = z.infer<typeof doctorQuerySchema>;
