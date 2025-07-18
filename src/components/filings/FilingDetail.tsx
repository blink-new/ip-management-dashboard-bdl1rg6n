import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  Building, 
  Users, 
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { NotesCommentsPanel } from '@/components/shared/NotesCommentsPanel'
import { ChecklistPanel } from '@/components/shared/ChecklistPanel'
import { TimelinePanel } from '@/components/shared/TimelinePanel'
import { CrossLinkingPanel } from '@/components/shared/CrossLinkingPanel'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface Filing {
  id: string
  title: string
  jurisdiction: string
  filing_type: string
  priority_date?: string
  filing_date?: string
  application_number?: string
  publication_date?: string
  status: string
  grant_date?: string
  grant_number?: string
  expiry_date?: string
  annuity_date?: string
  law_firm_name?: string
  law_firm_contact_name?: string
  law_firm_contact_email?: string
  patent_classifications?: string
  maintenance_schedule?: string
  office_action_log?: string
  tags: string[]
  parent_filing_id?: string
  created_at: string
  updated_at: string
}

export function FilingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [filing, setFiling] = useState<Filing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadFiling(id)
    }
  }, [id])

  const loadFiling = async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filings')
        .select('*')
        .eq('id', filingId)
        .single()

      if (error) throw error
      setFiling(data)
    } catch (error) {
      console.error('Error loading filing:', error)
      setError('Failed to load filing')
      toast({
        title: 'Error',
        description: 'Failed to load filing details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'granted': return 'success'
      case 'filed': return 'info'
      case 'published': return 'info'
      case 'under examination': return 'warning'
      case 'abandoned': return 'destructive'
      case 'expired': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  const isAnnuityDue = (annuityDate: string | undefined) => {
    if (!annuityDate) return false
    const due = new Date(annuityDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays >= 0
  }

  const getDaysUntilAnnuity = (annuityDate: string | undefined) => {
    if (!annuityDate) return null
    const due = new Date(annuityDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !filing) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Filing not found'}</p>
        <Button onClick={() => navigate('/filings')} className="mt-4">
          Back to Filings
        </Button>
      </div>
    )
  }

  const annuityDays = getDaysUntilAnnuity(filing.annuity_date)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/filings')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{filing.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={filing.status} variant={getStatusColor(filing.status)} />
              <Badge variant="outline">{filing.filing_type}</Badge>
              <Badge variant="secondary">{filing.jurisdiction}</Badge>
              {filing.annuity_date && isAnnuityDue(filing.annuity_date) && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Annuity Due in {annuityDays} days
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/filings/${id}/edit`)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Filing
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prosecution">Prosecution</TabsTrigger>
          <TabsTrigger value="linked">Linked Items</TabsTrigger>
          <TabsTrigger value="notes">Notes & Comments</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Application Number</p>
                      <p className="font-mono">{filing.application_number || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Grant Number</p>
                      <p className="font-mono">{filing.grant_number || 'Not granted'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Filing Type</p>
                      <Badge variant="outline">{filing.filing_type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Jurisdiction</p>
                      <Badge variant="secondary">{filing.jurisdiction}</Badge>
                    </div>
                  </div>

                  {filing.patent_classifications && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Patent Classifications</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">{filing.patent_classifications}</p>
                    </div>
                  )}

                  {filing.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {filing.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Important Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filing.priority_date && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Priority Date</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.priority_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {filing.filing_date && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Filing Date</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.filing_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {filing.publication_date && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Publication Date</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.publication_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {filing.grant_date && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Grant Date</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.grant_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {filing.expiry_date && (
                      <div className="flex items-center gap-3">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">Expiry Date</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.expiry_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    {filing.annuity_date && (
                      <div className="flex items-center gap-3">
                        <AlertCircle className={`w-4 h-4 ${isAnnuityDue(filing.annuity_date) ? 'text-red-500' : 'text-orange-500'}`} />
                        <div>
                          <p className="text-sm font-medium">Next Annuity Due</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(filing.annuity_date), 'MMM dd, yyyy')}
                            {annuityDays !== null && (
                              <span className={`ml-2 ${annuityDays <= 30 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                ({annuityDays > 0 ? `${annuityDays} days` : 'Overdue'})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Law Firm Information */}
              {(filing.law_firm_name || filing.law_firm_contact_name || filing.law_firm_contact_email) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Law Firm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filing.law_firm_name && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Firm</p>
                        <p className="font-medium">{filing.law_firm_name}</p>
                      </div>
                    )}
                    {filing.law_firm_contact_name && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact</p>
                        <p>{filing.law_firm_contact_name}</p>
                      </div>
                    )}
                    {filing.law_firm_contact_email && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <a 
                          href={`mailto:${filing.law_firm_contact_email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {filing.law_firm_contact_email}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Link to Disclosure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Prosecution Tab */}
        <TabsContent value="prosecution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {filing.maintenance_schedule ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{filing.maintenance_schedule}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No maintenance schedule recorded</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Action Log</CardTitle>
              </CardHeader>
              <CardContent>
                {filing.office_action_log ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{filing.office_action_log}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No office actions recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Linked Items Tab */}
        <TabsContent value="linked">
          <CrossLinkingPanel module="filings" recordId={id!} />
        </TabsContent>

        {/* Notes & Comments Tab */}
        <TabsContent value="notes">
          <NotesCommentsPanel module="filings" recordId={id!} />
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <ChecklistPanel module="filings" recordId={id!} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <TimelinePanel module="filings" recordId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  )
}