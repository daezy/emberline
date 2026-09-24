import { createServerFn } from '@tanstack/react-start'

import type {
  Account,
  NotificationPreferences,
  PreferenceChange,
} from './account.types'
import { authedRequest } from './auth.server'

function record(input: unknown) {
  return (input ?? {}) as Record<string, unknown>
}

export const getAccountFn = createServerFn({ method: 'GET' }).handler(() =>
  authedRequest<Account>('/account'),
)

export const updateAccountFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const { name, timezone } = record(input)
    if (typeof name !== 'string' || typeof timezone !== 'string') {
      throw new Error('Invalid request')
    }
    return { name, timezone }
  })
  .handler(({ data }) =>
    authedRequest<Account>('/account', { method: 'PATCH', body: data }),
  )

export const getNotificationPreferencesFn = createServerFn({
  method: 'GET',
}).handler(() =>
  authedRequest<NotificationPreferences>('/notifications/preferences'),
)

// The API validates event and channel names; this only checks the shape.
export const updateNotificationPreferenceFn = createServerFn({
  method: 'POST',
})
  .validator((input: unknown): PreferenceChange => {
    const { event, channel, enabled } = record(input)
    if (
      typeof event !== 'string' ||
      typeof channel !== 'string' ||
      typeof enabled !== 'boolean'
    ) {
      throw new Error('Invalid request')
    }
    return { event, channel, enabled }
  })
  .handler(({ data }) =>
    authedRequest<NotificationPreferences>('/notifications/preferences', {
      method: 'PUT',
      body: { preferences: [data] },
    }),
  )
