import { NextResponse, type NextRequest } from "next/server";

// Senha de acesso: defina APP_SENHA nas variáveis de ambiente do Vercel.
// Usuário pode ser qualquer um; só a senha é conferida.
export function middleware(req: NextRequest) {
  const senha = process.env.APP_SENHA;
  if (!senha) return NextResponse.next();
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Basic ")) {
    const [, pass] = atob(auth.slice(6)).split(":");
    if (pass === senha) return NextResponse.next();
  }
  return new NextResponse("Acesso restrito", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Radar GMN"' } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
