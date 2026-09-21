import { BrandLogo } from '../ui/brand-logo'

export function SiteFooter() {
  return (
    <footer className="site-footer section-wrap relative z-2 grid items-center">
      <a
        className="brand inline-flex items-center gap-3"
        href="#top"
        aria-label="Emberline home"
      >
        <BrandLogo />
      </a>
      <p>Readiness infrastructure for modern applications.</p>
      <div className="footer-links">
        <a href="#developers">Docs</a>
        <a href="mailto:hello@emberline.dev">Contact</a>
        <span>© 2026 Emberline</span>
      </div>
    </footer>
  )
}
