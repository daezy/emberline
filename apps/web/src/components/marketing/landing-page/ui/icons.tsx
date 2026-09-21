export function SignalMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3.5 14h5.25l2.1-5.2 3.25 10.4 2.5-7.1 1.65 1.9H24.5" />
      <circle cx="14" cy="14" r="12.25" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="7.25" />
      <path d="m5.8 9 2.1 2.1 4.4-4.5" />
    </svg>
  )
}
