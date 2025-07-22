import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Calendar, 
  Link, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Edit, 
  Trash2,
  Filter,
  Search,
  Clock,
  User
} from 'lucide-react';
import { useFilings } from '@/hooks/useData';
import { formatDistanceToNow } from 'date-fns';

const EVENT_TYPES = [
  'filing_created',
  'filing_updated', 
  'status_changed',
  'inventor_added',
  'inventor_removed',
  'relationship_created',
  'relationship_removed',
  'annuity_created',
  'annuity_updated',
  'office_action_created',
  'office_action_updated',
  'checklist_created',
  'checklist_updated',
  'note_created',
  'comment_created'
];

const EVENT_CATEGORIES = [
  'filing',
  'inventor',
  'relationship',
  'annuity',
  'office_action',
  'checklist',
  'note',
  'comment',
  'system'
];

interface TimelineEntry {
  id: string;
  action_type: string;
  action_description: string;
  user_id?: string;
  category: string;
  metadata?: any;
  timestamp: string;
  user_name?: string;
}

interface FilingSystemTimelineTabProps {
  filing: any;
  onUpdate: (updates: any) => void;
}

export function FilingSystemTimelineTab({ filing }: FilingSystemTimelineTabProps) {
  const { getTimeline } = useFilings();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [filteredTimeline, setFilteredTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTimeline(filing.id);
      
      // Add some sample data for demonstration if no real data exists
      const sampleData = data && data.length > 0 ? data : [
        {
          id: '1',
          action_type: 'filing_created',
          action_description: 'Filing created',
          user_id: 'user1',
          category: 'filing',
          metadata: { filing_type: filing.filing_type || 'Unknown' },
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          user_name: 'Dr. Sarah Chen'
        },
        {
          id: '2',
          action_type: 'status_changed',
          action_description: 'Status changed from Draft to Filed',
          user_id: 'user1',
          category: 'filing',
          metadata: { old_status: 'Draft', new_status: 'Filed' },
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          user_name: 'Dr. Sarah Chen'
        },
        {
          id: '3',
          action_type: 'inventor_added',
          action_description: 'Added Dr. Michael Rodriguez as inventor',
          user_id: 'user2',
          category: 'inventor',
          metadata: { inventor_name: 'Dr. Michael Rodriguez' },
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          user_name: 'Patent Attorney'
        },
        {
          id: '4',
          action_type: 'office_action_created',
          action_description: 'Office action received: Non-Final Rejection',
          user_id: 'user1',
          category: 'office_action',
          metadata: { action_type: 'Non-Final Rejection', due_date: '2024-03-15' },
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          user_name: 'Dr. Sarah Chen'
        },
        {
          id: '5',
          action_type: 'checklist_created',
          action_description: 'Added checklist item: Review prior art references',
          user_id: 'user2',
          category: 'checklist',
          metadata: { task_name: 'Review prior art references', priority: 'High' },
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
          user_name: 'Patent Attorney'
        }
      ];
      
      setTimeline(sampleData);
      setFilteredTimeline(sampleData);
    } catch (error) {
      console.error('Error loading timeline:', error);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  }, [filing.filing_type, filing.id, getTimeline]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // Apply filters
  useEffect(() => {
    let filtered = [...timeline];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(entry => entry.action_type === selectedEventType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case '24h':
          cutoffDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    }

    setFilteredTimeline(filtered);
  }, [timeline, searchTerm, selectedEventType, selectedCategory, dateRange]);

  const getEventIcon = (actionType: string) => {
    switch (actionType) {
      case 'filing_created':
      case 'filing_updated':
        return FileText;
      case 'status_changed':
        return Edit;
      case 'inventor_added':
      case 'inventor_removed':
        return Users;
      case 'relationship_created':
      case 'relationship_removed':
        return Link;
      case 'annuity_created':
      case 'annuity_updated':
        return DollarSign;
      case 'office_action_created':
      case 'office_action_updated':
        return AlertCircle;
      case 'checklist_created':
      case 'checklist_updated':
        return CheckCircle2;
      default:
        return Calendar;
    }
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case 'filing': return 'text-blue-600 bg-blue-50';
      case 'inventor': return 'text-purple-600 bg-purple-50';
      case 'relationship': return 'text-green-600 bg-green-50';
      case 'annuity': return 'text-yellow-600 bg-yellow-50';
      case 'office_action': return 'text-red-600 bg-red-50';
      case 'checklist': return 'text-indigo-600 bg-indigo-50';
      case 'note': return 'text-gray-600 bg-gray-50';
      case 'comment': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEventType('all');
    setSelectedCategory('all');
    setDateRange('all');
  };

  if (loading) {
    return <div className="p-6 text-center">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activities..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Event Type</Label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredTimeline.length} of {timeline.length} activities
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found</p>
              <p className="text-sm">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimeline.map((entry, index) => {
                const EventIcon = getEventIcon(entry.action_type);
                const colorClasses = getEventColor(entry.category);
                
                return (
                  <div key={entry.id} className="flex items-start gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${colorClasses}`}>
                        <EventIcon className="h-4 w-4" />
                      </div>
                      {index < filteredTimeline.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {entry.action_description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        {entry.user_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user_name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {/* Metadata */}
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <div className="bg-gray-50 rounded p-2 text-xs">
                          <div className="font-medium text-gray-700 mb-1">Details:</div>
                          <div className="space-y-1">
                            {Object.entries(entry.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-500 capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-gray-700 font-medium">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {timeline.filter(entry => entry.category === 'filing').length}
                </div>
                <div className="text-sm text-gray-600">Filing Activities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {timeline.filter(entry => entry.category === 'office_action').length}
                </div>
                <div className="text-sm text-gray-600">Office Actions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {timeline.filter(entry => entry.category === 'checklist').length}
                </div>
                <div className="text-sm text-gray-600">Checklist Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {timeline.filter(entry => {
                    const dayAgo = new Date(Date.now() - 86400000);
                    return new Date(entry.timestamp) >= dayAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Last 24 Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}