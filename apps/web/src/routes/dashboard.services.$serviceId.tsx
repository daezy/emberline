import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  activities,
  getService,
  triggerWarm,
} from '#/components/dashboard/dashboard-data'
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  MoreHorizontal,
  Pause,
  RotateCw,
  Settings,
  Zap,
} from '#/components/dashboard/icons'
import { LatencyChart } from '#/components/dashboard/latency-chart'
import { StatusPill } from '#/components/dashboard/status-pill'

export const Route = createFileRoute('/dashboard/services/$serviceId')({
  component: ServiceDetailPage,
})

function ServiceDetailPage() {
  const { serviceId } = Route.useParams()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getService(serviceId),
  })
  const warmMutation = useMutation({
    mutationFn: () => triggerWarm(serviceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activity'] }),
  })

  if (isLoading)
    return (
      <div className="detail-loading">
        <span />
      </div>
    )
  if (!service)
    return (
      <div className="empty-state">
        <h1>Service not found</h1>
        <Link to="/dashboard/services">Back to services</Link>
      </div>
    )

  const serviceActivity = activities.filter(
    (item) => item.serviceId === serviceId,
  )
  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(`https://${service.endpoint}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="page-stack service-detail-page">
      <Link className="back-link" to="/dashboard/services">
        <ArrowLeft size={15} /> All services
      </Link>
      <section className="detail-heading">
        <div className="detail-identity">
          <span className={`service-glyph service-glyph--${service.status}`}>
            <span />
          </span>
          <div>
            <div className="detail-title-line">
              <h1>{service.name}</h1>
              <StatusPill status={service.status} />
            </div>
            <button type="button" onClick={copyEndpoint}>
              <code>https://{service.endpoint}</code>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
        <div className="detail-actions">
          <button className="dash-button dash-button--secondary" type="button">
            <Pause size={15} /> Pause
          </button>
          <button
            className="dash-button dash-button--primary"
            type="button"
            onClick={() => warmMutation.mutate()}
            disabled={warmMutation.isPending}
          >
            <RotateCw
              className={warmMutation.isPending ? 'is-spinning' : ''}
              size={15}
            />
            {warmMutation.isPending
              ? 'Warming…'
              : warmMutation.isSuccess
                ? 'Warm queued'
                : 'Warm now'}
          </button>
          <button
            className="icon-button bordered"
            type="button"
            aria-label="More service actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </section>

      <section className="detail-metrics">
        <article>
          <span>Current latency</span>
          <strong>
            {service.latency ? `${service.latency.toLocaleString()}ms` : '—'}
          </strong>
          <small>Normal range: 160–240ms</small>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{service.readiness}%</strong>
          <small className={service.readiness > 80 ? 'positive' : 'warning'}>
            {service.readiness > 80
              ? 'Ready for traffic'
              : 'Recovering from cold start'}
          </small>
        </article>
        <article>
          <span>Uptime · 30d</span>
          <strong>{service.uptime}%</strong>
          <small>2 failed checks</small>
        </article>
        <article>
          <span>Next warm</span>
          <strong>{service.nextWarm}</strong>
          <small>{service.interval}</small>
        </article>
      </section>

      <section className="detail-grid">
        <article className="panel chart-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Response latency</h2>
              <p>Last 12 warm requests</p>
            </div>
            <button className="period-select" type="button">
              24 hours <span>⌄</span>
            </button>
          </div>
          <LatencyChart points={service.latencyHistory} />
        </article>
        <aside className="panel readiness-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Readiness</h2>
              <p>Current service state</p>
            </div>
            <Zap size={17} />
          </div>
          <div className="readiness-orbit">
            <span>
              {service.readiness}
              <small>%</small>
            </span>
            <i
              style={
                {
                  '--readiness': `${service.readiness * 3.6}deg`,
                } as React.CSSProperties
              }
            />
          </div>
          <div className="readiness-scale">
            <div>
              <span>Cold</span>
              <span>Ready</span>
            </div>
            <i>
              <b style={{ width: `${service.readiness}%` }} />
            </i>
          </div>
          <p>
            {service.readiness > 80
              ? 'Responding within its normal latency range.'
              : 'A slow response lowered this service’s readiness.'}
          </p>
        </aside>
      </section>

      <section className="detail-grid detail-grid--bottom">
        <article className="panel request-history">
          <div className="section-heading-row compact">
            <div>
              <h2>Request history</h2>
              <p>Recent warm checks and results.</p>
            </div>
            <Link to="/dashboard/activity">View all</Link>
          </div>
          <div className="request-table" role="table">
            <div className="request-row request-row--head" role="row">
              <span>Result</span>
              <span>Status</span>
              <span>Latency</span>
              <span>When</span>
            </div>
            {serviceActivity.map((item) => (
              <div className="request-row" role="row" key={item.id}>
                <span>
                  <i className={`activity-dot activity-dot--${item.status}`} />
                  {item.detail}
                </span>
                <code>{item.code ?? '—'}</code>
                <code>
                  {item.latency ? `${item.latency.toLocaleString()}ms` : '—'}
                </code>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </article>
        <aside className="panel policy-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Warm policy</h2>
              <p>When Emberline checks this service.</p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Edit warm policy"
            >
              <Settings size={16} />
            </button>
          </div>
          <div className="policy-row">
            <span>
              <Clock3 size={16} />
              Interval
            </span>
            <strong>{service.interval}</strong>
          </div>
          <div className="policy-row">
            <span>
              <Zap size={16} />
              Active window
            </span>
            <strong>Always warm</strong>
          </div>
          <div className="policy-row">
            <span>
              <RotateCw size={16} />
              Last warmed
            </span>
            <strong>{service.lastWarm}</strong>
          </div>
        </aside>
      </section>
    </div>
  )
}
