import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { useOrganization } from '../hooks/useOrganization'
import { useAuth } from '../hooks/useAuth'
import { Organization } from '../types'

import { ThemeToggle } from './ThemeToggle'

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
    }
  }
`

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { organizationId, setOrganizationId } = useOrganization()
  const { user, logout } = useAuth()
  const { data } = useQuery<{ organizations: Organization[] }>(GET_ORGANIZATIONS)

  // Auto-select first organization if none selected
  if (data?.organizations?.length && !organizationId) {
    setOrganizationId(data.organizations[0].id)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">ProjectHub</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                to="/projects"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/projects')
                    ? 'text-primary-600 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white'
                }`}
              >
                Projects
              </Link>
            </nav>

            {/* Organization Selector & User Profile */}
            <div className="flex items-center gap-4">
              {data?.organizations && data.organizations.length > 0 && (
                <select
                  value={organizationId || ''}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  {data.organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-white dark:bg-slate-800">
                      {org.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                <ThemeToggle />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                  title="Sign Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!organizationId && data?.organizations?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Organizations</h2>
            <p className="text-slate-600 dark:text-slate-400">Create an organization in the Django admin to get started.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
