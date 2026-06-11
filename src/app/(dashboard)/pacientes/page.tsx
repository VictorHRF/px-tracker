import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Pacientes activos</h2>
        <p className="text-muted-foreground">
          Bienvenido, {profile?.full_name ?? user?.email}.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">
          Aquí se mostrará la lista de pacientes activos.
        </p>
      </div>
    </div>
  );
}