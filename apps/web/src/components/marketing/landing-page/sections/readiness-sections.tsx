import { providers, steps } from '../landing-page.data'
import { ArrowIcon, SignalMark } from '../ui/icons'
import { Status } from '../ui/status'

export function ProviderStrip() {
  return (
    <section
      className="provider-strip relative z-2 grid items-center"
      aria-label="Supported infrastructure"
    >
      <p>KEEP ANY ENDPOINT READY</p>
      <div className="provider-list">
        {providers.map((provider) => (
          <span key={provider}>{provider}</span>
        ))}
      </div>
    </section>
  )
}

export function ProblemSection() {
  return (
    <section
      className="problem-section section-wrap relative z-2 grid items-center"
      id="features"
    >
      <div className="section-intro">
        <div className="section-kicker">
          <span>01</span> THE FIRST REQUEST
        </div>
        <h2>Cold starts are invisible infrastructure debt.</h2>
        <p>
          Scale-to-zero keeps costs down. It can also make the first user wait
          while your application starts from nothing. Emberline catches the
          delay before they do.
        </p>
      </div>
      <div className="latency-comparison">
        <div className="comparison-header">
          <span>RESPONSE TIME</span>
          <span>LAST 24 HOURS</span>
        </div>
        <div className="comparison-item">
          <div className="comparison-label">
            <Status type="cold">COLD START</Status>
            <strong>
              18.4<span>s</span>
            </strong>
          </div>
          <div className="bar-track">
            <div className="bar bar-cold" />
          </div>
          <p>Container startup · dependency init · database reconnect</p>
        </div>
        <div className="comparison-item">
          <div className="comparison-label">
            <Status type="warm">WARM</Status>
            <strong>
              420<span>ms</span>
            </strong>
          </div>
          <div className="bar-track">
            <div className="bar bar-warm" />
          </div>
          <p>Ready to serve immediately</p>
        </div>
        <div className="comparison-footer">
          <span>43×</span> faster when your service is ready
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-wrap">
        <div className="section-intro centered">
          <div className="section-kicker">
            <span>02</span> HOW IT WORKS
          </div>
          <h2>Ready before the request arrives.</h2>
          <p>
            One endpoint. One policy. A consistently faster first experience.
          </p>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="step-card" key={step.number}>
              <div className="step-top">
                <span>{step.number}</span>
                {index < steps.length - 1 && (
                  <i aria-hidden="true">
                    <ArrowIcon />
                  </i>
                )}
              </div>
              <div
                className={`step-icon step-icon-${index + 1}`}
                aria-hidden="true"
              >
                {index === 2 ? <SignalMark /> : <span />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
