import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Link, Unlink, FileText, ArrowRight, ArrowDown } from 'lucide-react';
import { useFilings } from '@/hooks/useData';
import { Filing } from '@/lib/blink';
import { toast } from 'sonner';

interface FilingLinkedFilingsTabProps {
  filing: Filing;
  onUpdate: (updates: Partial<Filing>) => void;
}

interface FilingRelationship {
  id: string;
  parent_filing_id: string;
  child_filing_id: string;
  relationship_type: string;
  priority_claim: boolean;
  created_at: string;
}

const RELATIONSHIP_TYPES = [
  'Continuation',
  'Divisional', 
  'Continuation-in-Part',
  'Provisional-to-Non-Provisional',
  'PCT-National-Phase',
  'Reissue',
  'Reexamination'
];

export function FilingLinkedFilingsTab({ filing, onUpdate }: FilingLinkedFilingsTabProps) {
  const { filings, loading, getRelationships, createRelationship, removeRelationship: deleteRelationship } = useFilings();
  const [relationships, setRelationships] = useState<FilingRelationship[]>([]);
  const [showAddParent, setShowAddParent] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [priorityClaim, setPriorityClaim] = useState(false);
  const [loadingRelationships, setLoadingRelationships] = useState(true);

  const loadRelationships = useCallback(async () => {
    try {
      setLoadingRelationships(true);
      const data = await getRelationships(filing.id);
      setRelationships(data);
    } catch (error) {
      console.error('Error loading relationships:', error);
      toast.error('Failed to load filing relationships');
    } finally {
      setLoadingRelationships(false);
    }
  }, [filing.id, getRelationships]);

  // Load filing relationships
  useEffect(() => {
    loadRelationships();
  }, [filing.id, loadRelationships]);

  const addParentFiling = async () => {
    if (!selectedParentId || !relationshipType) {
      toast.error('Please select a parent filing and relationship type');
      return;
    }

    try {
      await createRelationship(selectedParentId, filing.id, relationshipType, priorityClaim);
      await loadRelationships(); // Refresh the relationships
      setShowAddParent(false);
      setSelectedParentId('');
      setRelationshipType('');
      setPriorityClaim(false);
      toast.success('Parent filing linked successfully');
    } catch (error) {
      console.error('Error adding parent filing:', error);
      toast.error('Failed to link parent filing');
    }
  };

  const handleRemoveRelationship = async (relationshipId: string) => {
    try {
      await deleteRelationship(relationshipId);
      await loadRelationships(); // Refresh the relationships
      toast.success('Filing relationship removed');
    } catch (error) {
      console.error('Error removing relationship:', error);
      toast.error('Failed to remove relationship');
    }
  };

  const getFilingById = (id: string) => {
    return filings.find(f => f.id === id);
  };

  const parentRelationships = relationships.filter(r => r.child_filing_id === filing.id);
  const childRelationships = relationships.filter(r => r.parent_filing_id === filing.id);
  const availableParentFilings = filings.filter(f => 
    f.id !== filing.id && 
    !parentRelationships.some(r => r.parent_filing_id === f.id)
  );

  if (loading || loadingRelationships) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parent Filings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-blue-600" />
              Parent Filings
            </CardTitle>
            <Button
              onClick={() => setShowAddParent(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Link Parent Filing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddParent && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="parent-filing">Parent Filing</Label>
                  <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent filing" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParentFilings.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.filing_title} ({f.application_number || 'No App #'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relationship-type">Relationship Type</Label>
                  <Select value={relationshipType} onValueChange={setRelationshipType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="priority-claim"
                      checked={priorityClaim}
                      onChange={(e) => setPriorityClaim(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="priority-claim" className="text-sm">
                      Priority Claim
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={addParentFiling} size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Link Filing
                </Button>
                <Button 
                  onClick={() => setShowAddParent(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {parentRelationships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No parent filings linked</p>
              <p className="text-sm">Link a parent filing to show patent family relationships</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parentRelationships.map((relationship) => {
                const parentFiling = getFilingById(relationship.parent_filing_id);
                return (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {parentFiling?.filing_title || 'Unknown Filing'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {parentFiling?.application_number || 'No Application Number'} • 
                            Filed: {parentFiling?.filing_date ? new Date(parentFiling.filing_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {relationship.relationship_type}
                        </Badge>
                        {relationship.priority_claim && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Priority Claim
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveRelationship(relationship.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child Filings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDown className="h-5 w-5 text-green-600 rotate-180" />
            Child Filings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childRelationships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No child filings found</p>
              <p className="text-sm">Child filings will appear here when other filings reference this as a parent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {childRelationships.map((relationship) => {
                const childFiling = getFilingById(relationship.child_filing_id);
                return (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-400 rotate-180" />
                        <div>
                          <div className="font-medium">
                            {childFiling?.filing_title || 'Unknown Filing'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {childFiling?.application_number || 'No Application Number'} • 
                            Filed: {childFiling?.filing_date ? new Date(childFiling.filing_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {relationship.relationship_type}
                        </Badge>
                        {relationship.priority_claim && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Priority Claim
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveRelationship(relationship.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patent Family Tree Visualization */}
      {(parentRelationships.length > 0 || childRelationships.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Patent Family Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="inline-block p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                <div className="font-medium text-blue-900">{filing.filing_title}</div>
                <div className="text-sm text-blue-700">Current Filing</div>
              </div>
              {parentRelationships.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  ↑ {parentRelationships.length} Parent Filing{parentRelationships.length !== 1 ? 's' : ''}
                </div>
              )}
              {childRelationships.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  ↓ {childRelationships.length} Child Filing{childRelationships.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}