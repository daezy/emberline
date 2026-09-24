import { Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

import { errorMessage } from './error-message'

// Rendered inside the dashboard layout, so navigation stays available.
export function DashboardNotFound({
  title = 'Page not found',
  message = "This page doesn't exist or has moved.",
}: {
  title?: string
  message?: string
}) {
  return (
    <section className="panel dashboard-status" role="status">
      <span className="dashboard-status__code">404</span>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className="dashboard-status__actions">
        <Link className="dash-button dash-button--primary" to="/dashboard">
          Go to overview
        </Link>
        <Link
          className="dash-button dash-button--secondary"
          to="/dashboard/services"
        >
          View services
        </Link>
      </div>
    </section>
  )
}

export function DashboardError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const retry = async () => {
    reset()
    await router.invalidate()
  }

  return (
    <section className="panel dashboard-status" role="alert">
      <span className="dashboard-status__code">Error</span>
      <h1>This page couldn't load</h1>
      <p>{errorMessage(error)}</p>
      <div className="dashboard-status__actions">
        <button
          className="dash-button dash-button--primary"
          type="button"
          onClick={retry}
        >
          Try again
        </button>
        <Link className="dash-button dash-button--secondary" to="/dashboard">
          Go to overview
        </Link>
      </div>
    </section>
  )
}
