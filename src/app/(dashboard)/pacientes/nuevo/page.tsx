
import Link from "next/link";
import { createPatientAction } from "./actions";

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/pacientes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a pacientes
        </Link>

        <h2 className="mt-4 text-2xl font-bold">Nuevo paciente</h2>
        <p className="text-muted-foreground">
          Registra un paciente de piso o periférico para seguimiento.
        </p>
      </div>

      <form
        action={createPatientAction}
        className="space-y-6 rounded-xl border bg-background p-6"
      >
        <section className="space-y-4">
          <h3 className="font-semibold">Datos generales</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="full_name">
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Nombre completo del paciente"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="px_identifier">
              Expediente / identificador
            </label>
            <input
              id="px_identifier"
              name="px_identifier"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Opcional"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="age">
                Edad
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ej. 45"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="sex">
                Sexo
              </label>
              <select
                id="sex"
                name="sex"
                defaultValue="unknown"
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="unknown">No especificado</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="patient_type">
                Tipo de paciente
              </label>
              <select
                id="patient_type"
                name="patient_type"
                defaultValue="floor"
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="floor">Paciente de piso</option>
                <option value="peripheral">Paciente periférico</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">Ubicación</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bed_number">
                Cama
              </label>
              <input
                id="bed_number"
                name="bed_number"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ej. 204-A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="floor">
                Piso
              </label>
              <input
                id="floor"
                name="floor"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ej. 2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="location">
                Ubicación
              </label>
              <input
                id="location"
                name="location"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ej. Urgencias / Interconsulta"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="service">
              Servicio
            </label>
            <input
              id="service"
              name="service"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ej. Medicina interna"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">Seguimiento</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admission_date">
                Fecha de ingreso
              </label>
              <input
                id="admission_date"
                name="admission_date"
                type="date"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="clinical_status">
                Estado clínico
              </label>
              <select
                id="clinical_status"
                name="clinical_status"
                defaultValue="stable"
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="stable">Estable</option>
                <option value="delicate">Delicado</option>
                <option value="critical">Crítico</option>
                <option value="observation">En observación</option>
                <option value="postoperative">Postoperatorio</option>
                <option value="pre_discharge">Prealta</option>
              </select>
            </div>

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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="general_summary">
              Resumen inicial
            </label>
            <textarea
              id="general_summary"
              name="general_summary"
              className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Resumen clínico inicial, motivo de seguimiento o datos importantes..."
            />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/pacientes"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Guardar paciente
          </button>
        </div>
      </form>
    </div>
  );
}