"use client";

import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ConviteForm({ token }: { token: string }) {
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirma) {
      setErro("As duas senhas não são iguais.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const r = await fetch("/api/app?module=usuarios&action=aceitar-convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: senha }),
      });
      const j = await r.json().catch(() => ({ ok: false, error: "Resposta inválida do servidor." }));
      if (r.ok && j.ok) setPronto(j.email || "");
      else setErro(j.error || "Não foi possível criar o acesso.");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="glass relative w-full max-w-sm rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">H</span>
          Hyper<span className="gradient-text">grow</span>
          <span className="ml-1 text-xs font-normal text-slate-500">convite</span>
        </div>

        {pronto !== null ? (
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 size={18} /> Acesso criado!
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {pronto ? (
                <>
                  Agora entre com <b className="text-slate-200">{pronto}</b> e a senha que você acabou de escolher.
                </>
              ) : (
                "Agora entre com o seu e-mail e a senha que você acabou de escolher."
              )}
            </p>
            <a
              href="/admin/login"
              className="shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-6 py-3 font-semibold text-white"
            >
              Ir para o login
            </a>
          </div>
        ) : !token ? (
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Este link está incompleto — falta o código do convite. Peça ao administrador que envie o link inteiro.
          </p>
        ) : (
          <form onSubmit={enviar}>
            <h1 className="font-display text-xl font-bold text-white">Crie sua senha</h1>
            <p className="mt-1 text-sm text-slate-400">Mínimo de 8 caracteres. Você usará seu e-mail para entrar.</p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm text-slate-300">Nova senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={8}
                autoFocus
                autoComplete="new-password"
                className="input"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm text-slate-300">Repita a senha</span>
              <input
                type="password"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="input"
              />
            </label>

            {erro && (
              <p role="alert" className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {carregando ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound size={16} />}
              Criar acesso
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
