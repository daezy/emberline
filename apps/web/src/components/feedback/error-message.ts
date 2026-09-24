// Errors from server functions reach the client with their message intact.
// Anything that isn't an Error is not ours to show, so fall back to a generic
// line instead of leaking internals.
export function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
