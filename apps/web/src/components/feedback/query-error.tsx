import { errorMessage } from './error-message'

// Shown in place of data when a request fails, so a failure never looks like
// an empty list.
export function QueryError({
  error,
  onRetry,
  title = "Couldn't load this",
}: {
  error: unknown
  onRetry: () => unknown
  title?: string
}) {
  return (
    <div className="query-error" role="alert">
      <div>
        <strong>{title}</strong>
        <span>{errorMessage(error)}</span>
      </div>
      <button
        className="dash-button dash-button--secondary"
        type="button"
        onClick={() => void onRetry()}
      >
        Try again
      </button>
    </div>
  )
}
