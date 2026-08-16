import { Ctx, ModResult, ok, fail, str, isEmail } from "./_shared";
import { hashPassword, verifyPassword, gerarTokenConvite, hashToken } from "@/lib/auth";
import { ENV_SUPER_ID } from "@/lib/auth-constants";
import { isPapel, modulosDisponiveisPara, MODULOS, type Papel } from "@/lib/permissions";

/* ─────────────────────────────────────────────────────────────────────────────
   Usuários do painel.

   COMO O CONVITE FUNCIONA (e por que não depende de e-mail):
   o projeto não tem provedor de e-mail transacional configurado. Se o convite
   dependesse de envio, ele simplesmente não chegaria — e o dono descobriria
   isso só quando o funcionário reclamasse. Então o super gera o link, ele
   aparece UMA vez na tela, e o dono manda por WhatsApp. Sem dependência nova,
   sem promessa que o sistema não cumpre.

   O que vai para o banco é só o SHA-256 do token. Quem tiver acesso à tabela
   (ou a um dump dela) não consegue usar o convite de ninguém.

   RLS desta tabela é "modo cofre" (`using(false)`): nem `anon` nem
   `authenticated` enxergam UMA linha. Só a service_role — que é justamente
   quem roda este arquivo no servidor. A tabela guarda hash de senha; ninguém
   mais precisa dela.
   ──────────────────────────────────────────────────────────────────────────── */

const CAMPOS = "id,email,name,role,status,allowed_modules,invite_expires_at,last_login_at,created_at";
const VALIDADE_CONVITE_DIAS = 7;
const SENHA_MINIMA = 8;

/** Só aceita módulos que existem E que o papel pode receber. Uma lista vazia
 *  significa "usa o padrão do papel" (grava null). */
function sanearModulos(valor: unknown, role: Papel): string[] | null {
  if (!Array.isArray(valor)) return null;
  const permitidos = new Set<string>(modulosDisponiveisPara(role));
  const limpos = valor.filter((m): m is string => typeof m === "string" && permitidos.has(m));
  return limpos.length > 0 ? Array.from(new Set(limpos)) : null;
}

export async function modUsuarios(action: string, ctx: Ctx): Promise<ModResult> {
  const { supabase, body, user } = ctx;

  switch (action) {
    /* ── Quem sou eu (usado pelo shell do painel) ───────────────────────── */
    case "me": {
      if (!user) return fail("Sessão expirada.", 401);
      return ok({ user, modulosConhecidos: MODULOS });
    }

    /* ── Lista todo mundo ───────────────────────────────────────────────── */
    case "list": {
      const { data, error } = await supabase
        .from("admin_users")
        .select(CAMPOS)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) return fail(error.message, 500);
      return ok({ usuarios: data ?? [] });
    }

    /* ── Convidar ───────────────────────────────────────────────────────── */
    case "invite": {
      if (!user) return fail("Sessão expirada.", 401);
      const email = str(body.email, 160)?.toLowerCase() ?? "";
      const name = str(body.name, 120);
      const role = isPapel(body.role) ? body.role : "operador";
      if (!isEmail(email)) return fail("E-mail inválido.");
      if (!name) return fail("Informe o nome da pessoa.");

      const { data: jaExiste } = await supabase
        .from("admin_users")
        .select("id,status")
        .eq("email", email)
        .maybeSingle();
      if (jaExiste) {
        return fail("Já existe um usuário com este e-mail. Use 'Gerar novo convite' na linha dele.");
      }

      const token = gerarTokenConvite(32);
      const expira = new Date(Date.now() + VALIDADE_CONVITE_DIAS * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          email,
          name,
          role,
          status: "convidado",
          allowed_modules: sanearModulos(body.allowed_modules, role),
          invite_token_hash: hashToken(token),
          invite_expires_at: expira,
          // O break-glass não tem linha na tabela, então não pode virar FK.
          created_by: user.id === ENV_SUPER_ID ? null : user.id,
        })
        .select(CAMPOS);

      if (error || !data?.length) return fail(error?.message || "Não foi possível criar o convite.", 500);

      /* O token aparece UMA vez, aqui. Depois disso só existe o hash — nem o
         super consegue recuperá-lo; se perder, gera outro. */
      return ok({
        usuario: data[0],
        link: `/admin/convite?token=${token}`,
        expiraEm: expira,
      });
    }

    /* ── Gerar novo convite para quem já existe ─────────────────────────── */
    case "reset-invite": {
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      const token = gerarTokenConvite(32);
      const expira = new Date(Date.now() + VALIDADE_CONVITE_DIAS * 24 * 60 * 60 * 1000).toISOString();

      /* Volta para "convidado" de propósito: enquanto o novo convite não for
         aceito, a senha antiga não entra (requireUser exige status ativo).
         É o caminho de recuperação de senha do painel. */
      const { data, error } = await supabase
        .from("admin_users")
        .update({ status: "convidado", invite_token_hash: hashToken(token), invite_expires_at: expira })
        .eq("id", id)
        .select(CAMPOS);

      if (error || !data?.length) return fail(error?.message || "Usuário não encontrado.", 404);
      return ok({ usuario: data[0], link: `/admin/convite?token=${token}`, expiraEm: expira });
    }

    /* ── Alterar papel / módulos / status ───────────────────────────────── */
    case "update": {
      if (!user) return fail("Sessão expirada.", 401);
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");

      const { data: atual, error: erroAtual } = await supabase
        .from("admin_users")
        .select("id,role,status")
        .eq("id", id)
        .maybeSingle();
      if (erroAtual || !atual) return fail("Usuário não encontrado.", 404);

      const patch: Record<string, unknown> = {};
      const novoPapel: Papel = isPapel(body.role) ? body.role : (atual.role as Papel);

      if (body.role !== undefined) {
        if (!isPapel(body.role)) return fail("Papel inválido.");
        patch.role = body.role;
      }
      if (body.allowed_modules !== undefined) {
        patch.allowed_modules = sanearModulos(body.allowed_modules, novoPapel);
      } else if (patch.role) {
        // Trocou de papel: os módulos antigos podem não ser permitidos no novo.
        // Volta ao padrão do papel em vez de manter permissão que virou inválida.
        patch.allowed_modules = null;
      }
      if (body.status !== undefined) {
        const s = String(body.status);
        if (!["convidado", "ativo", "bloqueado"].includes(s)) return fail("Status inválido.");
        patch.status = s;
      }
      if (body.name !== undefined) patch.name = str(body.name, 120);

      if (Object.keys(patch).length === 0) return fail("Nada para alterar.");

      /* Trava anti-tiro-no-pé: ninguém se rebaixa nem se bloqueia sozinho —
         seria possível ficar sem nenhum super no sistema. */
      if (id === user.id && (patch.role !== undefined || patch.status !== undefined)) {
        return fail("Você não pode alterar o próprio papel ou status.");
      }
      if (atual.role === "super" && (patch.role !== undefined || patch.status === "bloqueado")) {
        const { count } = await supabase
          .from("admin_users")
          .select("id", { count: "exact", head: true })
          .eq("role", "super")
          .eq("status", "ativo");
        if ((count ?? 0) <= 1) {
          return fail("Este é o único administrador ativo. Promova outra pessoa antes de rebaixar este.");
        }
      }

      const { data, error } = await supabase.from("admin_users").update(patch).eq("id", id).select(CAMPOS);
      if (error || !data?.length) return fail(error?.message || "Não foi possível salvar.", 500);
      return ok({ usuario: data[0] });
    }

    /* ── Excluir ────────────────────────────────────────────────────────── */
    case "delete": {
      if (!user) return fail("Sessão expirada.", 401);
      const id = str(body.id, 60);
      if (!id) return fail("id ausente.");
      if (id === user.id) return fail("Você não pode excluir a si mesmo.");

      const { data: alvo } = await supabase
        .from("admin_users")
        .select("id,role,status")
        .eq("id", id)
        .maybeSingle();
      if (!alvo) return fail("Usuário não encontrado.", 404);

      if (alvo.role === "super" && alvo.status === "ativo") {
        const { count } = await supabase
          .from("admin_users")
          .select("id", { count: "exact", head: true })
          .eq("role", "super")
          .eq("status", "ativo");
        if ((count ?? 0) <= 1) return fail("Este é o único administrador ativo. Não dá para excluir.");
      }

      const { data, error } = await supabase.from("admin_users").delete().eq("id", id).select("id");
      if (error || !data?.length) return fail(error?.message || "Não foi possível excluir.", 500);
      return ok();
    }

    /* ── Trocar a própria senha ─────────────────────────────────────────── */
    case "trocar-senha": {
      if (!user) return fail("Sessão expirada.", 401);
      if (user.id === ENV_SUPER_ID) {
        return fail(
          "Você entrou pelo acesso de emergência (ADMIN_PASSWORD da Vercel), que não tem senha no banco. Convide o seu e-mail como administrador e use esse acesso."
        );
      }
      const atual = str(body.senha_atual, 200) ?? "";
      const nova = str(body.senha_nova, 200) ?? "";
      if (nova.length < SENHA_MINIMA) return fail(`A senha nova precisa ter ao menos ${SENHA_MINIMA} caracteres.`);

      const { data: linha } = await supabase
        .from("admin_users")
        .select("id,password_hash")
        .eq("id", user.id)
        .maybeSingle();
      if (!linha) return fail("Usuário não encontrado.", 404);
      if (!verifyPassword(atual, linha.password_hash as string | null)) return fail("Senha atual incorreta.", 401);

      const { data, error } = await supabase
        .from("admin_users")
        .update({ password_hash: hashPassword(nova) })
        .eq("id", user.id)
        .select("id");
      if (error || !data?.length) return fail(error?.message || "Não foi possível trocar a senha.", 500);
      return ok();
    }

    /* ── PÚBLICA: aceitar o convite e criar a senha ─────────────────────── */
    case "aceitar-convite": {
      const token = str(body.token, 200);
      const senha = str(body.password, 200) ?? "";
      if (!token) return fail("Link de convite inválido.");
      if (senha.length < SENHA_MINIMA) return fail(`A senha precisa ter ao menos ${SENHA_MINIMA} caracteres.`);

      const { data: linha, error } = await supabase
        .from("admin_users")
        .select("id,email,name,status,invite_expires_at")
        .eq("invite_token_hash", hashToken(token))
        .maybeSingle();

      // Mensagem única para token errado E token inexistente: não dá pistas
      // sobre quais convites existem.
      if (error || !linha) return fail("Convite inválido ou já utilizado. Peça um link novo ao administrador.", 404);
      if (linha.status !== "convidado") {
        return fail("Este convite já foi usado. Entre com o seu e-mail e senha.", 409);
      }
      if (!linha.invite_expires_at || new Date(linha.invite_expires_at as string).getTime() < Date.now()) {
        return fail("Convite expirado. Peça um link novo ao administrador.", 410);
      }

      const { data, error: erroSalvar } = await supabase
        .from("admin_users")
        .update({
          password_hash: hashPassword(senha),
          status: "ativo",
          // Queima o token: o mesmo link não vale duas vezes.
          invite_token_hash: null,
          invite_expires_at: null,
        })
        .eq("id", linha.id)
        .eq("status", "convidado") // corrida: dois cliques simultâneos, um só vence
        .select("id,email");

      if (erroSalvar || !data?.length) {
        return fail(erroSalvar?.message || "Não foi possível ativar o acesso.", 500);
      }
      return ok({ email: linha.email });
    }

    default:
      return fail(`Ação desconhecida: ${action}`, 404);
  }
}
