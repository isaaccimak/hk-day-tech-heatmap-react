import { useMemo, type CSSProperties } from 'react'
import './HeatmapGrid.css'

type HeatmapGridProps = {
  values: number[]
  rawCounts?: number[]
  maxColumns?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function HeatmapGrid({
  values,
  rawCounts = [],
  maxColumns = 5,
}: HeatmapGridProps) {
  const { min, max } = useMemo(() => {
    if (!values.length) {
      return { min: 0, max: 0 }
    }
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [values])

  const getColor = (value: number) => {
    if (!Number.isFinite(value) || min === max) {
      return 'hsl(210, 20%, 90%)'
    }
    const ratio = clamp((value - min) / (max - min), 0, 1)
    const hue = 210 - ratio * 210 // 210 (cool) → 0 (warm)
    const lightness = 80 - ratio * 30
    return `hsl(${hue}, 70%, ${lightness}%)`
  }

  const gridStyle = {
    '--grid-columns': Math.min(values.length || 1, maxColumns),
  } as CSSProperties & Record<'--grid-columns', number>

  return (
    <div className="heatmap-grid" style={gridStyle}>
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="heatmap-cell"
          style={{ backgroundColor: getColor(value) }}
        >
          <span className="heatmap-label">#{index + 1}</span>
          <span className="heatmap-value">
            {Number.isFinite(value) ? value.toFixed(2) : '—'}
          </span>
          {rawCounts[index] !== undefined && (
            <span className="heatmap-subtext">
              {Number.isFinite(rawCounts[index])
                ? rawCounts[index].toLocaleString()
                : '—'}
              <small> raw</small>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default HeatmapGrid
