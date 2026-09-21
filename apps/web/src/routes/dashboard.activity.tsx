import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getActivity } from '#/components/dashboard/dashboard-data'
import { ChevronDown, Search } from '#/components/dashboard/icons'

export const Route = createFileRoute('/dashboard/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  const { data = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
  })
  const [query, setQuery] = useState('')
  const rows = data.filter((item) =>
    `${item.service} ${item.detail}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Activity</h1>
          <p>Warm requests and state changes across your services.</p>
        </div>
      </section>
      <div className="service-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity…"
            aria-label="Search activity"
          />
        </label>
        <button className="dash-button dash-button--secondary" type="button">
          All results <ChevronDown size={14} />
        </button>
        <button className="dash-button dash-button--secondary" type="button">
          Last 24 hours <ChevronDown size={14} />
        </button>
      </div>
      <section className="panel activity-table-panel">
        <div className="request-table activity-table" role="table">
          <div className="request-row request-row--head" role="row">
            <span>Event</span>
            <span>Service</span>
            <span>Status</span>
            <span>Latency</span>
            <span>When</span>
          </div>
          {rows.map((item) => (
            <div className="request-row" role="row" key={item.id}>
              <span>
                <i className={`activity-dot activity-dot--${item.status}`} />
                {item.detail}
              </span>
              <Link
                to="/dashboard/services/$serviceId"
                params={{ serviceId: item.serviceId }}
              >
                {item.service}
              </Link>
              <code>{item.code ?? '—'}</code>
              <code>
                {item.latency ? `${item.latency.toLocaleString()}ms` : '—'}
              </code>
              <time>{item.time}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
