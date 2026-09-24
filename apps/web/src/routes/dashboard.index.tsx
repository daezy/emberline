import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import {
  ArrowUpRight,
  Pause,
  Plus,
  Sparkles,
  Zap,
} from '#/components/dashboard/icons'
import { useProjectNames, useServices } from '#/components/dashboard/queries'
import { ServiceCard } from '#/components/dashboard/service-card'
import {
  checkDot,
  checkSummary,
  displayStatus,
  formatLatency,
  timeAgo,
} from '#/components/dashboard/service-display'
import { ServicesEmpty } from '#/components/dashboard/services-empty'
import { listActivityFn } from '#/server/services.functions'
import { useSessionUser } from '#/stores/auth-store-provider'
import { DashboardError } from '#/components/feedback/dashboard-status'
import { QueryError } from '#/components/feedback/query-error'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
  errorComponent: DashboardError,
})

const today = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function summary(total: number, attention: number) {
  if (total === 0) return 'Add your first service to start keeping it warm.'
  if (attention === 0) return 'None of your services need attention.'
  return attention === 1
    ? 'One service needs your attention.'
    : `${attention} services need your attention.`
}

function DashboardOverview() {
  const user = useSessionUser()
  const firstName = user.name?.trim().split(/\s+/)[0]
  const servicesQuery = useServices()
  const { data: activity = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => listActivityFn(),
    refetchInterval: 30_000,
  })
  const projectNames = useProjectNames()
  const services = servicesQuery.data ?? []
  const statuses = services.map(displayStatus)
  const count = (...matches: Array<string>) =>
    statuses.filter((status) => matches.includes(status)).length
  const attentionCount = count('cold', 'down')
  const stat = (value: number) => (servicesQuery.isSuccess ? value : '—')

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">{today.format(new Date())}</span>
          <h1>Welcome back{firstName ? `, ${firstName}` : ''}.</h1>
          {servicesQuery.isSuccess && (
            <p>{summary(services.length, attentionCount)}</p>
          )}
        </div>
        <Link
          className="dash-button dash-button--primary"
          to="/dashboard/services/new"
        >
          <Plus size={16} /> Add service
        </Link>
      </section>

      <section className="overview-stats" aria-label="Service overview">
        <article>
          <span className="metric-icon">
            <Zap size={17} />
          </span>
          <div>
            <strong>{stat(services.length)}</strong>
            <span>Total services</span>
          </div>
        </article>
        <article>
          <span className="metric-icon metric-icon--green">
            <span className="live-pip" />
          </span>
          <div>
            <strong>{stat(count('warm', 'warming'))}</strong>
            <span>Warm now</span>
          </div>
        </article>
        <article>
          <span className="metric-icon metric-icon--amber">
            <Sparkles size={17} />
          </span>
          <div>
            <strong>{stat(attentionCount)}</strong>
            <span>Needs attention</span>
          </div>
        </article>
        <article>
          <span className="metric-icon">
            <Pause size={17} />
          </span>
          <div>
            <strong>{stat(count('paused'))}</strong>
            <span>Paused</span>
          </div>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <h2>Your services</h2>
            <p>Readiness across your active endpoints.</p>
          </div>
          <Link to="/dashboard/services">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {servicesQuery.isError ? (
          <QueryError
            title="Couldn't load your services"
            error={servicesQuery.error}
            onRetry={() => servicesQuery.refetch()}
          />
        ) : servicesQuery.isLoading ? (
          <div className="service-grid" aria-busy="true">
            {[0, 1, 2, 3].map((item) => (
              <div className="service-card service-card--loading" key={item} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <ServicesEmpty />
        ) : (
          <div className="service-grid">
            {services.slice(0, 4).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                projectName={projectNames.get(service.projectId)}
              />
            ))}
          </div>
        )}
      </section>

      {activity.length > 0 && (
        <article className="activity-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Recent activity</h2>
              <p>Latest checks across your services.</p>
            </div>
            <Link to="/dashboard/activity">View all</Link>
          </div>
          <div className="activity-list">
            {activity.slice(0, 5).map((item) => (
              <div className="activity-list__row" key={item.id}>
                <span className={checkDot(item)} />
                <div>
                  <strong>{item.serviceName}</strong>
                  <span>{checkSummary(item)}</span>
                </div>
                <code>{formatLatency(item.latencyMs)}</code>
                <time dateTime={item.checkedAt}>{timeAgo(item.checkedAt)}</time>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  )
}
