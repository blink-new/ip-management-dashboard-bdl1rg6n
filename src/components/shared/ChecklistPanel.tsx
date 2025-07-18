import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { useEntityChecklist } from '@/hooks/useData'

interface ChecklistPanelProps {
  entityType: string
  entityId: string
  entityTitle: string
}

export function ChecklistPanel({ entityType, entityId, entityTitle }: ChecklistPanelProps) {
  const { items, loading, createItem, updateItem, deleteItem } = useEntityChecklist(entityType, entityId)
  
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemDueDate, setNewItemDueDate] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: '' }), 3000)
  }

  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) return

    try {
      setSaving(true)
      await createItem(
        newItemTitle.trim(),
        newItemDescription.trim() || undefined,
        newItemDueDate || undefined
      )
      setNewItemTitle('')
      setNewItemDescription('')
      setNewItemDueDate('')
      showStatus('success', 'Checklist item created successfully')
    } catch (error) {
      showStatus('error', 'Failed to create checklist item')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (itemId: string, isCompleted: boolean) => {
    try {
      await updateItem(itemId, { is_completed: !isCompleted })
      showStatus('success', `Item marked as ${!isCompleted ? 'completed' : 'incomplete'}`)
    } catch (error) {
      showStatus('error', 'Failed to update item')
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item.id)
    setEditTitle(item.title)
    setEditDescription(item.description || '')
    setEditDueDate(item.due_date || '')
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !editTitle.trim()) return

    try {
      setSaving(true)
      await updateItem(editingItem, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        due_date: editDueDate || undefined
      })
      setEditingItem(null)
      setEditTitle('')
      setEditDescription('')
      setEditDueDate('')
      showStatus('success', 'Checklist item updated successfully')
    } catch (error) {
      showStatus('error', 'Failed to update checklist item')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
      showStatus('success', 'Checklist item deleted successfully')
    } catch (error) {
      showStatus('error', 'Failed to delete checklist item')
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate('')
  }

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null
    
    const due = new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', label: 'Overdue' }
    if (diffDays === 0) return { status: 'today', color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Due Today' }
    if (diffDays <= 3) return { status: 'soon', color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Due Soon' }
    return { status: 'upcoming', color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Upcoming' }
  }

  const completedItems = items.filter(item => item.is_completed)
  const pendingItems = items.filter(item => !item.is_completed)
  const completionRate = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status.type && (
        <Alert className={`border-0 ${
          status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
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

      {/* Progress Overview */}
      {items.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">Progress Overview</h3>
                <p className="text-sm text-green-700">
                  {completedItems.length} of {items.length} items completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-900">{completionRate}%</div>
                <div className="text-sm text-green-700">Complete</div>
              </div>
            </div>
            <div className="mt-3 bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Checklist Item
          </CardTitle>
          <CardDescription>
            Create a new task or milestone for this {entityType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-title">Title *</Label>
            <Input
              id="new-title"
              placeholder="Enter task title..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-description">Description</Label>
            <Textarea
              id="new-description"
              placeholder="Add additional details (optional)..."
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-due-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="new-due-date"
              type="date"
              value={newItemDueDate}
              onChange={(e) => setNewItemDueDate(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleCreateItem}
            disabled={!newItemTitle.trim() || saving}
            className="w-full gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Item
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-600" />
            Checklist ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No checklist items</h3>
              <p className="text-gray-600">Add your first checklist item to track progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Items */}
              {pendingItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-500" />
                    Pending ({pendingItems.length})
                  </h4>
                  {pendingItems.map((item) => {
                    const dueDateStatus = getDueDateStatus(item.due_date)
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4 bg-white">
                        {editingItem === item.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Task title..."
                            />
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description (optional)..."
                              rows={2}
                            />
                            <Input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={handleUpdateItem}
                                disabled={saving}
                              >
                                {saving ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={item.is_completed}
                                onCheckedChange={() => handleToggleComplete(item.id, item.is_completed)}
                                className="mt-1"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{item.title}</h5>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
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
                                          <AlertDialogTitle>Delete Checklist Item</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete Item
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                
                                {item.due_date && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(item.due_date).toLocaleDateString()}
                                    </span>
                                    {dueDateStatus && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${dueDateStatus.color} ${dueDateStatus.bgColor} border-current`}
                                      >
                                        {dueDateStatus.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                        {dueDateStatus.status === 'today' && <Clock className="h-3 w-3 mr-1" />}
                                        {dueDateStatus.label}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  Created {new Date(item.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Completed ({completedItems.length})
                  </h4>
                  {completedItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-green-50 opacity-75">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={() => handleToggleComplete(item.id, item.is_completed)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-700 line-through">{item.title}</h5>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1 line-through">{item.description}</p>
                              )}
                            </div>
                            
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
                                  <AlertDialogTitle>Delete Checklist Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Item
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Completed {new Date(item.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}