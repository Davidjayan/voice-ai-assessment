import { useMutation } from '@apollo/client'
import { Task, TaskStatus } from '../../types'
import { Button } from '../../components/ui'
import { UPDATE_TASK } from './operations'
import { GET_PROJECT } from '../projects/operations'
import { STATUS_LABELS, PRIORITY_LABELS, formatDate, getStatusClass, getPriorityClass, STATUS_OPTIONS } from '../../utils'

interface TaskCardProps {
  task: Task
  projectId: string
  organizationId: string
  onViewComments: (task: Task) => void
}

export function TaskCard({ task, projectId, organizationId, onViewComments }: TaskCardProps) {

  const [updateTask, { loading }] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId, organizationId } }],
    // Optimistic update for instant UI feedback
    optimisticResponse: (vars) => ({
      updateTask: {
        __typename: 'UpdateTask',
        success: true,
        error: null,
        task: {
          ...task,
          status: vars.input.status || task.status,
          __typename: 'TaskType',
        },
      },
    }),
  })

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask({
        variables: {
          id: task.id,
          organizationId,
          input: { status: newStatus },
        },
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div className="glass rounded-lg p-4 animate-fade-in hover:bg-white/5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white truncate">{task.title}</h4>
            <span className={`text-xs font-medium ${getPriorityClass(task.priority)}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={loading}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${getStatusClass(task.status)} ${loading ? 'opacity-50' : ''}`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task.comments?.length || 0} comments
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={() => onViewComments(task)}>
          View Comments
        </Button>
      </div>
    </div>
  )
}
