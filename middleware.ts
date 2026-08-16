import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, ROTAS_ADMIN_PUBLICAS } from "@/lib/auth-constants";

/* Presença do cookie é checada na borda; a validação da assinatura é feita
   no servidor (layout do painel e rotas /api) com Node crypto.

   ⚠️ O import vem de `lib/auth-constants`, NÃO de `lib/auth`: o middleware roda
   no runtime edge, onde `node:crypto` não existe. Importar `lib/auth` aqui
   arrasta scrypt e HMAC para o bundle da borda e quebra o build. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
  matcher: ["/admin", "/admin/:path*"],
};
