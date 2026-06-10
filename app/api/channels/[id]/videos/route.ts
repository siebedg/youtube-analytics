import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  const { id: channelId } = await params
  const body = await request.json()
  const title = typeof body.title === "string" ? body.title.trim() : ""
  const values = body.values

  if (!title) {
    return NextResponse.json({ error: "Video title is required" }, { status: 400 })
  }
  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "Values are required" }, { status: 400 })
  }

  const count = await prisma.video.count({ where: { channelId } })
  const video = await prisma.video.create({
    data: {
      channelId,
      title,
      values: JSON.stringify(values),
      sortOrder: count,
    },
  })

  return NextResponse.json(
    { id: video.id, title: video.title, values, sortOrder: video.sortOrder },
    { status: 201 },
  )
}
