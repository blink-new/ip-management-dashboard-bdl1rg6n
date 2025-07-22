import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, User, Crown, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings, useInventors } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

interface Filing {
  id: string;
  filing_title: string;
  lead_inventor_id?: string;
  assignment_to_university: boolean;
  assignment_date?: string;
  assignment_status: 'Yes' | 'No' | 'Pending';
}

interface FilingInventorsTabProps {
  filing: Filing;
  onUpdate: (updatedFiling: Filing) => void;
}

export function FilingInventorsTab({ filing, onUpdate }: FilingInventorsTabProps) {
  const { user } = useAuth();
  const { update: updateFiling } = useFilings();
  const { data: inventors } = useInventors();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<'Yes' | 'No' | 'Pending'>(filing.assignment_status || 'Pending');
  const [assignmentDate, setAssignmentDate] = useState<string>(filing.assignment_date || '');

  const handleSaveAssignment = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedFiling = await updateFiling(filing.id, {
        assignment_status: assignmentStatus,
        assignment_date: assignmentStatus === 'Yes' ? assignmentDate : null,
        assignment_to_university: assignmentStatus === 'Yes'
      });
      
      onUpdate(updatedFiling);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      setError('Failed to save assignment information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAssignmentStatus(filing.assignment_status || 'Pending');
    setAssignmentDate(filing.assignment_date || '');
    setIsEditing(false);
    setError(null);
  };

  const leadInventor = inventors?.find(inv => inv.id === filing.lead_inventor_id);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lead Inventor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Lead Inventor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leadInventor ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <User className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium">
                  {leadInventor.first_name} {leadInventor.last_name}
                  <Badge variant="secondary" className="ml-2">Lead</Badge>
                </p>
                <p className="text-sm text-gray-600">
                  {leadInventor.email} • {leadInventor.department}
                </p>
                {leadInventor.position_title && (
                  <p className="text-xs text-gray-500">{leadInventor.position_title}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No lead inventor assigned</p>
              <p className="text-sm">Lead inventor can be set during filing creation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* University Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>University Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="assignment_status">Assignment Status</Label>
                <Select value={assignmentStatus} onValueChange={(value: 'Yes' | 'No' | 'Pending') => setAssignmentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes - Assigned to University</SelectItem>
                    <SelectItem value="No">No - Not Assigned</SelectItem>
                    <SelectItem value="Pending">Pending - Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {assignmentStatus === 'Yes' && (
                <div>
                  <Label htmlFor="assignment_date">Assignment Date</Label>
                  <Input
                    id="assignment_date"
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveAssignment} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Assignment'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assignment Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={
                        filing.assignment_status === 'Yes' ? 'default' : 
                        filing.assignment_status === 'No' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {filing.assignment_status === 'Yes' ? 'Assigned to University' :
                       filing.assignment_status === 'No' ? 'Not Assigned' :
                       'Pending Review'}
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Assignment
                </Button>
              </div>

              {filing.assignment_status === 'Yes' && filing.assignment_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assignment Date</Label>
                  <p className="text-sm flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(filing.assignment_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {filing.assignment_status === 'Yes' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ This invention has been assigned to the University of Windsor. 
                    The university holds the intellectual property rights for this filing.
                  </p>
                </div>
              )}

              {filing.assignment_status === 'No' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ⚠ This invention has not been assigned to the university. 
                    The inventors retain the intellectual property rights.
                  </p>
                </div>
              )}

              {filing.assignment_status === 'Pending' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⏳ Assignment status is pending review. 
                    Please update once the assignment decision has been made.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{leadInventor ? '1' : '0'}</p>
              <p className="text-sm text-blue-800">Lead Inventor</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {filing.assignment_status === 'Yes' ? '✓' : filing.assignment_status === 'No' ? '✗' : '?'}
              </p>
              <p className="text-sm text-purple-800">University Assignment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}