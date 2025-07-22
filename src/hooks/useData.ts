import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { 
  Disclosure, 
  Filing,
  Project, 
  Agreement, 
  Startup, 
  Inventor, 
  TeamMember,
  Note,
  Comment,
  ChecklistItem,
  ActivityLog,
  Link,
  Alert
} from '@/lib/blink'

// Generic hook for CRUD operations using Supabase
export function useEntity<T>(tableName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    if (!user) {
      console.log(`No user authenticated, skipping fetch for ${tableName}`)
      setLoading(false)
      setData([])
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Fetching data from ${tableName} for user:`, user.id)
      console.log(`User object:`, user)
      
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.error(`Error fetching ${tableName}:`, fetchError)
        throw fetchError
      }
      
      console.log(`Successfully fetched ${result?.length || 0} records from ${tableName}`)
      console.log(`${tableName} data:`, result)
      setData(result || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error(`Failed to fetch ${tableName}:`, errorMessage)
      setError(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [tableName, user])

  const create = async (item: Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      console.log(`Creating new item in ${tableName}:`, item)
      
      const itemWithUser = {
        ...item,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: newItem, error: createError } = await supabase
        .from(tableName)
        .insert(itemWithUser)
        .select()
        .single()
      
      if (createError) {
        console.error(`Create error in ${tableName}:`, createError)
        throw createError
      }
      
      console.log(`Successfully created item in ${tableName}:`, newItem)
      setData(prev => [newItem, ...prev])
      setError(null)
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item'
      console.error(`Failed to create item in ${tableName}:`, errorMessage)
      setError(errorMessage)
      throw err
    }
  }

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { data: updatedItem, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      setData(prev => prev.map(item => 
        (item as any).id === id ? { ...item, ...updatedItem } : item
      ))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      throw err
    }
  }

  const remove = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      setData(prev => prev.filter(item => (item as any).id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      throw err
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refresh: fetchData
  }
}

// Specific hooks for each entity type
export const useDisclosures = () => useEntity<Disclosure>('disclosures')
export const useProjects = () => useEntity<Project>('projects')
export const useAgreements = () => useEntity<Agreement>('agreements')
export const useStartups = () => useEntity<Startup>('startups')
export const useInventors = () => useEntity<Inventor>('inventors')
export const useTeamMembers = () => useEntity<TeamMember>('team_members')
export const useNotes = () => useEntity<Note>('notes')
export const useComments = () => useEntity<Comment>('comments')
export const useChecklistItems = () => useEntity<ChecklistItem>('checklist_items')
export const useActivityLogs = () => useEntity<ActivityLog>('activity_logs')
export const useLinks = () => useEntity<Link>('links')
export const useAlerts = () => useEntity<Alert>('alerts')

// Enhanced Filings hook with advanced features
export function useFilings() {
  const baseHook = useEntity<Filing>('filings')
  const { user } = useAuth()

  // Filing relationships
  const getRelationships = useCallback(async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filing_relationships')
        .select('*')
        .or(`parent_filing_id.eq.${filingId},child_filing_id.eq.${filingId}`)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching relationships:', err)
      throw err
    }
  }, [])

  const createRelationship = useCallback(async (parentId: string, childId: string, relationshipType: string, priorityClaim: boolean = false) => {
    try {
      const { data, error } = await supabase
        .rpc('create_filing_relationship', {
          p_parent_filing_id: parentId,
          p_child_filing_id: childId,
          p_relationship_type: relationshipType,
          p_priority_claim: priorityClaim,
          p_user_id: user?.id
        })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating relationship:', err)
      throw err
    }
  }, [user?.id])

  const removeRelationship = useCallback(async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('filing_relationships')
        .delete()
        .eq('id', relationshipId)

      if (error) throw error
    } catch (err) {
      console.error('Error removing relationship:', err)
      throw err
    }
  }, [])

  // Annuity tracking
  const getAnnuities = useCallback(async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filing_annuities')
        .select('*')
        .eq('filing_id', filingId)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching annuities:', err)
      throw err
    }
  }, [])

  const createAnnuity = useCallback(async (filingId: string, annuityData: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_annuities')
        .insert([{ 
          ...annuityData, 
          filing_id: filingId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating annuity:', err)
      throw err
    }
  }, [])

  const updateAnnuity = useCallback(async (annuityId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_annuities')
        .update(updates)
        .eq('id', annuityId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating annuity:', err)
      throw err
    }
  }, [])

  const deleteAnnuity = useCallback(async (annuityId: string) => {
    try {
      const { error } = await supabase
        .from('filing_annuities')
        .delete()
        .eq('id', annuityId)

      if (error) throw error
    } catch (err) {
      console.error('Error removing annuity:', err)
      throw err
    }
  }, [])

  // Office actions
  const getOfficeActions = useCallback(async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filing_office_actions')
        .select('*')
        .eq('filing_id', filingId)
        .order('date_received', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching office actions:', err)
      throw err
    }
  }, [])

  const createOfficeAction = useCallback(async (filingId: string, actionData: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_office_actions')
        .insert([{ 
          ...actionData, 
          filing_id: filingId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating office action:', err)
      throw err
    }
  }, [])

  const updateOfficeAction = useCallback(async (actionId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_office_actions')
        .update(updates)
        .eq('id', actionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating office action:', err)
      throw err
    }
  }, [])

  const deleteOfficeAction = useCallback(async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('filing_office_actions')
        .delete()
        .eq('id', actionId)

      if (error) throw error
    } catch (err) {
      console.error('Error removing office action:', err)
      throw err
    }
  }, [])

  // Checklist items
  const getChecklistItems = useCallback(async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filing_checklists')
        .select('*')
        .eq('filing_id', filingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching checklist items:', err)
      throw err
    }
  }, [])

  const createChecklistItem = useCallback(async (filingId: string, itemData: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_checklists')
        .insert([{ 
          ...itemData, 
          filing_id: filingId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating checklist item:', err)
      throw err
    }
  }, [])

  const updateChecklistItem = useCallback(async (itemId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('filing_checklists')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating checklist item:', err)
      throw err
    }
  }, [])

  const deleteChecklistItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('filing_checklists')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (err) {
      console.error('Error removing checklist item:', err)
      throw err
    }
  }, [])

  // Timeline
  const getTimeline = useCallback(async (filingId: string) => {
    try {
      const { data, error } = await supabase
        .from('filing_timeline')
        .select('*')
        .eq('filing_id', filingId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching timeline:', err)
      throw err
    }
  }, [])

  const logActivity = useCallback(async (filingId: string, actionType: string, description: string, category: string = 'system', metadata: any = null) => {
    try {
      const { data, error } = await supabase
        .from('filing_timeline')
        .insert([{
          filing_id: filingId,
          action_type: actionType,
          action_description: description,
          user_id: user?.id,
          category,
          metadata,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error logging activity:', err)
      throw err
    }
  }, [user?.id])

  return {
    ...baseHook,
    // Advanced features
    getRelationships,
    createRelationship,
    removeRelationship,
    getAnnuities,
    createAnnuity,
    updateAnnuity,
    deleteAnnuity,
    getOfficeActions,
    createOfficeAction,
    updateOfficeAction,
    deleteOfficeAction,
    getChecklistItems,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    getTimeline,
    logActivity
  }
}

// Hook for cross-module linking
export function useLinking() {
  const { data: links, create: createLink, remove: removeLink } = useLinks()
  const { user } = useAuth()

  const linkEntities = async (
    fromType: string,
    fromId: string,
    toType: string,
    toId: string
  ) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      return await createLink({
        from_entity_type: fromType,
        from_entity_id: fromId,
        to_entity_type: toType,
        to_entity_id: toId,
        created_by: user.id
      })
    } catch (err) {
      throw new Error('Failed to create link')
    }
  }

  const unlinkEntities = async (linkId: string) => {
    await removeLink(linkId)
  }

  const getLinkedEntities = (entityType: string, entityId: string) => {
    return links.filter(link => 
      (link.from_entity_type === entityType && link.from_entity_id === entityId) ||
      (link.to_entity_type === entityType && link.to_entity_id === entityId)
    )
  }

  return {
    links,
    linkEntities,
    unlinkEntities,
    getLinkedEntities
  }
}

// Hook for activity logging
export function useActivityLogger() {
  const { create: createLog } = useActivityLogs()
  const { user } = useAuth()

  const logActivity = async (
    entityType: string,
    entityId: string,
    action: string,
    description: string,
    metadata?: any
  ) => {
    if (!user) return
    
    try {
      await createLog({
        entity_type: entityType,
        entity_id: entityId,
        action,
        description,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        created_by: user.id
      })
    } catch (err) {
      console.error('Failed to log activity:', err)
    }
  }

  return { logActivity }
}

// Hook for dashboard statistics using Supabase
export function useDashboardStats() {
  const [stats, setStats] = useState({
    activeDisclosures: 0,
    activeProjects: 0,
    startups: 0,
    loading: true
  })
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        const [
          { data: disclosures },
          { data: projects },
          { data: startups }
        ] = await Promise.all([
          supabase.from('disclosures').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('startups').select('*')
        ])

        // Filter active disclosures
        const activeDisclosures = (disclosures || []).filter(d => 
          ['Received', 'In Review', 'Approved'].includes(d.stage)
        )

        setStats({
          activeDisclosures: activeDisclosures.length,
          activeProjects: (projects || []).length,
          startups: (startups || []).length,
          loading: false
        })
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [user])

  return stats
}

// Hook for entity-specific notes
export function useEntityNotes(entityType: string, entityId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user || !entityId) return
      
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .or(`is_public.eq.true,user_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setNotes(data || [])
      } catch (err) {
        console.error('Failed to fetch notes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [entityType, entityId, user])

  const createNote = async (content: string, isPublic: boolean = false) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          content,
          is_public: isPublic,
          created_by: user.id,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      throw new Error('Failed to create note')
    }
  }

  const updateNote = async (noteId: string, content: string, isPublic: boolean) => {
    try {
      const { data: updatedNote, error } = await supabase
        .from('notes')
        .update({ content, is_public: isPublic })
        .eq('id', noteId)
        .select()
        .single()
      
      if (error) throw error
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ))
      return updatedNote
    } catch (err) {
      throw new Error('Failed to update note')
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
      
      if (error) throw error
      
      setNotes(prev => prev.filter(note => note.id !== noteId))
    } catch (err) {
      throw new Error('Failed to delete note')
    }
  }

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote
  }
}

// Hook for entity-specific comments
export function useEntityComments(entityType: string, entityId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchComments = async () => {
      if (!user || !entityId) return
      
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        setComments(data || [])
      } catch (err) {
        console.error('Failed to fetch comments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [entityType, entityId, user])

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          content,
          parent_comment_id: parentCommentId,
          created_by: user.id,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setComments(prev => [...prev, newComment])
      return newComment
    } catch (err) {
      throw new Error('Failed to create comment')
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
      
      if (error) throw error
      
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err) {
      throw new Error('Failed to delete comment')
    }
  }

  return {
    comments,
    loading,
    createComment,
    deleteComment
  }
}

// Hook for entity-specific checklist items
export function useEntityChecklist(entityType: string, entityId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchItems = async () => {
      if (!user || !entityId) return
      
      try {
        const { data, error } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Failed to fetch checklist items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [entityType, entityId, user])

  const createItem = async (title: string, description?: string, dueDate?: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data: newItem, error } = await supabase
        .from('checklist_items')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          title,
          description,
          due_date: dueDate,
          created_by: user.id,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setItems(prev => [newItem, ...prev])
      return newItem
    } catch (err) {
      throw new Error('Failed to create checklist item')
    }
  }

  const updateItem = async (itemId: string, updates: Partial<ChecklistItem>) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) throw error
      
      setItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ))
      return updatedItem
    } catch (err) {
      throw new Error('Failed to update checklist item')
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      throw new Error('Failed to delete checklist item')
    }
  }

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem
  }
}

// Hook for entity-specific activity timeline
export function useEntityTimeline(entityType: string, entityId: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user || !entityId) return
      
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        console.error('Failed to fetch activity timeline:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [entityType, entityId, user])

  return {
    activities,
    loading
  }
}