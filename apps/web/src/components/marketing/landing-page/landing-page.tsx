import { DeveloperSection } from './sections/developer-section'
import { FeaturesSection } from './sections/features-section'
import { FinalCtaSection } from './sections/final-cta-section'
import { HeroSection } from './sections/hero-section'
import {
  HowItWorksSection,
  ProblemSection,
  ProviderStrip,
} from './sections/readiness-sections'
import { SiteFooter } from './sections/site-footer'
import { SiteHeader } from './sections/site-header'

export function LandingPage() {
  return (
    <div className="site-shell relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <SiteHeader />
      <main id="main">
        <HeroSection />
        <ProviderStrip />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DeveloperSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
