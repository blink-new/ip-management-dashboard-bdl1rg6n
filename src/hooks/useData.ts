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
    if (!user) return
    
    try {
      setLoading(true)
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [tableName, user])

  const create = async (item: Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data: newItem, error: createError } = await supabase
        .from(tableName)
        .insert({
          ...item,
          user_id: user.id
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Create error:', createError)
        throw createError
      }
      
      setData(prev => [newItem, ...prev])
      return newItem
    } catch (err) {
      console.error('Failed to create item:', err)
      setError(err instanceof Error ? err.message : 'Failed to create item')
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
export const useFilings = () => useEntity<Filing>('filings')
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
    patentFilings: 0,
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
          { data: filings },
          { data: projects },
          { data: startups }
        ] = await Promise.all([
          supabase.from('disclosures').select('*').eq('user_id', user.id),
          supabase.from('filings').select('*').eq('user_id', user.id),
          supabase.from('projects').select('*').eq('user_id', user.id),
          supabase.from('startups').select('*').eq('user_id', user.id)
        ])

        // Filter active disclosures
        const activeDisclosures = (disclosures || []).filter(d => 
          ['Received', 'In Review', 'Approved'].includes(d.stage)
        )

        setStats({
          activeDisclosures: activeDisclosures.length,
          patentFilings: (filings || []).length,
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
          .eq('user_id', user.id)
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
          .eq('user_id', user.id)
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
          .eq('user_id', user.id)
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
          .eq('user_id', user.id)
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