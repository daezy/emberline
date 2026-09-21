import { useId, useState } from 'react'

import { Eye, EyeOff } from './auth-icons'

type AuthFieldProps = {
  label: string
  name: string
  type?: 'email' | 'password' | 'text'
  placeholder: string
  autoComplete?: string
  hint?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  hint,
  required = true,
  value,
  onChange,
}: AuthFieldProps) {
  const id = useId()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const inputType = type === 'password' && passwordVisible ? 'text' : type

  return (
    <label className="auth-field" htmlFor={id}>
      {label && <span>{label}</span>}
      <div className="auth-input-wrap">
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          >
            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </label>
  )
}
