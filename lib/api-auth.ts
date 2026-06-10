import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { user, error: null }
}

export async function requireChannel(user: User, channelId: string) {
  const { prisma } = await import("@/lib/prisma")
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, userId: user.id },
  })

  if (!channel) {
    return { channel: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  return { channel, error: null }
}
