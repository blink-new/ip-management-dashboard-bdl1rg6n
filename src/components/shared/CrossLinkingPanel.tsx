import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Link, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Briefcase, 
  Rocket, 
  Users, 
  FolderOpen,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { useLinking, useDisclosures, useProjects, useAgreements, useStartups } from '@/hooks/useData'

interface CrossLinkingPanelProps {
  entityType: string
  entityId: string
  entityTitle: string
}

const entityTypeConfig = {
  disclosure: { 
    icon: FileText, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    label: 'Disclosure'
  },
  project: { 
    icon: FolderOpen, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    label: 'Project'
  },
  agreement: { 
    icon: FileText, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50',
    label: 'Agreement'
  },
  startup: { 
    icon: Rocket, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50',
    label: 'Startup'
  }
}

export function CrossLinkingPanel({ entityType, entityId, entityTitle }: CrossLinkingPanelProps) {
  const { links, linkEntities, unlinkEntities, getLinkedEntities } = useLinking()
  const { data: disclosures } = useDisclosures()
  const { data: projects } = useProjects()
  const { data: agreements } = useAgreements()
  const { data: startups } = useStartups()
  
  const [selectedEntityType, setSelectedEntityType] = useState('')
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const linkedEntities = getLinkedEntities(entityType, entityId)

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: '' }), 3000)
  }

  const getAvailableEntities = () => {
    const allEntities = [
      ...disclosures.map(d => ({ ...d, type: 'disclosure' })),
      ...projects.map(p => ({ ...p, type: 'project' })),
      ...agreements.map(a => ({ ...a, type: 'agreement' })),
      ...startups.map(s => ({ ...s, type: 'startup' }))
    ]

    // Filter out current entity and already linked entities
    const linkedEntityIds = linkedEntities.map(link => 
      link.from_entity_id === entityId ? link.to_entity_id : link.from_entity_id
    )

    return allEntities.filter(entity => 
      entity.id !== entityId && 
      !linkedEntityIds.includes(entity.id) &&
      (selectedEntityType === '' || selectedEntityType === 'all' || entity.type === selectedEntityType) &&
      (searchTerm === '' || 
        entity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const getEntityDetails = (entityType: string, entityId: string) => {
    let entity
    switch (entityType) {
      case 'disclosure':
        entity = disclosures.find(d => d.id === entityId)
        break
      case 'project':
        entity = projects.find(p => p.id === entityId)
        break
      case 'agreement':
        entity = agreements.find(a => a.id === entityId)
        break
      case 'startup':
        entity = startups.find(s => s.id === entityId)
        break
    }
    return entity
  }

  const handleLink = async () => {
    if (!selectedEntityType || !selectedEntityId) return

    try {
      setLinking(true)
      await linkEntities(entityType, entityId, selectedEntityType, selectedEntityId)
      
      const linkedEntity = getEntityDetails(selectedEntityType, selectedEntityId)
      const linkedEntityName = linkedEntity?.title || linkedEntity?.name || 'Unknown'
      
      showStatus('success', `Successfully linked to ${linkedEntityName}`)
      setSelectedEntityType('')
      setSelectedEntityId('')
      setSearchTerm('')
    } catch (error) {
      showStatus('error', 'Failed to create link. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = async (linkId: string) => {
    try {
      setUnlinking(linkId)
      await unlinkEntities(linkId)
      showStatus('success', 'Link removed successfully')
    } catch (error) {
      showStatus('error', 'Failed to remove link. Please try again.')
    } finally {
      setUnlinking(null)
    }
  }

  const availableEntities = getAvailableEntities()

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status.type && (
        <Alert className={`border-0 ${
          status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={
              status.type === 'success' ? 'text-green-800' : 'text-red-800'
            }>
              {status.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Add New Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add New Link
          </CardTitle>
          <CardDescription>
            Link this {entityTypeConfig[entityType as keyof typeof entityTypeConfig]?.label.toLowerCase()} to other entities in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Entity Type Filter */}
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(entityTypeConfig).map(([type, config]) => {
                  if (type === entityType) return null // Don't show current entity type
                  const Icon = config.icon
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Entity Selection */}
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {availableEntities.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No entities available</div>
                ) : (
                  availableEntities.map((entity) => {
                    const config = entityTypeConfig[entity.type as keyof typeof entityTypeConfig]
                    const Icon = config.icon
                    const displayName = entity.title || entity.name || 'Untitled'
                    
                    return (
                      <SelectItem key={entity.id} value={entity.id}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="truncate">{displayName}</span>
                        </div>
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleLink}
            disabled={!selectedEntityType || !selectedEntityId || linking}
            className="w-full"
          >
            {linking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Link...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Create Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-purple-600" />
            Linked Entities
          </CardTitle>
          <CardDescription>
            Entities linked to this {entityTypeConfig[entityType as keyof typeof entityTypeConfig]?.label.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedEntities.length === 0 ? (
            <div className="text-center py-8">
              <Link className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No linked entities</h3>
              <p className="text-gray-600">Create links to connect this {entityTypeConfig[entityType as keyof typeof entityTypeConfig]?.label.toLowerCase()} with other entities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedEntities.map((link) => {
                const isFromEntity = link.from_entity_id === entityId
                const linkedEntityType = isFromEntity ? link.to_entity_type : link.from_entity_type
                const linkedEntityId = isFromEntity ? link.to_entity_id : link.from_entity_id
                
                const linkedEntity = getEntityDetails(linkedEntityType, linkedEntityId)
                const config = entityTypeConfig[linkedEntityType as keyof typeof entityTypeConfig]
                
                if (!linkedEntity || !config) return null
                
                const Icon = config.icon
                const displayName = linkedEntity.title || linkedEntity.name || 'Untitled'
                
                return (
                  <div key={link.id} className={`flex items-center justify-between p-4 border rounded-lg ${config.bgColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{displayName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Linked {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={unlinking === link.id}
                          >
                            {unlinking === link.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Link</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove the link to "{displayName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleUnlink(link.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Link
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}