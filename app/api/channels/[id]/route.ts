import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { mapChannel } from "@/lib/channel-mapper"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const data: { name?: string; color?: string } = {}

  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim()
  }
  if (typeof body.color === "string") {
    data.color = body.color
  }

  const channel = await prisma.channel.update({
    where: { id },
    data,
    include: { metrics: true, videos: true },
  })

  return NextResponse.json(mapChannel(channel))
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const count = await prisma.channel.count()
  if (count <= 1) {
    return NextResponse.json({ error: "Cannot delete the last channel" }, { status: 400 })
  }

  await prisma.channel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
