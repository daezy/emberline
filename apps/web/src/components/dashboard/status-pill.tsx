import type { ServiceStatus } from '#/server/services.types'

const labels: Record<ServiceStatus, string> = {
  warm: 'Warm',
  warming: 'Warming',
  sleeping: 'Sleeping',
  cold: 'Cold start',
  down: 'Down',
  paused: 'Paused',
}

export function StatusPill({ status }: { status: ServiceStatus }) {
  return (
    <span className={`dash-status dash-status--${status}`}>
      <i aria-hidden="true" />
      {labels[status]}
    </span>
  )
}
