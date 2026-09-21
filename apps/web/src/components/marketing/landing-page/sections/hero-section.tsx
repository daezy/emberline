import { Link } from '@tanstack/react-router'

import { ArrowIcon, CheckIcon } from '../ui/icons'
import { DashboardPreview } from '../ui/dashboard-preview'

export function HeroSection() {
  return (
    <section className="hero relative z-1 grid items-center" id="top">
      <div className="hero-copy">
        <div className="section-kicker hero-reveal reveal-one">
          <span className="live-dot" />
          READINESS INFRASTRUCTURE
        </div>
        <h1 className="hero-reveal reveal-two">
          Your server went to sleep.
          <br />
          <span>Your users shouldn&apos;t have to wake it.</span>
        </h1>
        <p className="hero-lede hero-reveal reveal-three">
          Emberline keeps your applications warm, detects cold starts, and makes
          sure your services are ready before traffic arrives.
        </p>
        <div className="hero-actions hero-reveal reveal-four flex gap-3">
          <Link className="button button-primary" to="/auth/sign-up">
            Start warming <ArrowIcon />
          </Link>
          <a className="button button-secondary" href="#how-it-works">
            See how it works
          </a>
        </div>
        <div className="hero-note hero-reveal reveal-five">
          <CheckIcon />
          Setup in under two minutes. No code required.
        </div>
      </div>

      <div className="hero-visual hero-reveal reveal-three">
        <div className="coordinate coordinate-top">READINESS / 96.4</div>
        <DashboardPreview />
        <div className="coordinate coordinate-bottom">PING / 08:42:19.184</div>
      </div>
    </section>
  )
}
