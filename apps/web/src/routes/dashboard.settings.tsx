import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="page-stack settings-page">
      <section className="page-heading">
        <div>
          <span className="page-eyebrow">Workspace</span>
          <h1>Settings</h1>
          <p>Manage your preferences and notifications.</p>
        </div>
      </section>
      <div className="settings-grid">
        <nav className="settings-tabs" aria-label="Settings sections">
          <button className="is-active">General</button>
          <button>Notifications</button>
          <button>Plan & usage</button>
        </nav>
        <section className="panel settings-panel">
          <div className="settings-section">
            <div>
              <h2>Workspace</h2>
              <p>Shared details for this Emberline workspace.</p>
            </div>
            <div className="settings-fields">
              <label className="form-field">
                <span>Workspace name</span>
                <input defaultValue="Personal workspace" />
              </label>
              <label className="form-field">
                <span>Default timezone</span>
                <div className="select-control">
                  <select defaultValue="lagos">
                    <option value="lagos">Africa/Lagos (GMT+1)</option>
                    <option value="london">Europe/London (GMT+1)</option>
                    <option value="new-york">America/New York (GMT-4)</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <div>
              <h2>Email notifications</h2>
              <p>Choose which service events reach your inbox.</p>
            </div>
            <div className="toggle-list">
              <Toggle
                label="Service went down"
                description="After two consecutive failed requests."
                defaultChecked
              />
              <Toggle
                label="Service recovered"
                description="When a previously down service responds again."
                defaultChecked
              />
              <Toggle
                label="Repeated cold starts"
                description="When three cold starts occur within one hour."
              />
            </div>
          </div>
          <div className="settings-save">
            <button className="dash-button dash-button--primary" type="button">
              Save changes
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" defaultChecked={defaultChecked} />
      <i />
    </label>
  )
}
