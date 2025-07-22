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
  Building2, 
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
  Users,
  Rocket,
  TrendingUp,
  DollarSign,
  Globe,
  ExternalLink,
  Linkedin
} from 'lucide-react'
import { useStartups } from '@/hooks/useData'
import type { Startup } from '@/lib/blink'

const stageColors = {
  'Idea': 'bg-gray-100 text-gray-800 border-gray-200',
  'Pre-Seed': 'bg-blue-100 text-blue-800 border-blue-200',
  'Seed': 'bg-green-100 text-green-800 border-green-200',
  'Revenue': 'bg-purple-100 text-purple-800 border-purple-200',
  'Exit': 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

const statusColors = {
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  'Acquired': 'bg-purple-100 text-purple-800 border-purple-200',
  'IPO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Closed': 'bg-red-100 text-red-800 border-red-200'
}

export function StartupsModule() {
  const { data: startups, loading, create, update, remove } = useStartups()
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.founders.some(founder => founder.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStage = stageFilter === 'all' || startup.stage === stageFilter
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter
    return matchesSearch && matchesStage && matchesStatus
  })

  const handleCreateStartup = async (formData: FormData) => {
    try {
      const externalLinks: { website?: string; linkedin?: string } = {}
      const website = formData.get('website') as string
      const linkedin = formData.get('linkedin') as string
      if (website) externalLinks.website = website
      if (linkedin) externalLinks.linkedin = linkedin

      await create({
        name: formData.get('name') as string,
        incorporation_date: formData.get('incorporation_date') as string || undefined,
        founders: (formData.get('founders') as string).split(',').map(s => s.trim()).filter(Boolean),
        tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
        department: formData.get('department') as string,
        status: formData.get('status') as string || 'Active',
        stage: formData.get('stage') as any,
        team_members: (formData.get('team_members') as string).split(',').map(s => s.trim()).filter(Boolean),
        external_links: externalLinks,
        point_of_contact: formData.get('point_of_contact') as string
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create startup:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading startups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startups & Spinouts</h1>
            <p className="text-gray-600 mt-1">Monitor startup companies and spin-off ventures</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search startups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Exit">Exit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Acquired">Acquired</SelectItem>
                <SelectItem value="IPO">IPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                New Startup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Startup</DialogTitle>
                <DialogDescription>
                  Register a new startup or spinout company from university research.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateStartup(new FormData(e.currentTarget))
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage *</Label>
                    <Select name="stage" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Idea">Idea</SelectItem>
                        <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Exit">Exit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incorporation_date">Incorporation Date</Label>
                    <Input id="incorporation_date" name="incorporation_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="Active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Acquired">Acquired</SelectItem>
                        <SelectItem value="IPO">IPO</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founders">Founders (comma-separated) *</Label>
                  <Input id="founders" name="founders" placeholder="Dr. Jane Smith, John Doe" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" name="department" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point_of_contact">Point of Contact *</Label>
                    <Input id="point_of_contact" name="point_of_contact" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_members">Team Members (comma-separated)</Label>
                  <Input id="team_members" name="team_members" placeholder="Alice Johnson, Bob Wilson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="AI, Healthcare, SaaS" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" name="website" type="url" placeholder="https://company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/company/..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Create Startup
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Startups</p>
                <p className="text-2xl font-bold text-blue-900">{startups.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Idea Stage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {startups.filter(s => s.stage === 'Idea').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Funded</p>
                <p className="text-2xl font-bold text-green-900">
                  {startups.filter(s => ['Pre-Seed', 'Seed'].includes(s.stage)).length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Revenue</p>
                <p className="text-2xl font-bold text-purple-900">
                  {startups.filter(s => s.stage === 'Revenue').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">Exits</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {startups.filter(s => s.stage === 'Exit').length}
                </p>
              </div>
              <Rocket className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedStartup ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  {selectedStartup.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge className={stageColors[selectedStartup.stage]}>
                    {selectedStartup.stage}
                  </Badge>
                  <Badge className={statusColors[selectedStartup.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                    {selectedStartup.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedStartup.founders.length} founders</span>
                  </div>
                  {selectedStartup.external_links?.website && (
                    <a 
                      href={selectedStartup.external_links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="h-3 w-3" />
                      <span className="text-sm">Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedStartup(null)}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="founders">Founders</TabsTrigger>
                <TabsTrigger value="funding">Funding</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Incorporation Date</Label>
                        <p className="mt-1 text-gray-900">
                          {selectedStartup.incorporation_date ? new Date(selectedStartup.incorporation_date).toLocaleDateString() : 'Not incorporated'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Department</Label>
                        <p className="mt-1 text-gray-900">{selectedStartup.department}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Point of Contact</Label>
                      <p className="mt-1 text-gray-900">{selectedStartup.point_of_contact}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">External Links</Label>
                      <div className="mt-1 space-y-2">
                        {selectedStartup.external_links?.website && (
                          <a 
                            href={selectedStartup.external_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Website</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {selectedStartup.external_links?.linkedin && (
                          <a 
                            href={selectedStartup.external_links.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span>LinkedIn</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedStartup.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Team Members</Label>
                      <div className="mt-1 space-y-2">
                        {selectedStartup.team_members.map((member, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="founders" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Founders</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Founder
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStartup.founders.map((founder, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {founder.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{founder}</p>
                              <p className="text-sm text-gray-600">Founder</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="funding" className="mt-6">
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding History</h3>
                  <p className="text-gray-600">Investment rounds and funding tracking coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="milestones" className="mt-6">
                <div className="text-center py-12">
                  <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Milestones</h3>
                  <p className="text-gray-600">Milestone tracking and progress management coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Timeline</h3>
                  <p className="text-gray-600">Timeline visualization and key events coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-600">Company documents and attachments coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Startups List</CardTitle>
            <CardDescription>
              {filteredStartups.length} of {startups.length} startups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStartups.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No startups found</h3>
                <p className="text-gray-600 mb-4">Get started by registering your first startup or spinout</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Startup
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Founders</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Incorporated</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStartups.map((startup) => (
                    <TableRow key={startup.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{startup.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {startup.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {startup.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{startup.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stageColors[startup.stage]}>
                          {startup.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[startup.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {startup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{startup.founders.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>{startup.department}</TableCell>
                      <TableCell>
                        {startup.incorporation_date ? new Date(startup.incorporation_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {startup.external_links?.website && (
                            <a 
                              href={startup.external_links.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                          {startup.external_links?.linkedin && (
                            <a 
                              href={startup.external_links.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedStartup(startup)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => remove(startup.id)}
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