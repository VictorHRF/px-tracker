import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">PX-Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Ingresa para continuar con el seguimiento de pacientes.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
