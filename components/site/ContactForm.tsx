"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   FORMULÁRIO DE ORÇAMENTO — componente único.

   Estava embutido na seção Contato de `HypergrowSite.tsx`, o que prendia o único
   canal que REALMENTE funciona (POST /api/lead → Supabase) dentro da home. A
   página /contato precisava do mesmo formulário; duas cópias do mesmo formulário
   é como um dos dois para de ser mantido.

   Comportamento idêntico ao que já estava no ar — mesma rota, mesmo payload,
   mesmos nomes de campo. Nada de /api/* foi alterado.

   a11y: todo campo tem id + name + htmlFor + autoComplete (o navegador precisa
   disso para autopreencher e o leitor de tela para associar o rótulo).
   ──────────────────────────────────────────────────────────────────────────── */
export default function ContactForm() {
  const [form, setForm] = useState({ nome: "", email: "", zap: "", servico: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.nome, email: form.email, phone: form.zap, product: form.servico, message: form.msg }),
      });
      const j = await res.json();
      if (res.ok && j.ok) setSent(true);
      else setErr(j.error || "Não foi possível enviar. Tente novamente.");
    } catch {
      setErr("Sem conexão. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const field: any = { width: "100%", boxSizing: "border-box", padding: "13px 15px", borderRadius: 12, font: "400 14.5px var(--font-sans)", color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", outline: "none", transition: "border-color .2s, box-shadow .2s" };
  const onFocus = (e: any) => { e.currentTarget.style.borderColor = "rgba(11,122,76,0.7)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,122,76,0.18)"; };
  const onBlur = (e: any) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; };
  const lbl: any = { font: "600 12px var(--font-sans)", color: "rgba(255,255,255,0.7)", marginBottom: 7, display: "block", letterSpacing: "0.02em" };

  return (
    <div className="neon-card glass-top" style={{ borderRadius: 22, padding: 30, background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 90px -40px rgba(0,0,0,0.7)" }}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "40px 10px" }}>
          <span style={{ width: 66, height: 66, borderRadius: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "linear-gradient(135deg,#2DD4A0,#0C8956)", boxShadow: "0 0 40px -10px rgba(15,169,104,0.8)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h3 style={{ font: "700 22px var(--font-display)", color: "#fff", margin: "20px 0 8px" }}>Mensagem enviada!</h3>
          <p style={{ font: "400 15px var(--font-sans)", color: "rgba(255,255,255,0.62)", margin: 0 }}>Em breve a HyperGrow entra em contato com sua proposta.</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="contact-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={lbl} htmlFor="hg-nome">Nome *</label><input id="hg-nome" name="nome" autoComplete="name" required value={form.nome} onChange={set("nome")} onFocus={onFocus} onBlur={onBlur} placeholder="Seu nome" style={field} /></div>
            <div><label style={lbl} htmlFor="hg-email">E-mail *</label><input id="hg-email" name="email" autoComplete="email" required type="email" value={form.email} onChange={set("email")} onFocus={onFocus} onBlur={onBlur} placeholder="voce@empresa.com" style={field} /></div>
            <div><label style={lbl} htmlFor="hg-zap">WhatsApp / Telefone</label><input id="hg-zap" name="telefone" autoComplete="tel" value={form.zap} onChange={set("zap")} onFocus={onFocus} onBlur={onBlur} placeholder="(00) 00000-0000" style={field} /></div>
            <div>
              <label style={lbl} htmlFor="hg-servico">Tenho interesse em</label>
              <select id="hg-servico" name="servico" value={form.servico} onChange={set("servico")} onFocus={onFocus} onBlur={onBlur} style={{ ...field, appearance: "none", cursor: "pointer", color: form.servico ? "#fff" : "rgba(255,255,255,0.45)" }}>
                <option value="" style={{ color: "#12151A" }}>Selecione um serviço</option>
                {["Website", "E-commerce", "Sistema sob medida", "Automação", "Inteligência Artificial", "Design & Branding"].map((o) => <option key={o} value={o} style={{ color: "#12151A" }}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={lbl} htmlFor="hg-msg">Mensagem</label>
            <textarea id="hg-msg" name="mensagem" value={form.msg} onChange={set("msg")} onFocus={onFocus} onBlur={onBlur} rows={4} placeholder="Conte sobre o seu projeto e seus objetivos..." style={{ ...field, resize: "vertical", fontFamily: "var(--font-sans)" }}></textarea>
          </div>
          {err && <p style={{ marginTop: 12, font: "500 13px var(--font-sans)", color: "#E0736A" }}>{err}</p>}
          <button type="submit" disabled={loading} className="btn btn-cta" style={{ width: "100%", justifyContent: "center", marginTop: 20, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Enviando..." : "Enviar mensagem"}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      )}
      <style>{`@media (max-width:900px){ .contact-fields { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
