"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  completePatientTaskSchema,
  createPatientTaskSchema,
} from "@/lib/validations/patient-task.schema";

export async function createPatientTaskAction(formData: FormData) {
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
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  };

  const parsed = createPatientTaskSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", data.patient_id)
    .single();

  if (patientError || !patient) {
    throw new Error("Paciente no encontrado");
  }

  const dueDate =
    data.due_date && data.due_date.length > 0
      ? new Date(data.due_date).toISOString()
      : null;

  const { data: task, error: taskError } = await supabase
    .from("patient_tasks")
    .insert({
      patient_id: data.patient_id,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      status: "pending",
      due_date: dueDate,
      assigned_to: user.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (taskError) {
    console.error("Error creating patient task:", taskError);
    throw new Error("No se pudo registrar el pendiente");
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "patient_task_created",
    entity_type: "patient_tasks",
    entity_id: task.id,
    metadata: {
      patient_id: data.patient_id,
      priority: data.priority,
      due_date: dueDate,
    },
  });

  revalidatePath(`/pacientes/${data.patient_id}`);
  revalidatePath("/pacientes");

  redirect(`/pacientes/${data.patient_id}`);
}

export async function completePatientTaskAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuario no autenticado");
  }

  const rawData = {
    task_id: formData.get("task_id"),
    patient_id: formData.get("patient_id"),
  };

  const parsed = completePatientTaskSchema.safeParse(rawData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    throw new Error(message);
  }

  const data = parsed.data;

  const { error } = await supabase
    .from("patient_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    })
    .eq("id", data.task_id)
    .eq("patient_id", data.patient_id);

  if (error) {
    console.error("Error completing patient task:", error);
    throw new Error("No se pudo completar el pendiente");
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "patient_task_completed",
    entity_type: "patient_tasks",
    entity_id: data.task_id,
    metadata: {
      patient_id: data.patient_id,
      completed_at: new Date().toISOString(),
    },
  });

  revalidatePath(`/pacientes/${data.patient_id}`);
  revalidatePath("/pacientes");
}