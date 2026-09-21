import { latencyBars } from '../landing-page.data'
import { Status } from '../ui/status'

export function FeaturesSection() {
  return (
    <section className="feature-section section-wrap">
      <div className="section-intro feature-heading">
        <div className="section-kicker">
          <span>03</span> QUIETLY INTELLIGENT
        </div>
        <h2>
          Warm when it matters.
          <br />
          Sleeping when it doesn&apos;t.
        </h2>
      </div>

      <div className="feature-grid grid gap-4 md:grid-cols-2">
        <article className="feature-card feature-schedule">
          <div className="feature-copy">
            <span className="feature-label">SMART SCHEDULING</span>
            <h3>Match readiness to real traffic.</h3>
            <p>
              Keep production warm during peak hours. Let staging sleep
              overnight. You stay fast without wasting compute.
            </p>
          </div>
          <SchedulePreview />
        </article>

        <article className="feature-card feature-alerts">
          <div className="feature-copy">
            <span className="feature-label">CLEAR SIGNALS</span>
            <h3>Know exactly what changed.</h3>
            <p>
              See cold starts, failed checks, and recovery events in language
              built for developers.
            </p>
          </div>
          <EventPreview />
        </article>

        <article className="feature-card feature-analytics">
          <div className="feature-copy">
            <span className="feature-label">COLD-START ANALYTICS</span>
            <h3>See the latency your users avoid.</h3>
            <p>
              Understand baseline response time, startup penalties, and
              readiness trends over time.
            </p>
          </div>
          <LatencyPreview />
        </article>
      </div>
    </section>
  )
}

function SchedulePreview() {
  return (
    <div className="schedule-ui" aria-label="Warm policy schedule preview">
      <div className="schedule-days">
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span className="off">S</span>
        <span className="off">S</span>
      </div>
      <div className="schedule-chart">
        <div className="chart-range">
          <i />
          <strong>WARM</strong>
        </div>
        <div className="chart-axis">
          <span>00</span>
          <span>06</span>
          <span>09</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>
    </div>
  )
}

function EventPreview() {
  return (
    <div className="event-stack" aria-label="Recent events preview">
      <div className="event-card prominent">
        <Status type="cold">COLD START</Status>
        <strong>Response took 18.4s</strong>
        <small>Normal latency is 420ms</small>
        <time>09:41:02</time>
      </div>
      <div className="event-card">
        <Status type="warm">WARM</Status>
        <strong>AI Backend is warm again</strong>
        <time>09:41:24</time>
      </div>
    </div>
  )
}

function LatencyPreview() {
  return (
    <div className="mini-chart" aria-label="Response latency chart">
      <div className="chart-value">
        <strong>184ms</strong>
        <span>Current latency</span>
      </div>
      <div className="chart-bars" aria-hidden="true">
        {latencyBars.map((height, index) => (
          <i
            key={index}
            className={height > 70 ? 'spike' : ''}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="chart-legend">
        <span>12AM</span>
        <span>NOW</span>
      </div>
    </div>
  )
}
