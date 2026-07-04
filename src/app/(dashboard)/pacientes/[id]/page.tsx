import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completePatientTaskAction } from "./pendientes/actions";
import { ReactivatePatientForm } from "@/components/patients/reactivate-patient-form";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getTaskStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return status ? labels[status] ?? status : "No especificado";
}

function isOverdue(value: string | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

function getPatientTypeLabel(type: string | null) {
  if (type === "floor") return "Paciente de piso";
  if (type === "peripheral") return "Paciente periférico";
  return "No especificado";
}

function getClinicalStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    stable: "Estable",
    delicate: "Delicado",
    critical: "Crítico",
    observation: "En observación",
    postoperative: "Postoperatorio",
    pre_discharge: "Prealta",
  };

  return status ? labels[status] ?? status : "No especificado";
}

function getPriorityLabel(priority: string | null) {
  const labels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };

  return priority ? labels[priority] ?? priority : "No especificada";
}

function getNoteTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    general: "Nota general",
    clinical_change: "Cambio clínico",
    laboratory: "Laboratorio",
    image: "Imagen",
    treatment: "Tratamiento",
    interconsultation: "Interconsulta",
    postoperative: "Postoperatorio",
    discharge: "Alta",
    external_followup: "Seguimiento externo",
    other: "Otro",
  };

  return type ? labels[type] ?? type : "Nota";
}

function formatDateTime(value: string | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !patient) {
    notFound();
  }

  const { data: notes, error: notesError } = await supabase
    .from("patient_notes")
    .select("*")
    .eq("patient_id", patient.id)
    .eq("cancelled", false)
    .order("created_at", { ascending: false });

  if (notesError) {
    console.error("Error loading notes:", notesError);
  }

  const { data: tasks, error: tasksError } = await supabase
  .from("patient_tasks")
  .select("*")
  .eq("patient_id", patient.id)
  .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Error loading tasks:", tasksError);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/pacientes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a pacientes
        </Link>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{patient.full_name}</h2>
            <p className="text-muted-foreground">
              {getPatientTypeLabel(patient.patient_type)}
            </p>
          </div>
          {patient.tracking_status === "active" ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/pacientes/${patient.id}/evoluciones/nueva`}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Nueva evolución
              </Link>

              <Link
                href={`/pacientes/${patient.id}/pendientes/nuevo`}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Nuevo pendiente
              </Link>

              <Link
                href={`/pacientes/${patient.id}/seguimiento/cerrar`}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cerrar seguimiento
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border p-4">
              <h3 className="font-semibold">Paciente en historial</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Este paciente no está actualmente en seguimiento activo.
              </p>
              <ReactivatePatientForm patientId={patient.id} />
            </div>
          )}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Estado clínico</p>
          <p className="font-semibold">
            {getClinicalStatusLabel(patient.clinical_status)}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Prioridad</p>
          <p className="font-semibold">
            {getPriorityLabel(patient.priority)}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Fecha de ingreso</p>
          <p className="font-semibold">{patient.admission_date}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Estado de seguimiento</p>
          <p className="font-semibold">
            {patient.tracking_status === "active"
              ? "Activo"
              : "En historial"}
          </p>
        </div>
      </section>

      <section className="rounded-xl border p-6">
        <h3 className="font-semibold">Datos generales</h3>

        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Expediente</dt>
            <dd className="font-medium">
              {patient.px_identifier ?? "No registrado"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">Servicio</dt>
            <dd className="font-medium">
              {patient.service ?? "No registrado"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">Edad</dt>
            <dd className="font-medium">
              {patient.age ? `${patient.age} años` : "No registrada"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">Ubicación</dt>
            <dd className="font-medium">
              {patient.patient_type === "floor"
                ? `Cama ${patient.bed_number ?? "N/A"} · Piso ${
                    patient.floor ?? "N/A"
                  }`
                : patient.location ?? "No registrada"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border p-6">
        <h3 className="font-semibold">Resumen inicial</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {patient.general_summary || "Sin resumen registrado."}
        </p>
      </section>

      <section className="rounded-xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Evoluciones</h3>
            <p className="text-sm text-muted-foreground">
              Timeline clínico inicial del paciente.
            </p>
          </div>

          <Link
            href={`/pacientes/${patient.id}/evoluciones/nueva`}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Agregar
          </Link>
        </div>

        {!notes || notes.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay evoluciones registradas.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {notes.map((note) => (
              <article key={note.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      {getNoteTypeLabel(note.note_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>

                  {note.previous_clinical_status !==
                    note.new_clinical_status && (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {getClinicalStatusLabel(note.previous_clinical_status)}
                      {" → "}
                      {getClinicalStatusLabel(note.new_clinical_status)}
                    </span>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {note.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Pendientes</h3>
            <p className="text-sm text-muted-foreground">
              Tareas de seguimiento relacionadas con el paciente.
            </p>
          </div>

          <Link
            href={`/pacientes/${patient.id}/pendientes/nuevo`}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Agregar
          </Link>
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay pendientes registrados.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {tasks.map((task) => {
              const overdue =
                task.status !== "completed" && isOverdue(task.due_date);

              return (
                <article
                  key={task.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium">{task.title}</h4>

                        <span className="rounded-full bg-muted px-2 py-1 text-xs">
                          {getTaskStatusLabel(task.status)}
                        </span>

                        {overdue && (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                            Vencido
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Prioridad: {getPriorityLabel(task.priority)}</span>

                        {task.due_date && (
                          <span>
                            Límite: {formatDateTime(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    {task.status !== "completed" && (
                      <form action={completePatientTaskAction}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <input
                          type="hidden"
                          name="patient_id"
                          value={patient.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md border px-3 py-2 text-sm"
                        >
                          Completar
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}