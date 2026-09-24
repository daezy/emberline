import { useQuery } from '@tanstack/react-query'

import { listProjectsFn, listServicesFn } from '#/server/services.functions'

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => listProjectsFn() })
}

export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: () => listServicesFn() })
}

export function useProjectNames() {
  const { data = [] } = useProjects()
  return new Map(data.map((project) => [project.id, project.name]))
}
