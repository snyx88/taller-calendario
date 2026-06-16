import { NextResponse, type NextRequest } from "next/server";

// En Next.js 16 el "middleware" pasó a llamarse "Proxy": el archivo debe
// llamarse `proxy` y exportar una función `proxy` (o default). El antiguo
// `middleware.ts` quedó deprecado.
const COOKIE_AUTH = "taller_auth";

export function proxy(request: NextRequest) {
  const tieneSesion = request.cookies.has(COOKIE_AUTH);

  if (!tieneSesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protege todo salvo: /api, archivos internos de Next (_next),
// la propia pantalla /login y cualquier archivo estático (con extensión).
export const config = {
  matcher: ["/((?!api|_next|login|.*\\..*).*)"],
};
