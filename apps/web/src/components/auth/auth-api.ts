import {
  googleSignInFn,
  signInFn,
  signOutFn,
  signUpFn,
} from '#/server/auth.functions'

export const signIn = (input: {
  email: string
  password: string
  remember: boolean
}) => signInFn({ data: input })

export const signUp = (input: {
  name: string
  email: string
  password: string
}) => signUpFn({ data: input })

export const signInWithGoogle = (idToken: string) =>
  googleSignInFn({ data: { idToken } })

export const signOut = () => signOutFn()

const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

export async function requestPasswordReset(email: string) {
  await wait()
  return { email }
}

export async function resetPassword(password: string) {
  await wait()
  return { updated: Boolean(password) }
}

export async function resendVerification(email: string) {
  await wait(600)
  return { email }
}
