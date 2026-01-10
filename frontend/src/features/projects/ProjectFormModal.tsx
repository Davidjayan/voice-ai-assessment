import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Modal, Button } from '../../components/ui'
import { Input, Textarea, Select } from '../../components/forms'
import { Project, ProjectStatus } from '../../types'
import { CREATE_PROJECT, UPDATE_PROJECT, GET_PROJECTS } from './operations'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from '../../utils'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  project?: Project | null
}

export function ProjectFormModal({ isOpen, onClose, organizationId, project }: ProjectFormModalProps) {
  const isEditing = !!project

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'PLANNING',
    dueDate: project?.dueDate || '',
  })
  const [error, setError] = useState<string | null>(null)

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { organizationId } }],
  })

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { organizationId } }],
  })

  const loading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      const input = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate || null,
      }

      if (isEditing) {
        const { data } = await updateProject({
          variables: { id: project.id, organizationId, input },
        })
        if (!data?.updateProject?.success) {
          throw new Error(data?.updateProject?.error || 'Failed to update project')
        }
      } else {
        const { data } = await createProject({
          variables: { organizationId, input },
        })
        if (!data?.createProject?.success) {
          throw new Error(data?.createProject?.error || 'Failed to create project')
        }
      }

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '', status: 'PLANNING', dueDate: '' })
    setError(null)
    onClose()
  }

  const statusOptions = PROJECT_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: PROJECT_STATUS_LABELS[status],
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Project' : 'Create Project'}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter project description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  )
}
