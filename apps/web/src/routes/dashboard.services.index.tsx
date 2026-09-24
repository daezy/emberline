import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Plus, Search } from '#/components/dashboard/icons'
import { NewProjectForm } from '#/components/dashboard/new-project-form'
import { useProjects, useServices } from '#/components/dashboard/queries'
import { ServiceCard } from '#/components/dashboard/service-card'
import { displayStatus } from '#/components/dashboard/service-display'
import { DashboardError } from '#/components/feedback/dashboard-status'
import { QueryError } from '#/components/feedback/query-error'

export const Route = createFileRoute('/dashboard/services/')({
  component: ServicesPage,
  errorComponent: DashboardError,
})

function ServicesPage() {
  const projectsQuery = useProjects()
  const servicesQuery = useServices()
  const projects = projectsQuery.data ?? []
  const services = servicesQuery.data ?? []
  const isLoading = projectsQuery.isLoading || servicesQuery.isLoading
  const failed = projectsQuery.isError
    ? projectsQuery
    : servicesQuery.isError
      ? servicesQuery
      : null
  const [query, setQuery] = useState('')
  const visible = services.filter((service) =>
    `${service.name} ${service.endpoint}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  const warmCount = services.filter(
    (service) => displayStatus(service) === 'warm',
  ).length

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Services</h1>
          <p>Every endpoint Emberline is keeping ready, by project.</p>
        </div>
        <Link
          className="dash-button dash-button--primary"
          to="/dashboard/services/new"
        >
          <Plus size={16} /> Add service
        </Link>
      </section>
      <div className="service-toolbar">
        {services.length > 0 && (
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services…"
              aria-label="Search services"
            />
          </label>
        )}
        <NewProjectForm />
      </div>
      {!isLoading && !failed && services.length > 0 && (
        <div className="services-count">
          <strong>{visible.length}</strong> services <span>·</span> {warmCount}{' '}
          warm
        </div>
      )}
      {failed ? (
        <QueryError
          title="Couldn't load your services"
          error={failed.error}
          onRetry={() =>
            Promise.all([projectsQuery.refetch(), servicesQuery.refetch()])
          }
        />
      ) : isLoading ? (
        <div className="service-grid">
          {[0, 1, 2, 3].map((item) => (
            <div className="service-card service-card--loading" key={item} />
          ))}
        </div>
      ) : (
        projects.map((project) => {
          const projectServices = visible.filter(
            (service) => service.projectId === project.id,
          )
          if (query && projectServices.length === 0) return null

          return (
            <section className="dashboard-section" key={project.id}>
              <div className="section-heading-row">
                <div>
                  <h2>{project.name}</h2>
                  <p>
                    {projectServices.length}{' '}
                    {projectServices.length === 1 ? 'service' : 'services'}
                  </p>
                </div>
                <Link
                  to="/dashboard/services/new"
                  search={{ project: project.id }}
                >
                  <Plus size={14} /> Add service
                </Link>
              </div>
              {projectServices.length === 0 ? (
                <div className="panel empty-state">
                  <p>No services in this project yet.</p>
                </div>
              ) : (
                <div className="service-grid">
                  {projectServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}
