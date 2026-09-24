import type { Check, Service, ServiceStatus } from '#/server/services.types'

export function displayStatus(service: Service): ServiceStatus {
  return service.isEnabled ? service.status : 'paused'
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function timeAgo(iso: string | null) {
  if (!iso) return 'Never'
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit)
    }
  }
  return seconds > 0 ? 'In a moment' : 'Just now'
}

export function formatLatency(ms: number | null) {
  return ms === null ? '—' : `${ms.toLocaleString()}ms`
}

const dots: Record<ServiceStatus, string> = {
  warm: 'success',
  cold: 'cold',
  warming: 'cold',
  down: 'failed',
  sleeping: 'idle',
  paused: 'idle',
}

export function checkDot(check: Check) {
  return `activity-dot activity-dot--${dots[check.status]}`
}

export function checkSummary(check: Check) {
  switch (check.status) {
    case 'cold':
      return 'Cold start detected'
    case 'warming':
      return `Service waking up (${check.responseStatus})`
    case 'down':
      return (
        check.errorMessage ??
        (check.responseStatus
          ? `Server error (${check.responseStatus})`
          : 'Check failed')
      )
    default:
      return 'Responded normally'
  }
}
