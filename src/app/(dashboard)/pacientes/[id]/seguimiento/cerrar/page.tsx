import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { closePatientTrackingAction } from "../actions";

type CloseTrackingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CloseTrackingPage({
  params,
}: CloseTrackingPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, full_name, tracking_status")
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

        <h2 className="mt-4 text-2xl font-bold">Cerrar seguimiento</h2>
        <p className="text-muted-foreground">
          Paciente: {patient.full_name}
        </p>
      </div>

      <form
        action={closePatientTrackingAction}
        className="space-y-6 rounded-xl border bg-background p-6"
      >
        <input type="hidden" name="patient_id" value={patient.id} />

        <section className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Esta acción sacará al paciente de la lista de activos y lo enviará
              al historial.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tracking_status">
              Motivo / estado final
            </label>

            <select
              id="tracking_status"
              name="tracking_status"
              defaultValue="hospital_discharge"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            >
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

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reason">
              Nota o motivo
            </label>

            <textarea
              id="reason"
              name="reason"
              className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ej. Alta por mejoría, continúa control externo..."
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
            Enviar a historial
          </button>
        </div>
      </form>
    </div>
  );
}