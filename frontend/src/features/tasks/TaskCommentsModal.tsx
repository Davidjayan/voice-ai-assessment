import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Modal, Button } from '../../components/ui'
import { Textarea, Input } from '../../components/forms'
import { Task } from '../../types'
import { ADD_COMMENT } from './operations'
import { GET_PROJECT } from '../projects/operations'
import { formatDateTime } from '../../utils'

interface TaskCommentsModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  projectId: string
  organizationId: string
}

export function TaskCommentsModal({ isOpen, onClose, task, projectId, organizationId }: TaskCommentsModalProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [addComment, { loading }] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId, organizationId } }],
    // Optimistic update for instant UI feedback
    optimisticResponse: task ? {
      addTaskComment: {
        __typename: 'AddTaskComment',
        success: true,
        error: null,
        comment: {
          __typename: 'TaskCommentType',
          id: 'temp-' + Date.now(),
          content,
          authorName: authorName || 'Anonymous',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    } : undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (!task) return

    try {
      const { data } = await addComment({
        variables: {
          taskId: task.id,
          organizationId,
          input: {
            content: content.trim(),
            authorName: authorName.trim() || 'Anonymous',
          },
        },
      })

      if (!data?.addTaskComment?.success) {
        throw new Error(data?.addTaskComment?.error || 'Failed to add comment')
      }

      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (!task) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comments - ${task.title}`}
    >
      <div className="space-y-4">
        {/* Comment list */}
        <div className="max-h-64 overflow-y-auto space-y-3">
          {task.comments && task.comments.length > 0 ? (
            task.comments.map((comment) => (
              <div key={comment.id} className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">No comments yet</p>
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />

          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
