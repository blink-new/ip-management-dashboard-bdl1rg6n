import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthProvider'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { DisclosuresModule } from '@/components/modules/DisclosuresModule'
import { FilingsModule } from '@/components/modules/FilingsModule'
import { ProjectsModule } from '@/components/modules/ProjectsModule'
import { AgreementsModule } from '@/components/modules/AgreementsModule'
import { StartupsModule } from '@/components/modules/StartupsModule'
import { InventorsModule } from '@/components/modules/InventorsModule'
import { TeamsModule } from '@/components/modules/TeamsModule'
import { AlertsModule } from '@/components/modules/AlertsModule'
import { ProfileModule } from '@/components/modules/ProfileModule'
import Dashboard from '@/pages/Dashboard'
import { UserManagement } from '@/pages/UserManagement'
import { Navbar } from '@/components/layout/Navbar'
import { useDashboardStats } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Plus,
  TrendingUp,
  Calendar,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Link,
  MessageSquare,
  CheckSquare,
  Target,
  Lightbulb,
  Scale,
  Rocket,
  Award,
  Globe,
  DollarSign,
  Zap
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const stats = useDashboardStats()

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

  const baseNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'disclosures', label: 'Disclosures', icon: FileText, color: 'text-emerald-600' },
    { id: 'filings', label: 'Filings', icon: FolderOpen, color: 'text-purple-600' },
    { id: 'projects', label: 'Projects', icon: Briefcase, color: 'text-amber-600' },
    { id: 'agreements', label: 'Agreements', icon: FileCheck, color: 'text-rose-600' },
    { id: 'startups', label: 'Startups', icon: Building2, color: 'text-indigo-600' },
    { id: 'inventors', label: 'Inventors', icon: Users, color: 'text-teal-600' },
    { id: 'teams', label: 'Teams', icon: UsersRound, color: 'text-orange-600' },
    { id: 'alerts', label: 'Alerts', icon: Bell, color: 'text-red-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-gray-600' },
  ]

  // Add User Management for Directors only
  const isDirector = user?.user_metadata?.role === 'Director'
  const navigationItems = isDirector 
    ? [
        ...baseNavigationItems.slice(0, -1), // All items except profile
        { id: 'user-management', label: 'User Management', icon: Settings, color: 'text-slate-600' },
        baseNavigationItems[baseNavigationItems.length - 1] // Profile at the end
      ]
    : baseNavigationItems

  // Sample data for charts
  const disclosureData = [
    { month: 'Jan', count: 12, filed: 8 },
    { month: 'Feb', count: 15, filed: 10 },
    { month: 'Mar', count: 18, filed: 12 },
    { month: 'Apr', count: 22, filed: 15 },
    { month: 'May', count: 19, filed: 14 },
    { month: 'Jun', count: 24, filed: 18 }
  ]

  const trlData = [
    { name: 'TRL 1-3', value: 35, color: '#ef4444' },
    { name: 'TRL 4-6', value: 45, color: '#f59e0b' },
    { name: 'TRL 7-9', value: 20, color: '#10b981' }
  ]

  const startupStageData = [
    { stage: 'Idea', count: 8 },
    { stage: 'Pre-Seed', count: 5 },
    { stage: 'Seed', count: 3 },
    { stage: 'Revenue', count: 2 },
    { stage: 'Exit', count: 1 }
  ]

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
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                activeModule === item.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 ${activeModule === item.id ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
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

  const DashboardContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome to the IP Management & Commercialization Center</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all">
            <Plus className="h-4 w-4" />
            New Disclosure
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Active Disclosures</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">24</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Patent Filings</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">12</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">+2 this quarter</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Active Projects</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">8</div>
            <div className="flex items-center gap-1 mt-2">
              <Target className="h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">2 in commercialization</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Startups</CardTitle>
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">5</div>
            <div className="flex items-center gap-1 mt-2">
              <Rocket className="h-3 w-3 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">1 new this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disclosure Trends */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Disclosure & Filing Trends
            </CardTitle>
            <CardDescription>Monthly disclosure submissions and patent filings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disclosureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Disclosures" radius={[4, 4, 0, 0]} />
                <Bar dataKey="filed" fill="hsl(var(--accent))" name="Filed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TRL Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              TRL Distribution
            </CardTitle>
            <CardDescription>Technology Readiness Levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={trlData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {trlData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">New disclosure submitted</p>
                <p className="text-sm text-blue-700">INV-2025-0024 - Advanced Battery Technology</p>
                <p className="text-xs text-blue-600 mt-1">2 hours ago by Dr. Sarah Chen</p>
              </div>
              <Badge className="bg-blue-500 text-white">New</Badge>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-900">Patent application filed</p>
                <p className="text-sm text-green-700">US Application for Smart Sensor Network</p>
                <p className="text-xs text-green-600 mt-1">1 day ago</p>
              </div>
              <Badge className="bg-green-500 text-white">Filed</Badge>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900">Agreement renewal due</p>
                <p className="text-sm text-amber-700">Licensing Agreement with TechCorp Inc.</p>
                <p className="text-xs text-amber-600 mt-1">Due in 30 days</p>
              </div>
              <Badge className="bg-amber-500 text-white">Pending</Badge>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900">New startup incorporated</p>
                <p className="text-sm text-purple-700">NanoTech Solutions Inc.</p>
                <p className="text-xs text-purple-600 mt-1">3 days ago</p>
              </div>
              <Badge className="bg-purple-500 text-white">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important dates to track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Annuity Payment</p>
                <p className="text-sm text-red-700">Patent US10,123,456</p>
                <p className="text-xs text-red-600">Due: Jan 25, 2025</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border-l-4 border-amber-500 bg-amber-50 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Office Action Response</p>
                <p className="text-sm text-amber-700">Application 17/234,567</p>
                <p className="text-xs text-amber-600">Due: Feb 15, 2025</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Agreement Review</p>
                <p className="text-sm text-blue-700">MTA with Research Institute</p>
                <p className="text-xs text-blue-600">Due: Feb 28, 2025</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-green-50 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900">TRL Assessment</p>
                <p className="text-sm text-green-700">Quantum Computing Project</p>
                <p className="text-xs text-green-600">Due: Mar 10, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Startup Funnel */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Startup Development Funnel
          </CardTitle>
          <CardDescription>Track startup progression through development stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={startupStageData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="stage" type="category" stroke="#666" width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const ModuleContent = ({ module }: { module: string }) => {
    const moduleConfig = {
      disclosures: {
        title: 'Disclosures',
        description: 'Manage invention disclosures and technology submissions',
        icon: FileText,
        color: 'emerald',
        tabs: ['Overview', 'IRL/TRL', 'Linked Projects', 'Linked Filings', 'Timeline', 'Notes']
      },
      filings: {
        title: 'Patent Filings',
        description: 'Track patent applications and prosecution',
        icon: FolderOpen,
        color: 'purple',
        tabs: ['Overview', 'Prosecution', 'Annuities', 'Family Tree', 'Timeline', 'Documents']
      },
      projects: {
        title: 'Commercialization Projects',
        description: 'Manage technology transfer and commercialization initiatives',
        icon: Briefcase,
        color: 'amber',
        tabs: ['Overview', 'Team', 'Milestones', 'Budget', 'Timeline', 'Reports']
      },
      agreements: {
        title: 'Legal Agreements',
        description: 'Track contracts, licenses, and legal documents',
        icon: FileCheck,
        color: 'rose',
        tabs: ['Overview', 'Terms', 'Parties', 'Renewals', 'Timeline', 'Documents']
      },
      startups: {
        title: 'Startups & Spinouts',
        description: 'Monitor startup companies and spin-off ventures',
        icon: Building2,
        color: 'indigo',
        tabs: ['Overview', 'Founders', 'Funding', 'Milestones', 'Timeline', 'Documents']
      },
      inventors: {
        title: 'Inventors',
        description: 'Manage inventor profiles and contributions',
        icon: Users,
        color: 'teal',
        tabs: ['Overview', 'Disclosures', 'Patents', 'Projects', 'Timeline', 'Profile']
      },
      teams: {
        title: 'Team Members',
        description: 'Coordinate project teams and collaborators',
        icon: UsersRound,
        color: 'orange',
        tabs: ['Overview', 'Projects', 'Skills', 'Availability', 'Timeline', 'Profile']
      },
      alerts: {
        title: 'Alerts & Notifications',
        description: 'Stay updated with important deadlines and events',
        icon: Bell,
        color: 'red',
        tabs: ['All Alerts', 'Deadlines', 'Reviews', 'Updates', 'Settings']
      }
    }

    const config = moduleConfig[module as keyof typeof moduleConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${config.color}-100 rounded-xl`}>
              <Icon className={`h-8 w-8 text-${config.color}-600`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button className={`gap-2 bg-${config.color}-600 hover:bg-${config.color}-700`}>
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>

        {/* Module Tabs */}
        <Tabs defaultValue={config.tabs[0].toLowerCase().replace(/[^a-z0-9]/g, '')} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100">
            {config.tabs.map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab.toLowerCase().replace(/[^a-z0-9]/g, '')}
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.tabs.map((tab) => (
            <TabsContent 
              key={tab} 
              value={tab.toLowerCase().replace(/[^a-z0-9]/g, '')}
              className="mt-6"
            >
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>{tab} - {config.title}</CardTitle>
                  <CardDescription>
                    This section is under development. Full functionality will be available soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Icon className={`h-16 w-16 text-${config.color}-300 mx-auto mb-4`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tab} Module Coming Soon
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We're building comprehensive {tab.toLowerCase()} management features. 
                      This will include advanced filtering, real-time collaboration, and detailed tracking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

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
        <Sheet>
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
          {activeModule === 'dashboard' && <Dashboard />}
          {activeModule === 'disclosures' && <DisclosuresModule />}
          {activeModule === 'filings' && <FilingsModule />}
          {activeModule === 'projects' && <ProjectsModule />}
          {activeModule === 'agreements' && <AgreementsModule />}
          {activeModule === 'startups' && <StartupsModule />}
          {activeModule === 'inventors' && <InventorsModule />}
          {activeModule === 'teams' && <TeamsModule />}
          {activeModule === 'alerts' && <AlertsModule />}
          {activeModule === 'profile' && <ProfileModule />}
          {activeModule === 'user-management' && <UserManagement />}
          {activeModule !== 'dashboard' && 
           activeModule !== 'disclosures' && 
           activeModule !== 'filings' && 
           activeModule !== 'projects' && 
           activeModule !== 'agreements' && 
           activeModule !== 'startups' && 
           activeModule !== 'profile' && 
           activeModule !== 'user-management' && (
            <ModuleContent module={activeModule} />
          )}
          {activeModule === 'profile' && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Management</h2>
              <p className="text-gray-600">User profile and settings management coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
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