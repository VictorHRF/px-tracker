"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  closePatientTrackingSchema,
  reactivatePatientSchema,
} from "@/lib/validations/patient-tracking.schema";

function getTrackingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    hospital_discharge: "Alta hospitalaria",
    followup_discharge: "Alta de seguimiento",
    referred: "Referido",
    transferred: "Trasladado",
    deceased: "Defunción",
    tracking_suspended: "Seguimiento suspendido",
  };

  return labels[status] ?? status;
}

export async function closePatientTrackingAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const rawData = {
    patient_id: formData.get("patient_id"),
    tracking_status: formData.get("tracking_status"),
    reason: formData.get("reason"),
  };

  const parsed = closePatientTrackingSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, full_name, clinical_status, tracking_status")
    .eq("id", data.patient_id)
    .single();

  if (patientError || !patient) {
    throw new Error("Paciente no encontrado");
  }

  const { error: updateError } = await supabase
    .from("patients")
    .update({
      tracking_status: data.tracking_status,
      active: false,
      discharge_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", data.patient_id);

  if (updateError) {
    console.error("Error closing patient tracking:", updateError);
    throw new Error("No se pudo cerrar el seguimiento del paciente");
  }

  const label = getTrackingStatusLabel(data.tracking_status);

  await supabase.from("patient_notes").insert({
    patient_id: data.patient_id,
    created_by: user.id,
    note_type: "discharge",
    content:
      data.reason && data.reason.trim().length > 0
        ? `Paciente enviado a historial. Estado: ${label}. Motivo: ${data.reason}`
        : `Paciente enviado a historial. Estado: ${label}.`,
    previous_clinical_status: patient.clinical_status,
    new_clinical_status: patient.clinical_status,
  });

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "patient_tracking_closed",
    entity_type: "patients",
    entity_id: data.patient_id,
    metadata: {
      previous_tracking_status: patient.tracking_status,
      new_tracking_status: data.tracking_status,
      reason: data.reason || null,
    },
  });

  revalidatePath("/pacientes");
  revalidatePath("/historial");
  revalidatePath(`/pacientes/${data.patient_id}`);

  redirect("/pacientes");
}

export async function reactivatePatientAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const rawData = {
    patient_id: formData.get("patient_id"),
    reason: formData.get("reason"),
  };

  const parsed = reactivatePatientSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const { error } = await supabase.rpc("reactivate_patient", {
    target_patient_id: data.patient_id,
    reactivation_reason: data.reason || null,
  });

  if (error) {
    console.error("Error reactivating patient:", error);
    throw new Error("No se pudo reactivar el paciente");
  }

  revalidatePath("/pacientes");
  revalidatePath("/historial");
  revalidatePath(`/pacientes/${data.patient_id}`);

  redirect(`/pacientes/${data.patient_id}`);
}