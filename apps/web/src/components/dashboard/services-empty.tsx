import { Link } from '@tanstack/react-router'

import { Plus } from './icons'

export function ServicesEmpty() {
  return (
    <div className="empty-state">
      <h2>No services yet</h2>
      <p>Add an endpoint and Emberline will start keeping it warm.</p>
      <Link
        className="dash-button dash-button--primary"
        to="/dashboard/services/new"
      >
        <Plus size={16} /> Add service
      </Link>
    </div>
  )
}
