# Emberline
## Brand Guidelines

**Brand:** Emberline  
**Category:** Developer Infrastructure  
**Primary Tagline:** Keep your services warm.

---

# 1. Brand Idea

An ember remains alive even when the flame disappears.

That idea represents Emberline's purpose:

Applications may become inactive, scale down, or sleep, but Emberline keeps the necessary readiness alive beneath the surface.

The brand should communicate:

- Readiness.
- Warmth.
- Reliability.
- Infrastructure.
- Speed.
- Quiet intelligence.

Emberline should feel like a developer tool first and a SaaS company second.

---

# 2. Brand Positioning

Emberline is a service-readiness platform that keeps serverless and idle-prone applications responsive before users arrive.

Its focus is not merely uptime.

Its focus is **readiness**.

### Uptime asks:

> Is your application available?

### Emberline asks:

> Is your application ready?

---

# 3. Brand Promise

**Your users should never have to wake your server.**

---

# 4. Primary Tagline

# Keep your services warm.

This should remain the most frequently used Emberline tagline.

---

# 5. Secondary Messaging

Approved supporting lines include:

### Cold starts, handled.

### Always ready when traffic arrives.

### Wake before your users do.

### Warm infrastructure. Faster experiences.

### Your server went to sleep. Your users shouldn't have to wake it.

### Ready before the request arrives.

---

# 6. Brand Personality

Emberline should be:

### Technical

It understands developers and infrastructure.

### Calm

The brand should never feel noisy or alarmist.

### Precise

Metrics and system states should be clear.

### Minimal

Avoid visual clutter.

### Reliable

Infrastructure products depend on trust.

### Slightly Playful

The heat/warmth metaphor provides personality without becoming gimmicky.

---

# 7. Brand Personality Spectrum

```text
Corporate        ●─────── Emberline ───────● Casual

Complex          ●──────── Emberline ───● Simple

Playful          ●────── Emberline ─────● Serious

Loud             ●────────── Emberline ● Quiet

Consumer         ●────────── Emberline ● Developer
```

---

# 8. Brand Voice

Emberline communicates like an experienced infrastructure engineer.

Short.

Clear.

Useful.

No unnecessary jargon.

---

# 9. Writing Style

Prefer:

> Cold start detected.

Not:

> Our system has identified that your infrastructure may currently be experiencing an abnormal latency event.

Prefer:

> Your service responded in 18.4s. Normal latency is 420ms.

Not:

> There seems to be an issue with the responsiveness of your endpoint.

Prefer:

> Next warm in 8 minutes.

Not:

> Your next scheduled automated warming request will occur approximately eight minutes from now.

---

# 10. Product Vocabulary

Emberline should consistently use the following terms.

### Service

An application endpoint monitored by Emberline.

### Warm

The service is available and responding normally.

### Warming

Emberline is attempting to prepare the service.

### Cold Start

A request experiencing startup-related latency.

### Sleeping

The service is intentionally not being warmed.

### Down

The service cannot currently be reached.

### Readiness

The likelihood that an application is ready to serve traffic immediately.

### Warm Policy

Rules controlling when Emberline keeps a service active.

---

# 11. Naming

Primary brand styling:

# emberline

Lowercase is preferred for logos and marketing graphics.

In body copy:

**Emberline**

CLI:

```bash
ember
```

Package naming may use:

```text
@emberline/sdk
@emberline/node
@emberline/core
```

---

# 12. Logo Concept

The Emberline logo should avoid a generic literal flame.

The icon should combine ideas from:

- Heat.
- Pulse.
- Infrastructure.
- Readiness.
- Network signals.

Possible visual concepts:

### Ember Node

A central node surrounded by two subtle curved forms suggesting retained heat.

### Pulse E

An abstract lowercase "e" created using a pulse or waveform.

### Warm Signal

Three progressively expanding lines radiating from a central node.

The logo must remain recognizable at:

- 16px favicon.
- 24px navigation icon.
- 32px application icon.
- Large marketing sizes.

---

# 13. Wordmark

Preferred:

```text
emberline
```

Lowercase.

The wordmark should use a custom or modified geometric sans-serif treatment.

Avoid excessively futuristic typography.

Emberline should look modern but timeless.

---

# 14. Core Colour Palette

## Ember Black

`#09090B`

Primary application background.

---

## Carbon

`#111113`

Cards and elevated surfaces.

---

## Graphite

`#27272A`

Borders and secondary surfaces.

---

## Ash

`#71717A`

Secondary text.

---

## Smoke

`#A1A1AA`

Muted foreground elements.

---

## White Hot

`#FAFAFA`

Primary text.

---

## Ember Orange

`#FF6422`

Primary brand colour.

Used for:

- Primary actions.
- Active warming.
- Brand highlights.
- Important interactive elements.

---

## Ember Glow

`#FF8A4C`

Secondary orange.

Used for:

- Hover states.
- Illustrations.
- Gradients.

---

## Warm Yellow

`#FFB84D`

Used for:

- Warming states.
- Cold-start warnings.
- Transitional states.

---

## Healthy Green

`#35D07F`

Used for:

- Healthy services.
- Successful checks.

---

## Critical Red

`#F05252`

Used for:

- Service failures.
- Critical warnings.

---

# 15. Brand Gradient

Primary gradient:

```css
linear-gradient(
  135deg,
  #FFB84D 0%,
  #FF6422 55%,
  #FF3D00 100%
)
```

Usage should be limited.

Good:

- Hero illustration.
- Logo glow.
- Key landing-page accent.

Avoid using the gradient across entire application cards.

---

# 16. Colour Philosophy

The majority of the interface should remain neutral.

A typical Emberline screen should visually consist of approximately:

```text
80–90% neutral colours
10–20% status / brand colours
```

Orange represents heat.

Green represents confirmed health.

Yellow represents warming or potential cold state.

Red represents failure.

Grey represents intentional inactivity.

---

# 17. Typography

## Primary Typeface

**Geist Sans**

Used for:

- Interface.
- Marketing pages.
- Navigation.
- Buttons.
- Headings.
- Body copy.

Alternative:

**Inter**

---

## Monospace Typeface

**Geist Mono**

Used for:

- URLs.
- Latency.
- HTTP status codes.
- Timestamps.
- API keys.
- CLI examples.
- Technical metrics.

Example:

```text
184ms
```

---

# 18. Type Scale

Recommended desktop scale:

```text
Display       64px / 68px
H1            48px / 54px
H2            36px / 42px
H3            24px / 30px
Body Large    18px / 28px
Body          15px / 24px
Small         13px / 20px
Caption       12px / 18px
```

---

# 19. Layout

Emberline should use generous negative space.

Recommended content width:

```text
Marketing
1200–1280px

Dashboard
1400–1500px
```

Spacing should generally follow an 8px system.

```text
4
8
12
16
24
32
48
64
96
```

---

# 20. Border Radius

Avoid excessively rounded SaaS interfaces.

Recommended:

```text
Inputs           6px

Small Controls   6px

Buttons          8px

Cards           10px

Large Panels    12px

Modals          12px
```

---

# 21. Borders

Default border:

```css
1px solid #27272A
```

The interface should use borders more frequently than drop shadows.

---

# 22. Shadows

Use shadows sparingly.

Emberline's interface should feel structural rather than floating.

Prefer:

- Borders.
- Surface contrast.
- Subtle glow around active states.

---

# 23. Status System

## Warm

```text
● WARM
```

Colour:

Healthy Green.

---

## Warming

```text
● WARMING
```

Colour:

Ember Orange.

---

## Cold

```text
● COLD
```

Colour:

Warm Yellow.

---

## Sleeping

```text
● SLEEPING
```

Colour:

Ash.

---

## Down

```text
● DOWN
```

Colour:

Critical Red.

---

## Paused

```text
● PAUSED
```

Colour:

Ash.

---

# 24. Signature Visual Element

The key Emberline visual metaphor is **readiness temperature**.

Example:

```text
SERVICE READINESS

COLD                               READY

│──────────────────────────●────────│
```

Another representation:

```text
READINESS

██████████████████░░

92%
WARM
```

This should not imply literal hardware temperature.

It communicates application readiness.

---

# 25. Dashboard Design

Primary dashboard example:

```text
emberline                                  + Add service


Overview

4 services
3 warm · 1 sleeping


┌──────────────────────────────────────────────┐
│                                              │
│ ● WARM                             RENDER    │
│                                              │
│ AI Backend                                   │
│ api.example.com                              │
│                                              │
│ 184ms           8m            99.98%         │
│ latency         next warm     uptime         │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 26. Metric Design

Metrics should emphasize values before labels.

Prefer:

```text
184ms
Latency
```

rather than:

```text
Latency: 184ms
```

Use Geist Mono for numeric values.

---

# 27. Buttons

## Primary

Background:

Ember Orange.

Text:

Ember Black.

Example:

```text
+ Add service
```

---

## Secondary

Transparent background.

Graphite border.

White text.

Example:

```text
View activity
```

---

## Destructive

Use Critical Red only when necessary.

Example:

```text
Delete service
```

---

# 28. Iconography

Icons should be:

- Thin.
- Geometric.
- Consistent.
- Functional.

Recommended icon systems:

- Lucide.
- Phosphor.

Avoid cartoon-style icons.

---

# 29. Illustrations

Illustrations should focus on infrastructure concepts:

- Requests.
- Nodes.
- Network paths.
- Heat signals.
- Service lifecycle.
- Latency.

Avoid generic people illustrations.

---

# 30. Landing Page

Recommended hero:

# Your server went to sleep.
# Your users shouldn't have to wake it.

Supporting copy:

Emberline keeps your applications warm, detects cold starts, and makes sure your services are ready before traffic arrives.

Primary CTA:

**Start warming →**

Secondary CTA:

**See how it works**

---

# 31. Landing Page Structure

Recommended sections:

### Hero

Product value proposition.

### Problem

Explain cold starts.

### How Emberline Works

```text
Add service
      ↓
Choose warm policy
      ↓
Emberline monitors readiness
      ↓
Users get faster responses
```

### Dashboard Preview

Show live service states.

### Smart Scheduling

Explain scheduled warming.

### Cold-Start Analytics

Show latency comparison.

### Supported Infrastructure

Provider examples.

### Developer Experience

Show API/CLI concepts.

### Pricing

Future.

### Final CTA

**Keep your services warm.**

---

# 32. Empty States

Empty states should reinforce the product concept.

Instead of:

> You currently have no services.

Use:

> Nothing's warming yet.

Supporting text:

> Add your first service and Emberline will keep an eye on its readiness.

CTA:

**Add service**

---

# 33. Notifications

Good:

> AI Backend is warm again.

> Cold start detected on API.

> API failed three consecutive health checks.

Bad:

> Warning! An unfortunate issue may have occurred!

The tone should remain calm even when reporting failures.

---

# 34. Error Messages

Errors should tell developers what happened.

Example:

```text
Request timed out after 10 seconds.

The endpoint may still be starting.
Emberline will retry shortly.
```

Avoid:

```text
Something went wrong.
```

unless no additional information is available.

---

# 35. CLI Brand

CLI command:

```bash
ember
```

Example:

```bash
$ ember status

SERVICE          STATUS       LATENCY

api              warm         184ms
worker           sleeping     -
staging          cold         8.7s
```

The CLI should use the same vocabulary as the dashboard.

---

# 36. Product Family

Potential future product naming:

### Emberline Warm

Endpoint warming.

### Emberline Pulse

Health and latency monitoring.

### Emberline Smart Warm

Traffic-aware warming.

### Emberline Insights

Cold-start analytics.

### Emberline Hooks

Deployment and event integrations.

---

# 37. Brand Do

Do:

- Use short sentences.
- Use accurate technical terminology.
- Emphasize readiness.
- Use orange sparingly.
- Show real system information.
- Keep interfaces calm.
- Keep layouts spacious.
- Make developer workflows obvious.

---

# 38. Brand Don't

Do not:

- Overuse flame illustrations.
- Make Emberline look like a crypto product.
- Use excessive gradients.
- Use excessive glassmorphism.
- Use huge rounded cards.
- Use corporate jargon.
- Use unnecessary animations.
- Turn every element orange.
- Describe Emberline solely as an uptime monitor.
- Market the product as a way to circumvent hosting provider restrictions.

---

# 39. Core Messaging Hierarchy

## Level 1

**Keep your services warm.**

## Level 2

Prevent cold starts from reaching your users.

## Level 3

Schedule, monitor and intelligently manage application readiness.

## Level 4

Developer infrastructure for serverless and idle-prone applications.

---

# 40. Brand Essence

If Emberline had to be described in three words:

**Warm. Ready. Reliable.**

If the product had to be described in one sentence:

> Emberline makes sure your application is ready before your users arrive.