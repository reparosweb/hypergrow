import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, ROTAS_ADMIN_PUBLICAS } from "@/lib/auth-constants";

/* Presença do cookie é checada na borda; a validação da assinatura é feita
   no servidor (layout do painel e rotas /api) com Node crypto.

   ⚠️ O import vem de `lib/auth-constants`, NÃO de `lib/auth`: o middleware roda
   no runtime edge, onde `node:crypto` não existe. Importar `lib/auth` aqui
   arrasta scrypt e HMAC para o bundle da borda e quebra o build.

   ── HYPER QR CODE — redirecionamento dinâmico (2026-09-11) ──────────────────
   `/q/{codigo}` é a URL que vai pra dentro de TODO QR Code impresso do
   produto. Roda aqui (Edge Runtime) por dois motivos: (1) sem cold start,
   scan de QR não pode ter latência de function fria; (2) historicamente Edge
   Middleware não entra na contagem de 12 funções serverless da Vercel Hobby
   — o site já usa 9 das 12 (cada route.ts dentro de app/api conta 1; ver o
   CLAUDE.md do projeto para a lista exata).
   Isso é uma PRESUNÇÃO documentada no plano aprovado, não 100% confirmada
   pela Vercel para volume alto — se um dia se provar errada, o plano B é
   mover isto para app/q/[codigo]/route.ts (uma 10ª function dedicada, ainda
   dentro do limite).

   Só tipos REDIRECIONÁVEIS (link/whatsapp/instagram/pdf) saem daqui direto
   pro destino. Pix/Wi-Fi/vCard/texto não são URL — não dá pra "redirecionar"
   pra uma senha de Wi-Fi — esses caem em app/q/[codigo]/page.tsx, que
   renderiza o conteúdo. Buscar por REST direto (fetch), não pelo cliente
   `@supabase/supabase-js` de lib/supabase.ts: mais previsível em Edge e evita
   qualquer risco de import Node-only escondido numa versão futura da lib. */
const HQR_TIPOS_REDIRECIONAVEIS = new Set(["link", "whatsapp", "instagram", "pdf"]);

type HqrConteudoPublico = {
  id: string;
  tipo: string;
  titulo: string;
  conteudo: Record<string, unknown>;
  cor_frente: string;
  cor_fundo: string;
  logo_url: string | null;
};

function hqrDestinoDoConteudo(tipo: string, conteudo: Record<string, unknown>): string | null {
  // Cada tipo redirecionável guarda o destino num campo próprio em `conteudo`
  // (jsonb) — contrato fechado aqui, o editor (Passo 3) escreve nesse formato.
  switch (tipo) {
    case "link":
      return typeof conteudo.url === "string" ? conteudo.url : null;
    case "instagram":
      return typeof conteudo.usuario === "string" ? `https://instagram.com/${conteudo.usuario}` : null;
    case "pdf":
      return typeof conteudo.arquivoUrl === "string" ? conteudo.arquivoUrl : null;
    case "whatsapp": {
      const numero = typeof conteudo.numero === "string" ? conteudo.numero.replace(/\D/g, "") : "";
      if (!numero) return null;
      const msg = typeof conteudo.mensagem === "string" ? conteudo.mensagem : "";
      return `https://wa.me/${numero}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
    }
    default:
      return null;
  }
}

async function hqrBuscarQrCodePublico(codigo: string): Promise<HqrConteudoPublico | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // sem env configurada: nunca quebra o site, só não redireciona dinâmico

  try {
    const r = await fetch(`${url}/rest/v1/rpc/hqr_buscar_qrcode_publico`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_codigo: codigo }),
    });
    if (!r.ok) return null;
    const linhas = (await r.json()) as HqrConteudoPublico[];
    return linhas?.[0] ?? null;
  } catch {
    return null; // Supabase fora do ar: cai no "não encontrado", nunca derruba o site inteiro
  }
}

async function hqrRegistrarScan(codigo: string, req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const pais = req.headers.get("x-vercel-ip-country") || null;
  const cidade = req.headers.get("x-vercel-ip-city") || null;
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const dispositivo = /mobile|android|iphone/.test(ua) ? "mobile" : /tablet|ipad/.test(ua) ? "tablet" : ua ? "desktop" : "outro";
  let refererHost: string | null = null;
  try {
    const ref = req.headers.get("referer");
    refererHost = ref ? new URL(ref).host : null;
  } catch {
    refererHost = null;
  }

  // Fogo-e-esquece: nunca aguardamos esta chamada (o redirect já aconteceu).
  // Se falhar, perde-se 1 registro de analytics — nunca o scan em si.
  void fetch(`${url}/rest/v1/rpc/hqr_registrar_scan`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_codigo: codigo, p_pais: pais, p_cidade: cidade, p_dispositivo: dispositivo, p_referer_host: refererHost }),
  }).catch(() => {});
}

async function hqrMiddleware(req: NextRequest): Promise<NextResponse> {
  const codigo = req.nextUrl.pathname.replace(/^\/q\//, "");
  if (!codigo) return NextResponse.next();

  const qr = await hqrBuscarQrCodePublico(codigo);
  if (!qr || !HQR_TIPOS_REDIRECIONAVEIS.has(qr.tipo)) {
    // Não encontrado, pausado, ou tipo interstitial (pix/wifi/vcard/texto):
    // deixa passar para app/q/[codigo]/page.tsx decidir o que mostrar.
    return NextResponse.next();
  }

  const destino = hqrDestinoDoConteudo(qr.tipo, qr.conteudo);
  if (!destino) return NextResponse.next(); // conteúdo mal formado: página mostra o erro, não o middleware

  // event.waitUntil não existe fora de rotas serverless; aqui disparamos sem
  // `await` mesmo — o runtime Edge da Vercel mantém a função viva até
  // promises pendentes resolverem, mesmo após a resposta já ter sido enviada.
  void hqrRegistrarScan(codigo, req);

  return NextResponse.redirect(destino, 307);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/q/")) {
    return hqrMiddleware(req);
  }

  const publica = ROTAS_ADMIN_PUBLICAS.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (pathname.startsWith("/admin") && !publica) {
    const cookie = req.cookies.get(ADMIN_COOKIE);
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/q/:path*"],
};
