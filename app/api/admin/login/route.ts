import { NextRequest, NextResponse } from "next/server";
import { signSession, verifyPassword, segredoIgual, ADMIN_COOKIE, SESSAO_TTL_MS } from "@/lib/auth";
import { ENV_SUPER_ID } from "@/lib/auth-constants";
import { isPapel } from "@/lib/permissions";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────────────────
   Login do painel — agora por E-MAIL + SENHA, contra a tabela `admin_users`.

   ── BREAK-GLASS (acesso de emergência) ──────────────────────────────────────
   Se o e-mail digitado NÃO existe em `admin_users` e a senha bate com a
   variável `ADMIN_PASSWORD` da Vercel, entra uma sessão de administrador com o
   id especial "env-super". Existe por dois motivos concretos:

     1. MIGRAÇÃO — no primeiro deploy a tabela está vazia. Sem isso, ninguém
        entraria para criar o primeiro usuário: o painel nasceria trancado.
     2. RECUPERAÇÃO — se o único administrador perder a senha, ou se um convite
        for gravado errado, este é o caminho de volta sem mexer no banco.

   ⚠️ PARA DESATIVAR O BREAK-GLASS: apague a variável ADMIN_PASSWORD no painel
   da Vercel (Settings → Environment Variables) e faça um novo deploy. Sem ela,
   este caminho para de existir e só e-mail + senha do banco entram. Faça isso
   DEPOIS de já ter um administrador ativo criado pelo fluxo de convite — senão
   você tranca a si mesmo do lado de fora.
   ──────────────────────────────────────────────────────────────────────────── */

const COOKIE_OPCOES = {
  httpOnly: true,
  // "secure" exige HTTPS; em producao (Vercel) NODE_ENV=production e continua true.
  // Sem isso o cookie nunca gruda em localhost e o login local nunca funciona.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSAO_TTL_MS / 1000),
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!password) return NextResponse.json({ error: "Informe a senha." }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });

  const supabase = getServerSupabase();

  /* O e-mail é sempre gravado em minúsculas (mod-usuarios normaliza no convite),
     por isso a busca é `eq` e não `ilike`. Usar ILIKE aqui seria pior: `_` é
     curinga no LIKE do Postgres e é caractere comum em e-mail — "joao_silva@x"
     casaria com endereços de OUTRAS pessoas. */
  /* Tipo NOMEADO, e não `typeof linha` no cast abaixo: como `linha` nasce
     `= null`, o TypeScript já a estreitou para `null` naquele ponto, então
     `data as typeof linha` virava `data as null` e todo acesso a `.status`,
     `.role` etc. depois disso era erro "Property does not exist on type
     'never'". Um tipo com nome próprio não sofre estreitamento. */
  type LinhaUsuario = {
    id: string;
    email: string;
    role: string;
    status: string;
    password_hash: string | null;
  };

  let linha: LinhaUsuario | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("admin_users")
      .select("id,email,role,status,password_hash")
      .eq("email", email)
      .maybeSingle();
    linha = (data as LinhaUsuario | null) ?? null;
  }

  /* ── Caminho 1: usuário existe na tabela ─────────────────────────────── */
  if (linha) {
    if (linha.status === "convidado") {
      return NextResponse.json(
        { error: "Este acesso ainda não foi ativado. Abra o link de convite para criar sua senha." },
        { status: 403 }
      );
    }
    if (linha.status !== "ativo") {
      return NextResponse.json({ error: "Acesso bloqueado. Fale com o administrador." }, { status: 403 });
    }
    if (!verifyPassword(password, linha.password_hash)) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    if (!isPapel(linha.role)) {
      return NextResponse.json({ error: "Papel do usuário inválido. Fale com o administrador." }, { status: 500 });
    }

    // Carimbo de último acesso. Falhar aqui não pode impedir o login.
    try {
      await supabase!.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", linha.id);
    } catch {
      /* silencioso de propósito */
    }

    const res = NextResponse.json({ ok: true, role: linha.role });
    res.cookies.set(ADMIN_COOKIE, signSession(linha.id, linha.role), COOKIE_OPCOES);
    return res;
  }

  /* ── Caminho 2: break-glass pela ADMIN_PASSWORD ──────────────────────── */
  if (envPassword && segredoIgual(password, envPassword)) {
    const res = NextResponse.json({ ok: true, role: "super", breakGlass: true });
    res.cookies.set(ADMIN_COOKIE, signSession(ENV_SUPER_ID, "super"), COOKIE_OPCOES);
    return res;
  }

  if (!envPassword && !supabase) {
    return NextResponse.json(
      { error: "Admin não configurado. Defina ADMIN_PASSWORD e as variáveis do Supabase na Vercel." },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
}
