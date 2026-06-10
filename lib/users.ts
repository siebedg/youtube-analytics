import { NextResponse } from "next/server"

export const USERS = ["zenex", "jojoh"] as const

export type UserSlug = (typeof USERS)[number]

export function parseUserSlug(input: string): UserSlug | null {
  const slug = input.trim().toLowerCase()
  if (slug === "zenex" || slug === "jojoh") return slug
  return null
}

export function displayName(slug: UserSlug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export async function requireUser(params: Promise<{ user: string }>) {
  const { user } = await params
  const userId = parseUserSlug(user)
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }
  return { userId, error: null }
}

export async function requireChannel(userId: UserSlug, channelId: string) {
  const { prisma } = await import("@/lib/prisma")
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, userId },
  })

  if (!channel) {
    return { channel: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  return { channel, error: null }
}
