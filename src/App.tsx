import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { MainLayout } from '@/components/layout/MainLayout'
import Dashboard from '@/pages/Dashboard'
import { DisclosuresModule } from '@/components/modules/DisclosuresModule'
import { FilingsModule } from '@/components/modules/FilingsModule'
import { ProjectsModule } from '@/components/modules/ProjectsModule'
import { AgreementsModule } from '@/components/modules/AgreementsModule'
import { StartupsModule } from '@/components/modules/StartupsModule'
import { InventorsModule } from '@/components/modules/InventorsModule'
import { TeamsModule } from '@/components/modules/TeamsModule'
import { AlertsModule } from '@/components/modules/AlertsModule'
import { ProfileModule } from '@/components/modules/ProfileModule'
import { UserManagement } from '@/pages/UserManagement'

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading IP Operations Center</h2>
          <p className="text-gray-600">Initializing your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="disclosures/*" element={<DisclosuresModule />} />
          <Route path="filings/*" element={<FilingsModule />} />
          <Route path="projects/*" element={<ProjectsModule />} />
          <Route path="agreements/*" element={<AgreementsModule />} />
          <Route path="startups/*" element={<StartupsModule />} />
          <Route path="inventors/*" element={<InventorsModule />} />
          <Route path="teams/*" element={<TeamsModule />} />
          <Route path="alerts/*" element={<AlertsModule />} />
          <Route path="profile/*" element={<ProfileModule />} />
          {user?.user_metadata?.role === 'Director' && (
            <Route path="user-management" element={<UserManagement />} />
          )}
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App