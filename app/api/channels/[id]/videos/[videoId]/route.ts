import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { parseVideoValues } from "@/lib/types"

type Params = { params: Promise<{ id: string; videoId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  const { videoId } = await params
  const body = await request.json()
  const data: { title?: string; values?: string } = {}

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim()
  }
  if (body.values && typeof body.values === "object") {
    data.values = JSON.stringify(body.values)
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
  const { error } = await requireAuth()
  if (error) return error

  const { videoId } = await params
  await prisma.video.delete({ where: { id: videoId } })
  return NextResponse.json({ ok: true })
}
