import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  Server,
  Sparkles,
  Zap,
} from '#/components/dashboard/icons'

export const Route = createFileRoute('/dashboard/services/new')({
  component: NewServicePage,
})

function NewServicePage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [policy, setPolicy] = useState('always')
  const [previewReady, setPreviewReady] = useState(false)

  return (
    <div className="new-service-page">
      <Link className="back-link" to="/dashboard/services">
        <ArrowLeft size={15} /> Cancel setup
      </Link>
      <section className="setup-heading">
        <span className="page-eyebrow">New service</span>
        <h1>What should we keep warm?</h1>
        <p>
          Add an endpoint now. You can fine-tune its request settings later.
        </p>
      </section>
      <ol className="setup-progress">
        {[
          ['01', 'Endpoint'],
          ['02', 'Warm policy'],
          ['03', 'Review'],
        ].map(([number, label], index) => (
          <li key={number} className={step >= index + 1 ? 'is-active' : ''}>
            <span>{step > index + 1 ? <Check size={13} /> : number}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      <div className="setup-grid">
        <form
          className="setup-card"
          onSubmit={(event) => {
            event.preventDefault()
            if (step < 3) setStep(step + 1)
            else setPreviewReady(true)
          }}
        >
          {step === 1 && (
            <>
              <div className="setup-card__heading">
                <span className="form-icon">
                  <Server size={18} />
                </span>
                <div>
                  <h2>Service details</h2>
                  <p>Enter the public endpoint Emberline should check.</p>
                </div>
              </div>
              <label className="form-field">
                <span>Service name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Atlas API"
                  required
                />
                <small>A clear name for this service in your workspace.</small>
              </label>
              <label className="form-field">
                <span>Endpoint URL</span>
                <div className="input-with-prefix">
                  <span>https://</span>
                  <input
                    value={endpoint}
                    onChange={(event) => setEndpoint(event.target.value)}
                    placeholder="api.example.com/health"
                    required
                  />
                </div>
                <small>
                  Use a lightweight health or readiness endpoint if possible.
                </small>
              </label>
              <label className="form-field">
                <span>
                  Project <em>Optional</em>
                </span>
                <div className="select-control">
                  <select defaultValue="">
                    <option value="" disabled>
                      Select a project
                    </option>
                    <option>Atlas</option>
                    <option>Papertrail</option>
                    <option>Personal</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <div className="setup-card__heading">
                <span className="form-icon">
                  <Clock3 size={18} />
                </span>
                <div>
                  <h2>Warm policy</h2>
                  <p>Choose when this endpoint should be ready.</p>
                </div>
              </div>
              <div className="policy-options">
                <label className={policy === 'always' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="policy"
                    value="always"
                    checked={policy === 'always'}
                    onChange={() => setPolicy('always')}
                  />
                  <span className="option-icon">
                    <Zap size={17} />
                  </span>
                  <span>
                    <strong>Always warm</strong>
                    <small>Check every 10 minutes, around the clock.</small>
                  </span>
                  <i />
                </label>
                <label className={policy === 'scheduled' ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="policy"
                    value="scheduled"
                    checked={policy === 'scheduled'}
                    onChange={() => setPolicy('scheduled')}
                  />
                  <span className="option-icon">
                    <Clock3 size={17} />
                  </span>
                  <span>
                    <strong>Scheduled</strong>
                    <small>Keep it warm only during selected hours.</small>
                  </span>
                  <i />
                </label>
              </div>
              <label className="form-field">
                <span>Warm interval</span>
                <div className="select-control">
                  <select defaultValue="10">
                    <option value="5">Every 5 minutes</option>
                    <option value="10">Every 10 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
              </label>
              {policy === 'scheduled' && (
                <div className="schedule-preview">
                  <Clock3 size={16} />
                  <div>
                    <strong>Monday–Friday · 08:00–22:00</strong>
                    <span>Africa/Lagos (GMT+1)</span>
                  </div>
                  <button type="button">Edit</button>
                </div>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <div className="setup-card__heading">
                <span className="form-icon form-icon--success">
                  <Check size={18} />
                </span>
                <div>
                  <h2>Ready to start warming</h2>
                  <p>Review the configuration before adding this service.</p>
                </div>
              </div>
              <div className="review-service">
                <span className="service-glyph service-glyph--warm">
                  <span />
                </span>
                <div>
                  <strong>{name || 'Unnamed service'}</strong>
                  <code>https://{endpoint || 'api.example.com/health'}</code>
                </div>
                <span className="provider-tag">AUTO DETECT</span>
              </div>
              <dl className="review-list">
                <div>
                  <dt>Warm policy</dt>
                  <dd>{policy === 'always' ? 'Always warm' : 'Scheduled'}</dd>
                </div>
                <div>
                  <dt>Interval</dt>
                  <dd>Every 10 minutes</dd>
                </div>
                <div>
                  <dt>HTTP method</dt>
                  <dd>GET</dd>
                </div>
                <div>
                  <dt>Timeout</dt>
                  <dd>30 seconds</dd>
                </div>
              </dl>
              <div className="frontend-note">
                <Sparkles size={16} />
                <p>
                  <strong>Frontend preview</strong>This form is ready to connect
                  to a create-service mutation when the API is available.
                </p>
              </div>
            </>
          )}
          <div className="setup-actions">
            {step > 1 && (
              <button
                className="dash-button dash-button--secondary"
                type="button"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button className="dash-button dash-button--primary" type="submit">
              {step === 3
                ? previewReady
                  ? 'Configuration ready'
                  : 'Add service'
                : 'Continue'}
            </button>
          </div>
        </form>

        <aside className="setup-aside">
          <div className="setup-aside__visual">
            <div className="signal-ring signal-ring--one" />
            <div className="signal-ring signal-ring--two" />
            <div className="signal-ring signal-ring--three" />
            <span>
              <Globe2 size={21} />
            </span>
          </div>
          <span className="page-eyebrow">Good to know</span>
          <h2>Use a dedicated health endpoint.</h2>
          <p>
            A lightweight endpoint keeps checks fast and avoids unnecessary work
            in your application.
          </p>
          <code>GET /health → 200 OK</code>
        </aside>
      </div>
    </div>
  )
}
