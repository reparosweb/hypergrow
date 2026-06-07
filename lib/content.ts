// Conteúdo do site da agência Hypergrow (FASE marketing)

export type Service = {
  slug: string;
  icon: string;
  title: string;
  description: string;
  items: string[];
  gradient: string;
  accent: string;
};

export const services: Service[] = [
  {
    slug: "websites",
    icon: "Globe",
    title: "Desenvolvimento de Websites",
    description: "Sites rápidos, modernos, responsivos e otimizados para conversão.",
    items: ["Landing Pages", "Sites Institucionais", "Portais", "Blogs", "SEO"],
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    accent: "#3b82f6",
  },
  {
    slug: "ecommerce",
    icon: "ShoppingCart",
    title: "E-commerce",
    description: "Lojas virtuais completas para vender 24 horas por dia.",
    items: ["Shopify", "WooCommerce", "Nuvemshop", "Integrações", "Marketplaces"],
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    accent: "#a855f7",
  },
  {
    slug: "sistemas",
    icon: "Boxes",
    title: "Criação de Sistemas",
    description: "Desenvolvimento de plataformas SaaS e sistemas sob medida.",
    items: ["CRM", "ERP", "Gestão Financeira", "Agendamentos", "Marketplaces", "Aplicativos"],
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    accent: "#06b6d4",
  },
  {
    slug: "automacao",
    icon: "Workflow",
    title: "Automação de Processos",
    description: "Elimine tarefas repetitivas e reduza custos operacionais.",
    items: ["WhatsApp", "E-mail", "CRM", "Fluxos automáticos", "Integrações"],
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    accent: "#10b981",
  },
  {
    slug: "ia",
    icon: "BrainCircuit",
    title: "Inteligência Artificial",
    description: "Implantação de IA para aumentar produtividade e vendas.",
    items: [
      "Chatbots",
      "Agentes IA",
      "Atendimento automático",
      "IA para vendas",
      "IA para suporte",
      "IA para análise de dados",
    ],
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    accent: "#ec4899",
  },
  {
    slug: "branding",
    icon: "Palette",
    title: "Design e Branding",
    description: "Construção de marcas fortes e memoráveis.",
    items: ["Logotipos", "Identidade Visual", "Banners", "Materiais Publicitários", "Social Media"],
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    accent: "#f97316",
  },
];

export type Differential = { icon: string; title: string };

export const differentials: Differential[] = [
  { icon: "Rocket", title: "Entrega Rápida" },
  { icon: "Cpu", title: "Tecnologia de Ponta" },
  { icon: "BrainCircuit", title: "Inteligência Artificial Integrada" },
  { icon: "Workflow", title: "Automação Completa" },
  { icon: "TrendingUp", title: "Escalabilidade" },
  { icon: "LifeBuoy", title: "Suporte Especializado" },
  { icon: "ShieldCheck", title: "Segurança Avançada" },
  { icon: "SlidersHorizontal", title: "Soluções Personalizadas" },
];

export type Step = { icon: string; title: string; desc: string };

export const processSteps: Step[] = [
  { icon: "Search", title: "Diagnóstico", desc: "Entendemos seu negócio, metas e gargalos antes de propor qualquer solução." },
  { icon: "ClipboardList", title: "Planejamento", desc: "Desenhamos a estratégia, o escopo e o roadmap de tecnologia ideal." },
  { icon: "Code2", title: "Desenvolvimento", desc: "Construímos com tecnologia de ponta, IA e automação — nível mundial." },
  { icon: "Rocket", title: "Implantação", desc: "Colocamos no ar, integramos e treinamos sua equipe para usar." },
  { icon: "TrendingUp", title: "Crescimento", desc: "Monitoramos, otimizamos e escalamos os resultados de forma contínua." },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Qual o prazo médio de entrega?",
    a: "Depende do escopo: uma landing page sai em poucos dias; sites institucionais e e-commerces em 2 a 4 semanas; sistemas e plataformas SaaS são entregues por fases, com a primeira versão funcional no menor tempo possível.",
  },
  {
    q: "Como funcionam os valores?",
    a: "Cada projeto recebe uma proposta sob medida com base no escopo. Trabalhamos com projeto fechado e também com planos mensais para evolução contínua, automações e IA. Solicite um orçamento para receber valores exatos.",
  },
  {
    q: "Vocês dão suporte depois da entrega?",
    a: "Sim. Oferecemos suporte especializado e planos de manutenção/evolução. Você não fica sozinho depois que o projeto vai ao ar.",
  },
  {
    q: "Vocês cuidam da hospedagem?",
    a: "Sim. Publicamos em infraestrutura moderna e segura (com HTTPS automático, alta performance e escalabilidade), e cuidamos de domínio, deploy e monitoramento.",
  },
  {
    q: "Como a Inteligência Artificial é aplicada?",
    a: "Implantamos chatbots e agentes de IA que atendem, qualificam e vendem 24/7, além de IA para suporte e análise de dados. Tudo integrado ao seu site, WhatsApp e CRM.",
  },
  {
    q: "O que dá para automatizar?",
    a: "Atendimento, follow-up de leads, envio de propostas, agendamento de reuniões, e-mails, integrações entre sistemas e fluxos internos — reduzindo custo e erro humano.",
  },
  {
    q: "Vocês criam sistemas sob medida?",
    a: "Sim. Desenvolvemos CRMs, ERPs, plataformas SaaS, gestão financeira, agendamentos, marketplaces e aplicativos — exatamente para a sua operação.",
  },
];

export type Testimonial = { quote: string; name: string; role: string };

// ⚠️ PLACEHOLDERS — substituir por depoimentos REAIS de clientes antes de divulgar.
export const testimonials: Testimonial[] = [
  {
    quote:
      "A HyperGrow entregou nosso sistema no prazo e com uma qualidade muito acima do que esperávamos. A automação de atendimento mudou nossa operação.",
    name: "Cliente (exemplo)",
    role: "Diretor — Clínica de Saúde",
  },
  {
    quote:
      "O agente de IA responde nossos clientes na hora e já agenda reuniões sozinho. Nossas vendas ficaram muito mais previsíveis.",
    name: "Cliente (exemplo)",
    role: "CEO — E-commerce",
  },
  {
    quote:
      "Profissionalismo do começo ao fim. Diagnóstico claro, execução rápida e suporte de verdade. Recomendo de olhos fechados.",
    name: "Cliente (exemplo)",
    role: "Fundador — Startup B2B",
  },
];
