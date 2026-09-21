import { Link, Outlet } from '@tanstack/react-router'

import iconUrl from '#/assets/icons/emberline-mark.png'

import { Check, Gauge, Globe2, Zap } from './auth-icons'

export function AuthShell() {
  return (
    <main className="auth-shell">
      <a className="skip-link" href="#auth-content">
        Skip to form
      </a>
      <section className="auth-story" aria-label="About Emberline">
        <div className="auth-story__grid" />
        <div className="auth-story__glow" />
        <Link className="auth-brand" to="/">
          <img src={iconUrl} alt="" />
          <span>emberline</span>
        </Link>

        <div className="auth-story__content">
          <span className="auth-kicker">
            <i /> READINESS INFRASTRUCTURE
          </span>
          <h2>
            Ready before the
            <br />
            request arrives.
          </h2>
          <p>
            Keep idle-prone services responsive and see exactly when cold starts
            slow you down.
          </p>

          <div className="auth-signal-card">
            <div className="auth-signal-card__head">
              <span>
                <Globe2 size={14} /> atlas-api
              </span>
              <strong>
                <i /> WARM
              </strong>
            </div>
            <div className="auth-readiness-line">
              <span />
              <i />
            </div>
            <div className="auth-signal-metrics">
              <div>
                <strong>184ms</strong>
                <span>Latency</span>
              </div>
              <div>
                <strong>99.98%</strong>
                <span>Uptime</span>
              </div>
              <div>
                <strong>6m</strong>
                <span>Next warm</span>
              </div>
            </div>
          </div>

          <ul className="auth-benefits">
            <li>
              <Check size={13} /> Setup in under two minutes
            </li>
            <li>
              <Zap size={13} /> No code required
            </li>
            <li>
              <Gauge size={13} /> Free during early access
            </li>
          </ul>
        </div>

        <p className="auth-story__footer">Keep your services warm.</p>
      </section>

      <section className="auth-workspace" id="auth-content">
        <div className="auth-mobile-brand">
          <Link className="auth-brand" to="/">
            <img src={iconUrl} alt="" />
            <span>emberline</span>
          </Link>
        </div>
        <Outlet />
        <p className="auth-legal">
          By continuing, you agree to Emberline&apos;s{' '}
          <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </section>
    </main>
  )
}
