import { createServerFn } from '@tanstack/react-start'

import { ApiError } from './api.server'
import { authedRequest } from './auth.server'
import type {
  ActivityItem,
  Check,
  Project,
  Service,
  WarmPolicy,
  WarmPolicyInput,
} from './services.types'

type CreateServiceInput = { projectId: string; name: string; endpoint: string }
type UpdateServiceInput = { id: string; isEnabled: boolean }

function record(input: unknown) {
  return (input ?? {}) as Record<string, unknown>
}

function requireString(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('Invalid request')
  }
  return value
}

export const listProjectsFn = createServerFn({ method: 'GET' }).handler(() =>
  authedRequest<Array<Project>>('/projects'),
)

export const createProjectFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => ({ name: requireString(record(input).name) }))
  .handler(({ data }) =>
    authedRequest<Project>('/projects', { method: 'POST', body: data }),
  )

export const listServicesFn = createServerFn({ method: 'GET' }).handler(() =>
  authedRequest<Array<Service>>('/services'),
)

export const getServiceFn = createServerFn({ method: 'GET' })
  .validator((input: unknown) => requireString(input))
  .handler(async ({ data: id }) => {
    try {
      return await authedRequest<Service>(`/services/${encodeURIComponent(id)}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  })

export const createServiceFn = createServerFn({ method: 'POST' })
  .validator((input: unknown): CreateServiceInput => {
    const fields = record(input)
    return {
      projectId: requireString(fields.projectId),
      name: requireString(fields.name),
      endpoint: requireString(fields.endpoint),
    }
  })
  .handler(({ data: { projectId, ...body } }) =>
    authedRequest<Service>(
      `/projects/${encodeURIComponent(projectId)}/services`,
      { method: 'POST', body },
    ),
  )

export const updateServiceFn = createServerFn({ method: 'POST' })
  .validator((input: unknown): UpdateServiceInput => {
    const fields = record(input)
    if (typeof fields.isEnabled !== 'boolean') {
      throw new Error('Invalid request')
    }
    return { id: requireString(fields.id), isEnabled: fields.isEnabled }
  })
  .handler(({ data: { id, ...body } }) =>
    authedRequest<Service>(`/services/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body,
    }),
  )

export const listChecksFn = createServerFn({ method: 'GET' })
  .validator((input: unknown) => requireString(input))
  .handler(({ data: id }) =>
    authedRequest<Array<Check>>(
      `/services/${encodeURIComponent(id)}/checks?limit=50`,
    ),
  )

export const warmServiceFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => requireString(input))
  .handler(({ data: id }) =>
    authedRequest<Check>(`/services/${encodeURIComponent(id)}/warm`, {
      method: 'POST',
    }),
  )

export const getPolicyFn = createServerFn({ method: 'GET' })
  .validator((input: unknown) => requireString(input))
  .handler(({ data: id }) =>
    authedRequest<WarmPolicy>(`/services/${encodeURIComponent(id)}/policy`),
  )

// The API validates the policy fields; this only checks the shape.
export const updatePolicyFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const fields = record(input)
    const policy = record(fields.policy)
    if (typeof policy.mode !== 'string') {
      throw new Error('Invalid request')
    }
    return {
      id: requireString(fields.id),
      policy: policy as unknown as WarmPolicyInput,
    }
  })
  .handler(({ data: { id, policy } }) =>
    authedRequest<WarmPolicy>(`/services/${encodeURIComponent(id)}/policy`, {
      method: 'PATCH',
      body: policy,
    }),
  )

export const listActivityFn = createServerFn({ method: 'GET' }).handler(() =>
  authedRequest<Array<ActivityItem>>('/activity?limit=100'),
)
