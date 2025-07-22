import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Edit, 
  ArrowLeft, 
  Users, 
  Tag, 
  Building2, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Link,
  MessageSquare,
  CheckSquare,
  History,
  Save,
  Loader2,
  Home
} from 'lucide-react'
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { CrossLinkingPanel } from '@/components/shared/CrossLinkingPanel'
import { NotesCommentsPanel } from '@/components/shared/NotesCommentsPanel'
import { ChecklistPanel } from '@/components/shared/ChecklistPanel'
import { TimelinePanel } from '@/components/shared/TimelinePanel'
import { useActivityLogger } from '@/hooks/useData'
import type { Disclosure } from '@/lib/blink'

interface DisclosureDetailProps {
  disclosure: Disclosure
  onEdit: () => void
  onBack: () => void
  onUpdate: (id: string, updates: Partial<Disclosure>) => Promise<void>
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'In Review', label: 'In Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'Returned to Inventor (Further Research)', label: 'Returned - Further Research', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'Returned to Inventor (Incomplete)', label: 'Returned - Incomplete', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'Reviewed for Filing', label: 'Reviewed for Filing', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'Application Filed', label: 'Application Filed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'Abandoned', label: 'Abandoned', color: 'bg-red-100 text-red-800 border-red-200' }
]

const stageOptions = [
  { value: 'Received', label: 'Received', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'In Review', label: 'In Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'Filed', label: 'Filed', color: 'bg-purple-100 text-purple-800 border-purple-200' }
]

export function DisclosureDetail({ disclosure, onEdit, onBack, onUpdate }: DisclosureDetailProps) {
  const { logActivity } = useActivityLogger()
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === disclosure.status) return
    
    try {
      setUpdating(true)
      await onUpdate(disclosure.id, { status: newStatus })
      await logActivity(
        'disclosure',
        disclosure.id,
        'status_change',
        `Status changed from "${disclosure.status}" to "${newStatus}"`
      )
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleStageChange = async (newStage: string) => {
    if (newStage === disclosure.stage) return
    
    try {
      setUpdating(true)
      await onUpdate(disclosure.id, { stage: newStage })
      await logActivity(
        'disclosure',
        disclosure.id,
        'stage_change',
        `Stage changed from "${disclosure.stage}" to "${newStage}"`
      )
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStageColor = (stage: string) => {
    return stageOptions.find(s => s.value === stage)?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getReadinessAverage = () => {
    const levels = [disclosure.trl, disclosure.irl, disclosure.crl, disclosure.brl, disclosure.iprl, disclosure.tmrl, disclosure.frl]
    return levels.reduce((sum, level) => sum + level, 0) / levels.length
  }

  const getReadinessColor = (level: number) => {
    if (level <= 3) return 'bg-red-500'
    if (level <= 6) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const IrlRadarChart = () => {
    const irlData = [
      { name: 'TRL', label: 'Technology', value: disclosure.trl, max: 9 },
      { name: 'CRL', label: 'Commercial', value: disclosure.crl, max: 9 },
      { name: 'BRL', label: 'Business', value: disclosure.brl, max: 9 },
      { name: 'IPRL', label: 'IP', value: disclosure.iprl, max: 9 },
      { name: 'TMRL', label: 'Team', value: disclosure.tmrl, max: 9 },
      { name: 'FRL', label: 'Financial', value: disclosure.frl, max: 9 }
    ]

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
          <div className="text-3xl font-bold text-indigo-900 mb-2">
            {getReadinessAverage().toFixed(1)}/9
          </div>
          <p className="text-indigo-700 font-medium">Overall Readiness Score</p>
          <Progress 
            value={(getReadinessAverage() / 9) * 100} 
            className="mt-3 h-3"
          />
        </div>

        {/* Individual Levels */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-4">Innovation Readiness Breakdown</h4>
          {irlData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.label})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getReadinessColor(item.value)}`}></div>
                  <span className="text-sm font-semibold">{item.value}/{item.max}</span>
                </div>
              </div>
              <Progress value={(item.value / item.max) * 100} className="h-2" />
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h5 className="font-medium text-amber-800 mb-2">Recommendations</h5>
          <ul className="text-sm text-amber-700 space-y-1">
            {getReadinessAverage() < 4 && (
              <li>• Focus on fundamental research and proof of concept development</li>
            )}
            {getReadinessAverage() >= 4 && getReadinessAverage() < 7 && (
              <li>• Consider prototype development and market validation</li>
            )}
            {getReadinessAverage() >= 7 && (
              <li>• Ready for commercialization planning and partnership discussions</li>
            )}
            {disclosure.iprl < 5 && (
              <li>• Strengthen intellectual property protection strategy</li>
            )}
            {disclosure.crl < 5 && (
              <li>• Conduct market research and competitive analysis</li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onBack} className="cursor-pointer flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onBack} className="cursor-pointer">
              Disclosures
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{disclosure.invention_id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{disclosure.title}</h1>
              <p className="text-gray-600">{disclosure.invention_id}</p>
            </div>
          </div>
        </div>
        <Button onClick={onEdit} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Edit className="h-4 w-4" />
          Edit Disclosure
        </Button>
      </div>

      {/* Status Update Alert */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Disclosure updated successfully
          </AlertDescription>
        </Alert>
      )}

      {/* Status and Stage Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Status & Stage Management
          </CardTitle>
          <CardDescription>
            Update the current status and stage of this disclosure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Current Stage</label>
                <Badge className={getStageColor(disclosure.stage)}>
                  {disclosure.stage}
                </Badge>
              </div>
              <Select 
                value={disclosure.stage} 
                onValueChange={handleStageChange}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Current Status</label>
                <Badge className={getStatusColor(disclosure.status)}>
                  {disclosure.status}
                </Badge>
              </div>
              <Select 
                value={disclosure.status} 
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {updating && (
            <div className="flex items-center gap-2 mt-4 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating disclosure...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="irl-trl" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  IRL/TRL
                </TabsTrigger>
                <TabsTrigger value="linked" className="gap-2">
                  <Link className="h-4 w-4" />
                  Linked Items
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <History className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="checklist" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {disclosure.description || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <p className="mt-1 text-gray-900">{disclosure.disclosure_type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Lead PI</label>
                            <p className="mt-1 text-gray-900">{disclosure.lead_pi}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              Department
                            </label>
                            <p className="mt-1 text-gray-900">{disclosure.department || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              Faculty
                            </label>
                            <p className="mt-1 text-gray-900">{disclosure.faculty || 'Not specified'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created
                          </label>
                          <p className="mt-1 text-gray-900">
                            {new Date(disclosure.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* People and Tags */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Inventors
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {disclosure.inventors.map((inventor, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            {inventor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-purple-600" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {disclosure.tags.length > 0 ? (
                          disclosure.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No tags added</p>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg">
                      <h4 className="font-medium mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inventors:</span>
                          <span className="font-medium">{disclosure.inventors.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tags:</span>
                          <span className="font-medium">{disclosure.tags.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Readiness:</span>
                          <span className="font-medium">{getReadinessAverage().toFixed(1)}/9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="irl-trl" className="mt-0">
                <IrlRadarChart />
              </TabsContent>
              
              <TabsContent value="linked" className="mt-0">
                <CrossLinkingPanel
                  entityType="disclosure"
                  entityId={disclosure.id}
                  entityTitle={disclosure.title}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <TimelinePanel
                  entityType="disclosure"
                  entityId={disclosure.id}
                />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0">
                <NotesCommentsPanel
                  entityType="disclosure"
                  entityId={disclosure.id}
                  entityTitle={disclosure.title}
                />
              </TabsContent>
              
              <TabsContent value="checklist" className="mt-0">
                <ChecklistPanel
                  entityType="disclosure"
                  entityId={disclosure.id}
                  entityTitle={disclosure.title}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}