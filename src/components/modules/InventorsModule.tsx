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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Mail,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  Lightbulb,
  Award,
  Clock
} from 'lucide-react'
import { useInventors } from '@/hooks/useData'
import type { Inventor } from '@/lib/blink'

const affiliationColors = {
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Left': 'bg-amber-100 text-amber-800 border-amber-200',
  'Retired': 'bg-gray-100 text-gray-800 border-gray-200'
}

export function InventorsModule() {
  const { data: inventors, loading, create, update, remove } = useInventors()
  const [selectedInventor, setSelectedInventor] = useState<Inventor | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInventors = inventors.filter(inventor => {
    const matchesSearch = inventor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inventor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inventor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inventor.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFaculty = facultyFilter === 'all' || inventor.faculty === facultyFilter
    const matchesStatus = statusFilter === 'all' || inventor.affiliation_status === statusFilter
    return matchesSearch && matchesFaculty && matchesStatus
  })

  const handleCreateInventor = async (formData: FormData) => {
    try {
      await create({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        department: formData.get('department') as string,
        faculty: formData.get('faculty') as string,
        position_title: formData.get('position_title') as string,
        affiliation_status: formData.get('affiliation_status') as any,
        notes: formData.get('notes') as string || undefined
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create inventor:', error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getFullName = (inventor: Inventor) => {
    return `${inventor.first_name} ${inventor.last_name}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <Users className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventors</h1>
            <p className="text-gray-600 mt-1">Manage inventor profiles and contributions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Medicine">Medicine</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Left">Left</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                New Inventor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Inventor</DialogTitle>
                <DialogDescription>
                  Add a new inventor to the database for tracking contributions and collaborations.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateInventor(new FormData(e.currentTarget))
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" name="first_name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input id="last_name" name="last_name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" name="department" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty *</Label>
                    <Input id="faculty" name="faculty" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position_title">Position Title *</Label>
                    <Input id="position_title" name="position_title" placeholder="Professor, Research Associate, etc." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation_status">Affiliation Status *</Label>
                    <Select name="affiliation_status" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Left">Left</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} placeholder="Additional information about the inventor..." />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    Add Inventor
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
                <p className="text-sm font-medium text-blue-900">Total Inventors</p>
                <p className="text-2xl font-bold text-blue-900">{inventors.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {inventors.filter(i => i.affiliation_status === 'Active').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Professors</p>
                <p className="text-2xl font-bold text-purple-900">
                  {inventors.filter(i => i.position_title.toLowerCase().includes('professor')).length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">Retired</p>
                <p className="text-2xl font-bold text-amber-900">
                  {inventors.filter(i => i.affiliation_status === 'Retired').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedInventor ? (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-lg font-semibold">
                    {getInitials(selectedInventor.first_name, selectedInventor.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{getFullName(selectedInventor)}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="font-medium">{selectedInventor.position_title}</span>
                    <Badge className={affiliationColors[selectedInventor.affiliation_status]}>
                      {selectedInventor.affiliation_status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{selectedInventor.department}</span>
                    </div>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedInventor(null)}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="disclosures">Disclosures</TabsTrigger>
                <TabsTrigger value="patents">Patents</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Contact Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${selectedInventor.email}`} className="text-blue-600 hover:text-blue-700">
                            {selectedInventor.email}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Department</Label>
                        <p className="mt-1 text-gray-900">{selectedInventor.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Faculty</Label>
                        <p className="mt-1 text-gray-900">{selectedInventor.faculty}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Notes</Label>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-4 rounded-lg">
                        {selectedInventor.notes || 'No additional notes'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Added</Label>
                      <p className="mt-1 text-gray-900">{new Date(selectedInventor.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="disclosures" className="mt-6">
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventor Disclosures</h3>
                  <p className="text-gray-600">Disclosures by this inventor coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="patents" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Patent Portfolio</h3>
                  <p className="text-gray-600">Patents by this inventor coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="mt-6">
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
                  <p className="text-gray-600">Projects involving this inventor coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Timeline</h3>
                  <p className="text-gray-600">Inventor activity timeline coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="profile" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Profile Information</h3>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Basic Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Full Name:</span>
                            <span className="font-medium">{getFullName(selectedInventor)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedInventor.position_title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={affiliationColors[selectedInventor.affiliation_status]}>
                              {selectedInventor.affiliation_status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Affiliation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Faculty:</span>
                            <span className="font-medium">{selectedInventor.faculty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Department:</span>
                            <span className="font-medium">{selectedInventor.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedInventor.email}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Inventors List</CardTitle>
            <CardDescription>
              {filteredInventors.length} of {inventors.length} inventors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInventors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventors found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first inventor</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inventor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventors.map((inventor) => (
                    <TableRow key={inventor.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-sm font-medium">
                              {getInitials(inventor.first_name, inventor.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getFullName(inventor)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inventor.position_title}</TableCell>
                      <TableCell>{inventor.department}</TableCell>
                      <TableCell>{inventor.faculty}</TableCell>
                      <TableCell>
                        <Badge className={affiliationColors[inventor.affiliation_status]}>
                          {inventor.affiliation_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${inventor.email}`} className="text-blue-600 hover:text-blue-700">
                          {inventor.email}
                        </a>
                      </TableCell>
                      <TableCell>{new Date(inventor.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedInventor(inventor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => remove(inventor.id)}
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