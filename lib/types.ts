export type MetricUnit = "number" | "percent" | "duration"

export type MetricDef = {
  id: string
  key: string
  label: string
  color: string
  unit: MetricUnit
  sortOrder: number
}

export type VideoStat = {
  id: string
  title: string
  values: Record<string, number>
  sortOrder: number
}

export type ChannelData = {
  id: string
  name: string
  color: string
  sortOrder: number
  metrics: MetricDef[]
  videos: VideoStat[]
}

export const DEFAULT_METRICS: Omit<MetricDef, "id" | "sortOrder">[] = [
  { key: "views", label: "Views", color: "oklch(0.58 0.22 27)", unit: "number" },
  { key: "ctr", label: "CTR (%)", color: "oklch(0.55 0.18 250)", unit: "percent" },
  { key: "apv", label: "APV (%)", color: "oklch(0.62 0.17 150)", unit: "percent" },
  { key: "avd", label: "AVD (min)", color: "oklch(0.68 0.16 65)", unit: "duration" },
]

export const CHANNEL_COLORS = [
  "oklch(0.58 0.22 27)",
  "oklch(0.55 0.18 250)",
  "oklch(0.62 0.17 150)",
  "oklch(0.68 0.16 65)",
  "oklch(0.65 0.2 320)",
  "oklch(0.7 0.15 200)",
]

export function parseVideoValues(raw: string): Record<string, number> {
  try {
    return JSON.parse(raw) as Record<string, number>
  } catch {
    return {}
  }
}

export function formatMetricValue(value: number, unit: MetricUnit): string {
  if (unit === "duration") {
    const minutes = Math.floor(value)
    const seconds = Math.round((value - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
  if (unit === "percent") return `${value}%`
  return value.toLocaleString()
}

export function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32) || "metric"
}
