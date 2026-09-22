import { useEffect, useRef, useState } from 'react'

import { GoogleIcon } from './google-icon'

type GoogleId = {
  initialize: (config: {
    client_id: string
    callback: (response: { credential: string }) => void
  }) => void
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

let scriptPromise: Promise<void> | undefined

function loadGoogleScript() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = undefined
      reject(new Error('Could not load Google sign-in'))
    }
    document.head.append(script)
  })
  return scriptPromise
}

type GoogleSignInButtonProps = {
  label: string
  mode: 'signin' | 'signup'
  disabled?: boolean
  onCredential: (idToken: string) => void
}

export function GoogleSignInButton({
  label,
  mode,
  disabled,
  onCredential,
}: GoogleSignInButtonProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onCredentialRef.current = onCredential
  })

  useEffect(() => {
    const overlay = overlayRef.current
    if (!clientId || !overlay) return

    let cancelled = false
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => onCredentialRef.current(credential),
        })
        window.google.accounts.id.renderButton(overlay, {
          type: 'standard',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          width: Math.min(400, Math.round(overlay.offsetWidth)),
        })
      })
      .catch(() => setFailed(true))

    return () => {
      cancelled = true
    }
  }, [mode])

  const unavailable = !clientId || failed

  return (
    <>
      <div className="google-button">
        <button
          className="oauth-button"
          type="button"
          disabled={disabled || unavailable}
          tabIndex={-1}
          aria-hidden="true"
        >
          <GoogleIcon /> {label}
        </button>
        {!unavailable && !disabled && (
          <div className="google-button__overlay" ref={overlayRef} />
        )}
      </div>
      {unavailable && (
        <p className="auth-inline-note" role="status">
          {clientId
            ? "Google sign-in couldn't load. Use email instead."
            : 'Google sign-in is not configured.'}
        </p>
      )}
    </>
  )
}
