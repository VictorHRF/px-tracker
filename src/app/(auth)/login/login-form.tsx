"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/pacientes");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleLogin}
      className="rounded-xl border bg-background p-6 shadow-sm space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="residente@mail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}