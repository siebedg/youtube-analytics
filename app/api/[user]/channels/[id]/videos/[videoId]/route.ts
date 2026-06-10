import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser, requireChannel } from "@/lib/users"
import { parseVideoValues } from "@/lib/types"

type Params = { params: Promise<{ user: string; id: string; videoId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  const { id: channelId, videoId } = await params
  const { error: channelError } = await requireChannel(userId, channelId)
  if (channelError) return channelError

  const body = await request.json()
  const data: { title?: string; values?: string } = {}

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim()
  }
  if (body.values && typeof body.values === "object") {
    data.values = JSON.stringify(body.values)
  }

  const existing = await prisma.video.findFirst({
    where: { id: videoId, channelId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const video = await prisma.video.update({ where: { id: videoId }, data })

  return NextResponse.json({
    id: video.id,
    title: video.title,
    values: parseVideoValues(video.values),
    sortOrder: video.sortOrder,
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  const { id: channelId, videoId } = await params
  const { error: channelError } = await requireChannel(userId, channelId)
  if (channelError) return channelError

  const existing = await prisma.video.findFirst({
    where: { id: videoId, channelId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.video.delete({ where: { id: videoId } })
  return NextResponse.json({ ok: true })
}
