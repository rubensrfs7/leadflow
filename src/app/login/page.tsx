"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Database } from "lucide-react";
import { login, registerUser } from "@/lib/api";
import { appTheme } from "@/lib/theme-config";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "register") {
        await registerUser(name, email, password);
        setSuccess("Usuario registrado com sucesso. Entre com suas credenciais.");
        setMode("login");
        setPassword("");
        return;
      }
      const result = await login(email, password);
      localStorage.setItem("generated_app_token", result.token);
      localStorage.setItem("generated_app_user", JSON.stringify(result.user));
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.message || (mode === "register" ? "Falha ao registrar usuario." : "Falha no login."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#05070d] dark:text-white flex items-center justify-center p-4 md:p-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[calc(var(--radius-app)+0.75rem)] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden min-h-[640px] overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop"
            alt="Escritório moderno"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${appTheme.colors.primary}dd, rgba(2,6,23,0.84))` }} />
          <div className="relative">
            <div className="mb-8 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
              Painel administrativo
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-tight text-white">{appTheme.appName}</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80">{appTheme.projectDescription}</p>
          </div>
          <div className="relative max-w-sm rounded-2xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur">
            <p className="text-sm font-bold">Workspace conectado</p>
            <p className="mt-2 text-sm leading-6 text-white/75">Acesse dados, relatórios e operações da API em uma interface responsiva.</p>
          </div>
        </div>

        <div className="flex min-h-[620px] items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ backgroundColor: appTheme.colors.primary + "22", color: appTheme.colors.primary }}>
            <Database className="h-6 w-6" />
          </div>
              <h1 className="text-3xl font-black tracking-tight">{appTheme.appName}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{mode === "register" ? "Crie seu acesso para usar o painel administrativo." : "Acesse o painel administrativo integrado a sua API."}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <label className="block text-sm font-semibold">
              Nome
              <input className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-900" style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties} value={name} onChange={(event) => setName(event.target.value)} type="text" required />
            </label>
          )}
          <label className="block text-sm font-semibold">
            E-mail
            <input className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-900" style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties} value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="block text-sm font-semibold">
            Senha
            <input className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-900" style={{ "--tw-ring-color": appTheme.colors.primary } as React.CSSProperties} value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={mode === "register" ? 8 : 1} maxLength={128} required />
          </label>
          {success && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">{success}</p>}
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: appTheme.colors.primary }}>
            {loading ? (mode === "register" ? "Registrando..." : "Entrando...") : (mode === "register" ? "Registrar usuario" : "Entrar")}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setMode((current) => current === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {mode === "register" ? "Ja tenho usuario" : "Registrar novo usuario"}
          </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
