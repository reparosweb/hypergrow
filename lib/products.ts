export type Product = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  problem: string;
  solution: string;
  features: string[];
  audience: string;
  url: string;
  status: "live" | "beta" | "soon";
  // tailwind gradient stops used for the card glow / icon
  gradient: string;
  accent: string; // hex for glows
  icon: string; // lucide icon name
};

export const products: Product[] = [
  {
    slug: "agentop",
    name: "Agentop",
    category: "Agendamento & Gestão",
    tagline: "A agenda inteligente para clínicas e consultórios.",
    problem:
      "Profissionais de saúde perdem horas com agenda no papel, faltas e cobranças manuais.",
    solution:
      "Agenda online, lembretes automáticos, prontuário e financeiro num só lugar — com IA que reduz faltas e organiza o dia.",
    features: [
      "Agenda online multi-profissional",
      "Lembretes e confirmação automáticos",
      "Prontuário e financeiro integrados",
      "Painel de métricas da clínica",
    ],
    audience: "Psicólogos, clínicas e consultórios",
    url: "https://agentop.com.br",
    status: "live",
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
    accent: "#6366f1",
    icon: "CalendarCheck",
  },
  {
    slug: "marido-de-aluguel",
    name: "Marido de Aluguel",
    category: "Sites & Captação",
    tagline: "Sites e clientes para profissionais de reparos.",
    problem:
      "O bom profissional de reparos não aparece no Google e depende só de indicação.",
    solution:
      "Site profissional pronto, otimizado para busca, com orçamento por WhatsApp e captação de clientes na sua região.",
    features: [
      "Site profissional em minutos",
      "Orçamento direto no WhatsApp",
      "SEO local para aparecer no Google",
      "Multi-tenant: cada pro com sua marca",
    ],
    audience: "Eletricistas, encanadores, montadores e reformas",
    url: "https://reparosweb.com.br",
    status: "live",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    accent: "#f97316",
    icon: "Wrench",
  },
  {
    slug: "sorteio-bilionario",
    name: "Sorteio Bilionário IA",
    category: "Sorteios & IA",
    tagline: "Palpites inteligentes para loterias, com IA.",
    problem:
      "Apostador comum joga no escuro, sem estatística e sem método.",
    solution:
      "Plataforma com análise de IA, palpites estatísticos, planos flexíveis e alertas — tudo pensado para jogar melhor.",
    features: [
      "Palpites gerados por IA",
      "Análise estatística de concursos",
      "Planos a partir de R$5",
      "Alertas e relatórios automáticos",
    ],
    audience: "Apostadores de loterias",
    url: "https://sorteiobilionario.com.br",
    status: "live",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    accent: "#10b981",
    icon: "Sparkles",
  },
  {
    slug: "nutrisnap",
    name: "NutriSnap",
    category: "Saúde & IA",
    tagline: "Conte calorias tirando uma foto.",
    problem:
      "Registrar a alimentação é chato e quase ninguém mantém por mais de uma semana.",
    solution:
      "Aponte a câmera para o prato e a IA identifica os alimentos e calcula calorias e macros em segundos.",
    features: [
      "Reconhecimento de comida por foto",
      "Cálculo de calorias e macros",
      "Histórico e metas diárias",
      "Experiência mobile-first",
    ],
    audience: "Quem quer emagrecer ou ganhar massa",
    url: "https://calorias.app.br",
    status: "live",
    gradient: "from-lime-400 via-green-500 to-emerald-500",
    accent: "#22c55e",
    icon: "Camera",
  },
  {
    slug: "unixx",
    name: "Unixx",
    category: "Logística & Vendas B2B",
    tagline: "Prospecção e CRM inteligente para times comerciais.",
    problem:
      "Equipes de vendas e logística perdem negócios por falta de organização e dados dos clientes certos.",
    solution:
      "Encontre empresas ideais, organize o funil num CRM moderno e gere propostas com um agente de IA que aprende com você.",
    features: [
      "Prospecção de empresas com dados ricos",
      "CRM e funil de vendas visual",
      "Propostas geradas por agente de IA",
      "Relatórios e automações comerciais",
    ],
    audience: "Times de vendas B2B e logística",
    url: "https://unixx.com.br",
    status: "beta",
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    accent: "#3b82f6",
    icon: "Radar",
  },
  {
    slug: "packslog",
    name: "Packslog",
    category: "Fulfillment & Operação",
    tagline: "Gestão de fulfillment e operação logística.",
    problem:
      "Operações de logística e fulfillment vivem no caos de planilhas e mensagens soltas.",
    solution:
      "Centralize pedidos, rotas e operação num painel único, com blog automático por IA e assistente que aprende a sua operação.",
    features: [
      "Painel central de operação",
      "Gestão de pedidos e rotas",
      "Blog automático por IA",
      "Assistente que aprende sua operação",
    ],
    audience: "Empresas de logística e fulfillment",
    url: "https://packslog.com.br",
    status: "beta",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    accent: "#f18216",
    icon: "Truck",
  },
];

export const stats = [
  { value: "6", label: "Produtos no portfólio" },
  { value: "4", label: "No ar gerando receita" },
  { value: "100%", label: "Construídos com IA real" },
  { value: "24/7", label: "Operação automatizada" },
];
