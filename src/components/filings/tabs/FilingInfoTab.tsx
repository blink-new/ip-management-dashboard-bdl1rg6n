import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Edit, Save, X, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings, useProjects } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

interface Filing {
  id: string;
  filing_title: string;
  filing_type: string;
  jurisdictions: string[];
  filing_date: string;
  priority_date?: string;
  application_number?: string;
  publication_date?: string;
  grant_date?: string;
  expiry_date?: string;
  grant_number?: string;
  patent_classifications: string[];
  filing_status: string;
  linked_disclosure_ids: string[];
  linked_project_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FilingInfoTabProps {
  filing: Filing;
  onUpdate: (updatedFiling: Filing) => void;
}

const FILING_TYPES = [
  'Provisional',
  'Non-Provisional',
  'PCT',
  'Continuation',
  'Continuation-in-Part',
  'Divisional',
  'Reissue',
  'Reexamination'
];

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

const JURISDICTIONS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'EP', name: 'European Patent Office', flag: '🇪🇺' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' }
];

export function FilingInfoTab({ filing, onUpdate }: FilingInfoTabProps) {
  const { user } = useAuth();
  const { update: updateFiling } = useFilings();
  const { data: projects } = useProjects();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedFiling, setEditedFiling] = useState<Filing>(filing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newClassification, setNewClassification] = useState('');



  // Auto-calculate expiry date based on filing type and jurisdiction
  const calculateExpiryDate = useCallback((filingDate: string, filingType: string, jurisdictions: string[]) => {
    if (!filingDate) return '';
    
    const baseDate = new Date(filingDate);
    let yearsToAdd = 20; // Default for most patents
    
    // Adjust based on filing type
    if (filingType === 'Provisional') {
      yearsToAdd = 1; // Provisional patents expire in 1 year
    }
    
    // Adjust based on jurisdiction (some have different terms)
    if (jurisdictions.includes('US') && filingType === 'Utility') {
      yearsToAdd = 20;
    }
    
    const expiryDate = new Date(baseDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + yearsToAdd);
    
    return expiryDate.toISOString().split('T')[0];
  }, []);

  // Auto-suggest priority date (12 months from provisional filing)
  const suggestPriorityDate = useCallback((filingDate: string, filingType: string) => {
    if (!filingDate || filingType !== 'Non-Provisional') return '';
    
    const baseDate = new Date(filingDate);
    baseDate.setFullYear(baseDate.getFullYear() - 1);
    
    return baseDate.toISOString().split('T')[0];
  }, []);

  const handleFieldChange = (field: keyof Filing, value: any) => {
    const updated = { ...editedFiling, [field]: value };
    
    // Auto-calculate expiry date when filing date or type changes
    if (field === 'filing_date' || field === 'filing_type') {
      const suggestedExpiry = calculateExpiryDate(
        updated.filing_date,
        updated.filing_type,
        updated.jurisdictions
      );
      if (suggestedExpiry && !updated.expiry_date) {
        updated.expiry_date = suggestedExpiry;
      }
    }
    
    // Auto-suggest priority date for non-provisional filings
    if (field === 'filing_date' && updated.filing_type === 'Non-Provisional') {
      const suggestedPriority = suggestPriorityDate(updated.filing_date, updated.filing_type);
      if (suggestedPriority && !updated.priority_date) {
        updated.priority_date = suggestedPriority;
      }
    }
    
    setEditedFiling(updated);
  };

  const handleJurisdictionToggle = (jurisdictionCode: string) => {
    const currentJurisdictions = editedFiling.jurisdictions || [];
    const newJurisdictions = currentJurisdictions.includes(jurisdictionCode)
      ? currentJurisdictions.filter(j => j !== jurisdictionCode)
      : [...currentJurisdictions, jurisdictionCode];
    
    handleFieldChange('jurisdictions', newJurisdictions);
  };

  const addClassification = () => {
    if (newClassification.trim()) {
      const currentClassifications = editedFiling.patent_classifications || [];
      if (!currentClassifications.includes(newClassification.trim())) {
        handleFieldChange('patent_classifications', [...currentClassifications, newClassification.trim()]);
      }
      setNewClassification('');
    }
  };

  const removeClassification = (classification: string) => {
    const currentClassifications = editedFiling.patent_classifications || [];
    handleFieldChange('patent_classifications', currentClassifications.filter(c => c !== classification));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedFiling = await updateFiling(filing.id, editedFiling);
      onUpdate(updatedFiling);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving filing:', error);
      setError('Failed to save filing information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFiling(filing);
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Filing Information</h3>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="filing_title">Filing Title</Label>
                <Input
                  id="filing_title"
                  value={editedFiling.filing_title}
                  onChange={(e) => handleFieldChange('filing_title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="filing_type">Filing Type</Label>
                <Select value={editedFiling.filing_type} onValueChange={(value) => handleFieldChange('filing_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILING_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filing_status">Filing Status</Label>
                <Select value={editedFiling.filing_status} onValueChange={(value) => handleFieldChange('filing_status', value)}>
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
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="filing_date">Filing Date</Label>
                <Input
                  id="filing_date"
                  type="date"
                  value={editedFiling.filing_date}
                  onChange={(e) => handleFieldChange('filing_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="priority_date">Priority Date (suggested)</Label>
                <Input
                  id="priority_date"
                  type="date"
                  value={editedFiling.priority_date || ''}
                  onChange={(e) => handleFieldChange('priority_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="publication_date">Publication Date</Label>
                <Input
                  id="publication_date"
                  type="date"
                  value={editedFiling.publication_date || ''}
                  onChange={(e) => handleFieldChange('publication_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="grant_date">Grant Date</Label>
                <Input
                  id="grant_date"
                  type="date"
                  value={editedFiling.grant_date || ''}
                  onChange={(e) => handleFieldChange('grant_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date (auto-calculated)</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={editedFiling.expiry_date || ''}
                  onChange={(e) => handleFieldChange('expiry_date', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="application_number">Application Number</Label>
                <Input
                  id="application_number"
                  value={editedFiling.application_number || ''}
                  onChange={(e) => handleFieldChange('application_number', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="grant_number">Grant Number</Label>
                <Input
                  id="grant_number"
                  value={editedFiling.grant_number || ''}
                  onChange={(e) => handleFieldChange('grant_number', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="linked_project">Linked Project</Label>
                <Select 
                  value={editedFiling.linked_project_id || 'none'} 
                  onValueChange={(value) => handleFieldChange('linked_project_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project selected</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdictions */}
          <Card>
            <CardHeader>
              <CardTitle>Jurisdictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {JURISDICTIONS.map(jurisdiction => (
                  <div
                    key={jurisdiction.code}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      (editedFiling.jurisdictions || []).includes(jurisdiction.code)
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleJurisdictionToggle(jurisdiction.code)}
                  >
                    <span className="mr-2">{jurisdiction.flag}</span>
                    <span className="text-sm">{jurisdiction.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patent Classifications */}
        <Card>
          <CardHeader>
            <CardTitle>Patent Classifications (CPC/IPC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add classification (e.g., A61K 31/00)"
                  value={newClassification}
                  onChange={(e) => setNewClassification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addClassification()}
                />
                <Button onClick={addClassification}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(editedFiling.patent_classifications || []).map(classification => (
                  <Badge key={classification} variant="secondary" className="flex items-center gap-1">
                    {classification}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeClassification(classification)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes about this filing..."
              value={editedFiling.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Read-only view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filing Information</h3>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Filing
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Filing Title</Label>
              <p className="text-sm">{filing.filing_title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Filing Type</Label>
              <Badge variant="outline">{filing.filing_type}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <Badge variant={filing.filing_status === 'Granted' ? 'default' : 'secondary'}>
                {filing.filing_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Filing Date</Label>
              <p className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(filing.filing_date).toLocaleDateString()}
              </p>
            </div>
            {filing.priority_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Priority Date</Label>
                <p className="text-sm">{new Date(filing.priority_date).toLocaleDateString()}</p>
              </div>
            )}
            {filing.publication_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Publication Date</Label>
                <p className="text-sm">{new Date(filing.publication_date).toLocaleDateString()}</p>
              </div>
            )}
            {filing.grant_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Grant Date</Label>
                <p className="text-sm">{new Date(filing.grant_date).toLocaleDateString()}</p>
              </div>
            )}
            {filing.expiry_date && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                <p className="text-sm">{new Date(filing.expiry_date).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filing.application_number && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Application Number</Label>
                <p className="text-sm font-mono">{filing.application_number}</p>
              </div>
            )}
            {filing.grant_number && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Grant Number</Label>
                <p className="text-sm font-mono">{filing.grant_number}</p>
              </div>
            )}
            {filing.linked_project_id && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Linked Project</Label>
                <p className="text-sm">
                  {projects.find(p => p.id === filing.linked_project_id)?.title || 'Project not found'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jurisdictions */}
        <Card>
          <CardHeader>
            <CardTitle>Jurisdictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(filing.jurisdictions || []).map(jurisdictionCode => {
                const jurisdiction = JURISDICTIONS.find(j => j.code === jurisdictionCode);
                return jurisdiction ? (
                  <Badge key={jurisdictionCode} variant="outline" className="flex items-center gap-1">
                    <span>{jurisdiction.flag}</span>
                    {jurisdiction.name}
                  </Badge>
                ) : (
                  <Badge key={jurisdictionCode} variant="outline">{jurisdictionCode}</Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patent Classifications */}
      {filing.patent_classifications && filing.patent_classifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patent Classifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filing.patent_classifications.map(classification => (
                <Badge key={classification} variant="secondary">
                  {classification}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {filing.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{filing.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}