import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { signInWithGoogle, signUp } from '#/components/auth/auth-api'
import { ArrowRight, Check } from '#/components/auth/auth-icons'
import { AuthField } from '#/components/auth/auth-field'
import { GoogleSignInButton } from '#/components/auth/google-sign-in-button'

export const Route = createFileRoute('/auth/sign-up')({ component: SignUpPage })

function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const strength = useMemo(() => {
    return [
      password.length >= 8,
      /[A-Z]/.test(password) && /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length
  }, [password])
  const goToDashboard = () => navigate({ to: '/dashboard' })
  const mutation = useMutation({ mutationFn: signUp, onSuccess: goToDashboard })
  const google = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: goToDashboard,
  })
  const busy = mutation.isPending || google.isPending
  const error = mutation.error ?? google.error

  return (
    <div className="auth-form-card auth-form-card--signup">
      <header className="auth-form-heading">
        <span className="auth-step-label">START WARMING</span>
        <h1>Create your account</h1>
        <p>
          Already use Emberline? <Link to="/auth/sign-in">Sign in</Link>
        </p>
      </header>

      <GoogleSignInButton
        label="Sign up with Google"
        mode="signup"
        disabled={busy}
        onCredential={(idToken) => google.mutate(idToken)}
      />

      <div className="auth-divider">
        <span>or create an account with email</span>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate({ name, email, password })
        }}
      >
        <AuthField
          label="Your name"
          name="name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          value={name}
          onChange={setName}
        />
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        <div className="password-strength" aria-live="polite">
          <div>
            {[0, 1, 2, 3].map((level) => (
              <i key={level} className={strength > level ? 'is-active' : ''} />
            ))}
          </div>
          <span>
            {strength === 0
              ? 'Use 8+ characters'
              : strength < 3
                ? 'Keep going'
                : strength === 3
                  ? 'Strong password'
                  : 'Excellent password'}
          </span>
        </div>
        <label className="auth-checkbox auth-checkbox--terms">
          <input type="checkbox" required />
          <span>
            <i /> I agree to the Terms and Privacy Policy
          </span>
        </label>
        {error && (
          <p className="auth-error" role="alert">
            {error.message}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={busy}>
          {mutation.isPending ? 'Creating account…' : 'Create account'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="auth-plan-note">
        <Check size={13} /> Free during early access · No credit card required
      </div>
    </div>
  )
}
