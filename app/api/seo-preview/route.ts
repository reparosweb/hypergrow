import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   /api/seo-preview — lê o <title> e a <meta description> de uma URL pública.

   POR QUE ESTA ROTA EXISTE (e por que NÃO é client-side como as outras
   ferramentas): o navegador bloqueia, por segurança (CORS), um site ler o HTML
   de OUTRO site. Então o "cole a URL e a ferramenta identifica sozinha" que o
   simulador de SERP promete SÓ é possível com o servidor buscando a página.
   O resto do simulador (contagem, largura em pixel, prévia) continua 100% no
   navegador — só a leitura da página passa por aqui.

   ⚠️ SEGURANÇA — SSRF é o risco central desta rota, e é obrigatório tratar.
   Um endpoint público que busca uma URL ARBITRÁRIA pode ser abusado para fazer
   o servidor bater em serviços internos (banco, painel) ou no endpoint de
   metadados da nuvem (169.254.169.254, que entrega credenciais). As defesas:
   · só http/https;
   · resolve o host em IP e RECUSA qualquer IP privado/reservado/loopback/
     link-local — inclusive seguindo cada redirect e revalidando o destino,
     porque "redirecionar para um IP interno" é o bypass clássico de SSRF;
   · timeout curto, teto de bytes lidos, sem baixar a página inteira;
   · devolve só texto (título/descrição), nunca o corpo bruto.
   ──────────────────────────────────────────────────────────────────────────── */

const TIMEOUT_MS = 6000;
const MAX_BYTES = 512 * 1024; // 512 KB — title/meta ficam sempre no começo do HTML
const MAX_REDIRECTS = 3;
const UA = "HyperGrowSEOPreview/1.0 (+https://hypergrow-lovat.vercel.app/ferramentas/simulador-google)";

/** IPv4/IPv6 privado, reservado, loopback ou link-local. Bloqueia o range de
 *  metadados da nuvem (169.254/16) junto com o resto do link-local. */
function ipPrivado(ip: string): boolean {
  const tipo = isIP(ip);
  if (tipo === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;            // link-local + metadados
    if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16/12
    if (a === 192 && b === 168) return true;            // 192.168/16
    if (a === 192 && b === 0) return true;              // 192.0.0/24, 192.0.2/24
    if (a === 100 && b >= 64 && b <= 127) return true;  // CGNAT 100.64/10
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;                          // multicast + reservado
    return false;
  }
  if (tipo === 6) {
    const baixo = ip.toLowerCase();
    if (baixo === "::1" || baixo === "::") return true;
    if (baixo.startsWith("fe80") || baixo.startsWith("fc") || baixo.startsWith("fd")) return true;
    // IPv4 mapeado em IPv6 (::ffff:169.254.169.254): desembrulha e reavalia.
    const m = baixo.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return ipPrivado(m[1]);
    return false;
  }
  return true; // não é IP válido: nega por padrão
}

/** Confere que o host da URL resolve SÓ para IPs públicos. Recusa localhost e
 *  qualquer coisa que resolva para IP privado. */
async function hostSeguro(u: URL): Promise<boolean> {
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    return false;
  }
  // Host já é um IP literal: checa direto.
  if (isIP(host)) return !ipPrivado(host);
  try {
    const enderecos = await lookup(host, { all: true });
    if (enderecos.length === 0) return false;
    return enderecos.every((e) => !ipPrivado(e.address));
  } catch {
    return false;
  }
}

/** Baixa o começo do HTML (até MAX_BYTES), seguindo redirects mas revalidando
 *  cada destino. Devolve o texto ou null. */
async function lerInicioDoHtml(urlInicial: string): Promise<string | null> {
  let urlAtual = urlInicial;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let u: URL;
    try {
      u = new URL(urlAtual);
    } catch {
      return null;
    }
    if (!(await hostSeguro(u))) return null;

    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(u.toString(), {
        method: "GET",
        redirect: "manual", // seguimos na mão para revalidar cada salto
        signal: controle.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      });
    } catch {
      clearTimeout(timer);
      return null;
    }
    clearTimeout(timer);

    // Redirect: revalida o destino no próximo giro do laço.
    if (res.status >= 300 && res.status < 400) {
      const destino = res.headers.get("location");
      if (!destino) return null;
      try {
        urlAtual = new URL(destino, u).toString();
      } catch {
        return null;
      }
      continue;
    }

    if (!res.ok) return null;
    const tipo = res.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(tipo) && tipo !== "") return null;
    if (!res.body) return null;

    // Lê só até MAX_BYTES — title/meta moram no <head>, no começo do arquivo.
    const reader = res.body.getReader();
    const pedacos: Uint8Array[] = [];
    let total = 0;
    try {
      while (total < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          pedacos.push(value);
          total += value.length;
        }
      }
    } catch {
      return null;
    } finally {
      try {
        await reader.cancel();
      } catch {
        /* fim do stream, ignorar */
      }
    }
    return new TextDecoder("utf-8", { fatal: false }).decode(concatenar(pedacos));
  }
  return null; // excedeu o limite de redirects
}

function concatenar(pedacos: Uint8Array[]): Uint8Array {
  const total = pedacos.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of pedacos) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

/** Desfaz as entidades HTML mais comuns nos textos de título/descrição. */
function decodificar(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function pegarMeta(html: string, chave: "name" | "property", valor: string): string {
  // Ordem dos atributos varia; tenta content antes e depois do name/property.
  const escapado = valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re1 = new RegExp(`<meta[^>]*\\b${chave}=["']${escapado}["'][^>]*\\bcontent=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]*\\bcontent=["']([^"']*)["'][^>]*\\b${chave}=["']${escapado}["']`, "i");
  const m = html.match(re1) || html.match(re2);
  return m ? decodificar(m[1]) : "";
}

export async function GET(req: NextRequest) {
  const bruta = (req.nextUrl.searchParams.get("url") || "").trim();
  if (!bruta) {
    return NextResponse.json({ error: "Informe o endereço da página." }, { status: 400 });
  }

  const comEsquema = /^https?:\/\//i.test(bruta) ? bruta : "https://" + bruta;
  let u: URL;
  try {
    u = new URL(comEsquema);
  } catch {
    return NextResponse.json({ error: "Endereço inválido. Confira se digitou certo." }, { status: 400 });
  }

  if (!(await hostSeguro(u))) {
    return NextResponse.json(
      { error: "Não é possível analisar este endereço (só páginas públicas na internet)." },
      { status: 400 }
    );
  }

  const html = await lerInicioDoHtml(u.toString());
  if (html === null) {
    return NextResponse.json(
      { error: "Não consegui abrir essa página. Ela pode estar fora do ar, bloquear leitura automática, ou não ser uma página HTML." },
      { status: 502 }
    );
  }

  const tituloTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titulo = tituloTag ? decodificar(tituloTag[1]) : pegarMeta(html, "property", "og:title");
  const descricao =
    pegarMeta(html, "name", "description") || pegarMeta(html, "property", "og:description");

  if (!titulo && !descricao) {
    return NextResponse.json(
      { error: "A página abriu, mas não tem título nem descrição para ler. Você pode preencher na mão." },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json(
    { titulo, descricao, url: u.toString() },
    { headers: { "cache-control": "no-store" } }
  );
}
