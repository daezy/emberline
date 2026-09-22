import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'

import type { AuthResponse } from './auth.types'

const ACCESS_COOKIE = 'ep_access'
const REFRESH_COOKIE = 'ep_refresh'
const REMEMBER_COOKIE = 'ep_remember'
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60

const baseOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})

function secondsUntilExpiry(jwt: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split('.')[1], 'base64url').toString(),
    ) as { exp?: number }
    return Math.max(1, (payload.exp ?? 0) - Math.floor(Date.now() / 1000))
  } catch {
    return 60
  }
}

export function saveSession(
  {
    accessToken,
    refreshToken,
  }: Pick<AuthResponse, 'accessToken' | 'refreshToken'>,
  remember: boolean,
) {
  setCookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions(),
    maxAge: secondsUntilExpiry(accessToken),
  })

  if (remember) {
    const persistent = { ...baseOptions(), maxAge: REMEMBER_MAX_AGE }
    setCookie(REFRESH_COOKIE, refreshToken, persistent)
    setCookie(REMEMBER_COOKIE, '1', persistent)
  } else {
    setCookie(REFRESH_COOKIE, refreshToken, baseOptions())
    deleteCookie(REMEMBER_COOKIE, { path: '/' })
  }
}

export function readSession() {
  return {
    accessToken: getCookie(ACCESS_COOKIE),
    refreshToken: getCookie(REFRESH_COOKIE),
    remember: getCookie(REMEMBER_COOKIE) === '1',
  }
}

export function clearSession() {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, REMEMBER_COOKIE]) {
    deleteCookie(name, { path: '/' })
  }
}
