import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Save, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

// Import tab components
import { FilingInfoTab } from './tabs/FilingInfoTab';
import { FilingInventorsTab } from './tabs/FilingInventorsTab';
import { FilingTimelineStatusTab } from './tabs/FilingTimelineStatusTab';
import { FilingLinkedFilingsTab } from './tabs/FilingLinkedFilingsTab';
import { FilingAnnuityTrackingTab } from './tabs/FilingAnnuityTrackingTab';
import { FilingOfficeActionsTab } from './tabs/FilingOfficeActionsTab';
import { FilingChecklistTab } from './tabs/FilingChecklistTab';
import { FilingLinkedItemsTab } from './tabs/FilingLinkedItemsTab';
import { FilingSystemTimelineTab } from './tabs/FilingSystemTimelineTab';

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
  lead_inventor_id?: string;
  assignment_to_university: boolean;
  assignment_date?: string;
  assignment_status: 'Yes' | 'No' | 'Pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function FilingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: filings, loading, error } = useFilings();
  
  const [filing, setFiling] = useState<Filing | null>(null);
  const [activeTab, setActiveTab] = useState('filing-info');

  useEffect(() => {
    if (!id || !filings) return;
    
    const foundFiling = filings.find(f => f.id === id);
    setFiling(foundFiling || null);
  }, [id, filings]);

  const handleFilingUpdate = (updatedFiling: Filing) => {
    setFiling(updatedFiling);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading filing details...</span>
        </div>
      </div>
    );
  }

  if (error || !filing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Filing not found'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/filings')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Filings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => navigate('/filings')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Filings
          </Button>
          <div className="text-sm text-gray-500">
            Patent Filings / {filing.filing_title}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {filing.filing_title}
            </h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{filing.filing_type}</Badge>
              <Badge className={getStatusColor(filing.filing_status)}>
                {filing.filing_status}
              </Badge>
              {filing.application_number && (
                <span className="text-sm text-gray-600 font-mono">
                  {filing.application_number}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-gray-600">
              <p>Filed: {new Date(filing.filing_date).toLocaleDateString()}</p>
              <p>Updated: {new Date(filing.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="filing-info">Filing Info</TabsTrigger>
          <TabsTrigger value="inventors">Inventors</TabsTrigger>
          <TabsTrigger value="timeline-status">Timeline & Status</TabsTrigger>
          <TabsTrigger value="linked-filings">Linked Filings</TabsTrigger>
          <TabsTrigger value="annuity-tracking">Annuity Tracking</TabsTrigger>
          <TabsTrigger value="office-actions">Office Actions</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="linked-items">Linked Items</TabsTrigger>
          <TabsTrigger value="system-timeline">System Timeline</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="filing-info" className="space-y-4">
            <FilingInfoTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="inventors" className="space-y-4">
            <FilingInventorsTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="timeline-status" className="space-y-4">
            <FilingTimelineStatusTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="linked-filings" className="space-y-4">
            <FilingLinkedFilingsTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="annuity-tracking" className="space-y-4">
            <FilingAnnuityTrackingTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="office-actions" className="space-y-4">
            <FilingOfficeActionsTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <FilingChecklistTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="linked-items" className="space-y-4">
            <FilingLinkedItemsTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>

          <TabsContent value="system-timeline" className="space-y-4">
            <FilingSystemTimelineTab filing={filing} onUpdate={handleFilingUpdate} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}