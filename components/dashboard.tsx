"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Eye,
  MousePointerClick,
  Percent,
  Clock,
  X,
  Pencil,
  Plus,
  GitCompare,
  BarChart3,
  Loader2,
} from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"
import { ComparisonChart } from "@/components/comparison-chart"
import { VideoForm } from "@/components/video-form"
import { MetricsManager } from "@/components/metrics-manager"
import { formatMetricValue, type ChannelData, type VideoStat } from "@/lib/types"

const METRIC_ICONS: Record<string, typeof Eye> = {
  views: Eye,
  ctr: MousePointerClick,
  apv: Percent,
  avd: Clock,
}

type ViewMode = "channel" | "compare"

export function Dashboard() {
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [compareChannelId, setCompareChannelId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("channel")
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [editingVideo, setEditingVideo] = useState<VideoStat | null>(null)
  const [compareMetric, setCompareMetric] = useState("views")
  const [newChannelName, setNewChannelName] = useState("")
  const [renaming, setRenaming] = useState(false)

  const loadChannels = useCallback(async () => {
    const res = await fetch("/api/channels")
    if (!res.ok) return
    const data: ChannelData[] = await res.json()
    setChannels(data)
    setActiveChannelId((prev) => {
      if (prev && data.some((c) => c.id === prev)) return prev
      return data[0]?.id ?? null
    })
    setCompareChannelId((prev) => {
      if (prev && data.some((c) => c.id === prev)) return prev
      return data[1]?.id ?? data[0]?.id ?? null
    })
    setLoading(false)
    return data
  }, [])

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? null
  const compareChannel = channels.find((c) => c.id === compareChannelId) ?? null

  useEffect(() => {
    loadChannels().then((data) => {
      const first = data?.[0]
      if (first) {
        setVisible((prev) => {
          const next = { ...prev }
          for (const m of first.metrics) {
            if (next[m.key] === undefined) next[m.key] = true
          }
          return next
        })
      }
    })
  }, [loadChannels])

  useEffect(() => {
    if (!activeChannel) return
    setVisible((prev) => {
      const next = { ...prev }
      for (const m of activeChannel.metrics) {
        if (next[m.key] === undefined) next[m.key] = true
      }
      return next
    })
  }, [activeChannel])

  const chartData = useMemo(() => {
    if (!activeChannel) return []
    return activeChannel.videos.map((v) => ({
      video: v.title,
      ...v.values,
    }))
  }, [activeChannel])

  const summary = useMemo(() => {
    if (!activeChannel || activeChannel.videos.length === 0) return []
    const count = activeChannel.videos.length
    return activeChannel.metrics.map((metric) => {
      const sum = activeChannel.videos.reduce((acc, v) => acc + (v.values[metric.key] ?? 0), 0)
      const avg = sum / count
      const Icon = METRIC_ICONS[metric.key] ?? BarChart3
      return {
        key: metric.key,
        label: metric.label,
        value: formatMetricValue(
          metric.key === "views" ? sum : avg,
          metric.unit,
        ),
        detail: metric.key === "views" ? `across ${count} videos` : "channel average",
        icon: Icon,
        color: metric.color,
      }
    })
  }, [activeChannel])

  const sharedMetrics = useMemo(() => {
    if (!activeChannel || !compareChannel) return []
    const keysA = new Set(activeChannel.metrics.map((m) => m.key))
    return compareChannel.metrics.filter((m) => keysA.has(m.key))
  }, [activeChannel, compareChannel])

  async function handleAddChannel() {
    const name = newChannelName.trim() || `Channel ${channels.length + 1}`
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return
    const channel: ChannelData = await res.json()
    setNewChannelName("")
    await loadChannels()
    setActiveChannelId(channel.id)
  }

  async function handleRenameChannel() {
    if (!activeChannel) return
    const name = newChannelName.trim()
    if (!name) return
    await fetch(`/api/channels/${activeChannel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setRenaming(false)
    setNewChannelName("")
    await loadChannels()
  }

  async function handleAddVideo(data: { title: string; values: Record<string, number> }) {
    if (!activeChannel) return
    const res = await fetch(`/api/channels/${activeChannel.id}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    await loadChannels()
  }

  async function handleEditVideo(data: { title: string; values: Record<string, number> }) {
    if (!activeChannel || !editingVideo) return
    const res = await fetch(`/api/channels/${activeChannel.id}/videos/${editingVideo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    setEditingVideo(null)
    await loadChannels()
  }

  async function handleRemoveVideo(videoId: string) {
    if (!activeChannel) return
    await fetch(`/api/channels/${activeChannel.id}/videos/${videoId}`, { method: "DELETE" })
    if (editingVideo?.id === videoId) setEditingVideo(null)
    await loadChannels()
  }

  async function handleAddMetric(data: { label: string; unit: string }) {
    if (!activeChannel) return
    const res = await fetch(`/api/channels/${activeChannel.id}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    const metric = await res.json()
    setVisible((prev) => ({ ...prev, [metric.key]: true }))
    await loadChannels()
  }

  async function handleRemoveMetric(metricId: string) {
    if (!activeChannel) return
    const res = await fetch(`/api/channels/${activeChannel.id}/metrics/${metricId}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed")
    await loadChannels()
  }

  function toggleMetric(key: string) {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={activeChannelId === channel.id && viewMode === "channel" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveChannelId(channel.id)
                setViewMode("channel")
                setEditingVideo(null)
              }}
              className="gap-2"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: channel.color }}
                aria-hidden="true"
              />
              {channel.name}
            </Button>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="New channel"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="h-8 w-32"
              onKeyDown={(e) => e.key === "Enter" && handleAddChannel()}
            />
            <Button variant="outline" size="sm" onClick={handleAddChannel} className="gap-1">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "compare" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("compare")}
            disabled={channels.length < 2}
            className="gap-1.5"
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            Compare channels
          </Button>
        </div>
      </div>

      {viewMode === "compare" && activeChannel && compareChannel ? (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Channel Comparison</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Channel A</label>
                  <select
                    value={activeChannelId ?? ""}
                    onChange={(e) => setActiveChannelId(e.target.value)}
                    className="flex h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Channel B</label>
                  <select
                    value={compareChannelId ?? ""}
                    onChange={(e) => setCompareChannelId(e.target.value)}
                    className="flex h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Compare metric</label>
                <select
                  value={compareMetric}
                  onChange={(e) => setCompareMetric(e.target.value)}
                  className="flex h-9 max-w-xs rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {sharedMetrics.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {activeChannelId !== compareChannelId ? (
                <ComparisonChart
                  channelA={activeChannel}
                  channelB={compareChannel}
                  metricKey={compareMetric}
                  metricLabel={
                    sharedMetrics.find((m) => m.key === compareMetric)?.label ?? compareMetric
                  }
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select two different channels to compare.</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {[activeChannel, compareChannel].map((ch) => (
                  <div key={ch.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: ch.color }}
                        aria-hidden="true"
                      />
                      <h3 className="font-semibold">{ch.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ch.videos.length} video{ch.videos.length === 1 ? "" : "s"}
                    </p>
                    {sharedMetrics.map((m) => {
                      const vals = ch.videos.map((v) => v.values[m.key] ?? 0)
                      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
                      return (
                        <p key={m.key} className="text-sm">
                          {m.label}: {formatMetricValue(avg, m.unit)}
                        </p>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeChannel ? (
        <>
          <div className="flex items-center gap-2">
            {renaming ? (
              <>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder={activeChannel.name}
                  className="h-8 max-w-xs"
                />
                <Button size="sm" onClick={handleRenameChannel}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRenaming(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRenaming(true)
                  setNewChannelName(activeChannel.name)
                }}
                className="gap-1.5 text-muted-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Rename {activeChannel.name}
              </Button>
            )}
          </div>

          {summary.length > 0 ? (
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {summary.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.key}>
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-md"
                          style={{ backgroundColor: item.color, color: "var(--background)" }}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </section>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-2">
            <VideoForm
              metrics={activeChannel.metrics}
              initial={editingVideo}
              onSubmit={editingVideo ? handleEditVideo : handleAddVideo}
              onCancel={editingVideo ? () => setEditingVideo(null) : undefined}
            />
            <MetricsManager
              metrics={activeChannel.metrics}
              onAdd={handleAddMetric}
              onRemove={handleRemoveMetric}
            />
          </div>

          <Card>
            <CardHeader className="gap-4">
              <CardTitle className="text-xl">Performance by Metric</CardTitle>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {activeChannel.metrics.map((metric) => (
                  <label
                    key={metric.id}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <Checkbox
                      checked={visible[metric.key] ?? true}
                      onCheckedChange={() => toggleMetric(metric.key)}
                      aria-label={`Toggle ${metric.label}`}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: metric.color }}
                      aria-hidden="true"
                    />
                    {metric.label}
                  </label>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <PerformanceChart
                  data={chartData}
                  metrics={activeChannel.metrics}
                  visible={visible}
                />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Add a video above to see the comparison chart.
                </p>
              )}
            </CardContent>
          </Card>

          {activeChannel.videos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Videos</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {activeChannel.videos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activeChannel.metrics
                          .map((m) => `${formatMetricValue(v.values[m.key] ?? 0, m.unit)} ${m.label}`)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingVideo(v)}
                        aria-label={`Edit ${v.title}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVideo(v.id)}
                        aria-label={`Remove ${v.title}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
