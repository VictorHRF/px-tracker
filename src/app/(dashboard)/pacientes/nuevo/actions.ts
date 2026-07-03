"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPatientSchema } from "@/lib/validations/patient.schema";

export async function createPatientAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const rawData = {
    full_name: formData.get("full_name"),
    px_identifier: formData.get("px_identifier"),
    patient_type: formData.get("patient_type"),
    age: formData.get("age"),
    sex: formData.get("sex"),
    bed_number: formData.get("bed_number"),
    floor: formData.get("floor"),
    location: formData.get("location"),
    service: formData.get("service"),
    admission_date: formData.get("admission_date"),
    clinical_status: formData.get("clinical_status"),
    priority: formData.get("priority"),
    general_summary: formData.get("general_summary"),
  };

  const parsed = createPatientSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const age =
    typeof data.age === "number" && !Number.isNaN(data.age)
      ? data.age
      : null;

  const { error } = await supabase.from("patients").insert({
    created_by: user.id,
    assigned_to: user.id,

    full_name: data.full_name,
    px_identifier: data.px_identifier || null,
    patient_type: data.patient_type,

    age,
    sex: data.sex,

    bed_number: data.bed_number || null,
    floor: data.floor || null,
    location: data.location || null,
    service: data.service || null,

    admission_date: data.admission_date,

    clinical_status: data.clinical_status,
    tracking_status: "active",
    priority: data.priority,

    general_summary: data.general_summary || null,
    active: true,
  });

  if (error) {
    console.error("Error creating patient:", error);
    throw new Error("No se pudo registrar el paciente");
  }

  redirect("/pacientes");
}