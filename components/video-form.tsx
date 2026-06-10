"use client"

import { useEffect, useState } from "react"
import { Plus, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { MetricDef, VideoStat } from "@/lib/types"

type VideoFormProps = {
  metrics: MetricDef[]
  initial?: VideoStat | null
  onSubmit: (data: { title: string; values: Record<string, number> }) => Promise<void>
  onCancel?: () => void
}

function emptyValues(metrics: MetricDef[]) {
  return Object.fromEntries(metrics.map((m) => [m.key, ""]))
}

export function VideoForm({ metrics, initial, onSubmit, onCancel }: VideoFormProps) {
  const isEdit = !!initial
  const [title, setTitle] = useState(initial?.title ?? "")
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (initial) {
      return Object.fromEntries(metrics.map((m) => [m.key, String(initial.values[m.key] ?? "")]))
    }
    return emptyValues(metrics)
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) {
      setTitle(initial.title)
      setValues(
        Object.fromEntries(metrics.map((m) => [m.key, String(initial.values[m.key] ?? "")])),
      )
    } else {
      setTitle("")
      setValues(emptyValues(metrics))
    }
  }, [initial, metrics])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please enter a video title.")
      return
    }

    const parsed: Record<string, number> = {}
    for (const metric of metrics) {
      const raw = values[metric.key]
      const num = Number(raw)
      if (raw === "" || Number.isNaN(num) || num < 0) {
        setError(`Please enter a valid number for ${metric.label}.`)
        return
      }
      parsed[metric.key] = num
    }

    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), values: parsed })
      if (!isEdit) {
        setTitle("")
        setValues(emptyValues(metrics))
      }
      setError("")
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const stepFor = (unit: string) => (unit === "number" ? "1" : "0.1")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{isEdit ? "Edit Video" : "Add a Video"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="video-title">Video title</Label>
            <Input
              id="video-title"
              placeholder="e.g. The Psychology of Carl Jung"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex flex-col gap-2">
                <Label htmlFor={`metric-${metric.key}`}>{metric.label}</Label>
                <Input
                  id={`metric-${metric.key}`}
                  type="number"
                  min="0"
                  step={stepFor(metric.unit)}
                  placeholder="0"
                  value={values[metric.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [metric.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          {error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {isEdit ? (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add video
                </>
              )}
            </Button>
            {isEdit && onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
