import { z } from "zod";

export const knowledgeCreateSchema = z.object({
  doctorId: z.string().trim().min(1, "Please select a doctor."),
  title: z.string().trim().min(3, "Title is required."),
  content: z
    .string()
    .trim()
    .min(20, "Medical content should be at least 20 characters."),
  // Optional: Prisma provides a default value on the DB column.
  language: z.string().trim().optional(),
});

export type KnowledgeCreateInput = z.infer<typeof knowledgeCreateSchema>;

