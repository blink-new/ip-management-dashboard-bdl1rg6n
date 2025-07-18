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
  Briefcase, 
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
  Target,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useProjects } from '@/hooks/useData'
import type { Project } from '@/lib/blink'

const projectTypeColors = {
  'Market Study': 'bg-blue-100 text-blue-800 border-blue-200',
  'Licensing Plan': 'bg-green-100 text-green-800 border-green-200',
  'Commercialization Roadmap': 'bg-purple-100 text-purple-800 border-purple-200',
  'Program': 'bg-amber-100 text-amber-800 border-amber-200'
}

const statusColors = {
  'Planning': 'bg-gray-100 text-gray-800 border-gray-200',
  'Active': 'bg-blue-100 text-blue-800 border-blue-200',
  'On Hold': 'bg-amber-100 text-amber-800 border-amber-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Cancelled': 'bg-red-100 text-red-800 border-red-200'
}

export function ProjectsModule() {
  const { data: projects, loading, create, update, remove } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || project.project_type === typeFilter
    const matchesStatus = statusFilter === 'all' || (project as any).status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateProject = async (formData: FormData) => {
    try {
      await create({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        trl: parseInt(formData.get('trl') as string) || 1,
        irl: parseInt(formData.get('irl') as string) || 1,
        tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
        department: formData.get('department') as string,
        project_type: formData.get('project_type') as any,
        team_members: (formData.get('team_members') as string).split(',').map(s => s.trim()).filter(Boolean)
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const IrlTrlDisplay = ({ project }: { project: Project }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="font-medium">Technology Readiness Level (TRL)</Label>
            <span className="text-sm font-semibold">{project.trl}/9</span>
          </div>
          <Progress value={(project.trl / 9) * 100} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="font-medium">Innovation Readiness Level (IRL)</Label>
            <span className="text-sm font-semibold">{project.irl}/9</span>
          </div>
          <Progress value={(project.irl / 9) * 100} className="h-2" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Briefcase className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commercialization Projects</h1>
            <p className="text-gray-600 mt-1">Manage technology transfer and commercialization initiatives</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
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
                <SelectItem value="Market Study">Market Study</SelectItem>
                <SelectItem value="Licensing Plan">Licensing Plan</SelectItem>
                <SelectItem value="Commercialization Roadmap">Roadmap</SelectItem>
                <SelectItem value="Program">Program</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new commercialization project to track technology transfer activities.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateProject(new FormData(e.currentTarget))
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project_type">Project Type *</Label>
                    <Select name="project_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Market Study">Market Study</SelectItem>
                        <SelectItem value="Licensing Plan">Licensing Plan</SelectItem>
                        <SelectItem value="Commercialization Roadmap">Commercialization Roadmap</SelectItem>
                        <SelectItem value="Program">Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" name="department" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_members">Team Members (comma-separated)</Label>
                    <Input id="team_members" name="team_members" placeholder="Dr. Smith, John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="AI, Healthcare, Licensing" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trl">TRL (1-9)</Label>
                    <Input id="trl" name="trl" type="number" min="1" max="9" defaultValue="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="irl">IRL (1-9)</Label>
                    <Input id="irl" name="irl" type="number" min="1" max="9" defaultValue="1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    Create Project
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
                <p className="text-sm font-medium text-blue-900">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Market Studies</p>
                <p className="text-2xl font-bold text-green-900">
                  {projects.filter(p => p.project_type === 'Market Study').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Licensing Plans</p>
                <p className="text-2xl font-bold text-purple-900">
                  {projects.filter(p => p.project_type === 'Licensing Plan').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">Roadmaps</p>
                <p className="text-2xl font-bold text-amber-900">
                  {projects.filter(p => p.project_type === 'Commercialization Roadmap').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedProject ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  {selectedProject.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge className={projectTypeColors[selectedProject.project_type]}>
                    {selectedProject.project_type}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedProject.team_members.length} members</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Description</Label>
                      <p className="mt-1 text-gray-900">{selectedProject.description || 'No description provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Department</Label>
                        <p className="mt-1 text-gray-900">{selectedProject.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Created</Label>
                        <p className="mt-1 text-gray-900">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <IrlTrlDisplay project={selectedProject} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProject.team_members.map((member, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member}</p>
                              <p className="text-sm text-gray-600">Team Member</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="milestones" className="mt-6">
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Milestones</h3>
                  <p className="text-gray-600">Milestone tracking and progress management coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="budget" className="mt-6">
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Management</h3>
                  <p className="text-gray-600">Budget tracking and financial management coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Timeline</h3>
                  <p className="text-gray-600">Timeline visualization and scheduling coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Reports</h3>
                  <p className="text-gray-600">Progress reports and analytics coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Projects List</CardTitle>
            <CardDescription>
              {filteredProjects.length} of {projects.length} projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first commercialization project</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>TRL/IRL</TableHead>
                    <TableHead>Team Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={projectTypeColors[project.project_type]}>
                          {project.project_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.department}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">TRL</span>
                            <Progress value={(project.trl / 9) * 100} className="w-12 h-1" />
                            <span className="text-xs font-medium">{project.trl}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">IRL</span>
                            <Progress value={(project.irl / 9) * 100} className="w-12 h-1" />
                            <span className="text-xs font-medium">{project.irl}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{project.team_members.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedProject(project)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => remove(project.id)}
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