import { NextResponse, type NextRequest } from "next/server"
import { verifySessionToken } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value
  const session = token ? await verifySessionToken(token) : null

  const { pathname } = request.nextUrl
  const isLogin = pathname === "/login"

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.png$).*)"],
}
