# Emberline
## Scope of Work

**Version:** 1.0  
**Project Type:** Personal SaaS / Developer Infrastructure Tool  
**Product:** Emberline  
**Tagline:** Keep your services warm.

---

## 1. Project Overview

Emberline is a developer infrastructure platform designed to keep idle-prone, serverless, and free-tier application servers responsive.

Many application hosting providers automatically suspend, scale down, or scale applications to zero after periods of inactivity. When a new user subsequently sends a request, the application may experience a cold start that adds significant latency.

This can be especially disruptive for applications involving AI inference, APIs, chat applications, webhooks, automation services, and other latency-sensitive workloads.

Emberline solves this by periodically warming registered application endpoints and monitoring their responsiveness.

The initial product will provide developers with a simple dashboard where they can register an application endpoint, define how and when it should remain warm, and monitor latency, availability, and cold-start behaviour.

---

# 2. Project Objectives

The objectives of Emberline V1 are to:

- Allow developers to register HTTP/HTTPS application endpoints.
- Keep configured services active through scheduled HTTP requests.
- Reduce user-facing cold-start delays.
- Detect unusually slow responses that may indicate a cold start.
- Measure endpoint health and latency.
- Allow users to configure warming schedules.
- Automatically identify common hosting providers where possible.
- Provide a simple visual dashboard for managing services.
- Establish the foundation for future intelligent warming functionality.

---

# 3. Target Users

Emberline will initially target:

### Independent Developers

Developers deploying personal projects, APIs, MVPs, bots, or experimental applications to platforms with idle shutdown or scale-to-zero behaviour.

### AI Application Developers

Developers hosting AI inference servers or AI-related APIs where cold starts can significantly worsen user experience.

### Startup Teams

Small teams using serverless or auto-scaling infrastructure that want better visibility into cold-start behaviour.

### Hackathon Builders

Developers using free-tier infrastructure who need their demos and APIs responsive during presentations or judging periods.

---

# 4. Scope of Work

## 4.1 User Authentication

Users will be able to:

- Create an Emberline account.
- Log into their account.
- Log out.
- Maintain a persistent authenticated session.
- Access only services belonging to their account.

Authentication may initially support:

- Email/password.
- Google authentication.

Additional OAuth providers may be added later.

---

# 4.2 Service Management

Users will be able to register services with Emberline.

Each service will include:

- Service name.
- Endpoint URL.
- HTTP method.
- Optional request headers.
- Optional request body.
- Hosting provider.
- Warming policy.
- Warming interval.
- Timezone.
- Active/inactive state.

Users will be able to:

- Add a service.
- Edit a service.
- Pause warming.
- Resume warming.
- Delete a service.
- Manually trigger a warm request.

---

# 4.3 Provider Detection

Emberline will attempt to identify common hosting providers based on endpoint information.

Initial supported provider labels:

- Render.
- Railway.
- Koyeb.
- Google Cloud Run.
- Custom / Unknown.

Provider detection may use:

- Domain patterns.
- DNS information.
- HTTP headers.
- User selection.

Provider detection should assist configuration but should not prevent users from manually overriding the selected provider.

---

# 4.4 Warming Engine

Emberline will periodically issue requests to configured endpoints.

The warming engine will support:

### Always Warm

Requests are sent continuously according to the configured interval.

Example:

Every 10 minutes.

### Scheduled Warm

Requests are only sent during a configured period.

Example:

08:00–23:00.

Outside this window Emberline allows the service to sleep.

### Manual Warm

The user can immediately trigger a warming request from the dashboard.

---

# 4.5 HTTP Request Configuration

The warming engine will initially support:

- GET.
- HEAD.
- POST.

Users may optionally configure:

- Custom headers.
- Authorization headers.
- Request body.
- Timeout.

Sensitive values should be encrypted at rest.

---

# 4.6 Service Health Monitoring

Every warming request will record:

- Timestamp.
- Response status.
- Response latency.
- Success/failure.
- HTTP status code.
- Timeout status.
- Error category.

Possible service states include:

### Warm

Endpoint is healthy and responding within its normal latency range.

### Warming

Emberline is currently attempting to wake or verify the service.

### Cold

The service responded significantly slower than its established baseline.

### Sleeping

The service is intentionally outside its configured warming schedule.

### Down

Repeated requests failed or returned an unhealthy status.

### Paused

Warming has been manually disabled.

---

# 4.7 Cold-Start Detection

Emberline will establish a latency baseline for each service.

A response may be classified as a cold start when latency significantly exceeds the normal response baseline.

Example:

Normal latency:

300 ms

Observed request:

17,400 ms

Emberline:

**Cold start detected — 17.4s**

The exact detection algorithm can initially use configurable thresholds and become more adaptive in later versions.

---

# 4.8 Dashboard

The dashboard will provide:

- Total number of services.
- Number of warm services.
- Number of sleeping services.
- Number of unhealthy services.
- Service health.
- Latest latency.
- Uptime percentage.
- Last warm time.
- Next scheduled warm.
- Provider.
- Cold-start count.

Each service will have a dedicated detail page.

---

# 4.9 Service Detail Page

The service detail page will show:

- Service status.
- Endpoint.
- Provider.
- Current warming policy.
- Last request.
- Next request.
- Average latency.
- Current latency.
- Uptime.
- Cold-start history.
- Request history.
- Warming settings.

The page should include a simple latency chart.

---

# 4.10 Activity History

Emberline will store a history of endpoint checks.

For each request:

- Request time.
- Response time.
- Status code.
- Latency.
- Result.
- Cold-start classification.

Retention limits may vary based on subscription plan in the future.

---

# 4.11 Notifications

Basic notifications may include:

- Service failed to respond.
- Service recovered.
- Cold start detected repeatedly.

V1 notifications should focus on email.

Future channels may include:

- Slack.
- Discord.
- Telegram.
- Webhooks.

---

# 4.12 Endpoint Verification

To reduce abuse, Emberline should provide an endpoint ownership verification system.

Possible verification methods:

### HTTP Verification

User exposes:

`/.well-known/emberline`

with a generated verification token.

### DNS Verification

User adds a TXT record containing the verification token.

Verification may initially be optional during development but should be introduced before public deployment.

---

# 4.13 Security Requirements

Because Emberline sends requests to user-supplied URLs, protection against Server-Side Request Forgery is mandatory.

The system must:

- Block localhost.
- Block loopback addresses.
- Block private network ranges.
- Block link-local addresses.
- Block cloud metadata endpoints.
- Validate DNS resolution.
- Revalidate redirects.
- Limit redirects.
- Enforce request timeouts.
- Limit response sizes.
- Rate-limit requests.
- Validate request protocols.
- Allow only HTTP and HTTPS.

Sensitive request headers must be encrypted before database storage.

---

# 5. Technical Scope

Recommended initial architecture:

### Frontend

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui or custom component system.

### Backend

- NestJS.
- TypeScript.

### Database

- PostgreSQL.

### ORM

- Prisma or TypeORM.

### Queue

- Redis.
- BullMQ.

### Scheduler

Central scheduler responsible for identifying services whose `nextRunAt` value has expired.

### Workers

Background workers responsible for performing warming requests.

### Authentication

- Auth.js.
- Clerk.
- Better Auth.

One may be selected during implementation.

---

# 6. High-Level Architecture

```text
User
  │
  ▼
Emberline Dashboard
  │
  ▼
Emberline API
  │
  ├──────────────► PostgreSQL
  │
  ▼
Scheduler
  │
  ▼
Redis / BullMQ
  │
  ▼
Warm Workers
  │
  ├────► Render
  ├────► Railway
  ├────► Koyeb
  ├────► Cloud Run
  └────► Custom HTTP Services
```

---

# 7. Core Data Entities

## User

- id
- name
- email
- createdAt

## Project

- id
- userId
- name
- createdAt

## Service

- id
- projectId
- name
- url
- method
- provider
- interval
- timezone
- warmingPolicy
- enabled
- lastRunAt
- nextRunAt

## RequestConfiguration

- serviceId
- headers
- body
- timeout

## Check

- id
- serviceId
- startedAt
- completedAt
- latencyMs
- statusCode
- success
- coldStartDetected
- errorType

---

# 8. MVP User Flow

```text
Create Account
      ↓
Create Project
      ↓
Add Service
      ↓
Enter Endpoint
      ↓
Provider Detected
      ↓
Choose Warm Policy
      ↓
Start Warming
      ↓
Emberline Worker Sends Requests
      ↓
Latency + Health Recorded
      ↓
Dashboard Displays Service Status
```

---

# 9. MVP Deliverables

The MVP should include:

1. Emberline landing page.
2. User authentication.
3. User dashboard.
4. Project creation.
5. Service creation.
6. Service configuration.
7. Endpoint warming engine.
8. Scheduler.
9. Background workers.
10. Provider detection.
11. Warm scheduling.
12. Manual warming.
13. Health monitoring.
14. Latency tracking.
15. Cold-start detection.
16. Request history.
17. Basic latency charts.
18. Pause/resume functionality.
19. SSRF protection.
20. Basic email notifications.
21. Responsive web interface.

---

# 10. Out of Scope for V1

The following are intentionally excluded from the first release:

- AI-based traffic prediction.
- Automatic traffic pattern learning.
- Native mobile applications.
- Enterprise SSO.
- Advanced incident management.
- Public status pages.
- Full APM functionality.
- Log aggregation.
- Distributed tracing.
- Infrastructure provisioning.
- Kubernetes agents.
- Browser synthetic monitoring.
- Multi-region warming.
- Advanced team permissions.
- Usage-based billing.
- Provider API integrations.

These may be considered for subsequent releases.

---

# 11. Future Scope

Potential V2 features include:

### Smart Warm

Automatically determine warming schedules based on observed traffic.

### Prewarming

Wake services shortly before predicted usage periods.

### Deployment Hooks

Automatically warm an application following a deployment.

### Multi-Region Warm

Trigger requests from multiple regions.

### Emberline Pulse

Advanced uptime and latency monitoring.

### Emberline Insights

Detailed cold-start analytics.

### Team Workspaces

Shared infrastructure monitoring.

### Emberline API

Programmatic control of services.

### Ember CLI

Example:

```bash
ember add https://api.example.com
ember warm api
ember status
```

---

# 12. MVP Success Criteria

The MVP will be considered successful when:

- A user can create an account.
- A user can register an endpoint.
- Emberline can reliably execute scheduled requests.
- Users can configure warming intervals.
- Users can configure warming windows.
- Request latency is recorded.
- Endpoint failures are detected.
- Cold starts can be identified.
- Users can inspect request history.
- Users can pause and resume warming.
- SSRF-sensitive destinations are blocked.
- The dashboard accurately reflects endpoint status.

---

# 13. Project Principle

Emberline should not attempt to become a full observability platform during its first release.

The initial product should do one thing exceptionally well:

**Make sure a service is ready before its users need it.**