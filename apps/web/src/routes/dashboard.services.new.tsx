import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import {
  ArrowLeft,
  ChevronDown,
  Globe2,
  Server,
} from '#/components/dashboard/icons'
import { useProjects } from '#/components/dashboard/queries'
import { createServiceFn } from '#/server/services.functions'

export const Route = createFileRoute('/dashboard/services/new')({
  validateSearch: (search: Record<string, unknown>): { project?: string } => ({
    project: typeof search.project === 'string' ? search.project : undefined,
  }),
  component: NewServicePage,
})

const withProtocol = (endpoint: string) =>
  `https://${endpoint.trim().replace(/^https?:\/\//i, '')}`

function NewServicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const search = Route.useSearch()
  const { data: projects = [] } = useProjects()
  const [chosenProject, setChosenProject] = useState(search.project ?? '')
  const projectId =
    projects.find((project) => project.id === chosenProject)?.id ??
    projects.at(0)?.id ??
    ''
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const mutation = useMutation({
    mutationFn: () =>
      createServiceFn({
        data: {
          projectId,
          name: name.trim(),
          endpoint: withProtocol(endpoint),
        },
      }),
    onSuccess: async (service) => {
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      await navigate({
        to: '/dashboard/services/$serviceId',
        params: { serviceId: service.id },
      })
    },
  })

  return (
    <div className="new-service-page">
      <Link className="back-link" to="/dashboard/services">
        <ArrowLeft size={15} /> Cancel setup
      </Link>
      <section className="setup-heading">
        <span className="page-eyebrow">New service</span>
        <h1>What should we keep warm?</h1>
        <p>Add an endpoint now. You can fine-tune its settings later.</p>
      </section>

      <div className="setup-grid">
        <form
          className="setup-card"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <div className="setup-card__heading">
            <span className="form-icon">
              <Server size={18} />
            </span>
            <div>
              <h2>Service details</h2>
              <p>Enter the public endpoint Emberline should check.</p>
            </div>
          </div>
          <label className="form-field">
            <span>Project</span>
            <div className="select-control">
              <select
                value={projectId}
                onChange={(event) => setChosenProject(event.target.value)}
                required
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
          </label>
          <label className="form-field">
            <span>Service name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Billing API"
              maxLength={100}
              required
            />
            <small>A clear name for this service in your workspace.</small>
          </label>
          <label className="form-field">
            <span>Endpoint URL</span>
            <div className="input-with-prefix">
              <span>https://</span>
              <input
                value={endpoint}
                onChange={(event) => setEndpoint(event.target.value)}
                placeholder="api.example.com/health"
                required
              />
            </div>
            <small>
              Use a lightweight health or readiness endpoint if possible.
            </small>
          </label>
          {mutation.error && (
            <p className="auth-error" role="alert">
              {mutation.error.message}
            </p>
          )}
          <div className="setup-actions">
            <button
              className="dash-button dash-button--primary"
              type="submit"
              disabled={mutation.isPending || !projectId}
            >
              {mutation.isPending ? 'Adding…' : 'Add service'}
            </button>
          </div>
        </form>

        <aside className="setup-aside">
          <div className="setup-aside__visual">
            <div className="signal-ring signal-ring--one" />
            <div className="signal-ring signal-ring--two" />
            <div className="signal-ring signal-ring--three" />
            <span>
              <Globe2 size={21} />
            </span>
          </div>
          <span className="page-eyebrow">Good to know</span>
          <h2>Use a dedicated health endpoint.</h2>
          <p>
            A lightweight endpoint keeps checks fast and avoids unnecessary work
            in your application.
          </p>
          <code>GET /health → 200 OK</code>
        </aside>
      </div>
    </div>
  )
}
