import { z } from "zod";

export const closePatientTrackingSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),

  tracking_status: z.enum([
    "hospital_discharge",
    "followup_discharge",
    "referred",
    "transferred",
    "deceased",
    "tracking_suspended",
  ]),

  reason: z
    .string()
    .max(2000, "El motivo es demasiado largo")
    .optional()
    .or(z.literal("")),
});

export const reactivatePatientSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),

  reason: z
    .string()
    .max(2000, "El motivo es demasiado largo")
    .optional()
    .or(z.literal("")),
});

export type ClosePatientTrackingInput = z.infer<
  typeof closePatientTrackingSchema
>;

export type ReactivatePatientInput = z.infer<typeof reactivatePatientSchema>;