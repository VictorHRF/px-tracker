import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPatientNoteAction } from "./actions";

type NewPatientNotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function NewPatientNotePage({
  params,
}: NewPatientNotePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, full_name, clinical_status")
    .eq("id", id)
    .single();

  if (error || !patient) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/pacientes/${patient.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver al paciente
        </Link>

        <h2 className="mt-4 text-2xl font-bold">Nueva evolución</h2>
        <p className="text-muted-foreground">
          Paciente: {patient.full_name}
        </p>
      </div>

      <form
        action={createPatientNoteAction}
        className="space-y-6 rounded-xl border bg-background p-6"
      >
        <input type="hidden" name="patient_id" value={patient.id} />

        <section className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Estado clínico actual</p>
            <p className="font-medium">
              {getClinicalStatusLabel(patient.clinical_status)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="note_type">
              Tipo de evolución
            </label>
            <select
              id="note_type"
              name="note_type"
              defaultValue="general"
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="general">Nota general</option>
              <option value="clinical_change">Cambio clínico</option>
              <option value="laboratory">Laboratorio</option>
              <option value="image">Imagen</option>
              <option value="treatment">Tratamiento</option>
              <option value="interconsultation">Interconsulta</option>
              <option value="postoperative">Postoperatorio</option>
              <option value="discharge">Alta</option>
              <option value="external_followup">Seguimiento externo</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="new_clinical_status">
              Nuevo estado clínico
            </label>
            <select
              id="new_clinical_status"
              name="new_clinical_status"
              defaultValue={patient.clinical_status ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Sin cambio</option>
              <option value="stable">Estable</option>
              <option value="delicate">Delicado</option>
              <option value="critical">Crítico</option>
              <option value="observation">En observación</option>
              <option value="postoperative">Postoperatorio</option>
              <option value="pre_discharge">Prealta</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content">
              Evolución
            </label>
            <textarea
              id="content"
              name="content"
              className="min-h-48 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Escribe la evolución, cambios clínicos, pendientes relevantes o indicaciones..."
              required
            />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href={`/pacientes/${patient.id}`}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Guardar evolución
          </button>
        </div>
      </form>
    </div>
  );
}