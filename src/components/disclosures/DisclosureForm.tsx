import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Plus, 
  X, 
  Users, 
  Tag, 
  Building2,
  GraduationCap,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { useInventors } from '@/hooks/useData'
import type { Disclosure } from '@/lib/blink'

interface DisclosureFormProps {
  disclosure?: Disclosure
  onSave: (data: Partial<Disclosure>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface FormErrors {
  [key: string]: string
}

interface FormData {
  invention_id: string
  title: string
  description: string
  inventors: string[]
  tags: string[]
  department: string
  faculty: string
  trl: number
  crl: number
  brl: number
  iprl: number
  tmrl: number
  frl: number
  disclosure_type: 'Invention' | 'Copyright' | 'Software' | 'Trade Secret'
  lead_pi: string
}

const DISCLOSURE_TYPES = [
  { value: 'Invention', label: 'Invention', description: 'Novel technical solutions or processes' },
  { value: 'Copyright', label: 'Copyright', description: 'Creative works, publications, or artistic content' },
  { value: 'Software', label: 'Software', description: 'Computer programs, algorithms, or code' },
  { value: 'Trade Secret', label: 'Trade Secret', description: 'Confidential business information or know-how' }
]

const READINESS_LEVELS = [
  { value: 1, label: 'Level 1', description: 'Basic principles observed' },
  { value: 2, label: 'Level 2', description: 'Technology concept formulated' },
  { value: 3, label: 'Level 3', description: 'Experimental proof of concept' },
  { value: 4, label: 'Level 4', description: 'Technology validated in lab' },
  { value: 5, label: 'Level 5', description: 'Technology validated in relevant environment' },
  { value: 6, label: 'Level 6', description: 'Technology demonstrated in relevant environment' },
  { value: 7, label: 'Level 7', description: 'System prototype demonstration' },
  { value: 8, label: 'Level 8', description: 'System complete and qualified' },
  { value: 9, label: 'Level 9', description: 'Actual system proven in operational environment' }
]

export function DisclosureForm({ disclosure, onSave, onCancel, loading = false }: DisclosureFormProps) {
  const { data: inventors } = useInventors()
  const [formData, setFormData] = useState<FormData>({
    invention_id: disclosure?.invention_id || '',
    title: disclosure?.title || '',
    description: disclosure?.description || '',
    inventors: disclosure?.inventors || [],
    tags: disclosure?.tags || [],
    department: disclosure?.department || '',
    faculty: disclosure?.faculty || '',
    trl: disclosure?.trl || 1,
    crl: disclosure?.crl || 1,
    brl: disclosure?.brl || 1,
    iprl: disclosure?.iprl || 1,
    tmrl: disclosure?.tmrl || 1,
    frl: disclosure?.frl || 1,
    disclosure_type: disclosure?.disclosure_type || 'Invention',
    lead_pi: disclosure?.lead_pi || ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [newInventor, setNewInventor] = useState('')
  const [newTag, setNewTag] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Auto-save functionality
  useEffect(() => {
    if (!disclosure) return // Only auto-save for existing disclosures
    
    const timeoutId = setTimeout(() => {
      if (validateForm(true)) {
        handleAutoSave()
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = (silent = false): boolean => {
    const newErrors: FormErrors = {}
    const newValidationErrors: string[] = []

    // Required field validation
    if (!formData.invention_id.trim()) {
      newErrors.invention_id = 'Invention ID is required'
      newValidationErrors.push('Invention ID is required')
    } else if (!/^INV-\d{4}-\d{3,4}$/.test(formData.invention_id.trim())) {
      newErrors.invention_id = 'Invention ID must follow format: INV-YYYY-XXX (e.g., INV-2025-001)'
      newValidationErrors.push('Invention ID must follow format: INV-YYYY-XXX')
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
      newValidationErrors.push('Title is required')
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
      newValidationErrors.push('Title must be at least 5 characters')
    }

    if (!formData.lead_pi.trim()) {
      newErrors.lead_pi = 'Lead PI is required'
      newValidationErrors.push('Lead Principal Investigator is required')
    }

    if (!formData.disclosure_type) {
      newErrors.disclosure_type = 'Disclosure type is required'
      newValidationErrors.push('Disclosure type must be selected')
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
      newValidationErrors.push('Description is too long (max 2000 characters)')
    }

    if (formData.inventors.length === 0) {
      newErrors.inventors = 'At least one inventor is required'
      newValidationErrors.push('At least one inventor must be specified')
    }

    // Readiness level validation
    const readinessFields = ['trl', 'crl', 'brl', 'iprl', 'tmrl', 'frl']
    readinessFields.forEach(field => {
      const value = formData[field as keyof FormData] as number
      if (value < 1 || value > 9) {
        newErrors[field] = 'Must be between 1 and 9'
        newValidationErrors.push(`${field.toUpperCase()} must be between 1 and 9`)
      }
    })

    if (!silent) {
      setErrors(newErrors)
      setValidationErrors(newValidationErrors)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleAutoSave = async () => {
    if (saveStatus === 'saving') return
    
    try {
      setSaveStatus('saving')
      // Include calculated IRL in auto-save
      const dataWithIRL = {
        ...formData,
        irl: calculateIRL()
      }
      await onSave(dataWithIRL)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaveStatus('saving')
      // Include calculated IRL in the submission
      const dataWithIRL = {
        ...formData,
        irl: calculateIRL()
      }
      await onSave(dataWithIRL)
      setSaveStatus('success')
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to save disclosure:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const addInventor = () => {
    if (newInventor.trim() && !formData.inventors.includes(newInventor.trim())) {
      handleInputChange('inventors', [...formData.inventors, newInventor.trim()])
      setNewInventor('')
    }
  }

  const removeInventor = (index: number) => {
    handleInputChange('inventors', formData.inventors.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index))
  }

  // Calculate IRL based on KTH framework - weighted average of component readiness levels
  const calculateIRL = () => {
    // KTH IRL framework weights (based on research and innovation management best practices)
    const weights = {
      trl: 0.25,    // Technology Readiness - core technical maturity
      crl: 0.20,    // Commercial Readiness - market understanding
      brl: 0.15,    // Business Readiness - business model
      iprl: 0.15,   // IP Readiness - intellectual property protection
      tmrl: 0.15,   // Team Readiness - team capability
      frl: 0.10     // Financial Readiness - funding and resources
    }
    
    const weightedSum = 
      formData.trl * weights.trl +
      formData.crl * weights.crl +
      formData.brl * weights.brl +
      formData.iprl * weights.iprl +
      formData.tmrl * weights.tmrl +
      formData.frl * weights.frl
    
    return Math.round(weightedSum * 10) / 10 // Round to 1 decimal place
  }

  const getReadinessAverage = () => {
    const levels = [formData.trl, formData.crl, formData.brl, formData.iprl, formData.tmrl, formData.frl]
    return levels.reduce((sum, level) => sum + level, 0) / levels.length
  }

  const getReadinessColor = (level: number) => {
    if (level <= 3) return 'bg-red-500'
    if (level <= 6) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <Alert className={`border-0 ${
          saveStatus === 'success' ? 'bg-green-50' : 
          saveStatus === 'error' ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            {saveStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {saveStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            <AlertDescription className={
              saveStatus === 'success' ? 'text-green-800' : 
              saveStatus === 'error' ? 'text-red-800' : 'text-blue-800'
            }>
              {saveStatus === 'saving' && 'Saving changes...'}
              {saveStatus === 'success' && 'Changes saved successfully'}
              {saveStatus === 'error' && 'Failed to save changes'}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-emerald-600" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Core details about the invention or technology disclosure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invention_id" className="flex items-center gap-2">
                Invention ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invention_id"
                value={formData.invention_id}
                onChange={(e) => handleInputChange('invention_id', e.target.value)}
                placeholder="INV-2025-001"
                className={errors.invention_id ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.invention_id && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.invention_id}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Format: INV-YYYY-XXX (e.g., INV-2025-001)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your disclosure"
                className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disclosure_type" className="flex items-center gap-2">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.disclosure_type} 
                onValueChange={(value) => handleInputChange('disclosure_type', value)}
              >
                <SelectTrigger className={errors.disclosure_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select disclosure type" />
                </SelectTrigger>
                <SelectContent>
                  {DISCLOSURE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.disclosure_type && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.disclosure_type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_pi" className="flex items-center gap-2">
                Lead Principal Investigator <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lead_pi"
                value={formData.lead_pi}
                onChange={(e) => handleInputChange('lead_pi', e.target.value)}
                placeholder="Dr. Jane Smith"
                className={errors.lead_pi ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.lead_pi && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lead_pi}
                </p>
              )}
            </div>
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the invention or technology..."
                rows={4}
                className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Faculty
              </Label>
              <Input
                id="faculty"
                value={formData.faculty}
                onChange={(e) => handleInputChange('faculty', e.target.value)}
                placeholder="Engineering"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Inventors
          </CardTitle>
          <CardDescription>
            Add all inventors and contributors to this disclosure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInventor}
              onChange={(e) => setNewInventor(e.target.value)}
              placeholder="Enter inventor name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInventor())}
            />
            <Button type="button" onClick={addInventor} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.inventors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.inventors.map((inventor, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  {inventor}
                  <button
                    type="button"
                    onClick={() => removeInventor(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {errors.inventors && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.inventors}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-600" />
            Tags & Keywords
          </CardTitle>
          <CardDescription>
            Add relevant tags to help categorize and search for this disclosure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag (e.g., AI, Machine Learning, Healthcare)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Innovation Readiness Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Innovation Readiness Assessment
          </CardTitle>
          <CardDescription>
            Assess the maturity and readiness of your technology across different dimensions. The Innovation Readiness Level (IRL) is calculated using KTH's framework.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* IRL Score Display */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="font-semibold text-amber-800">Innovation Readiness Level (IRL)</Label>
                <p className="text-sm text-amber-700 mt-1">Calculated using KTH's weighted framework</p>
              </div>
              <span className="text-2xl font-bold text-amber-800">{calculateIRL().toFixed(1)}/9</span>
            </div>
            <Progress 
              value={(calculateIRL() / 9) * 100} 
              className="h-3"
            />
            <div className="mt-3 text-xs text-amber-700">
              <p><strong>Weights:</strong> TRL (25%), CRL (20%), BRL (15%), IPRL (15%), TMRL (15%), FRL (10%)</p>
            </div>
          </div>

          {/* Component Average */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">Component Average</Label>
              <span className="text-lg font-bold">{getReadinessAverage().toFixed(1)}/9</span>
            </div>
            <Progress 
              value={(getReadinessAverage() / 9) * 100} 
              className="h-3"
            />
            <p className="text-sm text-gray-600 mt-2">
              Simple average across all readiness dimensions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'trl', label: 'Technology Readiness Level (TRL)', description: 'Technical maturity and development stage', weight: '25%' },
              { key: 'crl', label: 'Commercial Readiness Level (CRL)', description: 'Market understanding and commercial viability', weight: '20%' },
              { key: 'brl', label: 'Business Readiness Level (BRL)', description: 'Business model and strategy maturity', weight: '15%' },
              { key: 'iprl', label: 'IP Readiness Level (IPRL)', description: 'Intellectual property protection status', weight: '15%' },
              { key: 'tmrl', label: 'Team Readiness Level (TMRL)', description: 'Team capability and experience', weight: '15%' },
              { key: 'frl', label: 'Financial Readiness Level (FRL)', description: 'Funding and financial planning', weight: '10%' }
            ].map(({ key, label, description, weight }) => (
              <div key={key} className="space-y-3 p-4 border rounded-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">{label}</Label>
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      {weight}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                
                <Select 
                  value={String(formData[key as keyof FormData])} 
                  onValueChange={(value) => handleInputChange(key as keyof FormData, parseInt(value))}
                >
                  <SelectTrigger className={`${errors[key] ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {READINESS_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={String(level.value)}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getReadinessColor(formData[key as keyof FormData] as number)}`}></div>
                  <Progress 
                    value={(formData[key as keyof FormData] as number / 9) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium">{formData[key as keyof FormData]}/9</span>
                </div>
                
                {errors[key] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {disclosure && (
            <>
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Auto-saving...
                </>
              )}
              {saveStatus === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Saved
                </>
              )}
              {saveStatus === 'idle' && 'Changes are auto-saved'}
            </>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || saveStatus === 'saving'}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading || saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {disclosure ? 'Update Disclosure' : 'Create Disclosure'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}