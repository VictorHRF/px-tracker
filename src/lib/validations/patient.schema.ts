import { z } from "zod";

export const createPatientSchema = z.object({
  full_name: z
    .string()
    .min(3, "El nombre completo es obligatorio")
    .max(150, "El nombre es demasiado largo"),

  px_identifier: z
    .string()
    .max(50, "El identificador es demasiado largo")
    .optional()
    .or(z.literal("")),

  patient_type: z.enum(["floor", "peripheral"], {
    message: "Selecciona el tipo de paciente",
  }),

  age: z
    .coerce
    .number()
    .min(0, "La edad no puede ser negativa")
    .max(130, "La edad no es válida")
    .optional()
    .or(z.nan()),

  sex: z.enum(["male", "female", "other", "unknown"]),

  bed_number: z.string().optional().or(z.literal("")),
  floor: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),

  admission_date: z.string().min(1, "La fecha de ingreso es obligatoria"),

  clinical_status: z.enum([
    "stable",
    "delicate",
    "critical",
    "observation",
    "postoperative",
    "pre_discharge",
  ]),

  priority: z.enum(["low", "medium", "high", "urgent"]),

  general_summary: z.string().optional().or(z.literal("")),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
