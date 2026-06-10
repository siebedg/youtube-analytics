"use client"

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChannelData } from "@/lib/types"

type ComparisonChartProps = {
  channelA: ChannelData
  channelB: ChannelData
  metricKey: string
  metricLabel: string
}

function channelAverage(channel: ChannelData, metricKey: string) {
  if (channel.videos.length === 0) return 0
  const sum = channel.videos.reduce((acc, v) => acc + (v.values[metricKey] ?? 0), 0)
  return sum / channel.videos.length
}

export function ComparisonChart({ channelA, channelB, metricKey, metricLabel }: ComparisonChartProps) {
  const data = [
    {
      name: metricLabel,
      [channelA.name]: channelAverage(channelA, metricKey),
      [channelB.name]: channelAverage(channelB, metricKey),
    },
  ]

  const chartConfig = {
    [channelA.name]: { label: channelA.name, color: channelA.color },
    [channelB.name]: { label: channelB.name, color: channelB.color },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey={channelA.name} fill={channelA.color} radius={[4, 4, 0, 0]} />
        <Bar dataKey={channelB.name} fill={channelB.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
