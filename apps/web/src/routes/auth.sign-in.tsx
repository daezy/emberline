import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { signIn } from '#/components/auth/auth-api'
import { ArrowRight } from '#/components/auth/auth-icons'
import { AuthField } from '#/components/auth/auth-field'
import { GoogleIcon } from '#/components/auth/google-icon'

export const Route = createFileRoute('/auth/sign-in')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [providerMessage, setProviderMessage] = useState('')
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigate({ to: '/dashboard' }),
  })

  return (
    <div className="auth-form-card">
      <header className="auth-form-heading">
        <span className="auth-step-label">WELCOME BACK</span>
        <h1>Sign in to Emberline</h1>
        <p>
          New here? <Link to="/auth/sign-up">Create a free account</Link>
        </p>
      </header>

      <button
        className="oauth-button"
        type="button"
        onClick={() =>
          setProviderMessage('Google authentication will connect here.')
        }
      >
        <GoogleIcon /> Continue with Google
      </button>
      {providerMessage && (
        <p className="auth-inline-note" role="status">
          {providerMessage}
        </p>
      )}

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate({ email, password })
        }}
      >
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <div className="auth-password-field">
          <Link className="auth-field-action" to="/auth/forgot-password">
            Forgot password?
          </Link>
          <AuthField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </div>
        <label className="auth-checkbox">
          <input type="checkbox" />
          <span>
            <i /> Keep me signed in
          </span>
        </label>
        <button
          className="auth-submit"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="auth-security-note">
        Protected by encrypted sessions and secure cookies.
      </p>
    </div>
  )
}
