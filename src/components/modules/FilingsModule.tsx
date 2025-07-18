import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Link,
  MessageSquare,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  Scale,
  Globe
} from 'lucide-react'
import { useFilings } from '@/hooks/useData'
import type { Filing } from '@/lib/blink'

const statusColors = {
  'Filed': 'bg-blue-100 text-blue-800 border-blue-200',
  'Published': 'bg-green-100 text-green-800 border-green-200',
  'Granted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'Abandoned': 'bg-gray-100 text-gray-800 border-gray-200',
  'Pending': 'bg-amber-100 text-amber-800 border-amber-200'
}

const filingTypeColors = {
  'Provisional': 'bg-purple-100 text-purple-800 border-purple-200',
  'PCT': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'National': 'bg-green-100 text-green-800 border-green-200',
  'Continuation': 'bg-orange-100 text-orange-800 border-orange-200',
  'Divisional': 'bg-pink-100 text-pink-800 border-pink-200',
  'Non-Provisional': 'bg-blue-100 text-blue-800 border-blue-200'
}

export function FilingsModule() {
  const { data: filings, loading, create, update, remove } = useFilings()
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = filing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || filing.status === statusFilter
    const matchesType = typeFilter === 'all' || filing.filing_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateFiling = async (formData: FormData) => {
    try {
      await create({
        title: formData.get('title') as string,
        jurisdiction: formData.get('jurisdiction') as string,
        filing_type: formData.get('filing_type') as any,
        priority_date: formData.get('priority_date') as string,
        filing_date: formData.get('filing_date') as string,
        application_number: formData.get('application_number') as string,
        publication_date: formData.get('publication_date') as string || undefined,
        status: formData.get('status') as string || 'Filed',
        grant_date: formData.get('grant_date') as string || undefined,
        grant_number: formData.get('grant_number') as string || undefined,
        expiry_date: formData.get('expiry_date') as string || undefined,
        annuity_date: formData.get('annuity_date') as string || undefined,
        patent_classifications: (formData.get('patent_classifications') as string).split(',').map(s => s.trim()).filter(Boolean),
        tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
        law_firm_name: formData.get('law_firm_name') as string,
        law_firm_contact_name: formData.get('law_firm_contact_name') as string,
        law_firm_contact_email: formData.get('law_firm_contact_email') as string,
        parent_filing_id: formData.get('parent_filing_id') as string || undefined
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create filing:', error)
    }
  }

  const getAnnuityStatus = (annuityDate: string | undefined) => {
    if (!annuityDate) return null
    const today = new Date()
    const annuity = new Date(annuityDate)
    const daysUntil = Math.ceil((annuity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'overdue', color: 'text-red-600', days: Math.abs(daysUntil) }
    if (daysUntil <= 30) return { status: 'due-soon', color: 'text-amber-600', days: daysUntil }
    if (daysUntil <= 90) return { status: 'upcoming', color: 'text-blue-600', days: daysUntil }
    return { status: 'future', color: 'text-gray-600', days: daysUntil }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patent filings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FolderOpen className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patent Filings</h1>
            <p className="text-gray-600 mt-1">Track patent applications and prosecution</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search filings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Granted">Granted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Provisional">Provisional</SelectItem>
                <SelectItem value="PCT">PCT</SelectItem>
                <SelectItem value="National">National</SelectItem>
                <SelectItem value="Non-Provisional">Non-Provisional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                New Filing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Patent Filing</DialogTitle>
                <DialogDescription>
                  File a new patent application and track its prosecution.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateFiling(new FormData(e.currentTarget))
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filing_type">Filing Type *</Label>
                    <Select name="filing_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Provisional">Provisional</SelectItem>
                        <SelectItem value="PCT">PCT</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="Continuation">Continuation</SelectItem>
                        <SelectItem value="Divisional">Divisional</SelectItem>
                        <SelectItem value="Non-Provisional">Non-Provisional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Input id="jurisdiction" name="jurisdiction" placeholder="US, EP, CA, etc." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_number">Application Number *</Label>
                    <Input id="application_number" name="application_number" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority_date">Priority Date</Label>
                    <Input id="priority_date" name="priority_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filing_date">Filing Date *</Label>
                    <Input id="filing_date" name="filing_date" type="date" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publication_date">Publication Date</Label>
                    <Input id="publication_date" name="publication_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annuity_date">Next Annuity Date</Label>
                    <Input id="annuity_date" name="annuity_date" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patent_classifications">Patent Classifications (comma-separated)</Label>
                  <Input id="patent_classifications" name="patent_classifications" placeholder="H04L 29/06, G06F 21/62" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="AI, Security, Network" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="law_firm_name">Law Firm</Label>
                    <Input id="law_firm_name" name="law_firm_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="law_firm_contact_name">Contact Name</Label>
                    <Input id="law_firm_contact_name" name="law_firm_contact_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="law_firm_contact_email">Contact Email</Label>
                    <Input id="law_firm_contact_email" name="law_firm_contact_email" type="email" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Create Filing
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Filings</p>
                <p className="text-2xl font-bold text-blue-900">{filings.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Granted</p>
                <p className="text-2xl font-bold text-green-900">
                  {filings.filter(f => f.status === 'Granted').length}
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">Pending</p>
                <p className="text-2xl font-bold text-amber-900">
                  {filings.filter(f => ['Filed', 'Published', 'Pending'].includes(f.status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Annuities Due</p>
                <p className="text-2xl font-bold text-red-900">
                  {filings.filter(f => {
                    if (!f.annuity_date) return false
                    const daysUntil = Math.ceil((new Date(f.annuity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysUntil <= 90 && daysUntil >= 0
                  }).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedFiling ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  {selectedFiling.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="font-medium">{selectedFiling.application_number}</span>
                  <Badge className={filingTypeColors[selectedFiling.filing_type]}>
                    {selectedFiling.filing_type}
                  </Badge>
                  <Badge className={statusColors[selectedFiling.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                    {selectedFiling.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedFiling.jurisdiction}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedFiling(null)}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="prosecution">Prosecution</TabsTrigger>
                <TabsTrigger value="annuities">Annuities</TabsTrigger>
                <TabsTrigger value="family">Family Tree</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Priority Date</Label>
                        <p className="mt-1 text-gray-900">{selectedFiling.priority_date ? new Date(selectedFiling.priority_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Filing Date</Label>
                        <p className="mt-1 text-gray-900">{new Date(selectedFiling.filing_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Publication Date</Label>
                        <p className="mt-1 text-gray-900">{selectedFiling.publication_date ? new Date(selectedFiling.publication_date).toLocaleDateString() : 'Not published'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Grant Date</Label>
                        <p className="mt-1 text-gray-900">{selectedFiling.grant_date ? new Date(selectedFiling.grant_date).toLocaleDateString() : 'Not granted'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Law Firm</Label>
                      <div className="mt-1">
                        <p className="text-gray-900 font-medium">{selectedFiling.law_firm_name || 'Not assigned'}</p>
                        {selectedFiling.law_firm_contact_name && (
                          <p className="text-sm text-gray-600">{selectedFiling.law_firm_contact_name}</p>
                        )}
                        {selectedFiling.law_firm_contact_email && (
                          <p className="text-sm text-blue-600">{selectedFiling.law_firm_contact_email}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Patent Classifications</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedFiling.patent_classifications.map((classification, index) => (
                          <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {classification}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="prosecution" className="mt-6">
                <div className="text-center py-12">
                  <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Prosecution History</h3>
                  <p className="text-gray-600">Office actions and prosecution timeline coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="annuities" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Annuity Management</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Annuity
                    </Button>
                  </div>
                  {selectedFiling.annuity_date ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Next Annuity Payment</p>
                            <p className="text-sm text-gray-600">{new Date(selectedFiling.annuity_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const status = getAnnuityStatus(selectedFiling.annuity_date)
                              if (!status) return null
                              return (
                                <div className={status.color}>
                                  <p className="font-medium">
                                    {status.status === 'overdue' ? 'Overdue' : 
                                     status.status === 'due-soon' ? 'Due Soon' : 
                                     status.status === 'upcoming' ? 'Upcoming' : 'Future'}
                                  </p>
                                  <p className="text-sm">
                                    {status.status === 'overdue' ? `${status.days} days overdue` : `${status.days} days`}
                                  </p>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No annuity dates set</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="family" className="mt-6">
                <div className="text-center py-12">
                  <Link className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Patent Family Tree</h3>
                  <p className="text-gray-600">Parent/child patent relationships coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
                  <p className="text-gray-600">Filing timeline and milestones coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-600">Patent documents and attachments coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Patent Filings List</CardTitle>
            <CardDescription>
              {filteredFilings.length} of {filings.length} filings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFilings.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patent filings found</h3>
                <p className="text-gray-600 mb-4">Get started by filing your first patent application</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Filing
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Annuity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilings.map((filing) => (
                    <TableRow key={filing.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{filing.application_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{filing.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {filing.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {filing.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{filing.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={filingTypeColors[filing.filing_type]}>
                          {filing.filing_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{filing.jurisdiction}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[filing.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {filing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(filing.filing_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {filing.annuity_date ? (
                          (() => {
                            const status = getAnnuityStatus(filing.annuity_date)
                            return status ? (
                              <div className={`text-sm ${status.color}`}>
                                {status.status === 'overdue' ? 'Overdue' : 
                                 status.status === 'due-soon' ? 'Due Soon' : 
                                 status.status === 'upcoming' ? `${status.days}d` : 'Future'}
                              </div>
                            ) : null
                          })()
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedFiling(filing)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => remove(filing.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}