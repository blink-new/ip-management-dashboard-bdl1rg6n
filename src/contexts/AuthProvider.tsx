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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // First try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          // If there's a session error, try to get user directly
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) {
              console.error('Error getting user:', userError)
              setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false
              })
              return
            }
            
            // If we have a user but no session, create a minimal session state
            setAuthState({
              user: user,
              session: session,
              isLoading: false,
              isAuthenticated: !!user
            })

            if (user) {
              await updateUserProfile(user)
            }
          } catch (userError) {
            console.error('Error getting user after session error:', userError)
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false
            })
          }
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user
        })

        // Update user profile if user is authenticated
        if (session?.user) {
          await updateUserProfile(session.user)
        }
      } catch (error) {
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
        
        try {
          // Handle different auth events
          if (event === 'SIGNED_OUT') {
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              isAuthenticated: false
            })
            return
          }

          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            setAuthState({
              user: session?.user ?? null,
              session,
              isLoading: false,
              isAuthenticated: !!session?.user
            })

            // Update user profile in database when user signs in
            if (session?.user) {
              await updateUserProfile(session.user)
            }
            return
          }

          // For other events, just update the state
          setAuthState({
            user: session?.user ?? null,
            session,
            isLoading: false,
            isAuthenticated: !!session?.user
          })

        } catch (error) {
          console.error('Error handling auth state change:', error)
          // Don't completely reset state on error, just log it
          console.warn('Continuing with current auth state despite error')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
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
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}