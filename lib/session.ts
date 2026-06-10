import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { PasskeyUser } from "@/lib/passkeys"

const COOKIE_NAME = "session"

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function createSession(userId: PasskeyUser) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.userId
    if (userId === "zenex" || userId === "jojoh") {
      return { userId: userId as PasskeyUser }
    }
    return null
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.userId
    if (userId === "zenex" || userId === "jojoh") {
      return { userId: userId as PasskeyUser }
    }
    return null
  } catch {
    return null
  }
}
