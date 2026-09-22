import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { getActivity, getServices } from '#/components/dashboard/dashboard-data'
import {
  Activity,
  ArrowUpRight,
  Plus,
  Sparkles,
  Zap,
} from '#/components/dashboard/icons'
import { ServiceCard } from '#/components/dashboard/service-card'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const { user } = Route.useRouteContext()
  const firstName = user.name?.trim().split(/\s+/)[0]
  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  })
  const activityQuery = useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
  })
  const services = servicesQuery.data ?? []
  const activity = activityQuery.data ?? []
  const warmCount = services.filter(
    (service) => service.status === 'warm',
  ).length
  const attentionCount = services.filter(
    (service) => service.status === 'cold' || service.status === 'down',
  ).length

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Monday, 21 September</span>
          <h1>Welcome back{firstName ? `, ${firstName}` : ''}.</h1>
          <p>Your services are mostly warm. One needs your attention.</p>
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
            <strong>{services.length || '—'}</strong>
            <span>Total services</span>
          </div>
          <small>1 slot left</small>
        </article>
        <article>
          <span className="metric-icon metric-icon--green">
            <span className="live-pip" />
          </span>
          <div>
            <strong>{servicesQuery.isLoading ? '—' : warmCount}</strong>
            <span>Warm now</span>
          </div>
          <small className="positive">All responding</small>
        </article>
        <article>
          <span className="metric-icon metric-icon--amber">
            <Sparkles size={17} />
          </span>
          <div>
            <strong>{servicesQuery.isLoading ? '—' : attentionCount}</strong>
            <span>Needs attention</span>
          </div>
          <small>Cold start</small>
        </article>
        <article>
          <span className="metric-icon">
            <Activity size={17} />
          </span>
          <div>
            <strong>99.62%</strong>
            <span>Avg. uptime</span>
          </div>
          <small className="positive">+0.08%</small>
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
        {servicesQuery.isLoading ? (
          <div className="service-grid" aria-busy="true">
            {[0, 1, 2, 3].map((item) => (
              <div className="service-card service-card--loading" key={item} />
            ))}
          </div>
        ) : (
          <div className="service-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="overview-lower-grid">
        <article className="activity-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Recent activity</h2>
              <p>Latest checks across your workspace.</p>
            </div>
            <Link to="/dashboard/activity">View all</Link>
          </div>
          <div className="activity-list">
            {(activityQuery.isLoading ? [] : activity.slice(0, 4)).map(
              (item) => (
                <div className="activity-list__row" key={item.id}>
                  <span
                    className={`activity-dot activity-dot--${item.status}`}
                  />
                  <div>
                    <strong>{item.service}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <code>
                    {item.latency ? `${item.latency.toLocaleString()}ms` : '—'}
                  </code>
                  <time>{item.time}</time>
                </div>
              ),
            )}
          </div>
        </article>
        <aside className="warmth-card">
          <div className="warmth-card__glow" />
          <span className="metric-icon metric-icon--ember">
            <Zap size={17} />
          </span>
          <h2>1,284 cold seconds saved</h2>
          <p>
            Emberline has kept 46 user requests from hitting a sleeping service
            this month.
          </p>
          <div className="warmth-card__stat">
            <strong>21m 24s</strong>
            <span>estimated wait time avoided</span>
          </div>
        </aside>
      </section>
    </div>
  )
}
