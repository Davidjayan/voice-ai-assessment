import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import LoginPage from './pages/LoginPage'
import { OrganizationContext } from './hooks/useOrganization'
import { AuthProvider, useAuth } from './hooks/useAuth'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function AppContent() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  return (
    <OrganizationContext.Provider value={{ organizationId, setOrganizationId }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/projects" replace />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </OrganizationContext.Provider>
  )
}

import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
