export type ServiceStatus = 'warm' | 'sleeping' | 'cold' | 'down' | 'paused'

export type Service = {
  id: string
  name: string
  endpoint: string
  provider: string
  project: string
  status: ServiceStatus
  latency: number | null
  uptime: number
  nextWarm: string
  lastWarm: string
  interval: string
  readiness: number
  coldStarts: number
  latencyHistory: number[]
}

export type ActivityItem = {
  id: string
  serviceId: string
  service: string
  status: 'success' | 'cold' | 'failed' | 'sleeping'
  latency: number | null
  code: number | null
  time: string
  detail: string
}

export const services: Service[] = [
  {
    id: 'atlas-api',
    name: 'Atlas API',
    endpoint: 'api.atlas.so/health',
    provider: 'Render',
    project: 'Atlas',
    status: 'warm',
    latency: 184,
    uptime: 99.98,
    nextWarm: '6 min',
    lastWarm: '4 min ago',
    interval: 'Every 10 minutes',
    readiness: 96,
    coldStarts: 2,
    latencyHistory: [
      214, 196, 220, 181, 168, 201, 188, 178, 194, 184, 172, 184,
    ],
  },
  {
    id: 'papertrail-worker',
    name: 'Papertrail worker',
    endpoint: 'worker.papertrail.dev/ping',
    provider: 'Railway',
    project: 'Papertrail',
    status: 'warm',
    latency: 312,
    uptime: 99.92,
    nextWarm: '3 min',
    lastWarm: '7 min ago',
    interval: 'Every 10 minutes',
    readiness: 92,
    coldStarts: 4,
    latencyHistory: [
      344, 321, 298, 302, 289, 310, 330, 296, 305, 318, 301, 312,
    ],
  },
  {
    id: 'model-gateway',
    name: 'Model gateway',
    endpoint: 'gateway.nova.run/ready',
    provider: 'Cloud Run',
    project: 'Nova',
    status: 'cold',
    latency: 12840,
    uptime: 98.71,
    nextWarm: 'Now',
    lastWarm: '10 min ago',
    interval: 'Every 10 minutes',
    readiness: 38,
    coldStarts: 11,
    latencyHistory: [
      920, 744, 688, 540, 490, 510, 830, 12600, 744, 580, 611, 12840,
    ],
  },
  {
    id: 'portfolio-api',
    name: 'Portfolio API',
    endpoint: 'api.mikedev.me/health',
    provider: 'Koyeb',
    project: 'Personal',
    status: 'sleeping',
    latency: null,
    uptime: 99.89,
    nextWarm: 'Tomorrow, 08:00',
    lastWarm: '2 hr ago',
    interval: 'Weekdays, 08:00–22:00',
    readiness: 0,
    coldStarts: 1,
    latencyHistory: [
      226, 204, 210, 194, 201, 188, 190, 211, 204, 196, 198, 203,
    ],
  },
]

export const activities: ActivityItem[] = [
  {
    id: 'a1',
    serviceId: 'atlas-api',
    service: 'Atlas API',
    status: 'success',
    latency: 184,
    code: 200,
    time: '4 min ago',
    detail: 'Warm request completed',
  },
  {
    id: 'a2',
    serviceId: 'papertrail-worker',
    service: 'Papertrail worker',
    status: 'success',
    latency: 312,
    code: 204,
    time: '7 min ago',
    detail: 'Warm request completed',
  },
  {
    id: 'a3',
    serviceId: 'model-gateway',
    service: 'Model gateway',
    status: 'cold',
    latency: 12840,
    code: 200,
    time: '10 min ago',
    detail: 'Possible cold start detected',
  },
  {
    id: 'a4',
    serviceId: 'portfolio-api',
    service: 'Portfolio API',
    status: 'sleeping',
    latency: null,
    code: null,
    time: '2 hr ago',
    detail: 'Scheduled warm window ended',
  },
  {
    id: 'a5',
    serviceId: 'atlas-api',
    service: 'Atlas API',
    status: 'success',
    latency: 172,
    code: 200,
    time: '14 min ago',
    detail: 'Warm request completed',
  },
  {
    id: 'a6',
    serviceId: 'model-gateway',
    service: 'Model gateway',
    status: 'success',
    latency: 611,
    code: 200,
    time: '20 min ago',
    detail: 'Service responded normally',
  },
  {
    id: 'a7',
    serviceId: 'papertrail-worker',
    service: 'Papertrail worker',
    status: 'success',
    latency: 301,
    code: 204,
    time: '27 min ago',
    detail: 'Warm request completed',
  },
]

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms))

// Frontend-only query functions. Replace their bodies with API client calls later.
export async function getServices() {
  await delay()
  return services
}

export async function getService(id: string) {
  await delay()
  return services.find((service) => service.id === id) ?? null
}

export async function getActivity() {
  await delay(220)
  return activities
}

export async function triggerWarm(serviceId: string) {
  await delay(650)
  return { serviceId, queuedAt: new Date().toISOString() }
}
