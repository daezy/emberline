import { Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

import iconUrl from '#/assets/icons/emberline-mark.png'

import { errorMessage } from './error-message'

function StatusShell({
  code,
  title,
  message,
  children,
}: {
  code: string
  title: string
  message: string
  children: React.ReactNode
}) {
  return (
    <main className="status-page">
      <Link className="status-page__brand" to="/">
        <img src={iconUrl} alt="" />
        <span>emberline</span>
      </Link>
      <section className="status-page__body" aria-labelledby="status-title">
        <span className="status-page__code">{code}</span>
        <h1 id="status-title">{title}</h1>
        <p>{message}</p>
        <div className="status-page__actions">{children}</div>
      </section>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <StatusShell
      code="404"
      title="This page went cold"
      message="The page you're looking for doesn't exist or has moved."
    >
      <Link className="dash-button dash-button--primary" to="/">
        Back to home
      </Link>
      <Link className="dash-button dash-button--secondary" to="/dashboard">
        Open dashboard
      </Link>
    </StatusShell>
  )
}

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const retry = async () => {
    reset()
    await router.invalidate()
  }

  return (
    <StatusShell
      code="Error"
      title="Something went wrong"
      message={errorMessage(error)}
    >
      <button
        className="dash-button dash-button--primary"
        type="button"
        onClick={retry}
      >
        Try again
      </button>
      <Link className="dash-button dash-button--secondary" to="/">
        Back to home
      </Link>
    </StatusShell>
  )
}
