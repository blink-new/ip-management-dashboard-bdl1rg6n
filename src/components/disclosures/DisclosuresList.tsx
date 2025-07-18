import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  SortAsc, 
  SortDesc,
  Calendar,
  Users,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react'
import type { Disclosure } from '@/lib/blink'

interface DisclosuresListProps {
  disclosures: Disclosure[]
  loading: boolean
  onView: (disclosure: Disclosure) => void
  onEdit: (disclosure: Disclosure) => void
  onDelete: (id: string) => Promise<void>
  onCreate: () => void
  onRefresh: () => void
}

type SortField = 'title' | 'created_at' | 'lead_pi' | 'stage' | 'status' | 'trl'
type SortDirection = 'asc' | 'desc'

const statusColors = {
  'Approved': 'bg-green-100 text-green-800 border-green-200',
  'In Review': 'bg-amber-100 text-amber-800 border-amber-200',
  'Returned to Inventor (Further Research)': 'bg-blue-100 text-blue-800 border-blue-200',
  'Returned to Inventor (Incomplete)': 'bg-orange-100 text-orange-800 border-orange-200',
  'Reviewed for Filing': 'bg-purple-100 text-purple-800 border-purple-200',
  'Application Filed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Abandoned': 'bg-red-100 text-red-800 border-red-200'
}

const stageColors = {
  'Received': 'bg-blue-100 text-blue-800 border-blue-200',
  'In Review': 'bg-amber-100 text-amber-800 border-amber-200',
  'Approved': 'bg-green-100 text-green-800 border-green-200',
  'Filed': 'bg-purple-100 text-purple-800 border-purple-200'
}

export function DisclosuresList({ 
  disclosures, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onCreate, 
  onRefresh 
}: DisclosuresListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => 
    [...new Set(disclosures.map(d => d.status))].sort(), 
    [disclosures]
  )
  
  const uniqueStages = useMemo(() => 
    [...new Set(disclosures.map(d => d.stage))].sort(), 
    [disclosures]
  )
  
  const uniqueTypes = useMemo(() => 
    [...new Set(disclosures.map(d => d.disclosure_type))].sort(), 
    [disclosures]
  )

  // Filter and sort disclosures
  const filteredAndSortedDisclosures = useMemo(() => {
    const filtered = disclosures.filter(disclosure => {
      const matchesSearch = 
        disclosure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disclosure.invention_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disclosure.lead_pi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disclosure.inventors.some(inv => inv.toLowerCase().includes(searchTerm.toLowerCase())) ||
        disclosure.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || disclosure.status === statusFilter
      const matchesStage = stageFilter === 'all' || disclosure.stage === stageFilter
      const matchesType = typeFilter === 'all' || disclosure.disclosure_type === typeFilter
      
      return matchesSearch && matchesStatus && matchesStage && matchesType
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle date sorting
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [disclosures, searchTerm, statusFilter, stageFilter, typeFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await onDelete(id)
    } catch (error) {
      console.error('Failed to delete disclosure:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setStageFilter('all')
    setTypeFilter('all')
  }

  const getReadinessAverage = (disclosure: Disclosure) => {
    const levels = [disclosure.trl, disclosure.irl, disclosure.crl, disclosure.brl, disclosure.iprl, disclosure.tmrl, disclosure.frl]
    return levels.reduce((sum, level) => sum + level, 0) / levels.length
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <SortAsc className="h-3 w-3" /> : 
            <SortDesc className="h-3 w-3" />
        )}
      </div>
    </Button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disclosures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filters & Search
              </CardTitle>
              <CardDescription>
                Filter and search through {disclosures.length} disclosures
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search disclosures, inventors, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stage Filter */}
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== 'all' || stageFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="bg-blue-50">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="bg-green-50">
                  Status: {statusFilter}
                </Badge>
              )}
              {stageFilter !== 'all' && (
                <Badge variant="outline" className="bg-purple-50">
                  Stage: {stageFilter}
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="outline" className="bg-amber-50">
                  Type: {typeFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Disclosures
              </CardTitle>
              <CardDescription>
                Showing {filteredAndSortedDisclosures.length} of {disclosures.length} disclosures
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Disclosure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedDisclosures.length === 0 ? (
            <div className="text-center py-12">
              {disclosures.length === 0 ? (
                <>
                  <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No disclosures yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first disclosure</p>
                  <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Disclosure
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching disclosures</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      <SortButton field="title">ID</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="title">Title & Type</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="lead_pi">Lead PI</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="stage">Stage</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="status">Status</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="trl">Readiness</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="created_at">Created</SortButton>
                    </TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDisclosures.map((disclosure) => (
                    <TableRow key={disclosure.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-emerald-100 rounded">
                            <Lightbulb className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-sm">{disclosure.invention_id}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {disclosure.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {disclosure.disclosure_type}
                            </Badge>
                            {disclosure.inventors.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                {disclosure.inventors.length}
                              </div>
                            )}
                            {disclosure.tags.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Tag className="h-3 w-3" />
                                {disclosure.tags.length}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{disclosure.lead_pi}</p>
                          {disclosure.department && (
                            <p className="text-gray-500 text-xs">{disclosure.department}</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={stageColors[disclosure.stage]}>
                          {disclosure.stage}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={statusColors[disclosure.status]}>
                          {disclosure.status === 'Returned to Inventor (Further Research)' ? 'Returned - Research' :
                           disclosure.status === 'Returned to Inventor (Incomplete)' ? 'Returned - Incomplete' :
                           disclosure.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium">
                              {getReadinessAverage(disclosure).toFixed(1)}
                            </span>
                          </div>
                          <Progress 
                            value={(getReadinessAverage(disclosure) / 9) * 100} 
                            className="w-16 h-2" 
                          />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(disclosure.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onView(disclosure)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEdit(disclosure)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Disclosure</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{disclosure.title}"? This action cannot be undone and will remove all associated data including notes, comments, and links.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(disclosure.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingId === disclosure.id}
                                >
                                  {deletingId === disclosure.id ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Disclosure'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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