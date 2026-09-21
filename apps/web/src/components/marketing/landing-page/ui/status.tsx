import type { ReactNode } from 'react'

type StatusProps = {
  type: 'warm' | 'cold'
  children: ReactNode
}

export function Status({ type, children }: StatusProps) {
  return (
    <span className={`status status-${type}`}>
      <i />
      {children}
    </span>
  )
}
