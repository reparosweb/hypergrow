/* ─────────────────────────────────────────────────────────────────────────────
   FAQ DA HOME — fonte única.

   Por que este arquivo existe: as 7 perguntas viviam dentro de
   `components/site/HypergrowSite.tsx` (client component). Elas apareciam para o
   visitante mas NÃO existiam como dado estruturado — o Google e as IAs não
   tinham como reconhecê-las. Marcar FAQPage é o que habilita o bloco de
   perguntas na busca e é uma das formas mais diretas de ser citado por IA.

   Módulo LEVE de propósito (só texto, sem import): o client component pode
   importar sem arrastar peso, e `app/page.tsx` (server) usa o MESMO array para
   emitir o JSON-LD. Assim é impossível o schema divergir do que está na tela —
   que é exatamente o tipo de divergência que o Google penaliza.
   ──────────────────────────────────────────────────────────────────────────── */
export type QA = { q: string; a: string };

export const HOME_FAQ: QA[] = [
  {
    q: "Qual o prazo médio de entrega?",
    a: "Depende do escopo: uma landing page sai em poucos dias; sites institucionais e e-commerces em 2 a 4 semanas; sistemas e plataformas sob medida por fases, com uma primeira versão funcional no menor tempo possível.",
  },
  {
    q: "Como funcionam os valores?",
    a: "Trabalhamos com projeto fechado ou por escopo recorrente. Você recebe uma proposta clara, sem surpresa: o que entra, prazo e investimento — antes de começar.",
  },
  {
    q: "Vocês dão suporte depois da entrega?",
    a: "Sim. Todo projeto tem período de garantia e oferecemos planos de manutenção e evolução contínua para o que está no ar.",
  },
  {
    q: "Vocês cuidam da hospedagem?",
    a: "Cuidamos de tudo: domínio, hospedagem, certificados e monitoramento. Você não precisa se preocupar com infraestrutura.",
  },
  {
    q: "Como a Inteligência Artificial é aplicada?",
    a: "Implantamos agentes que atendem no WhatsApp, qualificam leads, agendam, criam reuniões no Meet e registram tudo no CRM — além de IA para conteúdo e análise de dados.",
  },
  {
    q: "O que dá para automatizar?",
    a: "Atendimento, follow-up, geração de propostas, emissão de documentos, integrações entre sistemas, relatórios e qualquer fluxo repetitivo que hoje consome o tempo da equipe.",
  },
  {
    q: "Vocês criam sistemas sob medida?",
    a: "Sim — CRM, ERP, agendamento, marketplaces, apps e plataformas inteiras. Construímos exatamente o que a sua operação precisa.",
  },
];

/** Monta o nó FAQPage do schema.org a partir do MESMO array que a página mostra. */
export function faqPageSchema(items: QA[], id: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
