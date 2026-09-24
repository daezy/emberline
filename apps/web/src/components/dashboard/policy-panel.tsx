import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getPolicyFn, updatePolicyFn } from '#/server/services.functions'
import type {
  WarmPolicy,
  WarmPolicyInput,
  WarmPolicyMode,
} from '#/server/services.types'
import { CalendarClock, ChevronDown, Clock3, Settings, Zap } from './icons'
import { timeAgo } from './service-display'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const INTERVALS = [5, 10, 15, 30, 60]
const MODE_LABELS: Record<WarmPolicyMode, string> = {
  interval: 'Always warm',
  schedule: 'Scheduled',
  manual: 'Manual only',
}
const browserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

function describeWindow(policy: WarmPolicy) {
  if (!policy.schedule) return '—'
  const days = [...policy.schedule.days]
    .sort((a, b) => a - b)
    .map((day) => DAY_LABELS[day])
    .join(', ')
  return `${days} · ${policy.schedule.startTime}–${policy.schedule.endTime}`
}

export function PolicyPanel({ serviceId }: { serviceId: string }) {
  const [editing, setEditing] = useState(false)
  const { data: policy } = useQuery({
    queryKey: ['policy', serviceId],
    queryFn: () => getPolicyFn({ data: serviceId }),
  })

  return (
    <aside className="panel policy-panel">
      <div className="section-heading-row compact">
        <div>
          <h2>Warm policy</h2>
          <p>When Emberline checks this service.</p>
        </div>
        {policy && !editing && (
          <button
            className="icon-button"
            type="button"
            aria-label="Edit warm policy"
            onClick={() => setEditing(true)}
          >
            <Settings size={16} />
          </button>
        )}
      </div>
      {policy && editing ? (
        <PolicyForm policy={policy} onDone={() => setEditing(false)} />
      ) : policy ? (
        <>
          <div className="policy-row">
            <span>
              <Zap size={16} /> Mode
            </span>
            <strong>{MODE_LABELS[policy.mode]}</strong>
          </div>
          {policy.mode !== 'manual' && (
            <div className="policy-row">
              <span>
                <Clock3 size={16} /> Interval
              </span>
              <strong>Every {policy.intervalMinutes ?? 10} minutes</strong>
            </div>
          )}
          {policy.mode === 'schedule' && (
            <div className="policy-row">
              <span>
                <CalendarClock size={16} /> Window
              </span>
              <strong>
                {describeWindow(policy)}
                <br />
                {policy.timezone}
              </strong>
            </div>
          )}
          <div className="policy-row">
            <span>
              <Clock3 size={16} /> Next check
            </span>
            <strong>
              {policy.nextWarmAt ? timeAgo(policy.nextWarmAt) : 'Not scheduled'}
            </strong>
          </div>
        </>
      ) : null}
    </aside>
  )
}

function PolicyForm({
  policy,
  onDone,
}: {
  policy: WarmPolicy
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState(policy.mode)
  const [interval, setInterval] = useState(policy.intervalMinutes ?? 10)
  const [days, setDays] = useState(policy.schedule?.days ?? [1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState(
    policy.schedule?.startTime ?? '08:00',
  )
  const [endTime, setEndTime] = useState(policy.schedule?.endTime ?? '22:00')
  const [timezone, setTimezone] = useState(
    policy.schedule ? policy.timezone : browserTimeZone(),
  )
  const mutation = useMutation({
    mutationFn: () => {
      const input: WarmPolicyInput = {
        mode,
        intervalMinutes: interval,
        timezone,
        ...(mode === 'schedule' && {
          schedule: { days, startTime, endTime },
        }),
      }
      return updatePolicyFn({ data: { id: policy.serviceId, policy: input } })
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(['policy', policy.serviceId], updated)
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      await queryClient.invalidateQueries({
        queryKey: ['service', policy.serviceId],
      })
      onDone()
    },
  })
  const toggleDay = (day: number) =>
    setDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    )

  return (
    <form
      className="policy-form"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate()
      }}
    >
      <label className="form-field">
        <span>Mode</span>
        <div className="select-control">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as WarmPolicyMode)}
          >
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
      </label>
      {mode !== 'manual' && (
        <label className="form-field">
          <span>Interval</span>
          <div className="select-control">
            <select
              value={interval}
              onChange={(event) => setInterval(Number(event.target.value))}
            >
              {INTERVALS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  Every {minutes} minutes
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </label>
      )}
      {mode === 'schedule' && (
        <>
          <fieldset className="form-field day-picker">
            <span>Active days</span>
            <div>
              {DAY_LABELS.map((label, day) => (
                <label
                  key={label}
                  className={days.includes(day) ? 'is-selected' : ''}
                >
                  <input
                    type="checkbox"
                    checked={days.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="time-range">
            <label className="form-field">
              <span>From</span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Until</span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </label>
          </div>
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
              </select>
              <ChevronDown size={15} />
            </div>
          </label>
        </>
      )}
      {mutation.error && (
        <p className="auth-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      <div className="setup-actions">
        <button
          className="dash-button dash-button--secondary"
          type="button"
          onClick={onDone}
        >
          Cancel
        </button>
        <button
          className="dash-button dash-button--primary"
          type="submit"
          disabled={
            mutation.isPending || (mode === 'schedule' && days.length === 0)
          }
        >
          {mutation.isPending ? 'Saving…' : 'Save policy'}
        </button>
      </div>
    </form>
  )
}
