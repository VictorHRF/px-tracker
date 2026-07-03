import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPatientTaskAction } from "../actions";

type NewPatientTaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewPatientTaskPage({
  params,
}: NewPatientTaskPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, full_name")
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

        <h2 className="mt-4 text-2xl font-bold">Nuevo pendiente</h2>
        <p className="text-muted-foreground">
          Paciente: {patient.full_name}
        </p>
      </div>

      <form
        action={createPatientTaskAction}
        className="space-y-6 rounded-xl border bg-background p-6"
      >
        <input type="hidden" name="patient_id" value={patient.id} />

        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Título del pendiente
            </label>
            <input
              id="title"
              name="title"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ej. Revisar laboratorios"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className="min-h-32 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Agrega detalles del pendiente, contexto o indicaciones..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="priority">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="due_date">
                Fecha límite
              </label>
              <input
                id="due_date"
                name="due_date"
                type="datetime-local"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
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
            Guardar pendiente
          </button>
        </div>
      </form>
    </div>
  );
}