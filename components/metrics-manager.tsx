"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { MetricDef } from "@/lib/types"

type MetricsManagerProps = {
  metrics: MetricDef[]
  onAdd: (data: { label: string; unit: string }) => Promise<void>
  onRemove: (metricId: string) => Promise<void>
}

export function MetricsManager({ metrics, onAdd, onRemove }: MetricsManagerProps) {
  const [label, setLabel] = useState("")
  const [unit, setUnit] = useState("number")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) {
      setError("Enter a metric name.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await onAdd({ label: label.trim(), unit })
      setLabel("")
      setUnit("number")
    } catch {
      setError("Failed to add metric.")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(metricId: string) {
    setRemovingId(metricId)
    try {
      await onRemove(metricId)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Metrics</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: metric.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-medium">{metric.label}</span>
                <span className="text-xs text-muted-foreground">({metric.unit})</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={metrics.length <= 1 || removingId === metric.id}
                onClick={() => handleRemove(metric.id)}
                aria-label={`Remove ${metric.label}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Add a custom metric</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-metric-label">Name</Label>
              <Input
                id="new-metric-label"
                placeholder="e.g. Likes"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-metric-unit">Type</Label>
              <select
                id="new-metric-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="number">Number</option>
                <option value="percent">Percentage</option>
                <option value="duration">Duration (min)</option>
              </select>
            </div>
          </div>
          {error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div>
            <Button type="submit" variant="outline" disabled={loading} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add metric
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
