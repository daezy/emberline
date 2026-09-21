const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

export async function signIn(input: { email: string; password: string }) {
  await wait()
  return { user: { email: input.email } }
}

export async function signUp(input: {
  name: string
  email: string
  password: string
}) {
  await wait(850)
  return { user: { name: input.name, email: input.email } }
}

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
