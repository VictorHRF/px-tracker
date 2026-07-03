"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPatientNoteSchema } from "@/lib/validations/patient-note.schema";

export async function createPatientNoteAction(formData: FormData) {
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
    note_type: formData.get("note_type"),
    content: formData.get("content"),
    new_clinical_status: formData.get("new_clinical_status"),
  };

  const parsed = createPatientNoteSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, clinical_status")
    .eq("id", data.patient_id)
    .single();

  if (patientError || !patient) {
    throw new Error("Paciente no encontrado");
  }

  const newClinicalStatus =
    data.new_clinical_status && data.new_clinical_status.length > 0
      ? data.new_clinical_status
      : patient.clinical_status;

  const { error: noteError } = await supabase.from("patient_notes").insert({
    patient_id: data.patient_id,
    created_by: user.id,
    note_type: data.note_type,
    content: data.content,
    previous_clinical_status: patient.clinical_status,
    new_clinical_status: newClinicalStatus,
  });

  if (noteError) {
    console.error("Error creating patient note:", noteError);
    throw new Error("No se pudo registrar la evolución");
  }

  if (newClinicalStatus !== patient.clinical_status) {
    const { error: updatePatientError } = await supabase
      .from("patients")
      .update({
        clinical_status: newClinicalStatus,
      })
      .eq("id", data.patient_id);

    if (updatePatientError) {
      console.error("Error updating patient status:", updatePatientError);
      throw new Error("La evolución se guardó, pero no se pudo actualizar el estado clínico");
    }
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "patient_note_created",
    entity_type: "patient_notes",
    entity_id: data.patient_id,
    metadata: {
      patient_id: data.patient_id,
      note_type: data.note_type,
      previous_clinical_status: patient.clinical_status,
      new_clinical_status: newClinicalStatus,
    },
  });

  revalidatePath(`/pacientes/${data.patient_id}`);
  revalidatePath("/pacientes");

  redirect(`/pacientes/${data.patient_id}`);
}