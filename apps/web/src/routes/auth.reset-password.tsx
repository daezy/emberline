import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { resetPassword } from '#/components/auth/auth-api'
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from '#/components/auth/auth-icons'
import { AuthField } from '#/components/auth/auth-field'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({ mutationFn: resetPassword })

  if (mutation.isSuccess) {
    return (
      <div className="auth-form-card auth-message-card">
        <span className="auth-message-icon auth-message-icon--success">
          <CheckCircle2 size={23} />
        </span>
        <span className="auth-step-label">PASSWORD UPDATED</span>
        <h1>You&apos;re all set</h1>
        <p>Your new password is active. You can use it to sign in now.</p>
        <Link className="auth-submit" to="/auth/sign-in">
          Continue to sign in <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-form-card auth-message-card">
      <span className="auth-message-icon">
        <KeyRound size={22} />
      </span>
      <span className="auth-step-label">SECURE YOUR ACCOUNT</span>
      <h1>Choose a new password</h1>
      <p>Use something unique that you don&apos;t use for another service.</p>
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (password !== confirmPassword) {
            setValidationError('The passwords do not match.')
            return
          }
          setValidationError('')
          mutation.mutate(password)
        }}
      >
        <AuthField
          label="New password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint="Use upper and lowercase letters, a number, and a symbol."
          value={password}
          onChange={setPassword}
        />
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Enter it once more"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {validationError && (
          <p className="auth-form-error" role="alert">
            {validationError}
          </p>
        )}
        <button
          className="auth-submit"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Updating password…' : 'Update password'}
          {!mutation.isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  )
}
