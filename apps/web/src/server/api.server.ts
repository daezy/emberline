export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  accessToken?: string
}

function baseUrl() {
  const url = process.env.API_URL
  if (!url) {
    throw new Error('API_URL is not set')
  }
  return url.replace(/\/$/, '')
}

function errorMessage(payload: unknown) {
  const message = (payload as { message?: unknown } | null)?.message
  if (Array.isArray(message)) {
    return message.join('. ')
  }
  return typeof message === 'string'
    ? message
    : 'Something went wrong. Please try again.'
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, accessToken }: RequestOptions = {},
): Promise<T> {
  const url = `${baseUrl()}${path}`
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(503, "We can't reach the server right now. Try again.")
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    throw new ApiError(response.status, errorMessage(payload))
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
