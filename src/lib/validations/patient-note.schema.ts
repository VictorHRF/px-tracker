import { z } from "zod";

export const createPatientNoteSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),

  note_type: z.enum([
    "general",
    "clinical_change",
    "laboratory",
    "image",
    "treatment",
    "interconsultation",
    "postoperative",
    "discharge",
    "external_followup",
    "other",
  ]),

  content: z
    .string()
    .min(5, "La evolución debe tener al menos 5 caracteres")
    .max(5000, "La evolución es demasiado larga"),

  new_clinical_status: z
    .enum([
      "stable",
      "delicate",
      "critical",
      "observation",
      "postoperative",
      "pre_discharge",
    ])
    .optional()
    .or(z.literal("")),
});

export type CreatePatientNoteInput = z.infer<typeof createPatientNoteSchema>;