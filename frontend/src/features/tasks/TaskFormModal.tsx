import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Modal, Button } from '../../components/ui'
import { Input, Textarea, Select } from '../../components/forms'
import { Task, TaskStatus, TaskPriority } from '../../types'
import { CREATE_TASK, UPDATE_TASK } from './operations'
import { GET_PROJECT } from '../projects/operations'
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  organizationId: string
  task?: Task | null
}

export function TaskFormModal({ isOpen, onClose, projectId, organizationId, task }: TaskFormModalProps) {
  const isEditing = !!task

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '',
  })
  const [error, setError] = useState<string | null>(null)

  const refetchQueries = [{ query: GET_PROJECT, variables: { id: projectId, organizationId } }]

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, { refetchQueries })
  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, { refetchQueries })

  const loading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }

    try {
      const input = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      }

      if (isEditing) {
        const { data } = await updateTask({
          variables: { id: task.id, organizationId, input },
        })
        if (!data?.updateTask?.success) {
          throw new Error(data?.updateTask?.error || 'Failed to update task')
        }
      } else {
        const { data } = await createTask({
          variables: { projectId, organizationId, input },
        })
        if (!data?.createTask?.success) {
          throw new Error(data?.createTask?.error || 'Failed to create task')
        }
      }

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' })
    setError(null)
    onClose()
  }

  const statusOptions = STATUS_OPTIONS.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }))

  const priorityOptions = PRIORITY_OPTIONS.map((priority) => ({
    value: priority,
    label: PRIORITY_LABELS[priority],
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
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
          label="Task Title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter task description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </form>
    </Modal>
  )
}
