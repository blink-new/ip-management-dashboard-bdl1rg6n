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

export type Filing = {
  id: string
  title: string
  jurisdiction: string
  filing_type: 'Provisional' | 'PCT' | 'National' | 'Continuation' | 'Divisional' | 'Non-Provisional'
  priority_date: string
  filing_date: string
  application_number: string
  publication_date?: string
  status: string
  grant_date?: string
  grant_number?: string
  expiry_date?: string
  annuity_date?: string
  patent_classifications: string[]
  tags: string[]
  law_firm_name: string
  law_firm_contact_name: string
  law_firm_contact_email: string
  parent_filing_id?: string
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