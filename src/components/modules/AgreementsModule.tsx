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
import { 
  FileCheck, 
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
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { useAgreements } from '@/hooks/useData'
import type { Agreement } from '@/lib/blink'

const agreementTypeColors = {
  'NDA': 'bg-blue-100 text-blue-800 border-blue-200',
  'MTA': 'bg-green-100 text-green-800 border-green-200',
  'Sponsored Research': 'bg-purple-100 text-purple-800 border-purple-200',
  'Collaboration Agreement': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Licensing Agreement': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Assignment Agreement': 'bg-orange-100 text-orange-800 border-orange-200'
}

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'Under Review': 'bg-amber-100 text-amber-800 border-amber-200',
  'Negotiating': 'bg-blue-100 text-blue-800 border-blue-200',
  'Executed': 'bg-green-100 text-green-800 border-green-200',
  'Expired': 'bg-red-100 text-red-800 border-red-200',
  'Terminated': 'bg-gray-100 text-gray-800 border-gray-200'
}

export function AgreementsModule() {
  const { data: agreements, loading, create, update, remove } = useAgreements()
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = agreement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.contract_manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.contracting_parties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || agreement.agreement_type === typeFilter
    const matchesStatus = statusFilter === 'all' || agreement.agreement_status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateAgreement = async (formData: FormData) => {
    try {
      await create({
        title: formData.get('title') as string,
        agreement_type: formData.get('agreement_type') as any,
        contracting_parties: (formData.get('contracting_parties') as string).split(',').map(s => s.trim()).filter(Boolean),
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string || undefined,
        agreement_status: formData.get('agreement_status') as string || 'Draft',
        contract_manager: formData.get('contract_manager') as string,
        file_name: formData.get('file_name') as string || undefined,
        renewal_terms: formData.get('renewal_terms') as string || undefined,
        ip_clauses_summary: formData.get('ip_clauses_summary') as string || undefined,
        revenue_sharing_terms: formData.get('revenue_sharing_terms') as string || undefined,
        tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean)
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create agreement:', error)
    }
  }

  const getExpiryStatus = (endDate: string | undefined) => {
    if (!endDate) return null
    const today = new Date()
    const expiry = new Date(endDate)
    const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'expired', color: 'text-red-600', days: Math.abs(daysUntil) }
    if (daysUntil <= 30) return { status: 'expiring-soon', color: 'text-amber-600', days: daysUntil }
    if (daysUntil <= 90) return { status: 'upcoming', color: 'text-blue-600', days: daysUntil }
    return { status: 'future', color: 'text-gray-600', days: daysUntil }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agreements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-xl">
            <FileCheck className="h-8 w-8 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Agreements</h1>
            <p className="text-gray-600 mt-1">Track contracts, licenses, and legal documents</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agreements..."
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
                <SelectItem value="NDA">NDA</SelectItem>
                <SelectItem value="MTA">MTA</SelectItem>
                <SelectItem value="Sponsored Research">Sponsored Research</SelectItem>
                <SelectItem value="Licensing Agreement">Licensing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Executed">Executed</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-rose-600 hover:bg-rose-700">
                <Plus className="h-4 w-4" />
                New Agreement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Agreement</DialogTitle>
                <DialogDescription>
                  Create a new legal agreement and track its lifecycle.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateAgreement(new FormData(e.currentTarget))
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agreement_type">Agreement Type *</Label>
                    <Select name="agreement_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NDA">NDA</SelectItem>
                        <SelectItem value="MTA">MTA</SelectItem>
                        <SelectItem value="Sponsored Research">Sponsored Research</SelectItem>
                        <SelectItem value="Collaboration Agreement">Collaboration Agreement</SelectItem>
                        <SelectItem value="Licensing Agreement">Licensing Agreement</SelectItem>
                        <SelectItem value="Assignment Agreement">Assignment Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contracting_parties">Contracting Parties (comma-separated) *</Label>
                  <Input id="contracting_parties" name="contracting_parties" placeholder="University of Windsor, TechCorp Inc." required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" name="end_date" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_manager">Contract Manager *</Label>
                    <Input id="contract_manager" name="contract_manager" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agreement_status">Status</Label>
                    <Select name="agreement_status" defaultValue="Draft">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Negotiating">Negotiating</SelectItem>
                        <SelectItem value="Executed">Executed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_name">Document File Name</Label>
                  <Input id="file_name" name="file_name" placeholder="agreement_techcorp_2025.pdf" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip_clauses_summary">IP Clauses Summary</Label>
                  <Textarea id="ip_clauses_summary" name="ip_clauses_summary" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue_sharing_terms">Revenue Sharing Terms</Label>
                  <Textarea id="revenue_sharing_terms" name="revenue_sharing_terms" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal_terms">Renewal Terms</Label>
                  <Textarea id="renewal_terms" name="renewal_terms" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="Research, Collaboration, AI" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                    Create Agreement
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
                <p className="text-sm font-medium text-blue-900">Total Agreements</p>
                <p className="text-2xl font-bold text-blue-900">{agreements.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Executed</p>
                <p className="text-2xl font-bold text-green-900">
                  {agreements.filter(a => a.agreement_status === 'Executed').length}
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
                <p className="text-sm font-medium text-amber-900">Under Review</p>
                <p className="text-2xl font-bold text-amber-900">
                  {agreements.filter(a => ['Under Review', 'Negotiating'].includes(a.agreement_status)).length}
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
                <p className="text-sm font-medium text-red-900">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-900">
                  {agreements.filter(a => {
                    if (!a.end_date) return false
                    const daysUntil = Math.ceil((new Date(a.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
      {selectedAgreement ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-rose-600" />
                  {selectedAgreement.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge className={agreementTypeColors[selectedAgreement.agreement_type]}>
                    {selectedAgreement.agreement_type}
                  </Badge>
                  <Badge className={statusColors[selectedAgreement.agreement_status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                    {selectedAgreement.agreement_status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedAgreement.contracting_parties.length} parties</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedAgreement(null)}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
                <TabsTrigger value="renewals">Renewals</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
                        <p className="mt-1 text-gray-900">{new Date(selectedAgreement.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">End Date</Label>
                        <p className="mt-1 text-gray-900">
                          {selectedAgreement.end_date ? new Date(selectedAgreement.end_date).toLocaleDateString() : 'No end date'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Contract Manager</Label>
                      <p className="mt-1 text-gray-900">{selectedAgreement.contract_manager}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Document File</Label>
                      <p className="mt-1 text-gray-900">{selectedAgreement.file_name || 'No file specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Contracting Parties</Label>
                      <div className="mt-1 space-y-2">
                        {selectedAgreement.contracting_parties.map((party, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{party}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedAgreement.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="terms" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">IP Clauses Summary</Label>
                    <p className="mt-2 text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedAgreement.ip_clauses_summary || 'No IP clauses summary provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Revenue Sharing Terms</Label>
                    <p className="mt-2 text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedAgreement.revenue_sharing_terms || 'No revenue sharing terms specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Renewal Terms</Label>
                    <p className="mt-2 text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedAgreement.renewal_terms || 'No renewal terms specified'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="parties" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Contracting Parties</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Party
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAgreement.contracting_parties.map((party, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                              {party.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{party}</p>
                              <p className="text-sm text-gray-600">Contracting Party</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="renewals" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Renewal Management</h3>
                    <Button size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Schedule Renewal
                    </Button>
                  </div>
                  {selectedAgreement.end_date ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Agreement Expiry</p>
                            <p className="text-sm text-gray-600">{new Date(selectedAgreement.end_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const status = getExpiryStatus(selectedAgreement.end_date)
                              if (!status) return null
                              return (
                                <div className={status.color}>
                                  <p className="font-medium">
                                    {status.status === 'expired' ? 'Expired' : 
                                     status.status === 'expiring-soon' ? 'Expiring Soon' : 
                                     status.status === 'upcoming' ? 'Upcoming' : 'Future'}
                                  </p>
                                  <p className="text-sm">
                                    {status.status === 'expired' ? `${status.days} days ago` : `${status.days} days`}
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
                      <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No expiry date set</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Agreement Timeline</h3>
                  <p className="text-gray-600">Agreement lifecycle and milestone tracking coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-600">Agreement documents and attachments coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Agreements List</CardTitle>
            <CardDescription>
              {filteredAgreements.length} of {agreements.length} agreements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAgreements.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No agreements found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first legal agreement</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agreement
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((agreement) => (
                    <TableRow key={agreement.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{agreement.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agreement.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {agreement.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{agreement.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={agreementTypeColors[agreement.agreement_type]}>
                          {agreement.agreement_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{agreement.contracting_parties.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[agreement.agreement_status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {agreement.agreement_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{agreement.contract_manager}</TableCell>
                      <TableCell>{new Date(agreement.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {agreement.end_date ? (
                          (() => {
                            const status = getExpiryStatus(agreement.end_date)
                            return status ? (
                              <div className={`text-sm ${status.color}`}>
                                {status.status === 'expired' ? 'Expired' : 
                                 status.status === 'expiring-soon' ? 'Soon' : 
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
                            onClick={() => setSelectedAgreement(agreement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => remove(agreement.id)}
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