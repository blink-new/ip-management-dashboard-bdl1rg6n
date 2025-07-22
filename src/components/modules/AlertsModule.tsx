import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Building2,
  FileCheck,
  Lightbulb,
  Scale
} from 'lucide-react'
import { useAlerts } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Alert } from '@/lib/blink'

const alertTypeColors = {
  'agreement_expiry': 'bg-amber-100 text-amber-800 border-amber-200',
  'new_disclosure': 'bg-green-100 text-green-800 border-green-200',
  'comment_reply': 'bg-purple-100 text-purple-800 border-purple-200',
  'checklist_due': 'bg-orange-100 text-orange-800 border-orange-200',
  'link_deleted': 'bg-gray-100 text-gray-800 border-gray-200',
  'project_milestone': 'bg-blue-100 text-blue-800 border-blue-200'
}

const alertTypeIcons = {
  'agreement_expiry': FileCheck,
  'new_disclosure': Lightbulb,
  'comment_reply': FileText,
  'checklist_due': Clock,
  'link_deleted': X,
  'project_milestone': Building2
}

export function AlertsModule() {
  const { data: alerts, loading, update, remove } = useAlerts()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTab, setSelectedTab] = useState('all')

  const generateSampleAlerts = useCallback(async () => {
    const sampleAlerts = [
      {
        type: 'agreement_expiry',
        title: 'Agreement Expiring',
        description: 'Licensing Agreement with TechCorp expires in 30 days',
        entity_type: 'agreement',
        entity_id: 'agreement_1',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        is_dismissed: false
      },
      {
        type: 'project_milestone',
        title: 'Project Milestone Due',
        description: 'Technology assessment milestone due for Smart Sensor Project',
        entity_type: 'project',
        entity_id: 'project_1',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        is_dismissed: false
      },
      {
        type: 'new_disclosure',
        title: 'New Disclosure Submitted',
        description: 'INV-2025-0025 - Quantum Computing Algorithm submitted for review',
        entity_type: 'disclosure',
        entity_id: 'disclosure_1',
        is_read: true,
        is_dismissed: false
      },
      {
        type: 'checklist_due',
        title: 'Checklist Item Due',
        description: 'Market research completion due for Project Alpha',
        entity_type: 'project',
        entity_id: 'project_2',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        is_dismissed: false
      }
    ]

    try {
      for (const alert of sampleAlerts) {
        await supabase.from('alerts').insert({
          ...alert,
          user_id: user.id
        })
      }
      // Refresh alerts after creating samples
      window.location.reload()
    } catch (error) {
      console.error('Failed to create sample alerts:', error)
    }
  }, [user])

  // Generate sample alerts on component mount if none exist
  useEffect(() => {
    if (!loading && alerts.length === 0 && user) {
      generateSampleAlerts()
    }
  }, [loading, alerts.length, user, generateSampleAlerts])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || alert.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !alert.is_read) ||
                         (statusFilter === 'read' && alert.is_read) ||
                         (statusFilter === 'dismissed' && alert.is_dismissed)
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'deadlines' && alert.due_date) ||
                      (selectedTab === 'reviews' && alert.type === 'new_disclosure') ||
                      (selectedTab === 'updates' && ['comment_reply', 'link_deleted'].includes(alert.type))
    
    return matchesSearch && matchesType && matchesStatus && matchesTab && !alert.is_dismissed
  })

  const handleMarkAsRead = async (alertId: string, isRead: boolean) => {
    try {
      await update(alertId, { is_read: isRead })
    } catch (error) {
      console.error('Failed to update alert:', error)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      await update(alertId, { is_dismissed: true })
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }

  const getAlertPriority = (alert: Alert) => {
    if (!alert.due_date) return 'low'
    const daysUntil = Math.ceil((new Date(alert.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 7) return 'high'
    if (daysUntil <= 30) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-amber-600'
      default: return 'text-blue-600'
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read && !a.is_dismissed).length
  const highPriorityCount = alerts.filter(a => !a.is_dismissed && getAlertPriority(a) === 'high').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl relative">
            <Bell className="h-8 w-8 text-red-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with important deadlines and events</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="agreement_expiry">Agreements</SelectItem>
                <SelectItem value="project_milestone">Projects</SelectItem>
                <SelectItem value="new_disclosure">Disclosures</SelectItem>
                <SelectItem value="checklist_due">Checklists</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-900">{alerts.filter(a => !a.is_dismissed).length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Unread</p>
                <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
              </div>
              <EyeOff className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">High Priority</p>
                <p className="text-2xl font-bold text-amber-900">{highPriorityCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Due This Week</p>
                <p className="text-2xl font-bold text-green-900">
                  {alerts.filter(a => {
                    if (!a.due_date || a.is_dismissed) return false
                    const daysUntil = Math.ceil((new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysUntil <= 7 && daysUntil >= 0
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <AlertsList alerts={filteredAlerts} onMarkAsRead={handleMarkAsRead} onDismiss={handleDismiss} />
            </TabsContent>

            <TabsContent value="deadlines" className="mt-6">
              <AlertsList 
                alerts={filteredAlerts.filter(a => a.due_date)} 
                onMarkAsRead={handleMarkAsRead} 
                onDismiss={handleDismiss} 
              />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <AlertsList 
                alerts={filteredAlerts.filter(a => a.type === 'new_disclosure')} 
                onMarkAsRead={handleMarkAsRead} 
                onDismiss={handleDismiss} 
              />
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <AlertsList 
                alerts={filteredAlerts.filter(a => ['comment_reply', 'link_deleted'].includes(a.type))} 
                onMarkAsRead={handleMarkAsRead} 
                onDismiss={handleDismiss} 
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Agreement Expiry</h4>
                        <p className="text-sm text-gray-600">Get notified about expiring agreements</p>
                      </div>
                      <Badge variant="outline">30 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Project Milestones</h4>
                        <p className="text-sm text-gray-600">Get notified about upcoming project milestones</p>
                      </div>
                      <Badge variant="outline">14 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">New Disclosures</h4>
                        <p className="text-sm text-gray-600">Get notified when new disclosures are submitted</p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface AlertsListProps {
  alerts: Alert[]
  onMarkAsRead: (id: string, isRead: boolean) => void
  onDismiss: (id: string) => void
}

function AlertsList({ alerts, onMarkAsRead, onDismiss }: AlertsListProps) {
  const getAlertPriority = (alert: Alert) => {
    if (!alert.due_date) return 'low'
    const daysUntil = Math.ceil((new Date(alert.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 7) return 'high'
    if (daysUntil <= 30) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-amber-600'
      default: return 'text-blue-600'
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
        <p className="text-gray-600">You're all caught up! No alerts match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const IconComponent = alertTypeIcons[alert.type as keyof typeof alertTypeIcons] || Bell
        const priority = getAlertPriority(alert)
        
        return (
          <div
            key={alert.id}
            className={`p-4 border rounded-lg transition-all hover:shadow-md ${
              alert.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${alertTypeColors[alert.type as keyof typeof alertTypeColors] || 'bg-gray-100 text-gray-800'}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${alert.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${alert.is_read ? 'text-gray-500' : 'text-gray-600'}`}>
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                      {alert.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={`text-xs font-medium ${getPriorityColor(priority)}`}>
                            Due: {new Date(alert.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {alert.entity_type && (
                        <Badge variant="outline" className="text-xs">
                          {alert.entity_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(alert.id, !alert.is_read)}
                      className="h-8 w-8 p-0"
                    >
                      {alert.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(alert.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}