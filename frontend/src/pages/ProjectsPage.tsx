import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { Button, ProjectCardSkeleton, ErrorMessage } from '../components/ui'
import { ProjectCard, ProjectFormModal, GET_PROJECTS } from '../features/projects'
import { useOrganization } from '../hooks/useOrganization'
import { Project } from '../types'

export default function ProjectsPage() {
  const { organizationId } = useOrganization()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(GET_PROJECTS, {
    variables: { organizationId },
    skip: !organizationId,
  })

  if (!organizationId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Select an Organization</h2>
        <p className="text-slate-600 dark:text-slate-400">Please select an organization from the header to view projects.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message="Failed to load projects" onRetry={() => refetch()} />
      ) : data?.projects.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Get started by creating your first project</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  )
}
