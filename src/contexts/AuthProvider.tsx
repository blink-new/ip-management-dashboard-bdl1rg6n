import React, { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext, AuthState, AuthContextType } from '@/lib/auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  })

  const updateUserProfile = async (user: User) => {
    try {
      if (!user?.email) {
        console.warn('No user email provided to updateUserProfile')
        return
      }

      // First check if user exists in ip_users table
      const { data: existingUser, error: fetchError } = await supabase
        .from('ip_users')
        .select('*')
        .eq('email', user.email)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError)
        // Don't return here, continue with creating new user
      }

      if (existingUser && !fetchError) {
        // Update existing user
        const { error } = await supabase
          .from('ip_users')
          .update({
            auth_user_id: user.id,
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email)

        if (error) {
          console.error('Error updating user profile:', error)
        } else {
          console.log('Successfully updated user profile for:', user.email)
        }
      } else {
        // Create new user profile
        const { error } = await supabase
          .from('ip_users')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'Innovation Admin',
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating user profile:', error)
        } else {
          console.log('Successfully created user profile for:', user.email)
        }
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      // Don't throw the error, just log it
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - setting to not authenticated')
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }, 10000) // 10 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        clearTimeout(loadingTimeout)
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false
          })
          return
        }

        console.log('Session retrieved:', !!session?.user)
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user
        })

        // Update user profile if user is authenticated (but don't block on it)
        if (session?.user) {
          updateUserProfile(session.user).catch(error => {
            console.error('Error updating user profile (non-blocking):', error)
          })
        }
      } catch (error) {
        if (!mounted) return
        clearTimeout(loadingTimeout)
        console.error('Error in getInitialSession:', error)
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    getInitialSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (!mounted) return
        
        // Always update the auth state first (non-blocking)
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user
        })

        // Handle user profile updates in background (non-blocking)
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          updateUserProfile(session.user).catch(error => {
            console.error('Error updating user profile (non-blocking):', error)
          })
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: 'Innovation Admin'
        }
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}