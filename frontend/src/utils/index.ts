import { TaskStatus, TaskPriority, ProjectStatus } from '../types'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

export const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
export const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']

export function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusClass(status: TaskStatus): string {
  const classes: Record<TaskStatus, string> = {
    TODO: 'status-todo',
    IN_PROGRESS: 'status-in-progress',
    IN_REVIEW: 'status-in-review',
    DONE: 'status-done',
  }
  return classes[status] || ''
}

export function getPriorityClass(priority: TaskPriority): string {
  const classes: Record<TaskPriority, string> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    URGENT: 'priority-urgent',
  }
  return classes[priority] || ''
}
