import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Calendar, Building, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface FilingFormData {
  title: string
  jurisdiction: string
  filing_type: string
  priority_date: string
  filing_date: string
  application_number: string
  publication_date: string
  status: string
  grant_date: string
  grant_number: string
  expiry_date: string
  annuity_date: string
  law_firm_name: string
  law_firm_contact_name: string
  law_firm_contact_email: string
  patent_classifications: string
  tags: string[]
  parent_filing_id?: string
  maintenance_schedule: string
  office_action_log: string
}

const FILING_TYPES = [
  'Provisional',
  'PCT',
  'National',
  'Continuation',
  'Divisional',
  'Non-Provisional'
]

const JURISDICTIONS = [
  'US',
  'CA',
  'EP',
  'GB',
  'DE',
  'FR',
  'JP',
  'CN',
  'AU',
  'PCT'
]

const FILING_STATUSES = [
  'Filed',
  'Published',
  'Under Examination',
  'Granted',
  'Abandoned',
  'Expired',
  'Pending'
]

export function FilingForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  
  const [formData, setFormData] = useState<FilingFormData>({
    title: '',
    jurisdiction: '',
    filing_type: '',
    priority_date: '',
    filing_date: '',
    application_number: '',
    publication_date: '',
    status: 'Filed',
    grant_date: '',
    grant_number: '',
    expiry_date: '',
    annuity_date: '',
    law_firm_name: '',
    law_firm_contact_name: '',
    law_firm_contact_email: '',
    patent_classifications: '',
    tags: [],
    maintenance_schedule: '',
    office_action_log: ''
  })

  useEffect(() => {
    if (isEditing && id) {
      loadFiling(id)
    }
  }, [id, isEditing])

  const loadFiling = async (filingId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('filings')
        .select('*')
        .eq('id', filingId)
        .single()

      if (error) throw error

      setFormData({
        title: data.title || '',
        jurisdiction: data.jurisdiction || '',
        filing_type: data.filing_type || '',
        priority_date: data.priority_date || '',
        filing_date: data.filing_date || '',
        application_number: data.application_number || '',
        publication_date: data.publication_date || '',
        status: data.status || 'Filed',
        grant_date: data.grant_date || '',
        grant_number: data.grant_number || '',
        expiry_date: data.expiry_date || '',
        annuity_date: data.annuity_date || '',
        law_firm_name: data.law_firm_name || '',
        law_firm_contact_name: data.law_firm_contact_name || '',
        law_firm_contact_email: data.law_firm_contact_email || '',
        patent_classifications: data.patent_classifications || '',
        tags: data.tags || [],
        parent_filing_id: data.parent_filing_id || '',
        maintenance_schedule: data.maintenance_schedule || '',
        office_action_log: data.office_action_log || ''
      })
    } catch (error) {
      console.error('Error loading filing:', error)
      toast({
        title: 'Error',
        description: 'Failed to load filing data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FilingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const filingData = {
        ...formData,
        priority_date: formData.priority_date || null,
        filing_date: formData.filing_date || null,
        publication_date: formData.publication_date || null,
        grant_date: formData.grant_date || null,
        expiry_date: formData.expiry_date || null,
        annuity_date: formData.annuity_date || null,
        parent_filing_id: formData.parent_filing_id || null,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error } = await supabase
          .from('filings')
          .update(filingData)
          .eq('id', id)

        if (error) throw error

        // Log activity
        await supabase.from('activity_logs').insert({
          module: 'filings',
          record_id: id,
          action: 'updated',
          user_id: user?.id,
          details: `Filing "${formData.title}" updated`
        })

        toast({
          title: 'Success',
          description: 'Filing updated successfully'
        })
      } else {
        const { data, error } = await supabase
          .from('filings')
          .insert({
            ...filingData,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await supabase.from('activity_logs').insert({
          module: 'filings',
          record_id: data.id,
          action: 'created',
          user_id: user?.id,
          details: `Filing "${formData.title}" created`
        })

        toast({
          title: 'Success',
          description: 'Filing created successfully'
        })

        navigate(`/filings/${data.id}`)
        return
      }

      navigate('/filings')
    } catch (error) {
      console.error('Error saving filing:', error)
      toast({
        title: 'Error',
        description: 'Failed to save filing',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/filings')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Filing' : 'New Filing'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update filing information' : 'Create a new patent filing'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Filing'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter filing title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="filing_type">Filing Type</Label>
                <Select 
                  value={formData.filing_type} 
                  onValueChange={(value) => handleInputChange('filing_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILING_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select 
                  value={formData.jurisdiction} 
                  onValueChange={(value) => handleInputChange('jurisdiction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map(jurisdiction => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILING_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="application_number">Application Number</Label>
                <Input
                  id="application_number"
                  value={formData.application_number}
                  onChange={(e) => handleInputChange('application_number', e.target.value)}
                  placeholder="e.g., 17/123,456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority_date">Priority Date</Label>
                <Input
                  id="priority_date"
                  type="date"
                  value={formData.priority_date}
                  onChange={(e) => handleInputChange('priority_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="filing_date">Filing Date</Label>
                <Input
                  id="filing_date"
                  type="date"
                  value={formData.filing_date}
                  onChange={(e) => handleInputChange('filing_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="publication_date">Publication Date</Label>
                <Input
                  id="publication_date"
                  type="date"
                  value={formData.publication_date}
                  onChange={(e) => handleInputChange('publication_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="grant_date">Grant Date</Label>
                <Input
                  id="grant_date"
                  type="date"
                  value={formData.grant_date}
                  onChange={(e) => handleInputChange('grant_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="annuity_date">Next Annuity Date</Label>
                <Input
                  id="annuity_date"
                  type="date"
                  value={formData.annuity_date}
                  onChange={(e) => handleInputChange('annuity_date', e.target.value)}
                />
              </div>
            </div>

            {formData.grant_number && (
              <div>
                <Label htmlFor="grant_number">Grant Number</Label>
                <Input
                  id="grant_number"
                  value={formData.grant_number}
                  onChange={(e) => handleInputChange('grant_number', e.target.value)}
                  placeholder="e.g., US 10,123,456"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Law Firm Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Law Firm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="law_firm_name">Law Firm Name</Label>
                <Input
                  id="law_firm_name"
                  value={formData.law_firm_name}
                  onChange={(e) => handleInputChange('law_firm_name', e.target.value)}
                  placeholder="Enter law firm name"
                />
              </div>

              <div>
                <Label htmlFor="law_firm_contact_name">Contact Name</Label>
                <Input
                  id="law_firm_contact_name"
                  value={formData.law_firm_contact_name}
                  onChange={(e) => handleInputChange('law_firm_contact_name', e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="law_firm_contact_email">Contact Email</Label>
                <Input
                  id="law_firm_contact_email"
                  type="email"
                  value={formData.law_firm_contact_email}
                  onChange={(e) => handleInputChange('law_firm_contact_email', e.target.value)}
                  placeholder="Enter contact email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patent_classifications">Patent Classifications</Label>
              <Textarea
                id="patent_classifications"
                value={formData.patent_classifications}
                onChange={(e) => handleInputChange('patent_classifications', e.target.value)}
                placeholder="Enter CPC, IPC, PCT classifications..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="maintenance_schedule">Maintenance Schedule</Label>
              <Textarea
                id="maintenance_schedule"
                value={formData.maintenance_schedule}
                onChange={(e) => handleInputChange('maintenance_schedule', e.target.value)}
                placeholder="Enter maintenance and annuity schedule details..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="office_action_log">Office Action Log</Label>
              <Textarea
                id="office_action_log"
                value={formData.office_action_log}
                onChange={(e) => handleInputChange('office_action_log', e.target.value)}
                placeholder="Enter office action history and responses..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/filings')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Filing' : 'Create Filing'}
          </Button>
        </div>
      </form>
    </div>
  )
}