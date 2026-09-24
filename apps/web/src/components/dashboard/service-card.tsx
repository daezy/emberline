import { Link } from '@tanstack/react-router'

import type { Service } from '#/server/services.types'
import { ArrowUpRight, Clock3 } from './icons'
import { displayStatus, timeAgo } from './service-display'
import { StatusPill } from './status-pill'

export function ServiceCard({
  service,
  projectName,
}: {
  service: Service
  projectName?: string
}) {
  const status = displayStatus(service)

  return (
    <article className="service-card">
      <div className="service-card__top">
        <StatusPill status={status} />
      </div>
      <div className="service-card__identity">
        <span className={`service-glyph service-glyph--${status}`}>
          <span />
        </span>
        <div>
          <Link
            to="/dashboard/services/$serviceId"
            params={{ serviceId: service.id }}
          >
            {service.name}
            <ArrowUpRight size={14} />
          </Link>
          <code>{service.endpoint}</code>
        </div>
      </div>
      <div className="service-card__footer">
        <span>
          <Clock3 size={13} /> Last checked {timeAgo(service.lastCheckedAt)}
        </span>
        {projectName && <span>{projectName}</span>}
      </div>
    </article>
  )
}
