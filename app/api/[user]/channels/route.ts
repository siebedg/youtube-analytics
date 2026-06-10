import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/users"
import { ensureDefaultChannels } from "@/lib/channel-seed"
import { mapChannel } from "@/lib/channel-mapper"
import { CHANNEL_COLORS, DEFAULT_METRICS } from "@/lib/types"

type Params = { params: Promise<{ user: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  await ensureDefaultChannels(userId)

  const channels = await prisma.channel.findMany({
    where: { userId },
    include: { metrics: true, videos: true },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(channels.map(mapChannel))
}

export async function POST(request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) {
    return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
  }

  const count = await prisma.channel.count({ where: { userId } })
  const channel = await prisma.channel.create({
    data: {
      userId,
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
