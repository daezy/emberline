import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  ArrowLeft,
  Check,
  Copy,
  Pause,
  Play,
  RotateCw,
} from '#/components/dashboard/icons'
import { LatencyChart } from '#/components/dashboard/latency-chart'
import { PolicyPanel } from '#/components/dashboard/policy-panel'
import { useProjectNames } from '#/components/dashboard/queries'
import {
  checkDot,
  checkSummary,
  displayStatus,
  formatLatency,
  timeAgo,
} from '#/components/dashboard/service-display'
import { StatusPill } from '#/components/dashboard/status-pill'
import {
  getServiceFn,
  listChecksFn,
  updateServiceFn,
  warmServiceFn,
} from '#/server/services.functions'
import {
  DashboardError,
  DashboardNotFound,
} from '#/components/feedback/dashboard-status'
import { QueryError } from '#/components/feedback/query-error'

export const Route = createFileRoute('/dashboard/services/$serviceId')({
  component: ServiceDetailPage,
  errorComponent: DashboardError,
})

const REFRESH_MS = 30_000

function ServiceDetailPage() {
  const { serviceId } = Route.useParams()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const projectNames = useProjectNames()
  const serviceQuery = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getServiceFn({ data: serviceId }),
    refetchInterval: REFRESH_MS,
  })
  const service = serviceQuery.data
  const checksQuery = useQuery({
    queryKey: ['checks', serviceId],
    queryFn: () => listChecksFn({ data: serviceId }),
    refetchInterval: REFRESH_MS,
    enabled: Boolean(service),
  })
  const checks = checksQuery.data ?? []
  const refresh = () =>
    Promise.all(
      [
        ['service', serviceId],
        ['checks', serviceId],
        ['services'],
        ['activity'],
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )
  const toggleMutation = useMutation({
    mutationFn: (isEnabled: boolean) =>
      updateServiceFn({ data: { id: serviceId, isEnabled } }),
    onSuccess: refresh,
  })
  const warmMutation = useMutation({
    mutationFn: () => warmServiceFn({ data: serviceId }),
    onSuccess: refresh,
  })

  if (serviceQuery.isLoading)
    return (
      <div className="detail-loading">
        <span />
      </div>
    )
  if (serviceQuery.isError)
    return (
      <QueryError
        title="Couldn't load this service"
        error={serviceQuery.error}
        onRetry={() => serviceQuery.refetch()}
      />
    )
  if (!service)
    return (
      <DashboardNotFound
        title="Service not found"
        message="It may have been deleted, or it belongs to another account."
      />
    )

  const status = displayStatus(service)
  const latest = checks.at(0)
  const chartable = checks.filter((check) => check.latencyMs !== null)
  const error = toggleMutation.error ?? warmMutation.error
  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(service.endpoint)
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
          <span className={`service-glyph service-glyph--${status}`}>
            <span />
          </span>
          <div>
            <div className="detail-title-line">
              <h1>{service.name}</h1>
              <StatusPill status={status} />
            </div>
            <button type="button" onClick={copyEndpoint}>
              <code>{service.endpoint}</code>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>
        <div className="detail-actions">
          <button
            className="dash-button dash-button--secondary"
            type="button"
            onClick={() => toggleMutation.mutate(!service.isEnabled)}
            disabled={toggleMutation.isPending}
          >
            {service.isEnabled ? (
              <>
                <Pause size={15} /> Pause
              </>
            ) : (
              <>
                <Play size={15} /> Resume
              </>
            )}
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
            {warmMutation.isPending ? 'Warming…' : 'Warm now'}
          </button>
        </div>
      </section>
      {error && (
        <p className="auth-error" role="alert">
          {error.message}
        </p>
      )}

      <section className="detail-metrics">
        <article>
          <span>Status</span>
          <strong>
            <StatusPill status={status} />
          </strong>
        </article>
        <article>
          <span>Latest latency</span>
          <strong>{formatLatency(latest?.latencyMs ?? null)}</strong>
          {latest?.responseStatus && (
            <small>HTTP {latest.responseStatus}</small>
          )}
        </article>
        <article>
          <span>Last checked</span>
          <strong>{timeAgo(service.lastCheckedAt)}</strong>
        </article>
        <article>
          <span>Project</span>
          <strong>{projectNames.get(service.projectId) ?? '—'}</strong>
        </article>
      </section>

      <section className="detail-grid">
        <article className="panel chart-panel">
          <div className="section-heading-row compact">
            <div>
              <h2>Response latency</h2>
              <p>
                Last {chartable.length} successful checks
                {chartable.some((check) => check.coldStartSuspected) &&
                  ' · cold starts in yellow'}
              </p>
            </div>
          </div>
          {chartable.length >= 2 ? (
            <LatencyChart checks={chartable} />
          ) : (
            <p className="detail-empty">
              The chart appears after a couple of successful checks.
            </p>
          )}
        </article>
        <PolicyPanel serviceId={serviceId} />
      </section>

      <section className="panel request-history">
        <div className="section-heading-row compact">
          <div>
            <h2>Request history</h2>
            <p>Recent checks and their results.</p>
          </div>
          <Link to="/dashboard/activity">View all activity</Link>
        </div>
        {checksQuery.isError ? (
          <div className="detail-empty">
            <QueryError
              title="Couldn't load check history"
              error={checksQuery.error}
              onRetry={() => checksQuery.refetch()}
            />
          </div>
        ) : checks.length === 0 ? (
          <p className="detail-empty">
            No checks yet. The first one runs shortly after a service is added.
          </p>
        ) : (
          <div className="request-table" role="table">
            <div className="request-row request-row--head" role="row">
              <span>Result</span>
              <span>Status</span>
              <span>Latency</span>
              <span>When</span>
            </div>
            {checks.map((check) => (
              <div className="request-row" role="row" key={check.id}>
                <span>
                  <i className={checkDot(check)} />
                  {checkSummary(check)}
                </span>
                <code>{check.responseStatus ?? '—'}</code>
                <code>{formatLatency(check.latencyMs)}</code>
                <time dateTime={check.checkedAt}>
                  {timeAgo(check.checkedAt)}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
