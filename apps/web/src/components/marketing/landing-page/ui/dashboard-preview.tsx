import { SignalMark } from './icons'
import { Status } from './status'

export function DashboardPreview() {
  return (
    <div className="dashboard-shell" aria-label="Emberline dashboard preview">
      <div className="dashboard-glow" />
      <div className="dashboard-topbar">
        <div className="window-controls" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="dashboard-wordmark">
          <SignalMark />
          <span>emberline</span>
        </div>
        <span className="topbar-meta">OVERVIEW</span>
      </div>

      <div className="dashboard-body">
        <div className="preview-heading">
          <div>
            <span className="eyebrow">SERVICE READINESS</span>
            <h2>AI Backend</h2>
            <code>api.emberdemo.dev/health</code>
          </div>
          <Status type="warm">WARM</Status>
        </div>

        <div className="readiness-card">
          <div className="readiness-labels">
            <span>COLD</span>
            <strong>READY</strong>
          </div>
          <div className="readiness-track">
            <div className="readiness-fill" />
            <i className="readiness-node" />
          </div>
          <div className="readiness-result">
            <div>
              <strong>96%</strong>
              <span>Readiness</span>
            </div>
            <div className="pulse-copy">
              <i />
              Responding normally
            </div>
          </div>
        </div>

        <div className="metric-grid">
          <div>
            <strong>
              184<span>ms</span>
            </strong>
            <small>LATENCY</small>
          </div>
          <div>
            <strong>
              08<span>m</span>
            </strong>
            <small>NEXT WARM</small>
          </div>
          <div>
            <strong>
              99.98<span>%</span>
            </strong>
            <small>30D READINESS</small>
          </div>
        </div>

        <div className="activity-row">
          <div className="activity-icon">
            <SignalMark />
          </div>
          <div>
            <strong>Warm check completed</strong>
            <span>Response received in 184ms</span>
          </div>
          <time>JUST NOW</time>
        </div>
      </div>
    </div>
  )
}
