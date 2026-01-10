// Type definitions for the project management system

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'

export interface Organization {
  id: string
  name: string
  slug: string
  contactEmail?: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface TaskComment {
  id: string
  content: string
  authorName: string
  authorEmail?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeEmail?: string
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
  comments?: TaskComment[]
}

export interface ProjectStatistics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionPercentage: number
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  dueDate?: string
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  statistics?: ProjectStatistics
}

// Input types for mutations
export interface ProjectInput {
  name?: string
  description?: string
  status?: ProjectStatus
  dueDate?: string
}

export interface TaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeEmail?: string
  dueDate?: string
}

export interface CommentInput {
  content: string
  authorName?: string
  authorEmail?: string
}

// Mutation response types
export interface MutationResponse<T> {
  success: boolean
  error?: string
  [key: string]: T | boolean | string | undefined
}
