import { reactivatePatientAction } from "@/app/(dashboard)/pacientes/[id]/seguimiento/actions";

type ReactivatePatientFormProps = {
  patientId: string;
};

export function ReactivatePatientForm({
  patientId,
}: ReactivatePatientFormProps) {
  return (
    <form action={reactivatePatientAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="reason">
          Motivo de reactivación
        </label>

        <textarea
          id="reason"
          name="reason"
          className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Ej. Reingreso hospitalario o nuevo seguimiento..."
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Reactivar paciente
      </button>
    </form>
  );
}