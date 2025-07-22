import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, X, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings, useDisclosures, useInventors } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

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

interface Disclosure {
  id: string;
  title: string;
  invention_title: string;
  disclosure_type: string;
}

interface Inventor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
}

export function FilingForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { create: createFiling } = useFilings();
  const { data: disclosures } = useDisclosures();
  const { data: inventors } = useInventors();
  
  const [formData, setFormData] = useState({
    filing_title: '',
    filing_type: 'Provisional',
    jurisdictions: [] as string[],
    filing_date: new Date().toISOString().split('T')[0],
    linked_disclosure_ids: [] as string[],
    lead_inventor_id: '',
    filing_status: 'Draft'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisclosureId, setSelectedDisclosureId] = useState('');



  const handleJurisdictionToggle = (jurisdictionCode: string) => {
    const currentJurisdictions = formData.jurisdictions;
    const newJurisdictions = currentJurisdictions.includes(jurisdictionCode)
      ? currentJurisdictions.filter(j => j !== jurisdictionCode)
      : [...currentJurisdictions, jurisdictionCode];
    
    setFormData({ ...formData, jurisdictions: newJurisdictions });
  };

  const addDisclosure = () => {
    if (selectedDisclosureId && !formData.linked_disclosure_ids.includes(selectedDisclosureId)) {
      setFormData({
        ...formData,
        linked_disclosure_ids: [...formData.linked_disclosure_ids, selectedDisclosureId]
      });
      setSelectedDisclosureId('');
    }
  };

  const removeDisclosure = (disclosureId: string) => {
    setFormData({
      ...formData,
      linked_disclosure_ids: formData.linked_disclosure_ids.filter(id => id !== disclosureId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Validation
    if (!formData.filing_title.trim()) {
      setError('Filing title is required');
      return;
    }

    if (formData.jurisdictions.length === 0) {
      setError('At least one jurisdiction must be selected');
      return;
    }

    if (formData.linked_disclosure_ids.length === 0) {
      setError('At least one linked disclosure is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newFiling = await createFiling({
        ...formData,
        lead_inventor_id: formData.lead_inventor_id === 'none' ? null : formData.lead_inventor_id,
        assignment_to_university: 'Pending',
        assignment_status: 'Pending' as const,
        patent_classifications: []
      });

      // Success message and redirect
      navigate(`/filings/${newFiling.id}`, { 
        state: { message: 'Patent Filing record created successfully!' }
      });

    } catch (error: any) {
      console.error('Error creating filing:', error);
      
      // Handle specific database errors
      if (error.message?.includes('duplicate key')) {
        setError('A filing with this title already exists');
      } else if (error.message?.includes('foreign key')) {
        setError('Invalid reference to disclosure or inventor');
      } else if (error.message?.includes('not-null')) {
        setError('Please fill in all required fields');
      } else {
        setError('Failed to create filing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Patent Filing</h1>
        <p className="text-gray-600">
          Enter the essential information to create a new patent filing record. 
          Additional details can be added later in the full filing interface.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="filing_title">Filing Title *</Label>
              <Input
                id="filing_title"
                value={formData.filing_title}
                onChange={(e) => setFormData({ ...formData, filing_title: e.target.value })}
                placeholder="Enter the patent filing title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filing_type">Filing Type *</Label>
                <Select value={formData.filing_type} onValueChange={(value) => setFormData({ ...formData, filing_type: value })}>
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
                <Label htmlFor="filing_date">Filing Date *</Label>
                <Input
                  id="filing_date"
                  type="date"
                  value={formData.filing_date}
                  onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filing_status">Filing Status</Label>
              <Select value={formData.filing_status} onValueChange={(value) => setFormData({ ...formData, filing_status: value })}>
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

        <Card>
          <CardHeader>
            <CardTitle>Jurisdictions *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the jurisdictions where this patent will be filed:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {JURISDICTIONS.map(jurisdiction => (
                  <div
                    key={jurisdiction.code}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.jurisdictions.includes(jurisdiction.code)
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => handleJurisdictionToggle(jurisdiction.code)}
                  >
                    <span className="mr-2 text-lg">{jurisdiction.flag}</span>
                    <span className="text-sm font-medium">{jurisdiction.name}</span>
                  </div>
                ))}
              </div>

              {formData.jurisdictions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Jurisdictions:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.jurisdictions.map(jurisdictionCode => {
                      const jurisdiction = JURISDICTIONS.find(j => j.code === jurisdictionCode);
                      return jurisdiction ? (
                        <Badge key={jurisdictionCode} variant="secondary" className="flex items-center gap-1">
                          <span>{jurisdiction.flag}</span>
                          {jurisdiction.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Disclosures *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Link this filing to one or more invention disclosures:
            </p>

            <div className="flex gap-2">
              <Select value={selectedDisclosureId} onValueChange={setSelectedDisclosureId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a disclosure to link" />
                </SelectTrigger>
                <SelectContent>
                  {disclosures
                    .filter(disclosure => !formData.linked_disclosure_ids.includes(disclosure.id))
                    .map(disclosure => (
                      <SelectItem key={disclosure.id} value={disclosure.id}>
                        {disclosure.invention_title || disclosure.title} ({disclosure.disclosure_type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addDisclosure} disabled={!selectedDisclosureId}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {formData.linked_disclosure_ids.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Linked Disclosures:</p>
                {formData.linked_disclosure_ids.map(disclosureId => {
                  const disclosure = disclosures.find(d => d.id === disclosureId);
                  return disclosure ? (
                    <div key={disclosureId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {disclosure.invention_title || disclosure.title} ({disclosure.disclosure_type})
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDisclosure(disclosureId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Inventor (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.lead_inventor_id} onValueChange={(value) => setFormData({ ...formData, lead_inventor_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead inventor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lead inventor selected</SelectItem>
                {inventors.map(inventor => (
                  <SelectItem key={inventor.id} value={inventor.id}>
                    {inventor.first_name} {inventor.last_name} - {inventor.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/filings')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating Filing...' : 'Create Filing'}
          </Button>
        </div>
      </form>
    </div>
  );
}