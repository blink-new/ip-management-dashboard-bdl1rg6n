// Blink SDK removed - using pure Supabase authentication
// All types moved here for reference

// Export types for better TypeScript support
export type User = {
  id: string
  email: string
  name?: string
  role?: string
  created_at?: string
  last_login?: string
}

export type Disclosure = {
  id: string
  invention_id: string
  title: string
  description: string
  inventors: string[]
  tags: string[]
  department: string
  faculty: string
  trl: number
  irl: number
  crl: number
  brl: number
  iprl: number
  tmrl: number
  frl: number
  disclosure_type: 'Invention' | 'Copyright' | 'Software' | 'Trade Secret'
  lead_pi: string
  stage: 'Received' | 'In Review' | 'Approved' | 'Filed'
  status: 'Approved' | 'In Review' | 'Returned to Inventor (Further Research)' | 'Returned to Inventor (Incomplete)' | 'Reviewed for Filing' | 'Application Filed' | 'Abandoned'
  created_at: string
  updated_at: string
  user_id: string
}

export type Project = {
  id: string
  title: string
  description: string
  trl: number
  irl: number
  tags: string[]
  department: string
  project_type: 'Market Study' | 'Licensing Plan' | 'Commercialization Roadmap' | 'Program'
  team_members: string[]
  created_at: string
  updated_at: string
  user_id: string
}

export type Agreement = {
  id: string
  title: string
  agreement_type: 'NDA' | 'MTA' | 'Sponsored Research' | 'Collaboration Agreement' | 'Licensing Agreement' | 'Assignment Agreement'
  contracting_parties: string[]
  start_date: string
  end_date?: string
  agreement_status: string
  contract_manager: string
  file_name?: string
  renewal_terms?: string
  ip_clauses_summary?: string
  revenue_sharing_terms?: string
  tags: string[]
  created_at: string
  updated_at: string
  user_id: string
}

export type Startup = {
  id: string
  name: string
  incorporation_date?: string
  founders: string[]
  tags: string[]
  department: string
  status: string
  stage: 'Idea' | 'Pre-Seed' | 'Seed' | 'Revenue' | 'Exit'
  team_members: string[]
  external_links: { website?: string; linkedin?: string }
  point_of_contact: string
  created_at: string
  updated_at: string
  user_id: string
}

export type Inventor = {
  id: string
  first_name: string
  last_name: string
  email: string
  department: string
  faculty: string
  position_title: string
  affiliation_status: 'Active' | 'Left' | 'Retired'
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

export type TeamMember = {
  id: string
  first_name: string
  last_name: string
  role: string
  affiliation: 'Inventor' | 'Non-Inventor'
  contact_email: string
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

export type Note = {
  id: string
  entity_type: string
  entity_id: string
  content: string
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
  user_id: string
}

export type Comment = {
  id: string
  entity_type: string
  entity_id: string
  content: string
  parent_comment_id?: string
  created_by: string
  created_at: string
  updated_at: string
  user_id: string
}

export type ChecklistItem = {
  id: string
  entity_type: string
  entity_id: string
  title: string
  description?: string
  is_completed: boolean
  due_date?: string
  created_by: string
  created_at: string
  updated_at: string
  user_id: string
}

export type ActivityLog = {
  id: string
  entity_type: string
  entity_id: string
  action: string
  description: string
  metadata?: any
  created_by: string
  created_at: string
  user_id: string
}

export type Link = {
  id: string
  from_entity_type: string
  from_entity_id: string
  to_entity_type: string
  to_entity_id: string
  created_by: string
  created_at: string
  user_id: string
}

export type Filing = {
  id: string
  filing_title: string
  filing_type: string
  jurisdictions: string[]
  filing_date: string
  priority_date?: string
  application_number?: string
  publication_date?: string
  grant_date?: string
  expiry_date?: string
  grant_number?: string
  patent_classifications: string[]
  filing_status: string
  linked_disclosure_ids: string[]
  linked_project_id?: string
  lead_inventor_id?: string
  assignment_to_university?: string
  assignment_date?: string
  assignment_status?: 'Yes' | 'No' | 'Pending'
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

export type FilingRelationship = {
  id: string
  parent_filing_id: string
  child_filing_id: string
  relationship_type: string
  priority_claim: boolean
  created_at: string
}

export type FilingAnnuity = {
  id: string
  filing_id: string
  jurisdiction: string
  due_date: string
  payment_frequency: string
  payment_status: string
  payment_date?: string
  amount?: number
  notes?: string
  created_at: string
  updated_at: string
}

export type FilingOfficeAction = {
  id: string
  filing_id: string
  action_type: string
  date_received: string
  response_deadline: string
  response_filed_date?: string
  status: string
  assigned_user_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type FilingChecklist = {
  id: string
  filing_id: string
  task_name: string
  due_date?: string
  reminder_days?: number
  assigned_user_id?: string
  status: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export type FilingTimeline = {
  id: string
  filing_id: string
  event_type: string
  event_description: string
  old_value?: string
  new_value?: string
  user_id?: string
  created_at: string
  timestamp: string
}

export type Alert = {
  id: string
  type: string
  title: string
  description: string
  entity_type?: string
  entity_id?: string
  due_date?: string
  is_read: boolean
  is_dismissed: boolean
  created_at: string
  user_id: string
}