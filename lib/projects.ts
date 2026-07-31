/* ─────────────────────────────────────────────────────────────────────────────
   PROJETOS — fonte única do portfólio real.

   Estava embutido dentro de `components/site/HypergrowSite.tsx` (client). Saiu
   para cá porque /sobre também precisa da mesma lista: duas cópias da mesma
   verdade é como o site passa a mentir em um dos lugares.

   ⚠️ NÃO CONFUNDIR com `lib/products.ts` — aquele é a vitrine ANTIGA (Nexlab),
   consumida só por componentes Tailwind que nenhuma rota importa. É código
   morto; não construa nada em cima dele.

   Módulo LEVE (só dados) — seguro para o bundle do cliente.
   `own: true` = produto da própria HyperGrow. `own: false` = cliente.
   ──────────────────────────────────────────────────────────────────────────── */
export type Project = {
  id: string;
  name: string;
  url?: string;
  cat: string[];
  tags: string[];
  grad: string;
  desc: string;
  own: boolean;
};

export const PROJECTS: Project[] = [
  { id: "clicouenviou", name: "Clicou Enviou", url: "https://www.clicouenviou.com.br", own: false, cat: ["E-commerce", "Sistemas", "Automações"], tags: ["Logística", "Plataforma"], grad: "linear-gradient(150deg,#0FA968,#0B7A4C)", desc: "Plataforma que reúne múltiplas transportadoras num único painel para simplificar os envios do e-commerce." },
  { id: "ebcorretora", name: "EB Corretora", url: "https://www.ebcorretora.com.br", own: false, cat: ["Websites", "Sistemas"], tags: ["Site", "Institucional"], grad: "linear-gradient(150deg,#0A7048,#6FBF9A)", desc: "Presença digital e site institucional para corretora de seguros, com captação de leads." },
  { id: "odontomed", name: "OdontoMed Saúde", url: "https://www.odontomedsaude.com.br", own: false, cat: ["Websites", "Sistemas"], tags: ["Site", "Saúde"], grad: "linear-gradient(150deg,#0C8956,#2DD4A0)", desc: "Site e presença digital para clínica de odontologia e saúde, com agendamento." },
  { id: "pneusmaninho", name: "Pneus Maninho", url: "https://www.pneusmaninho.com.br", own: false, cat: ["E-commerce", "Websites"], tags: ["E-commerce", "Loja"], grad: "linear-gradient(150deg,#C4763C,#7A4720)", desc: "Loja virtual de pneus com catálogo, presença digital e captação de clientes." },
  { id: "agentop", name: "Agentop", url: "https://agentop.com.br", own: true, cat: ["Sistemas", "IA"], tags: ["Sistema", "IA"], grad: "linear-gradient(150deg,#0A7048,#0B7A4C)", desc: "Agenda, CRM, financeiro e conteúdo com IA num sistema só para profissionais que vivem de atender." },
  { id: "marido", name: "Marido de Aluguel", own: true, cat: ["Websites", "Sistemas"], tags: ["Site", "Sistema"], grad: "linear-gradient(150deg,#0FA968,#6FBF9A)", desc: "Site e sistema de orçamentos para prestadores de reparos, com captação de leads automática." },
  { id: "sorteio", name: "Sorteio Bilionário IA", url: "https://www.sorteiobilionario.com.br", own: true, cat: ["Aplicativos", "IA"], tags: ["App", "IA"], grad: "linear-gradient(150deg,#0B7A4C,#C4763C)", desc: "Plataforma de sorteios com geração de números, pagamentos e validação automatizada por IA." },
  { id: "nutri", name: "NutriSnap", url: "https://calorias.app.br", own: true, cat: ["Aplicativos", "IA"], tags: ["App", "IA"], grad: "linear-gradient(150deg,#0C8956,#2DD4A0)", desc: "Conte calorias tirando uma foto. Visão computacional estimando macros em tempo real." },
  { id: "unixx", name: "Unixx", own: true, cat: ["Sistemas", "Automações"], tags: ["CRM", "Automação"], grad: "linear-gradient(150deg,#0A7048,#0FA968)", desc: "CRM e site integrados com disparos automáticos e funil de vendas para a equipe comercial." },
  { id: "packslog", name: "Packslog", own: true, cat: ["Sistemas", "Automações"], tags: ["Sistema", "Logística"], grad: "linear-gradient(150deg,#C4763C,#7A4720)", desc: "Sistema de operações logísticas com rastreio, etiquetas e painel de operação em tempo real." },
];

/** Categorias do filtro do portfólio na home. */
export const PROJECT_CATS = ["Todos", "E-commerce", "Websites", "Sistemas", "Aplicativos", "IA", "Automações"];
