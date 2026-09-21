import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { resendVerification } from '#/components/auth/auth-api'
import { ArrowRight, Mail, ShieldCheck } from '#/components/auth/auth-icons'

export const Route = createFileRoute('/auth/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === 'string' ? search.email : '',
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { email } = Route.useSearch()
  const mutation = useMutation({
    mutationFn: () => resendVerification(email || 'you@example.com'),
  })

  return (
    <div className="auth-form-card auth-message-card auth-verify-card">
      <div className="verification-visual" aria-hidden="true">
        <span className="verification-ring verification-ring--outer" />
        <span className="verification-ring verification-ring--inner" />
        <i>
          <Mail size={24} />
        </i>
      </div>
      <span className="auth-step-label">ONE LAST STEP</span>
      <h1>Verify your email</h1>
      <p>
        We sent a verification link to{' '}
        <strong>{email || 'you@example.com'}</strong>. Open it to activate your
        Emberline account.
      </p>
      <div className="verification-tip">
        <ShieldCheck size={17} />
        <span>
          <strong>Link expires in 24 hours</strong>
          Check your spam folder if it doesn&apos;t arrive.
        </span>
      </div>
      <Link className="auth-submit" to="/dashboard">
        Preview dashboard <ArrowRight size={16} />
      </Link>
      <button
        className="auth-text-button"
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending
          ? 'Sending…'
          : mutation.isSuccess
            ? 'Verification email resent'
            : 'Resend verification email'}
      </button>
      <p className="verification-wrong-email">
        Wrong email? <Link to="/auth/sign-up">Create another account</Link>
      </p>
    </div>
  )
}
