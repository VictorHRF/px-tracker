import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getPatientTypeLabel(type: string | null) {
  if (type === "floor") return "Piso";
  if (type === "peripheral") return "Periférico";
  return "No especificado";
}

function getClinicalStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    stable: "Estable",
    delicate: "Delicado",
    critical: "Crítico",
    observation: "Observación",
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

export default async function PatientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user?.id)
    .single();

  const { data: patients, error } = await supabase
    .from("active_patients_view")
    .select("*")
    .eq("assigned_to", user?.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading patients:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pacientes activos</h2>
          <p className="text-muted-foreground">
            Bienvenido, {profile?.full_name ?? user?.email}.
          </p>
        </div>

        <Link
          href="/pacientes/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Nuevo paciente
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los pacientes.
        </div>
      )}

      {!patients || patients.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <h3 className="font-semibold">No tienes pacientes activos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra tu primer paciente para comenzar el seguimiento.
          </p>

          <Link
            href="/pacientes/nuevo"
            className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm"
          >
            Crear paciente
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/pacientes/${patient.id}`}
              className="rounded-xl border bg-background p-5 transition hover:bg-muted/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {patient.full_name}
                    </h3>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {getPatientTypeLabel(patient.patient_type)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {patient.age ? `${patient.age} años` : "Edad no registrada"}
                    {" · "}
                    {patient.service ?? "Servicio no registrado"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {patient.patient_type === "floor"
                      ? `Cama ${patient.bed_number ?? "N/A"} · Piso ${
                          patient.floor ?? "N/A"
                        }`
                      : patient.location ?? "Ubicación no registrada"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {getClinicalStatusLabel(patient.clinical_status)}
                  </span>

                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    Prioridad: {getPriorityLabel(patient.priority)}
                  </span>

                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    Pendientes: {patient.active_tasks_count ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}