import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Button, Badge, ProjectDetailSkeleton, ErrorMessage } from '../components/ui'
import { GET_PROJECT, ProjectFormModal } from '../features/projects'
import { TaskCard, TaskFormModal, TaskCommentsModal } from '../features/tasks'
import { useOrganization } from '../hooks/useOrganization'
import { Project, Task } from '../types'
import { PROJECT_STATUS_LABELS, formatDate } from '../utils'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { organizationId } = useOrganization()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ project: Project }>(GET_PROJECT, {
    variables: { id: projectId, organizationId },
    skip: !projectId || !organizationId,
  })

  const project = data?.project

  const handleViewComments = (task: Task) => {
    setSelectedTask(task)
    setIsCommentsModalOpen(true)
  }

  if (!organizationId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Please select an organization.</p>
      </div>
    )
  }

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
        <ErrorMessage message="Failed to load project" onRetry={() => refetch()} />
      </div>
    )
  }

  const stats = project.statistics

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link to="/projects" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
            <Badge variant="info">{PROJECT_STATUS_LABELS[project.status]}</Badge>
          </div>
          {project.description && (
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{project.description}</p>
          )}
          {project.dueDate && (
            <p className="text-sm text-slate-500 mt-2">Due: {formatDate(project.dueDate)}</p>
          )}
        </div>
        <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Project
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalTasks || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.completedTasks || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.pendingTasks || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats?.completionPercentage || 0}%</p>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${stats?.completionPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tasks</h2>
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Button>
        </div>

        {project.tasks && project.tasks.length > 0 ? (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={project.id}
                organizationId={organizationId}
                onViewComments={handleViewComments}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">No tasks yet</p>
            <Button onClick={() => setIsTaskModalOpen(true)}>Create First Task</Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organizationId={organizationId}
        project={project}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={project.id}
        organizationId={organizationId}
      />

      <TaskCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        projectId={project.id}
        organizationId={organizationId}
      />
    </div>
  )
}
