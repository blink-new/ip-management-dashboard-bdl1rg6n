import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Link, Unlink, FileText, Briefcase, Building, Users, Search, ExternalLink } from 'lucide-react';
import { Filing } from '@/lib/blink';
import { useDisclosures, useProjects, useAgreements, useStartups } from '@/hooks/useData';
import { toast } from 'sonner';

interface FilingLinkedItemsTabProps {
  filing: Filing;
  onUpdate: (updates: Partial<Filing>) => void;
}

interface LinkedItem {
  id: string;
  type: 'disclosure' | 'project' | 'agreement' | 'startup';
  title: string;
  status?: string;
  created_at: string;
  description?: string;
}

const ENTITY_TYPES = [
  { value: 'disclosure', label: 'Disclosure', icon: FileText, color: 'blue' },
  { value: 'project', label: 'Project', icon: Briefcase, color: 'green' },
  { value: 'agreement', label: 'Agreement', icon: Building, color: 'purple' },
  { value: 'startup', label: 'Startup', icon: Users, color: 'orange' }
];

export function FilingLinkedItemsTab({ filing, onUpdate }: FilingLinkedItemsTabProps) {
  const { disclosures, loading: disclosuresLoading } = useDisclosures();
  const { projects, loading: projectsLoading } = useProjects();
  const { agreements, loading: agreementsLoading } = useAgreements();
  const { startups, loading: startupsLoading } = useStartups();
  
  const [linkedItems, setLinkedItems] = useState<LinkedItem[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLinkedItems = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load linked items from filing data
      const items: LinkedItem[] = [];
      
      // Add linked disclosures
      if (filing.linked_disclosure_ids && Array.isArray(filing.linked_disclosure_ids)) {
        filing.linked_disclosure_ids.forEach(id => {
          const disclosure = disclosures.find(d => d.id === id);
          if (disclosure) {
            items.push({
              id: disclosure.id,
              type: 'disclosure',
              title: disclosure.title,
              status: disclosure.status,
              created_at: disclosure.created_at,
              description: disclosure.description
            });
          }
        });
      }
      
      // Add linked projects
      if (filing.linked_project_id) {
        const project = projects.find(p => p.id === filing.linked_project_id);
        if (project) {
          items.push({
            id: project.id,
            type: 'project',
            title: project.title,
            status: project.status,
            created_at: project.created_at,
            description: project.description
          });
        }
      }
      
      setLinkedItems(items);
    } catch (error) {
      console.error('Error loading linked items:', error);
      toast.error('Failed to load linked items');
    } finally {
      setLoading(false);
    }
  }, [filing, disclosures, projects]);

  useEffect(() => {
    if (!disclosuresLoading && !projectsLoading && !agreementsLoading && !startupsLoading) {
      loadLinkedItems();
    }
  }, [filing, disclosures, projects, agreements, startups, disclosuresLoading, projectsLoading, agreementsLoading, startupsLoading, loadLinkedItems]);

  const getAvailableEntities = () => {
    switch (selectedEntityType) {
      case 'disclosure':
        return disclosures.filter(d => 
          !linkedItems.some(item => item.type === 'disclosure' && item.id === d.id) &&
          d.title.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(d => ({ id: d.id, title: d.title, status: d.status }));
      case 'project':
        return projects.filter(p => 
          !linkedItems.some(item => item.type === 'project' && item.id === p.id) &&
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(p => ({ id: p.id, title: p.title, status: p.status }));
      case 'agreement':
        return agreements.filter(a => 
          !linkedItems.some(item => item.type === 'agreement' && item.id === a.id) &&
          a.title.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(a => ({ id: a.id, title: a.title, status: a.status }));
      case 'startup':
        return startups.filter(s => 
          !linkedItems.some(item => item.type === 'startup' && item.id === s.id) &&
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(s => ({ id: s.id, title: s.name, status: s.status }));
      default:
        return [];
    }
  };

  const handleLinkEntity = async () => {
    if (!selectedEntityType || !selectedEntityId) {
      toast.error('Please select an entity type and item to link');
      return;
    }

    try {
      const updatedFiling = { ...filing };
      
      switch (selectedEntityType) {
        case 'disclosure': {
          const currentDisclosureIds = filing.linked_disclosure_ids || [];
          if (!currentDisclosureIds.includes(selectedEntityId)) {
            updatedFiling.linked_disclosure_ids = [...currentDisclosureIds, selectedEntityId];
          }
          break;
        }
        case 'project':
          updatedFiling.linked_project_id = selectedEntityId;
          break;
        // Note: agreements and startups would need additional fields in the filing schema
      }
      
      onUpdate(updatedFiling);
      await loadLinkedItems();
      
      setShowLinkForm(false);
      setSelectedEntityType('');
      setSelectedEntityId('');
      setSearchTerm('');
      
      toast.success('Item linked successfully');
    } catch (error) {
      console.error('Error linking entity:', error);
      toast.error('Failed to link item');
    }
  };

  const handleUnlinkEntity = async (itemId: string, itemType: string) => {
    try {
      const updatedFiling = { ...filing };
      
      switch (itemType) {
        case 'disclosure': {
          const currentDisclosureIds = filing.linked_disclosure_ids || [];
          updatedFiling.linked_disclosure_ids = currentDisclosureIds.filter(id => id !== itemId);
          break;
        }
        case 'project':
          if (filing.linked_project_id === itemId) {
            updatedFiling.linked_project_id = null;
          }
          break;
      }
      
      onUpdate(updatedFiling);
      await loadLinkedItems();
      
      toast.success('Item unlinked successfully');
    } catch (error) {
      console.error('Error unlinking entity:', error);
      toast.error('Failed to unlink item');
    }
  };

  const getEntityIcon = (type: string) => {
    const entityType = ENTITY_TYPES.find(et => et.value === type);
    return entityType ? entityType.icon : FileText;
  };

  const getEntityColor = (type: string) => {
    const entityType = ENTITY_TYPES.find(et => et.value === type);
    return entityType ? entityType.color : 'gray';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedItems = linkedItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, LinkedItem[]>);

  if (loading) {
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
      {/* Header with Link Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Linked Items</h3>
          <p className="text-sm text-gray-600">
            Connect this filing to related disclosures, projects, agreements, and startups
          </p>
        </div>
        <Button
          onClick={() => setShowLinkForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Link Item
        </Button>
      </div>

      {/* Link Form */}
      {showLinkForm && (
        <Card>
          <CardHeader>
            <CardTitle>Link New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="entity-type">Entity Type</Label>
                <Select 
                  value={selectedEntityType} 
                  onValueChange={(value) => {
                    setSelectedEntityType(value);
                    setSelectedEntityId('');
                    setSearchTerm('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedEntityType && (
                <>
                  <div>
                    <Label htmlFor="search">Search {ENTITY_TYPES.find(t => t.value === selectedEntityType)?.label}s</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={`Search ${selectedEntityType}s...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="entity-select">Select Item</Label>
                    <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item to link" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableEntities().map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{entity.title}</span>
                              {entity.status && (
                                <Badge variant="outline" className="ml-2">
                                  {entity.status}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleLinkEntity} disabled={!selectedEntityType || !selectedEntityId}>
                <Link className="h-4 w-4 mr-2" />
                Link Item
              </Button>
              <Button 
                onClick={() => {
                  setShowLinkForm(false);
                  setSelectedEntityType('');
                  setSelectedEntityId('');
                  setSearchTerm('');
                }} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Items Summary */}
      {linkedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Link Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ENTITY_TYPES.map((entityType) => {
                const count = groupedItems[entityType.value]?.length || 0;
                const Icon = entityType.icon;
                return (
                  <div key={entityType.value} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <div className="font-medium">{count}</div>
                    <div className="text-sm text-gray-600">{entityType.label}{count !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Items by Type */}
      {linkedItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Link className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Linked Items</h3>
            <p className="text-gray-500 mb-4">
              Link this filing to related disclosures, projects, agreements, and startups
            </p>
            <Button onClick={() => setShowLinkForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Link First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {ENTITY_TYPES.map((entityType) => {
            const items = groupedItems[entityType.value] || [];
            if (items.length === 0) return null;
            
            const Icon = entityType.icon;
            
            return (
              <Card key={entityType.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    Linked {entityType.label}s ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500">
                              Created: {new Date(item.created_at).toLocaleDateString()}
                              {item.status && (
                                <>
                                  {' • '}
                                  <Badge 
                                    variant="outline" 
                                    className={getColorClasses(getEntityColor(item.type))}
                                  >
                                    {item.status}
                                  </Badge>
                                </>
                              )}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 mt-1 max-w-md truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleUnlinkEntity(item.id, item.type)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Linking Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Linking Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Link to the original disclosure that led to this filing</li>
                <li>• Connect related commercialization projects</li>
                <li>• Link licensing agreements for this technology</li>
                <li>• Connect startup companies using this IP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Benefits:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Track IP commercialization pipeline</li>
                <li>• Maintain complete technology records</li>
                <li>• Enable cross-referencing and reporting</li>
                <li>• Support business development activities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}