import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { requestPasswordReset } from '#/components/auth/auth-api'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from '#/components/auth/auth-icons'
import { AuthField } from '#/components/auth/auth-field'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const mutation = useMutation({ mutationFn: requestPasswordReset })

  if (mutation.isSuccess) {
    return (
      <div className="auth-form-card auth-message-card">
        <span className="auth-message-icon auth-message-icon--success">
          <CheckCircle2 size={23} />
        </span>
        <span className="auth-step-label">CHECK YOUR INBOX</span>
        <h1>Reset link sent</h1>
        <p>
          We sent password reset instructions to <strong>{email}</strong>. The
          link expires in 30 minutes.
        </p>
        <Link className="auth-submit" to="/auth/sign-in">
          Back to sign in <ArrowRight size={16} />
        </Link>
        <button
          className="auth-text-button"
          type="button"
          onClick={() => mutation.reset()}
        >
          Didn&apos;t get it? Try another email
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form-card auth-message-card">
      <span className="auth-message-icon">
        <Mail size={22} />
      </span>
      <span className="auth-step-label">ACCOUNT RECOVERY</span>
      <h1>Forgot your password?</h1>
      <p>
        No problem. Enter your email and we&apos;ll send you a secure reset
        link.
      </p>
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate(email)
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
        <button
          className="auth-submit"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Sending link…' : 'Send reset link'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
      <Link className="auth-back-link" to="/auth/sign-in">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </div>
  )
}
