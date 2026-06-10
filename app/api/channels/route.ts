import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { ensureDefaultChannels } from "@/lib/channel-seed"
import { mapChannel } from "@/lib/channel-mapper"
import { CHANNEL_COLORS, DEFAULT_METRICS } from "@/lib/types"

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  await ensureDefaultChannels()

  const channels = await prisma.channel.findMany({
    include: { metrics: true, videos: true },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(channels.map(mapChannel))
}

export async function POST(request: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) {
    return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
  }

  const count = await prisma.channel.count()
  const channel = await prisma.channel.create({
    data: {
      name,
      color: CHANNEL_COLORS[count % CHANNEL_COLORS.length],
      sortOrder: count,
      metrics: {
        create: DEFAULT_METRICS.map((m, i) => ({ ...m, sortOrder: i })),
      },
    },
    include: { metrics: true, videos: true },
  })

  return NextResponse.json(mapChannel(channel), { status: 201 })
}
