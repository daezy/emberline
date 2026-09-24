import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { createProjectFn } from '#/server/services.functions'
import { Folder, Plus } from './icons'

export function NewProjectForm() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const mutation = useMutation({
    mutationFn: () => createProjectFn({ data: { name: name.trim() } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      setName('')
      setOpen(false)
    },
  })

  if (!open) {
    return (
      <button
        className="dash-button dash-button--secondary"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Folder size={15} /> New project
      </button>
    )
  }

  return (
    <form
      className="service-toolbar"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate()
      }}
    >
      <label className="search-field">
        <Folder size={16} />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          aria-label="Project name"
          maxLength={100}
          autoFocus
          required
        />
      </label>
      <button
        className="dash-button dash-button--primary"
        type="submit"
        disabled={mutation.isPending}
      >
        <Plus size={15} /> Create
      </button>
      <button
        className="dash-button dash-button--secondary"
        type="button"
        onClick={() => {
          mutation.reset()
          setOpen(false)
        }}
      >
        Cancel
      </button>
      {mutation.error && (
        <p className="auth-error" role="alert">
          {mutation.error.message}
        </p>
      )}
    </form>
  )
}
