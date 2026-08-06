"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Bot, ChevronDown, Menu, Palette, ShoppingCart, TrendingUp, X, type LucideIcon } from "lucide-react";
import { PILLARS, type PillarKey, type ServiceCardData } from "@/lib/pillars";
import { ClaroLogo } from "./ClaroUI";
import { ClaroServiceIcon } from "./ClaroServiceIcon";
import { CLARO_PILLAR_ACCENT } from "./claroPillarAccent";

/* ─────────────────────────────────────────────────────────────────────────────
   NAV da rota /claro — header fixo com progresso de leitura, mega-menu em
   cascata por pilar (hover/foco/clique) e drawer mobile com acordeão.

   Ícone de PILAR: `ClaroServiceIcon` só resolve os 22 ícones de SERVIÇO — os
   4 ícones de pilar ("shopping-cart", "trending-up", "palette", "bot") não
   estão nesse mapa. Em vez de recorrer a um lookup dinâmico por string aqui
   também, os 4 ficam num Record fechado (chave = PillarKey, só 4 valores
   possíveis) com import nomeado direto do lucide — mesmo espírito da regra
   "nunca Icons[nome]", só que fixado a um conjunto fechado de 4 em vez de 22.
   ──────────────────────────────────────────────────────────────────────────── */

const PILLAR_ICON: Record<PillarKey, LucideIcon> = {
  vender: ShoppingCart,
  atrair: TrendingUp,
  marca: Palette,
  ia: Bot,
};

/** Links diretos (fora do mega-menu). O primeiro ("Início") é renderizado
 *  separado no desktop (antes do gatilho "Soluções"); no drawer mobile a
 *  lista inteira entra depois dos acordeões, como pedido. */
const DIRECT_LINKS: [string, string][] = [
  ["Início", "#top"],
  ["Portfólio", "#portfolio"],
  ["Resultados", "#resultados"],
  ["Diagnóstico", "#diagnostico"],
  ["Clientes", "#depoimentos"],
  ["Dúvidas", "#faq"],
];

/* `services` chega do server (app/claro/page.tsx), já enxuto — 4 campos
   (slug/icon/title/desc) em vez do array completo com body/faq/outcomes
   (~63.000 bytes de texto que a home escura já mediu e evitou pelo mesmo
   motivo — não regredir essa otimização aqui). */
export default function ClaroNav({ services }: { services: ServiceCardData[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState<PillarKey | null>(null);
  const niRef = useRef<HTMLDivElement>(null);
  const trigRef = useRef<HTMLButtonElement>(null);
  const shutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Abrir/fechar o mega-menu virou ESTADO (antes era só o `:hover` do CSS em
     claro-tokens.css). Duas razões concretas:
     · o Esc passa a fechar de verdade — pela regra `.ni:hover .pop`, se o
       ponteiro continuasse sobre "Soluções" o painel reabria sozinho;
     · o painel deixou de se ancorar no .ni e passou a se ancorar no cabeçalho
       (ver CSS no fim do arquivo), então nasce ~31px abaixo do botão em vez de
       10px. Um atraso curto no FECHAR cobre esse vão melhor que esticar a
       ponte invisível do ::before, que nessa altura passaria por cima dos
       outros links do cabeçalho e roubaria o clique deles. */
  const openMenu = useCallback(() => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback((delay = 0) => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
    if (delay > 0) shutTimer.current = setTimeout(() => setMenuOpen(false), delay);
    else setMenuOpen(false);
  }, []);
  useEffect(() => () => {
    if (shutTimer.current) clearTimeout(shutTimer.current);
  }, []);

  // Header sólido + barra de progresso de leitura.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Esc fecha o que estiver aberto — quem abre por teclado precisa sair por teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Se o foco estava DENTRO do painel, ele some junto com o painel
      // (visibility:hidden) e o teclado ficaria sem âncora — devolve ao gatilho.
      const el = document.activeElement;
      const inside = !!(niRef.current && el instanceof Node && niRef.current.contains(el));
      closeMenu();
      setDrawerOpen(false);
      if (inside) trigRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  // Clique fora do mega-menu fecha (cobre o caso de ter sido aberto por clique/toque).
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (niRef.current && !niRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen, closeMenu]);

  // Redimensionar para desktop fecha o drawer; para mobile fecha o mega-menu hover.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1180) setDrawerOpen(false);
      else closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [closeMenu]);

  /* Trava a rolagem do corpo enquanto o drawer está aberto.
     Era só `overflow:hidden`, e faltavam as duas metades que fazem a trava
     parecer aplicativo em vez de site:

     1. COMPENSAÇÃO DA BARRA DE ROLAGEM (desktop). Ao esconder o overflow, a
        barra some e a área útil ENGORDA ~15px — a página inteira dá um pulo
        para a direita no instante em que o menu abre. A medida entra como
        padding no corpo e, via `--cl-sb`, também no cabeçalho fixo (que é
        largura de viewport e não recebe o padding do corpo). Em celular o
        valor é 0, porque a barra de rolagem é sobreposta.
     2. TRAVA NO <html> TAMBÉM. No iOS o `overflow:hidden` só no <body> não
        segura o gesto — quem rola de fato é o elemento raiz, e o fundo
        continuava correndo por trás do painel. É o sintoma nº 1 de "isto não é
        um app". A dupla html+body é o par que o Safari respeita; o gesto DENTRO
        do painel continua livre porque o `.dw-p` tem `overflow-y:auto` próprio
        (com `overscroll-behavior:contain`, para o fim da lista não empurrar a
        página por baixo). A posição de rolagem é preservada: nada de
        `position:fixed` no corpo, que é a receita que faz a página saltar para
        o topo quando o menu fecha. */
  useEffect(() => {
    if (!drawerOpen) return;
    const corpo = document.body;
    const raiz = document.documentElement;
    const antes = {
      corpoOverflow: corpo.style.overflow,
      corpoPadding: corpo.style.paddingRight,
      raizOverflow: raiz.style.overflow,
    };
    const barra = window.innerWidth - raiz.clientWidth;

    raiz.style.overflow = "hidden";
    corpo.style.overflow = "hidden";
    if (barra > 0) {
      corpo.style.paddingRight = `${barra}px`;
      raiz.style.setProperty("--cl-sb", `${barra}px`);
    }
    return () => {
      raiz.style.overflow = antes.raizOverflow;
      corpo.style.overflow = antes.corpoOverflow;
      corpo.style.paddingRight = antes.corpoPadding;
      raiz.style.removeProperty("--cl-sb");
    };
  }, [drawerOpen]);

  /* ECONOMIA DE BATERIA — pausa as esteiras (.mq) que não estão na tela.
     São três (duas no topo, uma em "Clientes") rodando em laço INFINITO de
     42s/52s. O CSS já as pausava no `:hover`/`:focus-within`, mas no celular
     hover não existe: elas animavam o tempo todo, inclusive fora da viewport e
     com a aba em segundo plano. Composto de `transform`, mas ainda assim é o
     compositor acordado a cada quadro, sem ninguém olhando.

     Por que este observador mora AQUI: as esteiras são renderizadas por
     ClaroHero e ClaroExtra, e o ClaroNav é o único componente-cliente montado
     uma vez só na página que pertence a este dono. Ele não conhece as esteiras
     — só liga/desliga a classe `.mq-pause` declarada em app/claro-tokens.css.
     Mesmo padrão de IntersectionObserver já usado em ClaroCaptura.tsx.

     O DOM já está inteiro no momento em que este efeito roda: o React executa
     os efeitos depois de confirmar toda a árvore. */
  useEffect(() => {
    const esteiras = Array.from(document.querySelectorAll<HTMLElement>(".cl .mq"));
    if (!esteiras.length) return;

    const naTela = new Set<HTMLElement>();
    const aplicar = () => {
      const abaOculta = document.hidden;
      esteiras.forEach((el) => el.classList.toggle("mq-pause", abaOculta || !naTela.has(el)));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) naTela.add(el);
          else naTela.delete(el);
        });
        aplicar();
      },
      { threshold: 0 }
    );
    esteiras.forEach((el) => io.observe(el));
    document.addEventListener("visibilitychange", aplicar);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", aplicar);
      esteiras.forEach((el) => el.classList.remove("mq-pause"));
    };
  }, []);

  const solid = scrolled || menuOpen || drawerOpen;
  const pillar = PILLARS[activePillar];
  const panServices = services.filter((s) => pillar.slugs.includes(s.slug));

  /* A cor do pilar ATIVO desce como custom property em vez de style inline em
     cada elemento. Isso é o que destrava o hover: com `style={{background:...}}`
     no ícone do serviço, NENHUMA regra de :hover pegava sem `!important`
     (inline vence seletor), e era exatamente por isso que "não mudava de cor ao
     passar o mouse". Com variável, o CSS manda no estado normal E no hover. */
  const pa = CLARO_PILLAR_ACCENT[pillar.key];
  const cascVars = {
    "--pa": pa,
    "--pa-soft": pa + "0f",
    "--pa-line": pa + "33",
  } as CSSProperties;

  return (
    <>
      <div className="prog" style={{ width: `${progress}%` }} aria-hidden="true" />

      <header className={"hd" + (solid ? " on" : "")}>
        <div className="wrap hd-in">
          <a href="#top" aria-label="HyperGrow — início">
            <ClaroLogo height={42} light={!solid} />
          </a>

          <nav className="nl" aria-label="Navegação principal">
            <a href={DIRECT_LINKS[0][1]}>{DIRECT_LINKS[0][0]}</a>

            <div
              className="ni"
              ref={niRef}
              onMouseEnter={openMenu}
              onMouseLeave={() => closeMenu(150)}
              /* onFocus/onBlur do React sobem (focusin/focusout), então cobrem o
                 painel inteiro. O gatilho é a exceção: TAB até ele não deve
                 escancarar o menu sozinho (padrão disclosure — abre no Enter/
                 Espaço); sem essa exceção, o foco que o navegador dá no
                 mousedown abriria o menu e o clique logo em seguida fecharia. */
              /* cast: o tipo de FocusEvent no React declara `target` como o
                 elemento do handler (a div), não como EventTarget genérico. */
              onFocus={(e) => { if ((e.target as Node) !== trigRef.current) openMenu(); }}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeMenu(); }}
            >
              <button
                type="button"
                className="nt"
                ref={trigRef}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-controls="cl-mm"
                onClick={() => (menuOpen ? closeMenu() : openMenu())}
              >
                Soluções <ChevronDown size={15} className="chev" aria-hidden />
              </button>

              <div className={"pop" + (menuOpen ? " open" : "")} id="cl-mm">
                <div className="casc" style={cascVars}>
                  <div className="rail">
                    {PILLARS.map((p, i) => {
                      const Icon = PILLAR_ICON[p.key];
                      const accent = CLARO_PILLAR_ACCENT[p.key];
                      const on = i === activePillar;
                      /* Cada botão carrega a PRÓPRIA cor: assim o ícone acende
                         no instante do :hover (CSS puro), sem esperar o React
                         re-renderizar. Antes o ícone já vinha colorido sempre —
                         o hover não tinha o que mudar, e era metade da queixa. */
                      const depVars = {
                        "--dc": accent,
                        "--dc-soft": accent + "12",
                        "--dc-line": accent + "30",
                      } as CSSProperties;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          className={"dep" + (on ? " on" : "")}
                          aria-controls="cl-mm-pan"
                          onMouseEnter={() => setActivePillar(i)}
                          onFocus={() => setActivePillar(i)}
                          onClick={() => setActivePillar(i)}
                          style={depVars}
                        >
                          <Icon size={17} className="dep-ic" aria-hidden />
                          <span className="dep-t">{p.label}</span>
                          <span className="dep-n">{p.slugs.length}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* key={pillar.key} remonta o painel a cada troca de pilar —
                      é o que faz a animação de entrada (e o stagger dos itens)
                      tocar de novo em vez de só na primeira abertura. */}
                  <div className="pan" id="cl-mm-pan" key={pillar.key}>
                    <div className="pan-h">
                      <b>{pillar.label}</b>
                      <span>{pillar.desc}</span>
                    </div>
                    <div className="pan-g">
                      {panServices.map((s, i) => (
                        <Link
                          href={`/servicos/${s.slug}`}
                          className="pl"
                          key={s.slug}
                          style={{ "--i": String(i) } as CSSProperties}
                          onClick={() => closeMenu()}
                        >
                          <span className="pl-ic">
                            <ClaroServiceIcon name={s.icon} size={17} />
                          </span>
                          {/* <div> e não <span>: a regra genérica ".cl .pl span"
                              de claro-tokens.css pinta TODO span filho de
                              --ink-3 com margin-top — um <div> fica fora dela
                              sem precisar de contra-regra. */}
                          <div className="pl-tx">
                            <b className="pl-t">{s.title}</b>
                            <span className="pl-d">{s.desc}</span>
                          </div>
                          <ArrowRight size={15} className="pl-go" aria-hidden />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {DIRECT_LINKS.slice(1).map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="#contato" className="btn btn-p">Falar com especialista</a>
            <button
              type="button"
              className="burger"
              aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={drawerOpen}
              aria-controls="cl-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <div className={"dw" + (drawerOpen ? " open" : "")} id="cl-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="dw-s" onClick={() => setDrawerOpen(false)} />
        <div className="dw-p">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <ClaroLogo height={30} />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setDrawerOpen(false)}
              style={{
                width: 40, height: 40, borderRadius: 10, border: "1px solid var(--line)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--ink)", background: "#fff",
              }}
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          {PILLARS.map((p) => {
            const Icon = PILLAR_ICON[p.key];
            const items = services.filter((s) => p.slugs.includes(s.slug));
            const on = openAcc === p.key;
            return (
              <div className="acc" key={p.key}>
                <button type="button" className="acc-h" aria-expanded={on} onClick={() => setOpenAcc(on ? null : p.key)}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={17} style={{ color: CLARO_PILLAR_ACCENT[p.key], flexShrink: 0 }} aria-hidden />
                    {p.label}
                    <span style={{ font: "600 11px var(--font-mono)", color: "var(--ink-3)" }}>{p.slugs.length}</span>
                  </span>
                  <ChevronDown size={16} aria-hidden style={{ transform: on ? "rotate(180deg)" : "none", transition: "transform .3s var(--ease)" }} />
                </button>
                <div className="acc-b" style={{ maxHeight: on ? 560 : 0 }}>
                  {items.map((s) => (
                    <Link key={s.slug} href={`/servicos/${s.slug}`} onClick={() => setDrawerOpen(false)}>{s.title}</Link>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
            {DIRECT_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{ padding: "13px 2px", font: "500 15.5px var(--font-sans)", color: "var(--ink-2)", borderBottom: "1px solid var(--line-2)" }}
              >
                {label}
              </a>
            ))}
          </div>

          <a href="#contato" className="btn btn-p" onClick={() => setDrawerOpen(false)} style={{ marginTop: 20, width: "100%" }}>
            Falar com especialista
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

/* Camada do MEGA-MENU. Fica aqui, e não em app/claro-tokens.css, porque este
   componente é o único consumidor de .casc/.rail/.dep/.pan/.pl (a grade de
   serviços da página usa .sol-*, outro conjunto) — e porque claro-tokens.css é
   arquivo de outro dono nesta tarefa.
   Tudo escopado em `.cl .pop ...` de propósito: 3 classes vencem por
   especificidade as regras genéricas do token (`.cl .pl span` = 2 classes + 1
   tipo) sem precisar de `!important` espalhado.
   Sempre dangerouslySetInnerHTML — nunca `<style>{...}` — o que também deixa
   `>` e aspas livres de risco de hidratação (React #418/#423/#425).
   Nenhuma cor nova: só as 4 do mapa CLARO_PILLAR_ACCENT, via var(--pa)/var(--dc). */
const CSS = `
  /* ── POSIÇÃO ──────────────────────────────────────────────────────────────
     O painel do design tem 880px (+24px de padding do .pop = 904px). Centrado
     no GATILHO (o botão 'Soluções' fica bem à esquerda do centro do cabeçalho) ele
     sairia ~54px pra FORA da borda esquerda a 1280px — foi por isso que a
     largura tinha sido cortada pra 760px. Como .wrap também é centralizado,
     fixar o painel no centro da VIEWPORT o alinha ao container em qualquer
     largura e nunca estoura.
     COMO: .ni deixa de ser o bloco de contenção (position:static), então o
     painel passa a se ancorar no .hd — que é position:fixed e ocupa a largura
     inteira da tela. Preferi isso a pôr position:fixed no próprio painel
     porque o .hd.on tem backdrop-filter, e backdrop-filter também cria bloco
     de contenção pra filhos fixos: o resultado seria o mesmo, mas dependendo
     de uma regra sutil que muda entre navegadores. Com .ni estático não há
     ambiguidade. O top vira valor absoluto (o calc(100% + 10px) do token
     passaria a medir a altura do .hd): 88px de .hd-in + os 10px de respiro. */
  .cl .nl .ni{position:static}
  .cl .ni .pop{top:98px;left:50%;right:auto;transform:translateX(-50%) translateY(8px);max-width:calc(100vw - 24px)}

  /* Visibilidade dirigida por ESTADO (classe .open), não pelo :hover do CSS —
     ver o comentário de openMenu/closeMenu lá em cima. A regra abaixo desliga
     a do token; como este <style> entra no <body>, ele vem depois da folha do
     <head> e vence no empate de especificidade. */
  .cl .ni:hover .pop{opacity:0;visibility:hidden;transform:translateX(-50%) translateY(8px)}
  .cl .ni .pop.open{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
  /* Chevron acompanha o estado real, não o ponteiro. */
  .cl .ni:hover .chev{transform:none}
  .cl .ni .nt[aria-expanded='true'] .chev{transform:rotate(180deg)}

  /* ── MEDIDAS DO DESIGN ────────────────────────────────────────────────────
     880 / 272 já vêm de claro-tokens.css (eram 760 / 246). Aqui só entra a
     trava de viewport, que é o que torna os 880px seguros — sem a âncora no
     cabeçalho (regra acima) essa largura vazava pela esquerda a 1280px. */
  .cl .pop .casc{width:min(880px,calc(100vw - 48px));grid-template-columns:272px 1fr}

  /* O design NÃO tem barra de rolagem dentro do painel (o max-height:340px +
     overflow-y:auto já saiu do token). Sem esse teto, o pilar mais cheio
     (Marca & conteúdo: 9 serviços = 5 linhas em 2 colunas) só cabe na tela se
     a ALTURA DA LINHA for previsível — daí o clamp de 2 linhas no título e na
     descrição mais abaixo. Fecha em ~560px de painel, com folga em 720px de
     viewport. O max-height/overflow aqui é cinto de segurança: se alguém
     recolocar o teto no token, o menu não volta a ganhar barra de rolagem. */
  .cl .pop .pan-g{max-height:none;overflow:visible;column-gap:6px;row-gap:4px}

  /* ── TRILHO DE PILARES ────────────────────────────────────────────────────
     O ícone nasce cinza e ACENDE na cor do pilar; antes já vinha colorido, e o
     hover não tinha o que mudar. Fundo e borda continuam vindo do design
     (hex+12 / hex+30), agora por variável em vez de style inline. */
  .cl .rail .dep-ic{flex-shrink:0;color:var(--ink-3);transition:color .2s var(--ease)}
  .cl .rail .dep:hover .dep-ic{color:var(--dc)}
  .cl .rail .dep.on{background:var(--dc-soft);border-color:var(--dc-line)}
  .cl .rail .dep.on .dep-ic,.cl .rail .dep.on .dep-n{color:var(--dc)}

  .cl .pop .pan-h b{color:var(--pa)}

  /* ── ITENS DE SERVIÇO ─────────────────────────────────────────────────────
     Entrada em cascata curta (18ms por item, 144ms no pilar de 9 → nada de
     desfile). fill-mode backwards e NÃO forwards: com forwards, o transform
     final da animação continuaria valendo depois e engoliria o translateX(3px)
     do :hover — bug clássico. */
  @keyframes cl-plin{from{opacity:0;transform:translateY(5px)}}
  .cl .pop .pl{align-items:flex-start;animation:cl-plin .28s var(--ease) backwards;animation-delay:calc(var(--i,0) * 18ms);transition:background .22s var(--ease),transform .22s var(--ease),box-shadow .22s var(--ease)}
  /* Borda por box-shadow inset: pinta a moldura no hover sem os 2px de layout
     que um border de verdade acrescentaria (e sem tremida na grade). */
  .cl .pop .pl:hover,.cl .pop .pl:focus-visible{background:var(--paper-2);transform:translateX(3px);box-shadow:inset 0 0 0 1px var(--pa-line)}

  /* .pl-ic é um <span>: a regra '.cl .pl span' (2 classes + 1 tipo) do token
     venceria '.cl .pl-ic' (2 classes) e trocaria o inline-flex por block, perdendo a
     centralização do ícone — bug que este arquivo já teve. Com 3 classes o
     empate acaba; o !important fica só como cinto de segurança do display. */
  .cl .pop .pl-ic{display:inline-flex!important;margin-top:0;color:var(--pa);background:var(--pa-soft);border-color:var(--pa-line);transition:background .22s var(--ease),border-color .22s var(--ease),color .22s var(--ease),box-shadow .22s var(--ease)}
  /* Mesmo espírito do .glow de claro-tokens.css: no hover o quadradinho vira
     cor sólida do pilar e o ícone vira branco. */
  .cl .pop .pl:hover .pl-ic,.cl .pop .pl:focus-visible .pl-ic{background:var(--pa);border-color:var(--pa);color:#fff;box-shadow:0 8px 18px -10px var(--pa)}

  .cl .pop .pl-tx{min-width:0}
  .cl .pop .pl-t,.cl .pop .pl-d{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
  .cl .pop .pl-t{-webkit-line-clamp:2;transition:color .22s var(--ease)}
  .cl .pop .pl-d{-webkit-line-clamp:2}
  .cl .pop .pl:hover .pl-t,.cl .pop .pl:focus-visible .pl-t{color:var(--pa)}

  /* Affordância: a seta diz que o item leva a uma PÁGINA (/servicos/slug),
     não a uma âncora. Entra deslizando no hover/foco. */
  .cl .pop .pl-go{flex-shrink:0;align-self:center;margin-left:auto;color:var(--pa);opacity:0;transform:translateX(-5px);transition:opacity .22s var(--ease),transform .22s var(--ease)}
  .cl .pop .pl:hover .pl-go,.cl .pop .pl:focus-visible .pl-go{opacity:1;transform:translateX(0)}

  /* ── FOCO DE TECLADO ──────────────────────────────────────────────────────
     Faltava em todo o cabeçalho e no drawer. :focus-visible (não :focus) pra
     não desenhar anel em clique de mouse. */
  .cl .hd :focus-visible,.cl .dw-p :focus-visible{outline:2px solid var(--brand);outline-offset:3px}
  /* Sobre o hero escuro (header ainda transparente) o azul some — anel branco.
     Escopado a .nl>a/.nt/.burger de propósito: os itens do painel ficam sobre
     fundo BRANCO e continuam com o anel colorido da regra seguinte. */
  .cl .hd:not(.on) .nl>a:focus-visible,.cl .hd:not(.on) .nt:focus-visible,.cl .hd:not(.on) .burger:focus-visible{outline-color:#fff}
  .cl .pop :focus-visible{outline-color:var(--pa)}
  /* claro-tokens.css passou a mandar border-radius:8px junto do anel de foco
     global (.cl a/button:focus-visible). Isso ENCOLHE o raio real dos itens
     enquanto eles estão focados — 11px no .pl/.dep/.burger, 10px no .nt, 9px
     nos links do acordeão — e o canto pula na hora do Tab. O contorno já
     acompanha o raio do elemento sozinho; aqui cada raio é reafirmado.
     Correção definitiva: tirar o border-radius:8px daquela regra do token. */
  .cl .hd .nl>a:focus-visible,.cl .hd .nt:focus-visible{border-radius:10px}
  .cl .hd .burger:focus-visible,.cl .pop .dep:focus-visible,.cl .pop .pl:focus-visible{border-radius:11px}
  .cl .dw-p .acc-b a:focus-visible{border-radius:9px}

  /* ── TELA BAIXA ───────────────────────────────────────────────────────────
     O menu de desktop aparece a partir de 1181px de LARGURA, e boa parte
     dessas máquinas é 1366x768 — ~650px de viewport útil. O painel cheio
     (pilar Marca, 5 linhas) fecha em ~657px e roçaria o rodapé da tela. Em vez
     de devolver a barra de rolagem (o que o dono reprovou), ele COMPRIME:
     descrição de 1 linha e menos respiro, caindo pra ~534px. */
  @media(max-height:700px){
    .cl .ni .pop{top:94px}
    .cl .pop .pl{padding:7px 10px}
    .cl .pop .pl-d{-webkit-line-clamp:1}
    .cl .pop .pan-h{padding-bottom:10px}
  }

  /* ── MOVIMENTO REDUZIDO ───────────────────────────────────────────────────
     A animação .pan/cl-pin do token também não estava coberta. */
  @media(prefers-reduced-motion:reduce){
    .cl .pop .pan,.cl .pop .pl{animation:none}
    .cl .pop .pl:hover,.cl .pop .pl:focus-visible{transform:none}
    .cl .pop .pl-go{transform:none;transition:opacity .01ms}
    .cl .ni .pop,.cl .ni .pop.open{transition:opacity .01ms}
  }
`;
