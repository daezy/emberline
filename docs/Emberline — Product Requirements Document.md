# Emberline
## Product Requirements Document

**Product:** Emberline  
**Version:** MVP 1.0  
**Category:** Developer Infrastructure / Serverless Tooling  
**Tagline:** Keep your services warm.

---

# 1. Product Summary

Emberline is a developer infrastructure service that helps prevent disruptive application cold starts.

Developers register application endpoints with Emberline and specify when those applications should remain responsive.

Emberline periodically sends lightweight requests to those endpoints, monitors response latency, detects cold starts and service failures, and provides developers with visibility into the readiness of their services.

The long-term goal is to evolve from static endpoint warming into intelligent infrastructure readiness management.

---

# 2. Problem

Modern developers increasingly deploy applications using:

- Serverless infrastructure.
- Scale-to-zero hosting.
- Free-tier application servers.
- On-demand containers.
- AI inference services.
- Auto-scaling infrastructure.

These platforms can reduce costs by shutting down inactive compute.

The downside is cold-start latency.

Consider an AI application whose backend normally responds in five seconds.

If the hosting provider has suspended the server, the first request may instead require:

1. Detecting the request.
2. Provisioning compute.
3. Starting the container.
4. Starting the application.
5. Initializing dependencies.
6. Loading models or connections.
7. Processing the user's request.

The user experiences this entire delay.

Developers frequently work around the problem using:

- Cron jobs.
- Uptime monitors.
- Custom scripts.
- Paid servers pinging free servers.
- Minimum instance configurations.

These approaches provide limited visibility and require manual setup.

There is an opportunity for a purpose-built tool focused specifically on service readiness and cold-start management.

---

# 3. Product Vision

Emberline should eventually become:

> The readiness layer between developers' applications and their users.

Developers should not need to think about whether an application has gone idle.

Emberline should understand:

- When the application needs to be awake.
- How long it takes to wake.
- When users typically arrive.
- Whether the service is currently ready.
- Whether warming is worth the associated infrastructure cost.

---

# 4. Product Principles

## Simple

Adding a service should require no infrastructure knowledge.

## Developer First

The product should feel native to developers.

## Observable

Emberline should explain exactly what happened.

Not:

> Something went wrong.

Instead:

> Cold start detected. Response took 18.4 seconds. Normal latency is 420 ms.

## Safe

User-provided URLs must never expose Emberline infrastructure to SSRF vulnerabilities.

## Efficient

Emberline should eventually minimize unnecessary warming requests.

## Provider Agnostic

The product should not depend entirely on any single hosting provider.

---

# 5. Goals

## Primary MVP Goals

1. Make endpoint warming extremely easy.
2. Reduce cold-start impact for configured services.
3. Provide visibility into cold-start behaviour.
4. Allow warming only during periods when it is needed.
5. Provide endpoint health and latency history.

---

# 6. Non-Goals

Emberline MVP is not:

- A Datadog replacement.
- A full observability platform.
- A log management system.
- A hosting provider.
- An application runtime.
- A Kubernetes management tool.
- An incident management platform.
- A full APM suite.

---

# 7. Target Personas

## Persona 1 — Indie Developer

Deploys applications to low-cost or free infrastructure.

Needs:

- Fast setup.
- Cheap/free warming.
- Simple monitoring.
- No DevOps complexity.

Example projects:

- Portfolio backend.
- Telegram bot API.
- AI demo.
- Side project.
- Hackathon application.

---

## Persona 2 — AI Developer

Runs AI workloads that take time to initialize.

Needs:

- Predictable response latency.
- Prewarming.
- Cold-start tracking.
- Scheduled readiness.

---

## Persona 3 — Startup Engineer

Uses scale-to-zero infrastructure to save money.

Needs:

- Cost-aware warming.
- Scheduling.
- Reliability visibility.
- API integrations.

---

# 8. Core User Stories

### Service Registration

As a developer, I want to add my backend URL so Emberline can keep it responsive.

### Automatic Setup

As a developer, I want Emberline to recommend appropriate warming behaviour so I do not need to research my provider's idle policy.

### Scheduled Warming

As a developer, I want my application kept warm during business hours but allowed to sleep overnight.

### Cold-Start Detection

As a developer, I want to know when a slow response was probably caused by a cold start.

### Monitoring

As a developer, I want to see whether my application is currently healthy.

### Manual Wake

As a developer, I want to wake my application immediately before a demo or test.

### History

As a developer, I want to inspect historical response latency.

---

# 9. Primary User Journey

## Onboarding

User opens Emberline.

Hero message:

**Your server went to sleep.  
Your users shouldn't have to wake it.**

CTA:

**Start warming**

User creates an account.

---

## Add Service

User selects:

**Add service**

Required fields:

**Service Name**

`AI Backend`

**Endpoint**

`https://api.example.com/health`

Emberline analyzes the URL.

Result:

```text
Provider detected

Render
```

Emberline recommends:

```text
Recommended warming policy

Keep warm every 10 minutes.
```

User selects:

**Start warming**

---

# 10. Functional Requirements

## FR-001 Authentication

The system must support authenticated accounts.

---

## FR-002 Projects

Users must be able to group services into projects.

Example:

```text
Project

Veilo
├── API
├── Relayer
└── Indexer
```

---

## FR-003 Add Service

A user must be able to register an HTTP or HTTPS endpoint.

Required:

- Name.
- URL.

Optional:

- Provider.
- HTTP method.
- Headers.
- Body.
- Timeout.

---

## FR-004 Provider Detection

Emberline should attempt to identify known hosting providers.

Detected provider should be editable.

---

## FR-005 Warming Interval

Users must be able to configure how frequently a service is warmed.

Possible presets:

- 5 minutes.
- 10 minutes.
- 15 minutes.
- 30 minutes.
- Custom.

Minimum interval should be controlled by product limits.

---

## FR-006 Warming Schedule

Users must be able to configure active periods.

Example:

```text
Monday–Friday
07:30–22:00

Saturday
09:00–18:00

Sunday
Disabled
```

---

## FR-007 Timezones

All schedules must use a user-selected timezone.

---

## FR-008 Manual Warm

Users must be able to trigger an immediate request.

Button:

**Warm now**

---

## FR-009 Pause Service

Users must be able to temporarily disable warming.

---

## FR-010 Request Logging

Every request must record:

- Start time.
- End time.
- Duration.
- Result.
- HTTP status.
- Error type.

---

## FR-011 Latency Baseline

Emberline must calculate normal latency for a service using recent successful requests.

---

## FR-012 Cold-Start Detection

Requests dramatically exceeding baseline latency should be marked as possible cold starts.

Example:

```text
Normal
420 ms

Current
13.8 s

Possible cold start
```

---

## FR-013 Service States

Services must support:

- Warm.
- Warming.
- Cold.
- Sleeping.
- Down.
- Paused.

---

## FR-014 Dashboard

Dashboard must display:

- Total services.
- Warm services.
- Sleeping services.
- Down services.
- Recent cold starts.

---

## FR-015 Service Cards

Each service card should display:

```text
● WARM

AI Backend
Render

184ms
Latency

6m
Next warm

99.98%
Uptime
```

---

## FR-016 Service Analytics

Service page should display:

- Current state.
- Recent latency.
- Average latency.
- Cold-start events.
- Uptime.
- Warming activity.

---

## FR-017 Notifications

The system should send an email after repeated service failure.

The system should avoid alerting users for single transient errors.

---

## FR-018 Request Headers

Users should be able to configure headers including:

```http
Authorization: Bearer ...
```

Sensitive headers must be encrypted.

---

## FR-019 Endpoint Verification

The platform should support ownership verification.

---

# 11. Scheduler Requirements

Emberline must not create operating-system cron jobs for individual services.

Instead each service should have:

```text
nextRunAt
```

A central scheduler finds due services.

Example:

```sql
SELECT *
FROM services
WHERE enabled = true
AND next_run_at <= NOW()
ORDER BY next_run_at
LIMIT 500;
```

The scheduler publishes jobs to a queue.

Workers perform the actual HTTP requests.

---

# 12. Worker Requirements

Workers should:

1. Receive service ID.
2. Retrieve request configuration.
3. Resolve domain.
4. Perform security validation.
5. Send HTTP request.
6. Measure latency.
7. Save request result.
8. Update service status.
9. Calculate next run time.
10. Trigger alerts where necessary.

---

# 13. Reliability

Workers should support:

- Retry policies.
- Backoff.
- Timeouts.
- Job deduplication.
- Failed-job handling.
- Queue monitoring.

---

# 14. Security Requirements

SSRF protection is a launch-blocking requirement.

Requests must never be allowed to target:

```text
localhost
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
169.254.0.0/16
::1
```

Equivalent reserved IPv6 ranges must also be blocked.

Additional protections:

- DNS rebinding protection.
- Redirect validation.
- Protocol validation.
- Response size limits.
- Rate limiting.
- Timeout enforcement.
- Abuse detection.

---

# 15. Suggested Technology

## Web Application

Next.js + TypeScript.

## API

NestJS.

## Database

PostgreSQL.

## Jobs

BullMQ.

## Queue Backend

Redis.

## Charts

Recharts.

## Authentication

Better Auth, Auth.js or Clerk.

## Email

Resend.

## Deployment

Frontend:

Vercel.

API/workers:

A persistent application environment suitable for running background workers.

---

# 16. Suggested API Surface

```text
POST   /projects
GET    /projects

POST   /services
GET    /services
GET    /services/:id
PATCH  /services/:id
DELETE /services/:id

POST   /services/:id/warm
POST   /services/:id/pause
POST   /services/:id/resume

GET    /services/:id/checks
GET    /services/:id/analytics

POST   /services/:id/verify
```

---

# 17. Dashboard Information Architecture

```text
Overview

Projects

Services

Activity

Settings
```

Service navigation:

```text
Overview
Activity
Analytics
Configuration
```

---

# 18. Product Metrics

## Activation

Percentage of users who successfully add their first service.

## First Warm

Percentage of created services successfully warmed.

## Active Services

Number of services warmed during the previous seven days.

## Cold Starts Detected

Number of probable cold starts identified.

## Cold Starts Prevented

Future estimated metric.

## Warm Request Success Rate

Percentage of Emberline requests completing successfully.

## Weekly Active Developers

Developers who interact with Emberline or have active warming services.

---

# 19. North-Star Metric

Long term:

**Ready Requests**

Number of application requests Emberline helps ensure arrive while the target service is ready.

Because direct application traffic may not initially pass through Emberline, the MVP will use:

**Successfully Warmed Service Hours**

as a proxy.

---

# 20. MVP Pricing Direction

Pricing does not need to be implemented immediately.

A future structure could be:

### Free

- 3 services.
- Fixed warming intervals.
- 7-day history.
- Basic monitoring.

### Pro

- More services.
- Scheduled warming.
- Advanced headers.
- Longer history.
- Notifications.
- Smart Warm.

### Teams

- Shared projects.
- Roles.
- Higher request limits.
- API access.

---

# 21. Future Product Roadmap

## V1 — Warm

Scheduled endpoint warming.

## V1.5 — Pulse

Improved health and latency monitoring.

## V2 — Smart Warm

Traffic-aware schedules.

## V2.5 — Hooks

Deployment hooks and external integrations.

## V3 — Predictive Readiness

Automatically predict when services should wake based on usage.

---

# 22. Smart Warm Vision

Eventually Emberline should observe patterns such as:

```text
00:00  very low usage
06:00  very low usage
07:45  traffic begins
08:00  high usage
13:00  high usage
19:00  moderate usage
22:30  traffic ends
```

Instead of continuously warming the application, Emberline can:

```text
07:40   begin warming
22:45   allow sleep
```

This reduces unnecessary compute usage while preserving responsiveness.

---

# 23. Key Product Differentiator

Generic uptime tools answer:

> Is my server online?

Emberline should answer:

> Will my server be ready when my user arrives?

That distinction should guide the product's future development.

---

# 24. Definition of MVP Complete

The product is ready for initial public testing when a developer can:

1. Create an Emberline account.
2. Create a project.
3. Add an HTTP endpoint.
4. Select a warming schedule.
5. Start warming.
6. Receive repeated successful checks.
7. See endpoint status.
8. See latency history.
9. See probable cold starts.
10. Manually warm the endpoint.
11. Pause warming.
12. Receive alerts for prolonged failures.

The infrastructure must additionally pass basic SSRF and abuse-resistance testing before public access.