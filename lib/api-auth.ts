import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"
import type { PasskeyUser } from "@/lib/passkeys"

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { user: { id: session.userId as PasskeyUser }, error: null }
}

export async function requireChannel(user: { id: string }, channelId: string) {
  const { prisma } = await import("@/lib/prisma")
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, userId: user.id },
  })

  if (!channel) {
    return { channel: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  return { channel, error: null }
}
