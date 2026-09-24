import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { ChevronDown } from '#/components/dashboard/icons'
import {
  getAccountFn,
  getNotificationPreferencesFn,
  updateAccountFn,
  updateNotificationPreferenceFn,
} from '#/server/account.functions'
import type {
  Account,
  NotificationPreferences,
  PreferenceChange,
} from '#/server/account.types'
import { useSetSessionUser } from '#/stores/auth-store-provider'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: () => getAccountFn(),
  })
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => getNotificationPreferencesFn(),
  })

  return (
    <div className="page-stack settings-page">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Account</span>
          <h1>Settings</h1>
          <p>Manage your profile and which alerts reach you.</p>
        </div>
      </section>
      <section className="panel settings-panel">
        {account && <ProfileSection account={account} />}
        {preferences && <NotificationsSection preferences={preferences} />}
      </section>
    </div>
  )
}

function ProfileSection({ account }: { account: Account }) {
  const queryClient = useQueryClient()
  const setSessionUser = useSetSessionUser()
  const [name, setName] = useState(account.name ?? '')
  const [timezone, setTimezone] = useState(account.timezone)
  const mutation = useMutation({
    mutationFn: () =>
      updateAccountFn({ data: { name: name.trim(), timezone } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['account'], updated)
      setSessionUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
      })
    },
  })
  const dirty =
    name.trim() !== (account.name ?? '') || timezone !== account.timezone

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate()
      }}
    >
      <div className="settings-section">
        <div>
          <h2>Profile</h2>
          <p>Alert emails show times in your timezone.</p>
        </div>
        <div className="settings-fields">
          <label className="form-field">
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input value={account.email} readOnly disabled />
          </label>
          <label className="form-field">
            <span>Timezone</span>
            <div className="select-control">
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {Intl.supportedValuesOf('timeZone').map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
                {/* UTC is valid but missing from some runtimes' list. */}
                {!Intl.supportedValuesOf('timeZone').includes('UTC') && (
                  <option value="UTC">UTC</option>
                )}
              </select>
              <ChevronDown size={15} />
            </div>
          </label>
        </div>
      </div>
      {mutation.error && (
        <p className="auth-error settings-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      <div className="settings-save">
        <button
          className="dash-button dash-button--primary"
          type="submit"
          disabled={!dirty || mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}

function NotificationsSection({
  preferences,
}: {
  preferences: NotificationPreferences
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (change: PreferenceChange) =>
      updateNotificationPreferenceFn({ data: change }),
    onSuccess: (updated) =>
      queryClient.setQueryData(['notification-preferences'], updated),
  })
  const showChannel = preferences.channels.length > 1

  return (
    <div className="settings-section">
      <div>
        <h2>Notifications</h2>
        <p>Choose which service events reach you. Changes save right away.</p>
      </div>
      <div className="toggle-list">
        {preferences.events.flatMap((event) =>
          preferences.channels.map((channel) => (
            <label className="toggle-row" key={`${event.type}:${channel.id}`}>
              <span>
                <strong>{event.label}</strong>
                <small>
                  {event.description}
                  {showChannel && ` · ${channel.label}`}
                </small>
              </span>
              <input
                type="checkbox"
                checked={event.channels[channel.id] ?? false}
                disabled={mutation.isPending}
                onChange={(change) =>
                  mutation.mutate({
                    event: event.type,
                    channel: channel.id,
                    enabled: change.target.checked,
                  })
                }
              />
              <i />
            </label>
          )),
        )}
        {mutation.error && (
          <p className="auth-error" role="alert">
            {mutation.error.message}
          </p>
        )}
      </div>
    </div>
  )
}
