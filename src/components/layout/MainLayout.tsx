import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  Home, 
  FileText, 
  FolderOpen,
  Briefcase, 
  FileCheck, 
  Building2, 
  Users, 
  UsersRound, 
  Bell, 
  Settings, 
  User,
  Lightbulb
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/hooks/useAuth'

export function MainLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const baseNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600', path: '/dashboard' },
    { id: 'disclosures', label: 'Disclosures', icon: FileText, color: 'text-emerald-600', path: '/disclosures' },
    { id: 'filings', label: 'Patent Filings', icon: FolderOpen, color: 'text-purple-600', path: '/filings' },
    { id: 'projects', label: 'Projects', icon: Briefcase, color: 'text-amber-600', path: '/projects' },
    { id: 'agreements', label: 'Agreements', icon: FileCheck, color: 'text-rose-600', path: '/agreements' },
    { id: 'startups', label: 'Startups', icon: Building2, color: 'text-indigo-600', path: '/startups' },
    { id: 'inventors', label: 'Inventors', icon: Users, color: 'text-teal-600', path: '/inventors' },
    { id: 'teams', label: 'Teams', icon: UsersRound, color: 'text-orange-600', path: '/teams' },
    { id: 'alerts', label: 'Alerts', icon: Bell, color: 'text-red-600', path: '/alerts' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-gray-600', path: '/profile' },
  ]

  // Add User Management for Directors only
  const isDirector = user?.user_metadata?.role === 'Director'
  const navigationItems = isDirector 
    ? [
        ...baseNavigationItems.slice(0, -1), // All items except profile
        { id: 'user-management', label: 'User Management', icon: Settings, color: 'text-slate-600', path: '/user-management' },
        baseNavigationItems[baseNavigationItems.length - 1] // Profile at the end
      ]
    : baseNavigationItems

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const Sidebar = ({ className = "" }) => (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-accent text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">IP Operations</h1>
            <p className="text-sm text-white/80">University of Windsor</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'alerts' && (
                <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-1">3</Badge>
              )}
            </button>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <Button variant="outline" className="w-full justify-start gap-2 hover:bg-gray-50">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navbar */}
      <Navbar />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">IP Operations</h1>
            <p className="text-xs text-gray-500">University of Windsor</p>
          </div>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="hover:bg-gray-50">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <VisuallyHidden>
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
            </VisuallyHidden>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 h-screen sticky top-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}