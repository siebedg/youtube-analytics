"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { MetricDef } from "@/lib/types"

export type ChartRow = {
  video: string
  [key: string]: string | number
}

const labelStyle = { fontSize: 11, fontWeight: 600 }

function buildChartConfig(metrics: MetricDef[]) {
  return Object.fromEntries(
    metrics.map((m) => [m.key, { label: m.label, color: m.color }]),
  )
}

function isLargeScaleMetric(metric: MetricDef) {
  return metric.unit === "number" && metric.key === "views"
}

export function PerformanceChart({
  data,
  metrics,
  visible,
}: {
  data: ChartRow[]
  metrics: MetricDef[]
  visible: Record<string, boolean>
}) {
  const activeMetrics = metrics.filter((m) => visible[m.key])
  const chartConfig = buildChartConfig(activeMetrics)
  const largeScale = activeMetrics.filter(isLargeScaleMetric)
  const smallScale = activeMetrics.filter((m) => !isLargeScaleMetric(m))

  if (activeMetrics.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Select at least one metric to display the chart.
      </p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[460px] w-full">
      <LineChart data={data} margin={{ top: 32, right: 24, left: 8, bottom: 24 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="video"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          interval={0}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        {largeScale.length > 0 ? (
          <YAxis
            yAxisId="large"
            orientation="left"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: largeScale[0].color }}
            label={{
              value: largeScale.map((m) => m.label).join(" / "),
              angle: -90,
              position: "insideLeft",
              style: { fill: largeScale[0].color, fontSize: 12, fontWeight: 600 },
            }}
          />
        ) : null}
        {smallScale.length > 0 ? (
          <YAxis
            yAxisId="small"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            label={{
              value: smallScale.map((m) => m.label).join(" / "),
              angle: 90,
              position: "insideRight",
              style: { fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 },
            }}
          />
        ) : null}
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
        {activeMetrics.map((metric) => (
          <Line
            key={metric.key}
            yAxisId={isLargeScaleMetric(metric) ? "large" : "small"}
            type="monotone"
            dataKey={metric.key}
            stroke={`var(--color-${metric.key})`}
            strokeWidth={2.5}
            dot={{ r: 4, fill: `var(--color-${metric.key})` }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey={metric.key}
              position="top"
              offset={10}
              fill={`var(--color-${metric.key})`}
              style={labelStyle}
            />
          </Line>
        ))}
      </LineChart>
    </ChartContainer>
  )
}
