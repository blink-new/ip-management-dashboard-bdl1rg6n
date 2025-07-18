import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckSquare, 
  TrendingUp,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useDisclosures, useActivityLogger } from '@/hooks/useData'
import { DisclosureForm } from '@/components/disclosures/DisclosureForm'
import { DisclosureDetail } from '@/components/disclosures/DisclosureDetail'
import { DisclosuresList } from '@/components/disclosures/DisclosuresList'
import type { Disclosure } from '@/lib/blink'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export function DisclosuresModule() {
  const { data: disclosures, loading, error, create, update, remove, refresh } = useDisclosures()
  const { logActivity } = useActivityLogger()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDisclosure, setSelectedDisclosure] = useState<Disclosure | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const showStatus = (type: 'success' | 'error', message: string) => {
    setOperationStatus({ type, message })
    setTimeout(() => setOperationStatus({ type: null, message: '' }), 5000)
  }

  const handleCreate = () => {
    setSelectedDisclosure(null)
    setViewMode('create')
  }

  const handleEdit = (disclosure: Disclosure) => {
    setSelectedDisclosure(disclosure)
    setViewMode('edit')
  }

  const handleView = (disclosure: Disclosure) => {
    setSelectedDisclosure(disclosure)
    setViewMode('detail')
  }

  const handleSave = async (data: Partial<Disclosure>) => {
    try {
      setFormLoading(true)
      
      if (selectedDisclosure) {
        // Update existing disclosure
        await update(selectedDisclosure.id, data)
        await logActivity(
          'disclosure',
          selectedDisclosure.id,
          'update',
          `Disclosure "${data.title || selectedDisclosure.title}" was updated`
        )
        showStatus('success', 'Disclosure updated successfully')
        
        // Update selected disclosure for detail view
        setSelectedDisclosure({ ...selectedDisclosure, ...data } as Disclosure)
        setViewMode('detail')
      } else {
        // Create new disclosure
        const newDisclosure = await create({
          ...data,
          stage: 'Received',
          status: 'In Review'
        })
        
        await logActivity(
          'disclosure',
          newDisclosure.id,
          'create',
          `New disclosure "${data.title}" was created`
        )
        
        showStatus('success', 'Disclosure created successfully')
        setViewMode('list')
      }
    } catch (error) {
      console.error('Failed to save disclosure:', error)
      showStatus('error', 'Failed to save disclosure. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const disclosure = disclosures.find(d => d.id === id)
      await remove(id)
      
      if (disclosure) {
        await logActivity(
          'disclosure',
          id,
          'delete',
          `Disclosure "${disclosure.title}" was deleted`
        )
      }
      
      showStatus('success', 'Disclosure deleted successfully')
    } catch (error) {
      console.error('Failed to delete disclosure:', error)
      showStatus('error', 'Failed to delete disclosure. Please try again.')
      throw error // Re-throw to let the component handle the error state
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Disclosure>) => {
    try {
      await update(id, updates)
      
      // Update selected disclosure if it's the one being updated
      if (selectedDisclosure && selectedDisclosure.id === id) {
        setSelectedDisclosure({ ...selectedDisclosure, ...updates } as Disclosure)
      }
    } catch (error) {
      console.error('Failed to update disclosure:', error)
      throw error
    }
  }

  const handleCancel = () => {
    setSelectedDisclosure(null)
    setViewMode('list')
  }

  const handleBack = () => {
    setViewMode('list')
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disclosures</h1>
            <p className="text-gray-600 mt-1">Error loading disclosures</p>
          </div>
        </div>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Failed to load disclosures</div>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="mt-3"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - only show on list view */}
      {viewMode === 'list' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Disclosures</h1>
                <p className="text-gray-600 mt-1">Manage invention disclosures and technology submissions</p>
              </div>
            </div>
            <Button onClick={handleCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              New Disclosure
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Disclosures</p>
                    <p className="text-2xl font-bold text-blue-900">{disclosures.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-900">In Review</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {disclosures.filter(d => d.status === 'In Review').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Approved</p>
                    <p className="text-2xl font-bold text-green-900">
                      {disclosures.filter(d => d.status === 'Approved').length}
                    </p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Filed</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {disclosures.filter(d => d.status === 'Application Filed').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Operation Status Alert */}
      {operationStatus.type && (
        <Alert className={`border-0 ${
          operationStatus.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {operationStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={
              operationStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }>
              {operationStatus.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      {viewMode === 'list' && (
        <DisclosuresList
          disclosures={disclosures}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onRefresh={refresh}
        />
      )}

      {viewMode === 'detail' && selectedDisclosure && (
        <DisclosureDetail
          disclosure={selectedDisclosure}
          onEdit={() => handleEdit(selectedDisclosure)}
          onBack={handleBack}
          onUpdate={handleUpdate}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={handleCancel}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Disclosures
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {viewMode === 'create' ? 'New Disclosure' : `Edit ${selectedDisclosure?.invention_id}`}
            </span>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                {viewMode === 'create' ? 'Create New Disclosure' : 'Edit Disclosure'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'create' 
                  ? 'Submit a new invention disclosure for review and potential patent filing'
                  : `Update details for ${selectedDisclosure?.title}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DisclosureForm
                disclosure={selectedDisclosure}
                onSave={handleSave}
                onCancel={handleCancel}
                loading={formLoading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}