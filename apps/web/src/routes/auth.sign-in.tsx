import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { signIn, signInWithGoogle } from '#/components/auth/auth-api'
import { ArrowRight } from '#/components/auth/auth-icons'
import { AuthField } from '#/components/auth/auth-field'
import { GoogleSignInButton } from '#/components/auth/google-sign-in-button'

export const Route = createFileRoute('/auth/sign-in')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const goToDashboard = () => navigate({ to: '/dashboard' })
  const mutation = useMutation({ mutationFn: signIn, onSuccess: goToDashboard })
  const google = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: goToDashboard,
  })
  const busy = mutation.isPending || google.isPending
  const error = mutation.error ?? google.error

  return (
    <div className="auth-form-card">
      <header className="auth-form-heading">
        <span className="auth-step-label">WELCOME BACK</span>
        <h1>Sign in to Emberline</h1>
        <p>
          New here? <Link to="/auth/sign-up">Create a free account</Link>
        </p>
      </header>

      <GoogleSignInButton
        label="Continue with Google"
        mode="signin"
        disabled={busy}
        onCredential={(idToken) => google.mutate(idToken)}
      />

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate({ email, password, remember })
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
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>
            <i /> Keep me signed in
          </span>
        </label>
        {error && (
          <p className="auth-error" role="alert">
            {error.message}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={busy}>
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
