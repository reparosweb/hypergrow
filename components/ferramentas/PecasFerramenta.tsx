import Link from "next/link";
import { FERRAMENTAS, type IconeFerramenta } from "@/lib/ferramentas";

/* ─────────────────────────────────────────────────────────────────────────────
   PEÇAS REPETIDAS DAS PÁGINAS DE FERRAMENTA — todas server components.

   Ícones em SVG inline: estas rotas NÃO carregam o script do lucide (ele vive
   dentro da home, em HypergrowSite.tsx). Um <i data-lucide> aqui renderizaria
   vazio — bug já cometido neste projeto e registrado em hg-regras-de-bug.
   ──────────────────────────────────────────────────────────────────────────── */

export function IconeDaFerramenta({ nome, tamanho = 24 }: { nome: IconeFerramenta; tamanho?: number }) {
  const p = { width: tamanho, height: tamanho, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (nome === "whatsapp")
    return (
      <svg {...p}>
        <path d="M4 20.5 5.4 16A8 8 0 1 1 8.6 19L4 20.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M9.2 9.4c.2 1 .8 2.1 1.6 2.9.8.8 1.9 1.4 2.9 1.6l.9-1.1 1.8.9-.5 1.4c-1.9.5-4-.6-5.5-2.1-1.5-1.5-2.6-3.6-2.1-5.5l1.4-.5.9 1.8-1.4.6Z" fill="currentColor" />
      </svg>
    );
  if (nome === "etiqueta")
    return (
      <svg {...p}>
        <path d="M3 12.4V4.6A1.6 1.6 0 0 1 4.6 3h7.8a1.6 1.6 0 0 1 1.1.5l7.1 7.1a1.6 1.6 0 0 1 0 2.2l-7.8 7.8a1.6 1.6 0 0 1-2.2 0L3.5 13.5a1.6 1.6 0 0 1-.5-1.1Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        <circle cx="7.6" cy="7.6" r="1.7" fill="currentColor" />
      </svg>
    );
  if (nome === "alvo")
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  return (
    <svg {...p}>
      <circle cx="10.6" cy="10.6" r="6.6" stroke="currentColor" strokeWidth="1.9" />
      <path d="m15.6 15.6 4.4 4.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** Selo que deixa a promessa explícita — a ferramenta é grátis SEM pedágio. */
export function SeloGratis() {
  return (
    <span className="ft-free">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Grátis de verdade: sem cadastro, sem e-mail, sem limite de uso
    </span>
  );
}

/** Convite discreto no fim da ferramenta, ligado ao serviço que resolve aquilo. */
export function ConviteFerramenta({
  servico, titulo, texto,
}: { servico: { slug: string; rotulo: string }; titulo: string; texto: string }) {
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="pg-cta">
          <h2 className="pg-h2">{titulo}</h2>
          <p className="pg-p">{texto}</p>
          <div className="pg-cta-actions">
            <Link href="/contato" className="btn btn-p">Falar com a HyperGrow</Link>
            <Link href={"/servicos/" + servico.slug} className="btn btn-s">{servico.rotulo}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** As outras ferramentas — mantém a pessoa no site e liga as páginas entre si. */
export function OutrasFerramentas({ atual }: { atual: string }) {
  const outras = FERRAMENTAS.filter((f) => f.slug !== atual);
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <h2 className="pg-h2">Outras ferramentas grátis</h2>
        <p className="pg-p" style={{ marginBottom: 22 }}>
          Todas funcionam do mesmo jeito: abrem, calculam no seu navegador e não pedem nada em troca.
        </p>
        <div className="ft-hub">
          {outras.map((f) => (
            <Link
              key={f.slug}
              href={"/ferramentas/" + f.slug}
              className="ft-hub-c"
              style={{ ["--beam" as string]: f.accent }}
            >
              <span className="ft-hub-ic" style={{ background: f.accent + "14", color: f.accent }}>
                <IconeDaFerramenta nome={f.icone} />
              </span>
              <h3 className="ft-hub-t">{f.nome}</h3>
              <p className="ft-hub-d">{f.resolve}</p>
              <span className="ft-hub-go">
                Abrir ferramenta
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
