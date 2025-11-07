import { useCallback, useEffect, useMemo, useState } from 'react'
import HeatmapGrid from './components/HeatmapGrid'
import './App.css'

const API_URL = 'http://192.168.0.205:8000/heatmap'

type HeatmapResponse = {
  updated_at: string | null
  heat_values: number[]
  raw_counts: number[]
}

function App() {
  const [data, setData] = useState<HeatmapResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHeatmap = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(API_URL, { signal })
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const payload = (await response.json()) as HeatmapResponse
      console.log('payload', payload);
      setData(payload)
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return
      }
      setError((err as Error).message ?? 'Unable to load heatmap data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchHeatmap(controller.signal)
    return () => controller.abort()
  }, [fetchHeatmap])

  const updatedAt = useMemo(() => {
    if (!data?.updated_at) return 'Not available'
    const timestamp = new Date(data.updated_at)
    return Number.isNaN(timestamp.valueOf())
      ? data.updated_at
      : timestamp.toLocaleString()
  }, [data?.updated_at])

  const handleRefresh = () => {
    const controller = new AbortController()
    void fetchHeatmap(controller.signal)
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Heat health monitor</p>
          <h1>Live Activity Heatmap</h1>
          <p className="lede">
            Pulls the latest readings from <code>/heatmap</code> (localhost
            port&nbsp;8000) and visualizes the intensity from cool to warm tones.
          </p>
        </div>
        <button
          className="ghost-button"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </header>

      {error && (
        <div className="status status-error" role="alert">
          {error}
        </div>
      )}

      <section className="panel">
        {isLoading && !data ? (
          <p className="status">Loading heatmap values…</p>
        ) : data && data.heat_values.length ? (
          <HeatmapGrid
            values={data.heat_values}
            rawCounts={data.raw_counts}
          />
        ) : (
          <p className="status">No heat values returned by the API yet.</p>
        )}
      </section>

      <section className="meta">
        <div>
          <p className="label">Updated</p>
          <p className="value">{updatedAt}</p>
        </div>
        {data?.raw_counts?.length ? (
          <div>
            <p className="label">Total raw count</p>
            <p className="value">
              {data.raw_counts
                .reduce((sum, val) => sum + (val ?? 0), 0)
                .toLocaleString()}
            </p>
          </div>
        ) : null}
        <div>
          <p className="label">Samples</p>
          <p className="value">{data?.heat_values.length ?? 0}</p>
        </div>
      </section>
    </div>
  )
}

export default App
