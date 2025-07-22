import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Plus, Edit, Trash2, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';
import { FilingOfficeAction } from '@/lib/blink';

const ACTION_TYPES = [
  'Non-Final Rejection',
  'Final Rejection',
  'Notice of Allowance',
  'Restriction Requirement',
  'Request for Continued Examination',
  'Interview Summary',
  'Examiner Amendment',
  'Advisory Action',
  'Other'
];

const ACTION_STATUSES = [
  'Not Started',
  'In Progress', 
  'Submitted',
  'Resolved'
];

const PRIORITY_LEVELS = [
  'High',
  'Medium',
  'Low'
];

// Smart checklist templates based on action type
const CHECKLIST_TEMPLATES = {
  'Non-Final Rejection': [
    { task: 'Review rejection grounds and prior art', priority: 'High', category: 'Analysis' },
    { task: 'Analyze claim rejections and objections', priority: 'High', category: 'Analysis' },
    { task: 'Research additional prior art if needed', priority: 'Medium', category: 'Research' },
    { task: 'Draft response strategy', priority: 'High', category: 'Strategy' },
    { task: 'Prepare claim amendments', priority: 'High', category: 'Drafting' },
    { task: 'Draft arguments against rejections', priority: 'High', category: 'Drafting' },
    { task: 'Review response with inventor', priority: 'Medium', category: 'Review' },
    { task: 'File response with USPTO', priority: 'High', category: 'Filing' }
  ],
  'Final Rejection': [
    { task: 'Evaluate continuation/divisional options', priority: 'High', category: 'Strategy' },
    { task: 'Consider Request for Continued Examination (RCE)', priority: 'High', category: 'Strategy' },
    { task: 'Analyze appeal prospects', priority: 'Medium', category: 'Analysis' },
    { task: 'Draft response or RCE', priority: 'High', category: 'Drafting' },
    { task: 'Consult with client on strategy', priority: 'High', category: 'Communication' },
    { task: 'File appropriate response', priority: 'High', category: 'Filing' }
  ],
  'Restriction Requirement': [
    { task: 'Review restriction requirement', priority: 'High', category: 'Analysis' },
    { task: 'Analyze invention groupings', priority: 'High', category: 'Analysis' },
    { task: 'Select invention for prosecution', priority: 'High', category: 'Strategy' },
    { task: 'Consider divisional applications', priority: 'Medium', category: 'Strategy' },
    { task: 'File election of species/invention', priority: 'High', category: 'Filing' }
  ]
};

interface OfficeAction extends Omit<FilingOfficeAction, 'assigned_user_id'> {
  priority: string;
  assigned_user?: string;
  checklist_items?: ChecklistItem[];
}

interface ChecklistItem {
  id?: string;
  task: string;
  completed: boolean;
  priority: string;
  category: string;
  due_date?: string;
}

interface FilingOfficeActionsTabProps {
  filing: any;
  onUpdate: (updates: any) => void;
}

export function FilingOfficeActionsTab({ filing }: FilingOfficeActionsTabProps) {
  const { getOfficeActions, createOfficeAction, updateOfficeAction, deleteOfficeAction } = useFilings();
  const [officeActions, setOfficeActions] = useState<OfficeAction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAction, setNewAction] = useState<OfficeAction>({
    action_type: 'Non-Final Rejection',
    date_received: new Date().toISOString().split('T')[0],
    response_deadline: '',
    response_filed_date: '',
    status: 'Not Started',
    priority: 'High',
    assigned_user: '',
    notes: '',
    checklist_items: []
  });

  const loadOfficeActions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOfficeActions(filing.id);
      setOfficeActions(data || []);
    } catch (error) {
      console.error('Error loading office actions:', error);
      setError('Failed to load office actions');
    } finally {
      setLoading(false);
    }
  }, [filing.id, getOfficeActions]);

  useEffect(() => {
    loadOfficeActions();
  }, [loadOfficeActions]);

  const generateSmartChecklist = (actionType: string): ChecklistItem[] => {
    const template = CHECKLIST_TEMPLATES[actionType as keyof typeof CHECKLIST_TEMPLATES] || [];
    const baseDate = new Date();
    
    return template.map((item, index) => ({
      task: item.task,
      completed: false,
      priority: item.priority,
      category: item.category,
      due_date: new Date(baseDate.getTime() + (item.priority === 'High' ? 7 : item.priority === 'Medium' ? 14 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  };

  const calculateResponseDeadline = (dateReceived: string, actionType: string): string => {
    const received = new Date(dateReceived);
    let months = 3; // Default 3 months
    
    if (actionType === 'Final Rejection') months = 3;
    else if (actionType === 'Non-Final Rejection') months = 3;
    else if (actionType === 'Restriction Requirement') months = 3;
    
    const deadline = new Date(received);
    deadline.setMonth(deadline.getMonth() + months);
    return deadline.toISOString().split('T')[0];
  };

  const handleAddOfficeAction = async () => {
    if (!newAction.action_type || !newAction.date_received) {
      setError('Action type and date received are required');
      return;
    }

    try {
      setLoading(true);
      
      // Auto-calculate response deadline if not provided
      if (!newAction.response_deadline) {
        newAction.response_deadline = calculateResponseDeadline(newAction.date_received, newAction.action_type);
      }

      // Generate smart checklist
      newAction.checklist_items = generateSmartChecklist(newAction.action_type);

      const created = await createOfficeAction(filing.id, newAction);
      setOfficeActions([...officeActions, created]);
      
      // Reset form
      setNewAction({
        action_type: 'Non-Final Rejection',
        date_received: new Date().toISOString().split('T')[0],
        response_deadline: '',
        response_filed_date: '',
        status: 'Not Started',
        priority: 'High',
        assigned_user: '',
        notes: '',
        checklist_items: []
      });
      
      setShowAddForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating office action:', error);
      setError('Failed to create office action');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOfficeAction = async (id: string, updates: Partial<OfficeAction>) => {
    try {
      setLoading(true);
      const updated = await updateOfficeAction(id, updates);
      setOfficeActions(officeActions.map(a => a.id === id ? { ...a, ...updated } : a));
      setEditingId(null);
      setError(null);
    } catch (error) {
      console.error('Error updating office action:', error);
      setError('Failed to update office action');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOfficeAction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office action?')) return;

    try {
      setLoading(true);
      await deleteOfficeAction(id);
      setOfficeActions(officeActions.filter(a => a.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting office action:', error);
      setError('Failed to delete office action');
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = async (actionId: string, itemIndex: number) => {
    const action = officeActions.find(a => a.id === actionId);
    if (!action || !action.checklist_items) return;

    const updatedItems = [...action.checklist_items];
    updatedItems[itemIndex].completed = !updatedItems[itemIndex].completed;

    await handleUpdateOfficeAction(actionId, { checklist_items: updatedItems });
  };

  const markAsSubmitted = async (id: string) => {
    await handleUpdateOfficeAction(id, {
      status: 'Submitted',
      response_filed_date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-green-100 text-green-800';
      case 'Resolved': return 'bg-purple-100 text-purple-800';
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

  const getUrgencyLevel = (deadline: string) => {
    const due = new Date(deadline);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { level: 'overdue', color: 'text-red-600', text: 'Overdue', icon: AlertTriangle };
    if (daysUntilDue <= 14) return { level: 'urgent', color: 'text-orange-600', text: `${daysUntilDue} days`, icon: Clock };
    if (daysUntilDue <= 30) return { level: 'upcoming', color: 'text-yellow-600', text: `${daysUntilDue} days`, icon: Clock };
    return { level: 'future', color: 'text-green-600', text: `${daysUntilDue} days`, icon: CheckCircle2 };
  };

  const calculateProgress = (checklistItems: ChecklistItem[] = []) => {
    if (checklistItems.length === 0) return 0;
    const completed = checklistItems.filter(item => item.completed).length;
    return Math.round((completed / checklistItems.length) * 100);
  };

  if (loading && officeActions.length === 0) {
    return <div className="p-6 text-center">Loading office actions...</div>;
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
          <h3 className="text-lg font-semibold">Office Actions</h3>
          <p className="text-sm text-gray-600">
            Track patent prosecution actions with smart checklists
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Office Action
        </Button>
      </div>

      {/* Add New Office Action Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Office Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Action Type *</Label>
                <Select value={newAction.action_type} onValueChange={(value) => setNewAction({ ...newAction, action_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date Received *</Label>
                <Input
                  type="date"
                  value={newAction.date_received}
                  onChange={(e) => setNewAction({ ...newAction, date_received: e.target.value })}
                />
              </div>

              <div>
                <Label>Response Deadline</Label>
                <Input
                  type="date"
                  value={newAction.response_deadline}
                  onChange={(e) => setNewAction({ ...newAction, response_deadline: e.target.value })}
                  placeholder="Auto-calculated if left blank"
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={newAction.priority} onValueChange={(value) => setNewAction({ ...newAction, priority: value })}>
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
                <Select value={newAction.status} onValueChange={(value) => setNewAction({ ...newAction, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned User</Label>
                <Input
                  value={newAction.assigned_user || ''}
                  onChange={(e) => setNewAction({ ...newAction, assigned_user: e.target.value })}
                  placeholder="Attorney or agent name"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newAction.notes || ''}
                onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                placeholder="Additional notes about this office action..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddOfficeAction} disabled={loading}>
                Add Office Action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Office Actions List */}
      {officeActions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Office Actions</h3>
            <p className="text-gray-600 mb-4">
              Start tracking patent prosecution by adding your first office action.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Office Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {officeActions.map((action) => {
            const urgency = getUrgencyLevel(action.response_deadline);
            const progress = calculateProgress(action.checklist_items);
            const UrgencyIcon = urgency.icon;
            
            return (
              <Card key={action.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{action.action_type}</h4>
                        <Badge className={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(action.priority)}>
                          {action.priority} Priority
                        </Badge>
                        <div className={`flex items-center gap-1 ${urgency.color}`}>
                          <UrgencyIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{urgency.text}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Date Received:</span>
                          <div className="font-medium">{new Date(action.date_received).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Response Due:</span>
                          <div className="font-medium">{new Date(action.response_deadline).toLocaleDateString()}</div>
                        </div>
                        {action.response_filed_date && (
                          <div>
                            <span className="text-gray-500">Response Filed:</span>
                            <div className="font-medium">{new Date(action.response_filed_date).toLocaleDateString()}</div>
                          </div>
                        )}
                        {action.assigned_user && (
                          <div>
                            <span className="text-gray-500">Assigned To:</span>
                            <div className="font-medium">{action.assigned_user}</div>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">{progress}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Smart Checklist */}
                      {action.checklist_items && action.checklist_items.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-gray-700">Smart Checklist:</h5>
                          <div className="grid gap-2">
                            {action.checklist_items.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => toggleChecklistItem(action.id!, index)}
                                  className="rounded"
                                />
                                <div className="flex-1">
                                  <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                    {item.task}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {item.category}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                                      {item.priority}
                                    </Badge>
                                    {item.due_date && (
                                      <span className="text-xs text-gray-500">
                                        Due: {new Date(item.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {action.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {action.status !== 'Submitted' && action.status !== 'Resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsSubmitted(action.id!)}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Submitted
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(action.id!)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOfficeAction(action.id!)}
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
      {officeActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {officeActions.filter(a => a.status === 'In Progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {officeActions.filter(a => a.status === 'Submitted').length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {officeActions.filter(a => {
                    const due = new Date(a.response_deadline);
                    const now = new Date();
                    return due < now && a.status !== 'Submitted' && a.status !== 'Resolved';
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {officeActions.filter(a => {
                    const due = new Date(a.response_deadline);
                    const now = new Date();
                    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDue <= 14 && a.status !== 'Submitted' && a.status !== 'Resolved';
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Due Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}