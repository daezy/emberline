import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getServices } from '#/components/dashboard/dashboard-data'
import { ListFilter, Plus, Search } from '#/components/dashboard/icons'
import { ServiceCard } from '#/components/dashboard/service-card'

export const Route = createFileRoute('/dashboard/services/')({
  component: ServicesPage,
})

function ServicesPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  })
  const [query, setQuery] = useState('')
  const visible = data.filter((service) =>
    `${service.name} ${service.endpoint} ${service.provider}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Services</h1>
          <p>Every endpoint Emberline is keeping ready.</p>
        </div>
        <Link
          className="dash-button dash-button--primary"
          to="/dashboard/services/new"
        >
          <Plus size={16} /> Add service
        </Link>
      </section>
      <div className="service-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
          />
        </label>
        <button className="dash-button dash-button--secondary" type="button">
          <ListFilter size={15} /> All states
        </button>
      </div>
      <div className="services-count">
        <strong>{visible.length}</strong> services <span>·</span>{' '}
        {data.filter((service) => service.status === 'warm').length} warm
      </div>
      {isLoading ? (
        <div className="service-grid">
          {[0, 1, 2, 3].map((item) => (
            <div className="service-card service-card--loading" key={item} />
          ))}
        </div>
      ) : (
        <div className="service-grid">
          {visible.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
