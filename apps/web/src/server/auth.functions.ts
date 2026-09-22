import { createServerFn } from '@tanstack/react-start'

import { apiRequest } from './api.server'
import { endSession, getSessionUser } from './auth.server'
import type { AuthResponse } from './auth.types'
import { saveSession } from './session.server'

type SignInInput = { email: string; password: string; remember: boolean }
type SignUpInput = { name: string; email: string; password: string }
type GoogleInput = { idToken: string }

function fields(input: unknown, names: Array<string>) {
  const record = (input ?? {}) as Record<string, unknown>
  for (const name of names) {
    if (typeof record[name] !== 'string') {
      throw new Error('Invalid request')
    }
  }
  return record
}

const parseSignIn = (input: unknown): SignInInput => {
  const record = fields(input, ['email', 'password'])
  return {
    email: record.email as string,
    password: record.password as string,
    remember: record.remember === true,
  }
}

const parseSignUp = (input: unknown): SignUpInput => {
  const record = fields(input, ['name', 'email', 'password'])
  return {
    name: record.name as string,
    email: record.email as string,
    password: record.password as string,
  }
}

const parseGoogle = (input: unknown): GoogleInput => ({
  idToken: fields(input, ['idToken']).idToken as string,
})

export const signInFn = createServerFn({ method: 'POST' })
  .validator(parseSignIn)
  .handler(async ({ data }) => {
    const { remember, ...credentials } = data
    const session = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    saveSession(session, remember)
    return { user: session.user }
  })

export const signUpFn = createServerFn({ method: 'POST' })
  .validator(parseSignUp)
  .handler(async ({ data }) => {
    const session = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
    })
    saveSession(session, true)
    return { user: session.user }
  })

export const googleSignInFn = createServerFn({ method: 'POST' })
  .validator(parseGoogle)
  .handler(async ({ data }) => {
    const session = await apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: data,
    })
    saveSession(session, true)
    return { user: session.user }
  })

export const signOutFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    await endSession()
    return { ok: true }
  },
)

export const getCurrentUserFn = createServerFn({ method: 'POST' }).handler(() =>
  getSessionUser(),
)
