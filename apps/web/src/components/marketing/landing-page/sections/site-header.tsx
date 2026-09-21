import { Link } from '@tanstack/react-router'

import { BrandLogo } from '../ui/brand-logo'
import { ArrowIcon } from '../ui/icons'

export function SiteHeader() {
  return (
    <header className="site-header relative z-10 grid items-center">
      <a
        className="brand inline-flex items-center gap-3"
        href="#top"
        aria-label="Emberline home"
      >
        <BrandLogo />
      </a>
      <nav className="items-center md:flex" aria-label="Primary navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
        <Link to="/auth/sign-in">Sign in</Link>
        <a href="#developers">Developers</a>
      </nav>
      <Link className="header-cta" to="/auth/sign-up">
        Start warming <ArrowIcon />
      </Link>
    </header>
  )
}
