import { z } from "zod";

export const createPatientTaskSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),

  title: z
    .string()
    .min(3, "El título es obligatorio")
    .max(150, "El título es demasiado largo"),

  description: z
    .string()
    .max(2000, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),

  priority: z.enum(["low", "medium", "high", "urgent"]),

  due_date: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const completePatientTaskSchema = z.object({
  task_id: z.string().uuid("Pendiente inválido"),
  patient_id: z.string().uuid("Paciente inválido"),
});

export type CreatePatientTaskInput = z.infer<typeof createPatientTaskSchema>;
export type CompletePatientTaskInput = z.infer<typeof completePatientTaskSchema>;