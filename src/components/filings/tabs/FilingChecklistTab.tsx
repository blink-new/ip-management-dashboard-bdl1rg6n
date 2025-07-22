import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Edit, Trash2, CheckCircle2, Clock, User, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';
import { toast } from 'sonner';

const REMINDER_DAYS = [1, 3, 7, 14, 30];
const PRIORITY_LEVELS = ['High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'Cancelled'];

const COMMON_TAGS = [
  'Prior Art', 'Claims', 'Prosecution', 'Deadline', 'Filing', 'Response',
  'Amendment', 'Interview', 'Appeal', 'Maintenance', 'Licensing', 'Business Development'
];

interface ChecklistItem {
  id?: string;
  task_name: string;
  description?: string;
  due_date?: string;
  reminder_days?: number;
  assigned_user?: string;
  status: string;
  priority: string;
  tags?: string[];
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface FilingChecklistTabProps {
  filing: any;
  onUpdate: (updates: any) => void;
}

export function FilingChecklistTab({ filing }: FilingChecklistTabProps) {
  const { getChecklistItems, createChecklistItem, updateChecklistItem, deleteChecklistItem } = useFilings();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<ChecklistItem>({
    task_name: '',
    description: '',
    due_date: '',
    reminder_days: 7,
    assigned_user: '',
    status: 'Not Started',
    priority: 'Medium',
    tags: []
  });

  const loadChecklistItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChecklistItems(filing.id);
      setItems(data || []);
    } catch (error) {
      console.error('Error loading checklist items:', error);
      setError('Failed to load checklist items');
    } finally {
      setLoading(false);
    }
  }, [filing.id, getChecklistItems]);

  useEffect(() => {
    loadChecklistItems();
  }, [loadChecklistItems]);

  const handleAddItem = async () => {
    if (!newItem.task_name.trim()) {
      setError('Task name is required');
      return;
    }

    try {
      setLoading(true);
      const created = await createChecklistItem(filing.id, newItem);
      setItems([...items, created]);
      
      // Reset form
      setNewItem({
        task_name: '',
        description: '',
        due_date: '',
        reminder_days: 7,
        assigned_user: '',
        status: 'Not Started',
        priority: 'Medium',
        tags: []
      });
      
      setShowAddForm(false);
      setError(null);
      toast.success('Checklist item added successfully');
    } catch (error) {
      console.error('Error creating checklist item:', error);
      setError('Failed to create checklist item');
      toast.error('Failed to create checklist item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<ChecklistItem>) => {
    try {
      setLoading(true);
      const updated = await updateChecklistItem(id, updates);
      setItems(items.map(item => item.id === id ? { ...item, ...updated } : item));
      setEditingId(null);
      setError(null);
      toast.success('Checklist item updated successfully');
    } catch (error) {
      console.error('Error updating checklist item:', error);
      setError('Failed to update checklist item');
      toast.error('Failed to update checklist item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;

    try {
      setLoading(true);
      await deleteChecklistItem(id);
      setItems(items.filter(item => item.id !== id));
      setError(null);
      toast.success('Checklist item deleted successfully');
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      setError('Failed to delete checklist item');
      toast.error('Failed to delete checklist item');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    await handleUpdateItem(id, {
      status: 'Completed',
      completed_at: new Date().toISOString()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getUrgencyLevel = (dueDate: string) => {
    if (!dueDate) return { level: 'none', color: 'text-gray-400', text: 'No due date' };
    
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { level: 'overdue', color: 'text-red-600', text: 'Overdue' };
    if (daysUntilDue <= 3) return { level: 'urgent', color: 'text-orange-600', text: `${daysUntilDue} days` };
    if (daysUntilDue <= 7) return { level: 'upcoming', color: 'text-yellow-600', text: `${daysUntilDue} days` };
    return { level: 'future', color: 'text-green-600', text: `${daysUntilDue} days` };
  };

  const addTag = (tag: string) => {
    if (!newItem.tags?.includes(tag)) {
      setNewItem({ ...newItem, tags: [...(newItem.tags || []), tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewItem({ 
      ...newItem, 
      tags: newItem.tags?.filter(tag => tag !== tagToRemove) || [] 
    });
  };

  if (loading && items.length === 0) {
    return <div className="p-6 text-center">Loading checklist items...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Checklist</h3>
          <p className="text-sm text-gray-600">
            Track internal tasks, follow-ups, and business development activities
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Checklist Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Task Name *</Label>
                <Input
                  value={newItem.task_name}
                  onChange={(e) => setNewItem({ ...newItem, task_name: e.target.value })}
                  placeholder="Enter task name..."
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Additional details about this task..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newItem.due_date || ''}
                  onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Reminder (days before)</Label>
                <Select 
                  value={newItem.reminder_days?.toString() || '7'} 
                  onValueChange={(value) => setNewItem({ ...newItem, reminder_days: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_DAYS.map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} day{days !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={newItem.priority} onValueChange={(value) => setNewItem({ ...newItem, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={newItem.status} onValueChange={(value) => setNewItem({ ...newItem, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned User</Label>
                <Input
                  value={newItem.assigned_user || ''}
                  onChange={(e) => setNewItem({ ...newItem, assigned_user: e.target.value })}
                  placeholder="User name or email"
                />
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {newItem.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.filter(tag => !newItem.tags?.includes(tag)).map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className="text-xs"
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={loading}>
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Checklist Items</h3>
            <p className="text-gray-600 mb-4">
              Start organizing your work by adding your first checklist item.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const urgency = getUrgencyLevel(item.due_date || '');
            
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{item.task_name}</h4>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority} Priority
                        </Badge>
                        {item.due_date && (
                          <div className={`flex items-center gap-1 ${urgency.color}`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{urgency.text}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-gray-600 mb-3">{item.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        {item.due_date && (
                          <div>
                            <span className="text-gray-500">Due Date:</span>
                            <div className="font-medium">{new Date(item.due_date).toLocaleDateString()}</div>
                          </div>
                        )}
                        {item.assigned_user && (
                          <div>
                            <span className="text-gray-500">Assigned To:</span>
                            <div className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.assigned_user}
                            </div>
                          </div>
                        )}
                        {item.reminder_days && (
                          <div>
                            <span className="text-gray-500">Reminder:</span>
                            <div className="font-medium">{item.reminder_days} days before</div>
                          </div>
                        )}
                        {item.completed_at && (
                          <div>
                            <span className="text-gray-500">Completed:</span>
                            <div className="font-medium">{new Date(item.completed_at).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {item.status !== 'Completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsCompleted(item.id!)}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(item.id!)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id!)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {items.filter(item => item.status === 'In Progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {items.filter(item => item.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(item => {
                    if (!item.due_date || item.status === 'Completed') return false;
                    const due = new Date(item.due_date);
                    const now = new Date();
                    return due < now;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {items.filter(item => item.priority === 'High' && item.status !== 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}