import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  History, 
  Clock, 
  User, 
  Edit, 
  Plus, 
  Trash2, 
  CheckSquare, 
  MessageSquare, 
  StickyNote,
  Link,
  TrendingUp,
  FileText,
  Filter,
  Calendar
} from 'lucide-react'
import { useEntityTimeline } from '@/hooks/useData'

interface TimelinePanelProps {
  entityType: string
  entityId: string
}

const activityIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  status_change: TrendingUp,
  stage_change: TrendingUp,
  note_added: StickyNote,
  comment_added: MessageSquare,
  checklist_updated: CheckSquare,
  link_created: Link,
  link_removed: Link,
  default: Clock
}

const activityColors = {
  create: 'text-green-600 bg-green-100',
  update: 'text-blue-600 bg-blue-100',
  delete: 'text-red-600 bg-red-100',
  status_change: 'text-purple-600 bg-purple-100',
  stage_change: 'text-indigo-600 bg-indigo-100',
  note_added: 'text-amber-600 bg-amber-100',
  comment_added: 'text-cyan-600 bg-cyan-100',
  checklist_updated: 'text-emerald-600 bg-emerald-100',
  link_created: 'text-pink-600 bg-pink-100',
  link_removed: 'text-gray-600 bg-gray-100',
  default: 'text-gray-600 bg-gray-100'
}

export function TimelinePanel({ entityType, entityId }: TimelinePanelProps) {
  const { activities, loading } = useEntityTimeline(entityType, entityId)
  const [filterType, setFilterType] = useState('all')

  const filteredActivities = activities.filter(activity => 
    filterType === 'all' || activity.action === filterType
  )

  const uniqueActionTypes = [...new Set(activities.map(a => a.action))].sort()

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActivityIcon = (action: string) => {
    return activityIcons[action as keyof typeof activityIcons] || activityIcons.default
  }

  const getActivityColor = (action: string) => {
    return activityColors[action as keyof typeof activityColors] || activityColors.default
  }

  const groupActivitiesByDate = (activities: any[]) => {
    const groups: { [key: string]: any[] } = {}
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })
    
    return groups
  }

  const activityGroups = groupActivitiesByDate(filteredActivities)
  const sortedDates = Object.keys(activityGroups).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Activity Filter
              </CardTitle>
              <CardDescription>
                Filter timeline by activity type
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50">
              {filteredActivities.length} activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {uniqueActionTypes.map(actionType => {
                const Icon = getActivityIcon(actionType)
                return (
                  <SelectItem key={actionType} value={actionType}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Complete history of changes and activities for this {entityType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activities.length === 0 ? 'No activity yet' : 'No matching activities'}
              </h3>
              <p className="text-gray-600">
                {activities.length === 0 
                  ? 'Activity will appear here as changes are made to this disclosure'
                  : 'Try adjusting your filter to see more activities'
                }
              </p>
              {activities.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilterType('all')}
                  className="mt-4"
                >
                  Show All Activities
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(dateString => (
                <div key={dateString} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {formatDateHeader(dateString)}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Activities for this date */}
                  <div className="space-y-4 ml-4">
                    {activityGroups[dateString].map((activity, index) => {
                      const Icon = getActivityIcon(activity.action)
                      const colorClasses = getActivityColor(activity.action)
                      
                      return (
                        <div key={activity.id} className="flex gap-4">
                          {/* Timeline connector */}
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${colorClasses}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {index < activityGroups[dateString].length - 1 && (
                              <div className="w-px h-8 bg-gray-200 mt-2"></div>
                            )}
                          </div>

                          {/* Activity content */}
                          <div className="flex-1 pb-4">
                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${colorClasses.replace('bg-', 'border-').replace('-100', '-200')}`}
                                  >
                                    {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <User className="h-3 w-3" />
                                    You
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(activity.created_at)}
                                </div>
                              </div>
                              
                              <p className="text-gray-900 text-sm leading-relaxed">
                                {activity.description}
                              </p>
                              
                              {/* Metadata */}
                              {activity.metadata && activity.metadata !== '{}' && (
                                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                  <span className="font-medium text-gray-700">Details:</span>
                                  <pre className="text-gray-600 mt-1 whitespace-pre-wrap">
                                    {typeof activity.metadata === 'string' 
                                      ? activity.metadata 
                                      : JSON.stringify(activity.metadata, null, 2)
                                    }
                                  </pre>
                                </div>
                              )}
                              
                              {/* Exact timestamp */}
                              <div className="mt-3 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                  {new Date(activity.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}