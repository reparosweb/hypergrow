"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Mail } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(json.error || "Não foi possível entrar.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <form onSubmit={submit} className="glass relative w-full max-w-sm rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
          Hyper<span className="gradient-text">grow</span>
          <span className="ml-1 text-xs font-normal text-slate-500">admin</span>
        </div>
        <h1 className="font-display text-xl font-bold text-white">Acesso ao painel</h1>
        <p className="mt-1 text-sm text-slate-400">Entre com o seu e-mail e senha.</p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm text-slate-300">E-mail</span>
          <span className="relative block">
            <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              placeholder="voce@empresa.com.br"
              className="input pl-9"
            />
          </span>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-slate-300">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="input"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock size={16} />}
          Entrar
        </button>

        <p className="mt-5 text-center text-xs text-slate-500">
          Recebeu um convite? Abra o link que o administrador enviou para criar sua senha.
        </p>
      </form>
    </main>
  );
}
