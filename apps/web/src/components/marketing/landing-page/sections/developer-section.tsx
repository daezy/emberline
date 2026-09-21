import { CheckIcon } from '../ui/icons'

const capabilities = [
  'Any HTTP endpoint',
  'Provider agnostic',
  'Deployment hooks',
  'Readiness API',
]

export function DeveloperSection() {
  return (
    <section className="developer-section" id="developers">
      <div className="section-wrap developer-grid grid items-center">
        <div className="developer-copy">
          <div className="section-kicker">
            <span>04</span> BUILT FOR DEVELOPERS
          </div>
          <h2>
            Works with your stack.
            <br />
            Fits your workflow.
          </h2>
          <p>
            Start in the dashboard, automate with the CLI, or integrate through
            the API. Emberline stays out of the way until there is something
            worth seeing.
          </p>
          <ul>
            {capabilities.map((capability) => (
              <li key={capability}>
                <CheckIcon /> {capability}
              </li>
            ))}
          </ul>
        </div>
        <TerminalPreview />
      </div>
    </section>
  )
}

function TerminalPreview() {
  return (
    <div className="terminal" aria-label="Emberline command line preview">
      <div className="terminal-header">
        <div className="window-controls" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>~/production</span>
        <span>ember</span>
      </div>
      <div className="terminal-body">
        <p>
          <span className="prompt">$</span>ember status
        </p>
        <div className="terminal-table">
          <div className="table-row table-head">
            <span>SERVICE</span>
            <span>STATUS</span>
            <span>LATENCY</span>
          </div>
          <div className="table-row">
            <span>api</span>
            <span className="text-warm">● warm</span>
            <span>184ms</span>
          </div>
          <div className="table-row">
            <span>worker</span>
            <span className="text-muted">● sleeping</span>
            <span>—</span>
          </div>
          <div className="table-row">
            <span>staging</span>
            <span className="text-cold">● cold</span>
            <span>8.7s</span>
          </div>
        </div>
        <p className="terminal-cursor">
          <span className="prompt">$</span>
          <i />
        </p>
      </div>
    </div>
  )
}
