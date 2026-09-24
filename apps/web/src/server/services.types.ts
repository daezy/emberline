export type ServiceStatus =
  'warm' | 'warming' | 'cold' | 'sleeping' | 'down' | 'paused'

export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Service = {
  id: string
  projectId: string
  name: string
  endpoint: string
  status: ServiceStatus
  isEnabled: boolean
  lastCheckedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Check = {
  id: string
  serviceId: string
  status: ServiceStatus
  responseStatus: number | null
  latencyMs: number | null
  coldStartSuspected: boolean
  errorMessage: string | null
  checkedAt: string
}

export type ActivityItem = Check & { serviceName: string }

export type WarmSchedule = {
  days: Array<number>
  startTime: string
  endTime: string
}

export type WarmPolicyMode = 'interval' | 'schedule' | 'manual'

export type WarmPolicy = {
  id: string
  serviceId: string
  mode: WarmPolicyMode
  intervalMinutes: number | null
  timezone: string
  schedule: WarmSchedule | null
  nextWarmAt: string | null
}

export type WarmPolicyInput = {
  mode: WarmPolicyMode
  intervalMinutes: number
  timezone: string
  schedule?: WarmSchedule
}
