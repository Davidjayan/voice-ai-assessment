import { Link } from 'react-router-dom'
import { Project } from '../../types'
import { Badge } from '../../components/ui'
import { formatDate, PROJECT_STATUS_LABELS } from '../../utils'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      PLANNING: 'default',
      ACTIVE: 'info',
      ON_HOLD: 'warning',
      COMPLETED: 'success',
      ARCHIVED: 'default',
    }
    return variants[status] || 'default'
  }

  const completionPercentage = project.statistics?.completionPercentage || 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block glass rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {project.name}
        </h3>
        <Badge variant={getStatusVariant(project.status)}>
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>
      </div>

      {project.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {project.statistics?.totalTasks || 0} tasks
        </span>
        {project.dueDate && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(project.dueDate)}
          </span>
        )}
      </div>
    </Link>
  )
}
