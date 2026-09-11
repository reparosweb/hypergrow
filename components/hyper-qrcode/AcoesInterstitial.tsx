"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   Botões interativos da página pública /q/{codigo} (Pix, Wi-Fi, vCard) —
   por isso "use client": tudo o resto da página é Server Component.

   Reusa `useCopiar` de components/ferramentas/acoes.tsx (mesmo hook que as
   ferramentas grátis já usam) em vez de reescrever a lógica de clipboard
   com fallback de Safari antigo pela segunda vez no projeto.
   ──────────────────────────────────────────────────────────────────────────── */
import { useCopiar } from "@/components/ferramentas/acoes";

export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, copiar] = useCopiar();
  return (
    <button type="button" className="hqr-btn hqr-btn-p" onClick={() => copiar(texto)}>
      {copiado ? "Copiado!" : rotulo}
    </button>
  );
}

/** Monta um arquivo .vcf (vCard 3.0) e dispara o download — tudo no
 *  navegador do visitante, nenhuma rota de servidor envolvida. */
export function BotaoSalvarContato({
  nome,
  telefone,
  email,
  empresa,
}: {
  nome: string;
  telefone?: string;
  email?: string;
  empresa?: string;
}) {
  function salvar() {
    const linhas = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${nome}`,
      empresa ? `ORG:${empresa}` : "",
      telefone ? `TEL;TYPE=CELL:${telefone}` : "",
      email ? `EMAIL:${email}` : "",
      "END:VCARD",
    ].filter(Boolean);
    const blob = new Blob([linhas.join("\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nome || "contato"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return (
    <button type="button" className="hqr-btn hqr-btn-p" onClick={salvar}>
      Salvar contato
    </button>
  );
}
