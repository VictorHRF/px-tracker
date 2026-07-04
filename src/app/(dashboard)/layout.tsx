import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/logout-button";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-semibold">PX-Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Seguimiento de pacientes
            </p>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/pacientes" className="hover:underline">
                Pacientes
              </Link>

              <Link href="/historial" className="hover:underline">
                Historial
              </Link>
            </nav>

            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}