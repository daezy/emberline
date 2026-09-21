import { Link } from '@tanstack/react-router'

import { ArrowIcon } from '../ui/icons'

export function FinalCtaSection() {
  return (
    <section className="cta-section section-wrap relative z-2" id="get-started">
      <div className="cta-panel">
        <div className="cta-signal" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="section-kicker">
          <span className="live-dot" />
          YOUR FIRST SERVICE IS WAITING
        </div>
        <h2>Keep your services warm.</h2>
        <p>Make your application ready before your users arrive.</p>
        <Link className="button button-primary" to="/auth/sign-up">
          Start warming <ArrowIcon />
        </Link>
        <small>Free during early access · No credit card required</small>
      </div>
    </section>
  )
}
