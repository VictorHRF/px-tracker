import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getPatientTypeLabel(type: string | null) {
  if (type === "floor") return "Piso";
  if (type === "peripheral") return "Periférico";
  return "No especificado";
}

function getTrackingStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    active: "Activo",
    hospital_discharge: "Alta hospitalaria",
    followup_discharge: "Alta de seguimiento",
    referred: "Referido",
    transferred: "Trasladado",
    deceased: "Defunción",
    tracking_suspended: "Seguimiento suspendido",
  };

  return status ? labels[status] ?? status : "No especificado";
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    patient_type?: string;
    tracking_status?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("patient_history_view")
    .select("*")
    .eq("assigned_to", user?.id)
    .order("discharge_date", { ascending: false, nullsFirst: false });

  if (params.q && params.q.trim().length > 0) {
    query = query.or(
      `full_name.ilike.%${params.q}%,px_identifier.ilike.%${params.q}%`
    );
  }

  if (
    params.patient_type === "floor" ||
    params.patient_type === "peripheral"
  ) {
    query = query.eq("patient_type", params.patient_type);
  }

  if (params.tracking_status && params.tracking_status !== "all") {
    query = query.eq("tracking_status", params.tracking_status);
  }

  const { data: patients, error } = await query;

  if (error) {
    console.error("Error loading history:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Historial</h2>
        <p className="text-muted-foreground">
          Consulta pacientes dados de alta o sin seguimiento activo.
        </p>
      </div>

      <form className="rounded-xl border p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="q">
              Buscar
            </label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Nombre o expediente"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient_type">
              Tipo
            </label>
            <select
              id="patient_type"
              name="patient_type"
              defaultValue={params.patient_type ?? "all"}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="floor">Piso</option>
              <option value="peripheral">Periférico</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tracking_status">
              Estado final
            </label>
            <select
              id="tracking_status"
              name="tracking_status"
              defaultValue={params.tracking_status ?? "all"}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="hospital_discharge">Alta hospitalaria</option>
              <option value="followup_discharge">Alta de seguimiento</option>
              <option value="referred">Referido</option>
              <option value="transferred">Trasladado</option>
              <option value="deceased">Defunción</option>
              <option value="tracking_suspended">
                Seguimiento suspendido
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link href="/historial" className="rounded-md border px-4 py-2 text-sm">
            Limpiar
          </Link>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Filtrar
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el historial.
        </div>
      )}

      {!patients || patients.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <h3 className="font-semibold">No hay pacientes en historial</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando cierres seguimiento de un paciente, aparecerá aquí.
          </p>
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
                    {patient.px_identifier
                      ? `Expediente: ${patient.px_identifier}`
                      : "Sin expediente"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {patient.service ?? "Servicio no registrado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {getTrackingStatusLabel(patient.tracking_status)}
                  </span>

                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    Alta: {patient.discharge_date ?? "Sin fecha"}
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
