import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';

const PAYMENT_FREQUENCIES = [
  'Annual',
  'Biennial', 
  'Triennial',
  'Other'
];

const PAYMENT_STATUSES = [
  'Upcoming',
  'Paid',
  'Missed',
  'Not Tracked'
];

const JURISDICTIONS = [
  { code: 'US', name: 'United States', flag: 'US' },
  { code: 'CA', name: 'Canada', flag: 'CA' },
  { code: 'EP', name: 'European Patent Office', flag: 'EU' },
  { code: 'GB', name: 'United Kingdom', flag: 'GB' },
  { code: 'DE', name: 'Germany', flag: 'DE' },
  { code: 'FR', name: 'France', flag: 'FR' },
  { code: 'JP', name: 'Japan', flag: 'JP' },
  { code: 'CN', name: 'China', flag: 'CN' },
  { code: 'KR', name: 'South Korea', flag: 'KR' },
  { code: 'AU', name: 'Australia', flag: 'AU' }
];

interface AnnuityEntry {
  id?: string;
  jurisdiction: string;
  due_date: string;
  payment_frequency: string;
  payment_status: string;
  payment_date?: string;
  amount?: number;
  notes?: string;
}

interface FilingAnnuityTrackingTabProps {
  filing: any;
  onUpdate: (updates: any) => void;
}

export function FilingAnnuityTrackingTab({ filing }: FilingAnnuityTrackingTabProps) {
  const { getAnnuities, createAnnuity, updateAnnuity, deleteAnnuity } = useFilings();
  const [annuities, setAnnuities] = useState<AnnuityEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAnnuity, setNewAnnuity] = useState<AnnuityEntry>({
    jurisdiction: '',
    due_date: '',
    payment_frequency: 'Annual',
    payment_status: 'Upcoming',
    payment_date: '',
    amount: 0,
    notes: ''
  });

  const loadAnnuities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnnuities(filing.id);
      setAnnuities(data || []);
    } catch (error) {
      console.error('Error loading annuities:', error);
      setError('Failed to load annuity data');
    } finally {
      setLoading(false);
    }
  }, [filing.id, getAnnuities]);

  useEffect(() => {
    loadAnnuities();
  }, [loadAnnuities]);

  const handleAddAnnuity = async () => {
    if (!newAnnuity.jurisdiction || !newAnnuity.due_date) {
      setError('Jurisdiction and due date are required');
      return;
    }

    try {
      setLoading(true);
      const created = await createAnnuity(filing.id, newAnnuity);
      setAnnuities([...annuities, created]);
      setNewAnnuity({
        jurisdiction: '',
        due_date: '',
        payment_frequency: 'Annual',
        payment_status: 'Upcoming',
        payment_date: '',
        amount: 0,
        notes: ''
      });
      setShowAddForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating annuity:', error);
      setError('Failed to create annuity entry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnuity = async (id: string, updates: Partial<AnnuityEntry>) => {
    try {
      setLoading(true);
      const updated = await updateAnnuity(id, updates);
      setAnnuities(annuities.map(a => a.id === id ? { ...a, ...updated } : a));
      setError(null);
    } catch (error) {
      console.error('Error updating annuity:', error);
      setError('Failed to update annuity entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnuity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this annuity entry?')) return;

    try {
      setLoading(true);
      await deleteAnnuity(id);
      setAnnuities(annuities.filter(a => a.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting annuity:', error);
      setError('Failed to delete annuity entry');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    await handleUpdateAnnuity(id, {
      payment_status: 'Paid',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Missed': return 'bg-red-100 text-red-800';
      case 'Not Tracked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { level: 'overdue', color: 'text-red-600', text: 'Overdue' };
    if (daysUntilDue <= 30) return { level: 'urgent', color: 'text-orange-600', text: `${daysUntilDue} days` };
    if (daysUntilDue <= 90) return { level: 'upcoming', color: 'text-yellow-600', text: `${daysUntilDue} days` };
    return { level: 'future', color: 'text-green-600', text: `${daysUntilDue} days` };
  };

  const getJurisdictionInfo = (code: string) => {
    return JURISDICTIONS.find(j => j.code === code) || { code, name: code, flag: code };
  };

  if (loading && annuities.length === 0) {
    return <div className="p-6 text-center">Loading annuity data...</div>;
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
          <h3 className="text-lg font-semibold">Annuity Tracking</h3>
          <p className="text-sm text-gray-600">
            Manage patent maintenance fees and renewal schedules
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Annuity Entry
        </Button>
      </div>

      {/* Add New Annuity Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Annuity Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Jurisdiction *</Label>
                <Select value={newAnnuity.jurisdiction} onValueChange={(value) => setNewAnnuity({ ...newAnnuity, jurisdiction: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map(jurisdiction => (
                      <SelectItem key={jurisdiction.code} value={jurisdiction.code}>
                        {jurisdiction.flag} {jurisdiction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={newAnnuity.due_date}
                  onChange={(e) => setNewAnnuity({ ...newAnnuity, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Payment Frequency</Label>
                <Select value={newAnnuity.payment_frequency} onValueChange={(value) => setNewAnnuity({ ...newAnnuity, payment_frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_FREQUENCIES.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Status</Label>
                <Select value={newAnnuity.payment_status} onValueChange={(value) => setNewAnnuity({ ...newAnnuity, payment_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount (Optional)</Label>
                <Input
                  type="number"
                  value={newAnnuity.amount || ''}
                  onChange={(e) => setNewAnnuity({ ...newAnnuity, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Payment Date (if paid)</Label>
                <Input
                  type="date"
                  value={newAnnuity.payment_date || ''}
                  onChange={(e) => setNewAnnuity({ ...newAnnuity, payment_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newAnnuity.notes || ''}
                onChange={(e) => setNewAnnuity({ ...newAnnuity, notes: e.target.value })}
                placeholder="Additional notes about this annuity payment..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAnnuity} disabled={loading}>
                Add Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Annuity Entries */}
      {annuities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Annuity Entries</h3>
            <p className="text-gray-600 mb-4">
              Start tracking patent maintenance fees by adding your first annuity entry.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {annuities.map((annuity) => {
            const jurisdiction = getJurisdictionInfo(annuity.jurisdiction);
            const urgency = getUrgencyLevel(annuity.due_date);
            
            return (
              <Card key={annuity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold">{jurisdiction.flag}</span>
                        <h4 className="font-medium">{jurisdiction.name}</h4>
                        <Badge className={getStatusColor(annuity.payment_status)}>
                          {annuity.payment_status}
                        </Badge>
                        <Badge variant="outline" className={urgency.color}>
                          {urgency.text}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <div className="font-medium">{new Date(annuity.due_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <div className="font-medium">{annuity.payment_frequency}</div>
                        </div>
                        {annuity.amount && annuity.amount > 0 && (
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <div className="font-medium">${annuity.amount.toLocaleString()}</div>
                          </div>
                        )}
                        {annuity.payment_date && (
                          <div>
                            <span className="text-gray-500">Paid Date:</span>
                            <div className="font-medium">{new Date(annuity.payment_date).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>

                      {annuity.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          {annuity.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {annuity.payment_status !== 'Paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid(annuity.id!)}
                          disabled={loading}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAnnuity(annuity.id!)}
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
      {annuities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {annuities.filter(a => a.payment_status === 'Upcoming').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {annuities.filter(a => a.payment_status === 'Paid').length}
                </div>
                <div className="text-sm text-gray-600">Paid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {annuities.filter(a => a.payment_status === 'Missed').length}
                </div>
                <div className="text-sm text-gray-600">Missed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {annuities.filter(a => {
                    const due = new Date(a.due_date);
                    const now = new Date();
                    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDue <= 30 && a.payment_status === 'Upcoming';
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