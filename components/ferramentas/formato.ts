/* ─────────────────────────────────────────────────────────────────────────────
   FORMATAÇÃO E LEITURA DE NÚMERO — pt-BR, determinística.

   POR QUE NÃO `Intl.NumberFormat` AQUI:
   estes componentes são "use client", mas o App Router renderiza o primeiro
   HTML no servidor (Node) e o React precisa encontrar exatamente o mesmo texto
   ao hidratar no navegador. `Intl` depende do ICU embarcado em cada ambiente —
   qualquer diferença de espaço (o separador entre "R$" e o número é U+00A0 em
   um e pode ser U+0020 em outro) derruba a hidratação inteira da página. Este
   projeto já pagou esse pedágio duas vezes (React #418/#423/#425, ver
   `.claude/skills/hg-regras-de-bug`). Uma função pura resolve: mesma entrada,
   mesma saída, nos dois lados. A saída é idêntica à do `Intl` em pt-BR:
   R$ 12.345,67.

   LEITURA: o brasileiro digita "12,50" e também "1.250,90". Um <input
   type="number"> devolve string vazia para os dois em vários navegadores — por
   isso os campos são type="text" + inputMode="decimal" e a conversão passa por
   `paraNumero`, que entende vírgula, ponto de milhar e os dois juntos.
   ──────────────────────────────────────────────────────────────────────────── */

/** "12345.678" → "12.345,68" (2 casas, separador de milhar). */
export function brl(valor: number): string {
  return (valor < 0 ? "-R$ " : "R$ ") + numero(Math.abs(valor), 2);
}

/**
 * Arredondamento "meio para cima" que corrige a representação binária.
 *
 * POR QUE NÃO USAR `toFixed` DIRETO: 89,90 x 35% dá 31,465, e o double mais
 * próximo desse valor é 31,4649999999999998... — então `(31.465).toFixed(2)`
 * devolve "31.46", não "31.47". Um centavo a menos numa calculadora pública é
 * exatamente o tipo de detalhe que faz quem confere na mão desconfiar de toda
 * a conta. Passar por `toPrecision(15)` descarta o ruído do 16º dígito antes
 * de arredondar, e aí 3146,4999999999995 volta a ser 3146,5 → 3147.
 */
function arredondar(valor: number, casas: number): number {
  const f = Math.pow(10, casas);
  return Math.round(Number((valor * f).toPrecision(15))) / f;
}

/** Número simples com N casas e separador de milhar pt-BR. */
export function numero(valor: number, casas = 2): string {
  if (!Number.isFinite(valor)) return "—";
  const negativo = valor < 0;
  const fixo = arredondar(Math.abs(valor), casas).toFixed(casas);
  const [inteiro, decimal] = fixo.split(".");
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (negativo ? "-" : "") + comMilhar + (decimal ? "," + decimal : "");
}

/** 12.5 → "12,5%" (tira zero à direita: 12,50% vira 12,5%). */
export function pct(valor: number, casas = 2): string {
  if (!Number.isFinite(valor)) return "—";
  let s = numero(valor, casas);
  if (s.includes(",")) s = s.replace(/,?0+$/, "");
  return s + "%";
}

/** Multiplicador de ROAS: 4.3333 → "4,33x". */
export function vezes(valor: number, casas = 2): string {
  if (!Number.isFinite(valor)) return "—";
  return numero(valor, casas) + "x";
}

/**
 * Aceita "12,50", "12.50", "1.250,90", "R$ 1.250,90" e " " (vazio → 0).
 * Devolve NaN só quando não sobra dígito nenhum.
 */
export function paraNumero(texto: string): number {
  const limpo = (texto || "").replace(/[^\d,.-]/g, "");
  if (!limpo || limpo === "-") return NaN;
  const temVirgula = limpo.includes(",");
  const temPonto = limpo.includes(".");
  let normalizado = limpo;
  if (temVirgula && temPonto) {
    // "1.250,90" — ponto é milhar, vírgula é decimal
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (temVirgula) {
    normalizado = limpo.replace(",", ".");
  }
  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

/** Igual a `paraNumero`, mas devolve 0 no lugar de NaN (campo opcional vazio). */
export function paraNumeroOuZero(texto: string): number {
  const n = paraNumero(texto);
  return Number.isFinite(n) ? n : 0;
}
