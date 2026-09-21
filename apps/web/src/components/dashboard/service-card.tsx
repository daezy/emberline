import { Link } from '@tanstack/react-router'

import type { Service } from './dashboard-data'
import { ArrowUpRight, Clock3, MoreHorizontal } from './icons'
import { StatusPill } from './status-pill'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <div className="service-card__top">
        <StatusPill status={service.status} />
        <div className="service-card__provider">
          <span>{service.provider}</span>
          <button type="button" aria-label={`More actions for ${service.name}`}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      <div className="service-card__identity">
        <span className={`service-glyph service-glyph--${service.status}`}>
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
      <div className="service-card__metrics">
        <div>
          <strong>
            {service.latency ? `${service.latency.toLocaleString()}ms` : '—'}
          </strong>
          <span>Latency</span>
        </div>
        <div>
          <strong>{service.nextWarm}</strong>
          <span>Next warm</span>
        </div>
        <div>
          <strong>{service.uptime}%</strong>
          <span>Uptime</span>
        </div>
      </div>
      <div className="service-card__footer">
        <span>
          <Clock3 size={13} /> {service.interval}
        </span>
        <span>{service.project}</span>
      </div>
    </article>
  )
}
