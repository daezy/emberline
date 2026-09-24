import { redirect } from '@tanstack/react-router'

import { ApiError, apiRequest } from './api.server'
import type { RequestOptions } from './api.server'
import type { AuthResponse, AuthUser } from './auth.types'
import { clearSession, readSession, saveSession } from './session.server'

const inFlightRefreshes = new Map<string, Promise<AuthResponse>>()

// Parallel requests carry the same refresh cookie until the browser applies the
// new one. The API treats a replayed refresh token as theft, so share one call.
function refreshSession(refreshToken: string) {
  let pending = inFlightRefreshes.get(refreshToken)
  if (!pending) {
    pending = apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
    inFlightRefreshes.set(refreshToken, pending)
    setTimeout(() => inFlightRefreshes.delete(refreshToken), 10_000)
  }
  return pending
}

const isUnauthorized = (error: unknown) =>
  error instanceof ApiError && error.status === 401

export async function getSessionUser(): Promise<AuthUser | null> {
  const { accessToken, refreshToken, remember } = readSession()

  if (accessToken) {
    try {
      return await apiRequest<AuthUser>('/auth/me', { accessToken })
    } catch (error) {
      if (!isUnauthorized(error)) throw error
    }
  }

  if (!refreshToken) {
    return null
  }

  try {
    const session = await refreshSession(refreshToken)
    saveSession(session, remember)
    return session.user
  } catch (error) {
    if (!isUnauthorized(error)) throw error
    clearSession()
    return null
  }
}

type AuthedOptions = Omit<RequestOptions, 'accessToken'>

export async function authedRequest<T>(
  path: string,
  options: AuthedOptions = {},
): Promise<T> {
  const { accessToken, refreshToken, remember } = readSession()

  if (accessToken) {
    try {
      return await apiRequest<T>(path, { ...options, accessToken })
    } catch (error) {
      if (!isUnauthorized(error)) throw error
    }
  }

  // A redirect rather than an error: the client sends the user to sign in
  // instead of showing a failure they can't fix by retrying.
  if (!refreshToken) {
    throw redirect({ to: '/auth/sign-in' })
  }

  let session: AuthResponse
  try {
    session = await refreshSession(refreshToken)
  } catch (error) {
    if (!isUnauthorized(error)) throw error
    clearSession()
    throw redirect({ to: '/auth/sign-in' })
  }
  saveSession(session, remember)
  return apiRequest<T>(path, { ...options, accessToken: session.accessToken })
}

export async function endSession() {
  const { refreshToken } = readSession()
  if (refreshToken) {
    await apiRequest('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }).catch(() => undefined)
  }
  clearSession()
}
