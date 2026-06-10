import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser, requireChannel } from "@/lib/users"

type Params = { params: Promise<{ user: string; id: string; metricId: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  const { id: channelId, metricId } = await params
  const { error: channelError } = await requireChannel(userId, channelId)
  if (channelError) return channelError

  const metric = await prisma.metric.findUnique({ where: { id: metricId } })

  if (!metric || metric.channelId !== channelId) {
    return NextResponse.json({ error: "Metric not found" }, { status: 404 })
  }

  const metricCount = await prisma.metric.count({ where: { channelId } })
  if (metricCount <= 1) {
    return NextResponse.json({ error: "Cannot delete the last metric" }, { status: 400 })
  }

  const videos = await prisma.video.findMany({ where: { channelId } })
  for (const video of videos) {
    const values = JSON.parse(video.values) as Record<string, number>
    delete values[metric.key]
    await prisma.video.update({
      where: { id: video.id },
      data: { values: JSON.stringify(values) },
    })
  }

  await prisma.metric.delete({ where: { id: metricId } })
  return NextResponse.json({ ok: true })
}
