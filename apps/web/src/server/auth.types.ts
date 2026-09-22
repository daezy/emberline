export type AuthUser = {
  id: string
  email: string
  name: string | null
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
