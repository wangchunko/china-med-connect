import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientName: z.string().trim().min(2, "Patient name is required."),
  symptoms: z
    .string()
    .trim()
    .min(3, "Please provide brief symptoms/notes (min 3 characters)."),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

