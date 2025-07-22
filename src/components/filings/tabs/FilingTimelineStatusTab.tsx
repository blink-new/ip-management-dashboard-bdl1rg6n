import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Edit, Save, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

interface Filing {
  id: string;
  filing_title: string;
  filing_type: string;
  filing_date: string;
  filing_status: string;
  priority_date?: string;
  publication_date?: string;
  grant_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

interface FilingTimelineStatusTabProps {
  filing: Filing;
  onUpdate: (updatedFiling: Filing) => void;
}

const FILING_STATUSES = [
  'Draft',
  'Filed',
  'Published',
  'Under Examination',
  'Granted',
  'Abandoned',
  'Expired',
  'Rejected'
];

export function FilingTimelineStatusTab({ filing, onUpdate }: FilingTimelineStatusTabProps) {
  const { user } = useAuth();
  const { update: updateFiling } = useFilings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(filing.filing_status);
  const [statusNotes, setStatusNotes] = useState('');

  // Generate key dates based on filing type and dates
  const generateKeyDates = () => {
    const keyDates = [];
    const filingDate = new Date(filing.filing_date);

    // 12-month deadline for provisional patents
    if (filing.filing_type === 'Provisional') {
      const deadline = new Date(filingDate);
      deadline.setFullYear(deadline.getFullYear() + 1);
      keyDates.push({
        id: '12-month',
        title: '12-Month Non-Provisional Deadline',
        date: deadline.toISOString().split('T')[0],
        type: 'deadline',
        priority: 'high',
        status: deadline < new Date() ? 'overdue' : deadline.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'urgent' : 'upcoming'
      });
    }

    // PCT National Phase deadline (30 months from priority)
    if (filing.filing_type === 'PCT' && filing.priority_date) {
      const priorityDate = new Date(filing.priority_date);
      const deadline = new Date(priorityDate);
      deadline.setMonth(deadline.getMonth() + 30);
      keyDates.push({
        id: 'pct-national',
        title: 'PCT National Phase Deadline',
        date: deadline.toISOString().split('T')[0],
        type: 'deadline',
        priority: 'high',
        status: deadline < new Date() ? 'overdue' : deadline.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000 ? 'urgent' : 'upcoming'
      });
    }

    // Publication date (18 months from filing)
    if (!filing.publication_date) {
      const pubDate = new Date(filingDate);
      pubDate.setMonth(pubDate.getMonth() + 18);
      keyDates.push({
        id: 'publication',
        title: 'Expected Publication Date',
        date: pubDate.toISOString().split('T')[0],
        type: 'milestone',
        priority: 'medium',
        status: pubDate < new Date() ? 'completed' : 'upcoming'
      });
    }

    // Expiry date
    if (filing.expiry_date) {
      const expiryDate = new Date(filing.expiry_date);
      keyDates.push({
        id: 'expiry',
        title: 'Patent Expiry Date',
        date: filing.expiry_date,
        type: 'expiry',
        priority: 'low',
        status: expiryDate < new Date() ? 'expired' : 'upcoming'
      });
    }

    return keyDates;
  };

  const keyDates = generateKeyDates();

  const handleStatusChange = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedFiling = await updateFiling(filing.id, {
        filing_status: newStatus
      });
      
      onUpdate(updatedFiling);
      setIsEditing(false);
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update filing status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewStatus(filing.filing_status);
    setStatusNotes('');
    setIsEditing(false);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Granted': return 'bg-green-100 text-green-800';
      case 'Filed': return 'bg-blue-100 text-blue-800';
      case 'Published': return 'bg-purple-100 text-purple-800';
      case 'Under Examination': return 'bg-yellow-100 text-yellow-800';
      case 'Abandoned': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string, status: string) => {
    if (status === 'overdue') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (status === 'urgent') return <AlertCircle className="w-4 h-4 text-orange-500" />;
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new_status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILING_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status_notes">Status Change Notes (Optional)</Label>
                <Textarea
                  id="status_notes"
                  placeholder="Add notes about this status change..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStatusChange} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Updating...' : 'Update Status'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <Badge className={getStatusColor(filing.filing_status)}>
                  {filing.filing_status}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Last updated: {new Date(filing.updated_at).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Dates & Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Key Dates & Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyDates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No key dates generated for this filing type
              </p>
            ) : (
              keyDates.map(keyDate => (
                <div key={keyDate.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(keyDate.priority, keyDate.status)}
                    <div>
                      <p className="font-medium">{keyDate.title}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(keyDate.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        keyDate.status === 'overdue' ? 'destructive' :
                        keyDate.status === 'urgent' ? 'default' :
                        keyDate.status === 'completed' ? 'secondary' :
                        'outline'
                      }
                    >
                      {keyDate.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {keyDate.priority} priority
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Filing Date</Label>
              <p className="text-sm flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(filing.filing_date).toLocaleDateString()}
              </p>
            </div>

            {filing.priority_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Priority Date</Label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(filing.priority_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {filing.publication_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Publication Date</Label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(filing.publication_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {filing.grant_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Grant Date</Label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(filing.grant_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {filing.expiry_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                <p className="text-sm flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(filing.expiry_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-600">Created</Label>
              <p className="text-sm flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(filing.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Status history tracking coming soon...</p>
            <p className="text-sm mt-2">This will show all status changes with timestamps and notes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}