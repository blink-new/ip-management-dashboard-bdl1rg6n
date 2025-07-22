import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, FileText, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilings } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

import { Filing } from '@/lib/blink';

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
  { code: 'AU', name: 'Australia', flag: '🇦🇺' }
];

export function FilingsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: filings, loading, error } = useFilings();
  
  const [filteredFilings, setFilteredFilings] = useState<Filing[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');



  // Apply filters
  useEffect(() => {
    let filtered = filings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(filing =>
        filing.filing_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filing.application_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filing.grant_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(filing => filing.filing_status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(filing => filing.filing_type === typeFilter);
    }

    // Jurisdiction filter
    if (jurisdictionFilter !== 'all') {
      filtered = filtered.filter(filing => 
        filing.jurisdictions && filing.jurisdictions.includes(jurisdictionFilter)
      );
    }

    setFilteredFilings(filtered);
  }, [filings, searchTerm, statusFilter, typeFilter, jurisdictionFilter]);

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

  const getJurisdictionFlags = (jurisdictions: string[]) => {
    if (!jurisdictions || jurisdictions.length === 0) return '';
    
    return jurisdictions
      .map(code => JURISDICTIONS.find(j => j.code === code)?.flag || code)
      .join(' ');
  };

  const getFilingStats = () => {
    const total = filings.length;
    const granted = filings.filter(f => f.filing_status === 'Granted').length;
    const pending = filings.filter(f => ['Filed', 'Under Examination', 'Published'].includes(f.filing_status)).length;
    const draft = filings.filter(f => f.filing_status === 'Draft').length;
    
    return { total, granted, pending, draft };
  };

  const stats = getFilingStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading filings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patent Filings</h1>
          <p className="text-gray-600">
            Manage your patent filing portfolio and track prosecution progress
          </p>
        </div>
        <Button onClick={() => navigate('/filings/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Filing
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Filings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Granted</p>
                <p className="text-2xl font-bold text-green-600">{stats.granted}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold">📝</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search filings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FILING_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {FILING_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  {JURISDICTIONS.map(jurisdiction => (
                    <SelectItem key={jurisdiction.code} value={jurisdiction.code}>
                      {jurisdiction.flag} {jurisdiction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Filings ({filteredFilings.length} of {filings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFilings.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filings.length === 0 ? 'No filings yet' : 'No filings match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {filings.length === 0 
                  ? 'Create your first patent filing to get started'
                  : 'Try adjusting your search criteria or filters'
                }
              </p>
              {filings.length === 0 && (
                <Button onClick={() => navigate('/filings/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Filing
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jurisdictions</TableHead>
                  <TableHead>Filing Date</TableHead>
                  <TableHead>Application #</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFilings.map(filing => (
                  <TableRow 
                    key={filing.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/filings/${filing.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{filing.filing_title}</p>
                        {filing.grant_number && (
                          <p className="text-sm text-gray-500 font-mono">{filing.grant_number}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{filing.filing_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(filing.filing_status)}>
                        {filing.filing_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg">
                        {getJurisdictionFlags(filing.jurisdictions)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(filing.filing_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {filing.application_number || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(filing.updated_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}