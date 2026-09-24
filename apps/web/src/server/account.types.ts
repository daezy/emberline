export type Account = {
  id: string
  email: string
  name: string | null
  timezone: string
}

export type NotificationPreferences = {
  channels: Array<{ id: string; label: string }>
  events: Array<{
    type: string
    label: string
    description: string
    channels: Record<string, boolean>
  }>
}

export type PreferenceChange = {
  event: string
  channel: string
  enabled: boolean
}
