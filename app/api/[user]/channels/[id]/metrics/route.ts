import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser, requireChannel } from "@/lib/users"
import { slugifyKey } from "@/lib/types"

type Params = { params: Promise<{ user: string; id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { userId, error } = await requireUser(params)
  if (error) return error

  const { id: channelId } = await params
  const { error: channelError } = await requireChannel(userId, channelId)
  if (channelError) return channelError

  const body = await request.json()
  const label = typeof body.label === "string" ? body.label.trim() : ""
  const unit = body.unit === "percent" || body.unit === "duration" ? body.unit : "number"
  const color = typeof body.color === "string" ? body.color : "oklch(0.6 0.15 280)"

  if (!label) {
    return NextResponse.json({ error: "Metric label is required" }, { status: 400 })
  }

  let key = typeof body.key === "string" && body.key.trim() ? body.key.trim() : slugifyKey(label)
  const existing = await prisma.metric.findMany({ where: { channelId }, select: { key: true } })
  const usedKeys = new Set(existing.map((m) => m.key))
  if (usedKeys.has(key)) {
    let i = 2
    while (usedKeys.has(`${key}_${i}`)) i++
    key = `${key}_${i}`
  }

  const count = await prisma.metric.count({ where: { channelId } })
  const metric = await prisma.metric.create({
    data: { channelId, key, label, color, unit, sortOrder: count },
  })

  return NextResponse.json(
    {
      id: metric.id,
      key: metric.key,
      label: metric.label,
      color: metric.color,
      unit: metric.unit,
      sortOrder: metric.sortOrder,
    },
    { status: 201 },
  )
}
