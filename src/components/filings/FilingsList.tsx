import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, FileText, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useFilings } from '@/hooks/useData'
import { format } from 'date-fns'

interface Filing {
  id: string
  title: string
  jurisdiction: string
  filing_type: string
  priority_date: string
  filing_date: string
  application_number: string
  publication_date?: string
  status: string
  grant_date?: string
  grant_number?: string
  expiry_date?: string
  annuity_date?: string
  law_firm_name?: string
  law_firm_contact_name?: string
  law_firm_contact_email?: string
  tags: string[]
  created_at: string
  updated_at: string
}

const FILING_TYPES = [
  'Provisional',
  'PCT',
  'National',
  'Continuation',
  'Divisional',
  'Non-Provisional'
]

const JURISDICTIONS = [
  'US',
  'CA',
  'EP',
  'GB',
  'DE',
  'FR',
  'JP',
  'CN',
  'AU',
  'PCT'
]

const FILING_STATUSES = [
  'Filed',
  'Published',
  'Under Examination',
  'Granted',
  'Abandoned',
  'Expired',
  'Pending'
]

export function FilingsList() {
  const navigate = useNavigate()
  const { data: filings, loading, error, refresh: refetch } = useFilings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all')

  const filteredFilings = filings?.filter(filing => {
    const matchesSearch = filing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.law_firm_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || filing.status === statusFilter
    const matchesType = typeFilter === 'all' || filing.filing_type === typeFilter
    const matchesJurisdiction = jurisdictionFilter === 'all' || filing.jurisdiction === jurisdictionFilter

    return matchesSearch && matchesStatus && matchesType && matchesJurisdiction
  }) || []

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading filings: {error.message}</p>
        <Button onClick={refetch} className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patent Filings</h1>
          <p className="text-gray-600">Manage patent applications and prosecution</p>
        </div>
        <Button onClick={() => navigate('/filings/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Filing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Filings</p>
                <p className="text-2xl font-semibold">{filings?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Granted Patents</p>
                <p className="text-2xl font-semibold">
                  {filings?.filter(f => f.status === 'Granted').length || 0}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Granted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Examination</p>
                <p className="text-2xl font-semibold">
                  {filings?.filter(f => f.status === 'Under Examination').length || 0}
                </p>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annuities Due</p>
                <p className="text-2xl font-semibold">
                  {filings?.filter(f => isAnnuityDue(f.annuity_date)).length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search filings by title, application number, or law firm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FILING_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {FILING_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  {JURISDICTIONS.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-gray-600">Additional filtering options coming soon...</p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Filings ({filteredFilings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFilings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No filings found</p>
              <Button 
                onClick={() => navigate('/filings/new')} 
                className="mt-4"
                variant="outline"
              >
                Create First Filing
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Application #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Annuity Due</TableHead>
                    <TableHead>Law Firm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilings.map((filing) => (
                    <TableRow 
                      key={filing.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/filings/${filing.id}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{filing.title}</span>
                          {filing.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {filing.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {filing.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{filing.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {filing.application_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{filing.filing_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{filing.jurisdiction}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={filing.status} variant={getStatusColor(filing.status)} />
                      </TableCell>
                      <TableCell>
                        {filing.filing_date ? format(new Date(filing.filing_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {filing.annuity_date ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {format(new Date(filing.annuity_date), 'MMM dd, yyyy')}
                            </span>
                            {isAnnuityDue(filing.annuity_date) && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {filing.law_firm_name ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{filing.law_firm_name}</span>
                            {filing.law_firm_contact_name && (
                              <span className="text-xs text-gray-600">{filing.law_firm_contact_name}</span>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}