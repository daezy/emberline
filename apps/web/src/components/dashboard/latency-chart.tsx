import type { Check } from '#/server/services.types'
import { timeAgo } from './service-display'

export function LatencyChart({ checks }: { checks: Array<Check> }) {
  const points = checks.filter((check) => check.latencyMs !== null).reverse()
  const latencies = points.map((check) => check.latencyMs!)
  const width = 720
  const height = 220
  const max = Math.max(...latencies) * 1.08
  const min = Math.min(...latencies) * 0.85
  const range = max - min || 1
  const coords = latencies.map((latency, index) => ({
    x: (index / (latencies.length - 1)) * width,
    y: height - ((latency - min) / range) * (height - 24) - 12,
  }))
  const line = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const area = `${line} L ${width} ${height} L 0 ${height} Z`

  return (
    <div
      className="latency-chart"
      aria-label={`Latency over the last ${latencies.length} checks`}
    >
      <div className="chart-y-labels">
        <span>{Math.round(max).toLocaleString()}ms</span>
        <span>{Math.round((max + min) / 2).toLocaleString()}ms</span>
        <span>{Math.round(min).toLocaleString()}ms</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="latency-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff6422" stopOpacity=".25" />
            <stop offset="1" stopColor="#ff6422" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          <line x1="0" y1="12" x2={width} y2="12" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} />
          <line x1="0" y1={height - 1} x2={width} y2={height - 1} />
        </g>
        <path className="chart-area" d={area} />
        <path className="chart-line" d={line} />
        {coords.map((point, index) => (
          <circle
            className={
              points[index].coldStartSuspected
                ? 'chart-point chart-point--cold'
                : 'chart-point'
            }
            key={points[index].id}
            cx={point.x}
            cy={point.y}
            r="3"
          />
        ))}
      </svg>
      <div className="chart-x-labels">
        <span>{timeAgo(points[0].checkedAt)}</span>
        <span>{timeAgo(points[points.length - 1].checkedAt)}</span>
      </div>
    </div>
  )
}
