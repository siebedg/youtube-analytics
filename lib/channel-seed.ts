import { prisma } from "@/lib/prisma"
import { DEFAULT_METRICS } from "@/lib/types"

const SEED_VIDEOS = [
  { title: "The Psychology of Carl Jung", values: { views: 162, ctr: 3.4, apv: 14.9, avd: 5.3 } },
  { title: "Persona", values: { views: 111, ctr: 7.2, apv: 19.8, avd: 3.25 } },
  { title: "The Shadow", values: { views: 262, ctr: 2.8, apv: 24.6, avd: 2.95 } },
]

export async function ensureDefaultChannels() {
  const count = await prisma.channel.count()
  if (count > 0) return

  const channel = await prisma.channel.create({
    data: {
      name: "Channel 1",
      color: "oklch(0.58 0.22 27)",
      sortOrder: 0,
      metrics: {
        create: DEFAULT_METRICS.map((m, i) => ({ ...m, sortOrder: i })),
      },
      videos: {
        create: SEED_VIDEOS.map((v, i) => ({
          title: v.title,
          values: JSON.stringify(v.values),
          sortOrder: i,
        })),
      },
    },
  })

  await prisma.channel.create({
    data: {
      name: "Channel 2",
      color: "oklch(0.55 0.18 250)",
      sortOrder: 1,
      metrics: {
        create: DEFAULT_METRICS.map((m, i) => ({ ...m, sortOrder: i })),
      },
      videos: {
        create: [],
      },
    },
  })

  return channel
}
