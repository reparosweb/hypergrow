/* ─────────────────────────────────────────────────────────────────────────────
   Constantes da sessão do painel — DE PROPÓSITO sem nenhum import.

   POR QUE ESTE ARQUIVO EXISTE SEPARADO DE `lib/auth.ts`:
   o `middleware.ts` roda no runtime EDGE e importa `ADMIN_COOKIE`. Se ele
   importasse de `lib/auth.ts`, todo o `node:crypto` (scrypt, HMAC) entraria no
   bundle da borda e o build quebraria — `crypto` do Node não existe no edge.
   Aqui só moram valores literais, que qualquer runtime aceita.

   `lib/auth.ts` reexporta o que está aqui, então quem já importava de lá
   continua funcionando sem mudar nada.
   ──────────────────────────────────────────────────────────────────────────── */

/** Nome do cookie httpOnly que guarda o token de sessão do painel. */
export const ADMIN_COOKIE = "hg_admin";

/** Validade da sessão: 12 horas. */
export const SESSAO_TTL_MS = 1000 * 60 * 60 * 12;

/** Caminhos de `/admin` que NÃO exigem sessão (o middleware deixa passar). */
export const ROTAS_ADMIN_PUBLICAS = ["/admin/login", "/admin/convite"];

/* Identidade do "break-glass": quando o dono entra com a ADMIN_PASSWORD da
   Vercel e não existe linha em `admin_users` para aquele e-mail, a sessão sai
   com este id. Não é UUID de propósito — assim nunca colide com um usuário
   real e o código sabe que não deve consultar o banco por ele. */
export const ENV_SUPER_ID = "env-super";
