import type { Channel, Metric, Video } from "@prisma/client"
import { parseVideoValues, type ChannelData } from "@/lib/types"

type ChannelWithRelations = Channel & {
  metrics: Metric[]
  videos: Video[]
}

export function mapChannel(channel: ChannelWithRelations): ChannelData {
  return {
    id: channel.id,
    name: channel.name,
    color: channel.color,
    sortOrder: channel.sortOrder,
    metrics: channel.metrics
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => ({
        id: m.id,
        key: m.key,
        label: m.label,
        color: m.color,
        unit: m.unit as "number" | "percent" | "duration",
        sortOrder: m.sortOrder,
      })),
    videos: channel.videos
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((v) => ({
        id: v.id,
        title: v.title,
        values: parseVideoValues(v.values),
        sortOrder: v.sortOrder,
      })),
  }
}
