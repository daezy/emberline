import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Search } from '#/components/dashboard/icons'
import {
  checkDot,
  checkSummary,
  formatLatency,
  timeAgo,
} from '#/components/dashboard/service-display'
import { listActivityFn } from '#/server/services.functions'
import { DashboardError } from '#/components/feedback/dashboard-status'
import { QueryError } from '#/components/feedback/query-error'

export const Route = createFileRoute('/dashboard/activity')({
  component: ActivityPage,
  errorComponent: DashboardError,
})

function ActivityPage() {
  const activityQuery = useQuery({
    queryKey: ['activity'],
    queryFn: () => listActivityFn(),
    refetchInterval: 30_000,
  })
  const { data = [], isLoading } = activityQuery
  const [query, setQuery] = useState('')
  const rows = data.filter((item) =>
    `${item.serviceName} ${checkSummary(item)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Activity</h1>
          <p>Warm requests and their results across your services.</p>
        </div>
      </section>
      {activityQuery.isError ? (
        <QueryError
          title="Couldn't load activity"
          error={activityQuery.error}
          onRetry={() => activityQuery.refetch()}
        />
      ) : !isLoading && data.length === 0 ? (
        <section className="panel">
          <div className="empty-state">
            <h2>No activity yet</h2>
            <p>Checks will show up here once your services are being warmed.</p>
          </div>
        </section>
      ) : (
        <>
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
                    <i className={checkDot(item)} />
                    {checkSummary(item)}
                  </span>
                  <Link
                    to="/dashboard/services/$serviceId"
                    params={{ serviceId: item.serviceId }}
                  >
                    {item.serviceName}
                  </Link>
                  <code>{item.responseStatus ?? '—'}</code>
                  <code>{formatLatency(item.latencyMs)}</code>
                  <time dateTime={item.checkedAt}>
                    {timeAgo(item.checkedAt)}
                  </time>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
