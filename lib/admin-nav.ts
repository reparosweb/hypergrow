import {
  Sun,
  CalendarDays,
  KanbanSquare,
  CreditCard,
  Wallet,
  BarChart3,
  Users,
  Share2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Navegação do painel — FONTE ÚNICA.

   Antes existiam três agrupamentos diferentes, digitados à mão dentro dos
   componentes: o CRM linkava "Financeiro" e "Cobranças", o Financeiro linkava
   "Pipeline", e Cobranças linkava só "Pipeline". Cada tela mostrava um menu
   diferente e, quando entrasse uma tela nova, ela não apareceria em lugar
   nenhum sem editar os três arquivos — que foi exatamente o erro que os
   departamentos do site já cometeram (ver CLAUDE.md).

   Agora: item novo aqui = item novo na barra lateral, com permissão junto.
   ──────────────────────────────────────────────────────────────────────────── */

export type ItemNav = {
  slug: string;
  href: string;
  rotulo: string;
  icone: LucideIcon;
  /** Liga ao MODULE_ACCESS de `lib/permissions.ts`: quem não tem o módulo não
   *  vê o item (e o servidor recusa a chamada, que é o que de fato protege). */
  modulo: string;
  /** Descrição curta usada no subtítulo do cabeçalho. */
  descricao?: string;
  /** `false` = aparece apagado, sem link. Existe para o item não sumir do mapa
   *  do painel só porque a tela ainda não foi construída — e para não mandar
   *  o dono clicar num link que dá 404. */
  disponivel?: boolean;
};

export type GrupoNav = { id: string; titulo: string; itens: ItemNav[] };

export const NAV: GrupoNav[] = [
  {
    id: "operacao",
    titulo: "Operação",
    itens: [
      /* ⚠️ `disponivel: false` nos itens cuja TELA ainda não existe.
         O módulo de API já responde (mod-agenda, mod-relatorios,
         mod-automacoes estão no roteador) e os componentes MeuDia.tsx e
         Agenda.tsx já foram escritos — falta só a página que os monta.
         Enquanto isso, o item aparece apagado em vez de virar um link que
         devolve 404: o dono precisa ver o mapa completo do painel, mas não
         pode clicar e cair em erro. Ao criar a página, apague esta linha. */
      {
        slug: "meu-dia",
        href: "/admin/meu-dia",
        rotulo: "Meu dia",
        icone: Sun,
        modulo: "agenda",
        descricao: "Em construção",
        disponivel: false,
      },
      {
        slug: "agenda",
        href: "/admin/agenda",
        rotulo: "Agenda",
        icone: CalendarDays,
        modulo: "agenda",
        descricao: "Em construção",
        disponivel: false,
      },
    ],
  },
  {
    id: "negocio",
    titulo: "Negócio",
    itens: [
      {
        slug: "crm",
        href: "/admin",
        rotulo: "CRM",
        icone: KanbanSquare,
        modulo: "crm",
        descricao: "Leads e pipeline de vendas",
      },
      {
        slug: "cobrancas",
        href: "/admin/cobrancas",
        rotulo: "Cobranças",
        icone: CreditCard,
        modulo: "cobrancas",
        descricao: "PIX, boleto e cartão pelo Asaas",
      },
      {
        slug: "financeiro",
        href: "/admin/financeiro",
        rotulo: "Financeiro",
        icone: Wallet,
        modulo: "financeiro",
        descricao: "A receber, a pagar, extrato e DRE",
      },
      {
        slug: "relatorios",
        href: "/admin/relatorios",
        rotulo: "Relatórios",
        icone: BarChart3,
        modulo: "relatorios",
        descricao: "Em construção",
        disponivel: false,
      },
    ],
  },
  {
    id: "sistema",
    titulo: "Sistema",
    itens: [
      {
        slug: "usuarios",
        href: "/admin/usuarios",
        rotulo: "Usuários",
        icone: Users,
        modulo: "usuarios",
        descricao: "Quem entra no painel e o que cada um vê",
      },
      {
        slug: "afiliados",
        href: "/admin/afiliados",
        rotulo: "Afiliados",
        icone: Share2,
        modulo: "afiliado",
        descricao: "Ainda não construído",
        // O papel "afiliado" já existe no controle de acesso, mas a TELA dele
        // não foi feita. Fica visível e apagado em vez de virar link quebrado.
        disponivel: false,
      },
      {
        slug: "automacoes",
        href: "/admin/automacoes",
        rotulo: "Automações",
        icone: Workflow,
        modulo: "automacoes",
        descricao: "Em construção",
        disponivel: false,
      },
    ],
  },
];

/** Todos os itens, em lista plana. */
export const ITENS_NAV: ItemNav[] = NAV.flatMap((g) => g.itens);

/* Casamento de rota → item. Ordena do href mais longo para o mais curto porque
   "/admin" é prefixo de TODOS os outros: sem isso, "/admin/financeiro" cairia
   no item do CRM. O "/admin" só casa exato. */
const POR_TAMANHO = [...ITENS_NAV].sort((a, b) => b.href.length - a.href.length);

export function findNavItem(pathname: string): ItemNav | null {
  const limpo = pathname.replace(/\/+$/, "") || "/admin";
  for (const item of POR_TAMANHO) {
    if (limpo === item.href) return item;
    if (item.href !== "/admin" && limpo.startsWith(`${item.href}/`)) return item;
  }
  return null;
}
