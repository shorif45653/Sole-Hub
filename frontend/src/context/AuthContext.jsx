import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { isSupabaseConfigured, supabase } from '../services/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile
  const fetchProfile = useCallback(async (userId, fallbackName = 'SoleHub Customer', fallbackPhone = null, fallbackEmail = null) => {
    if (!supabase || !isSupabaseConfigured) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      if (!data && error?.code === 'PGRST116') {
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fallbackName,
            phone: fallbackPhone,
            email: fallbackEmail
          }, { onConflict: 'id' })
          .select()
          .single()
        setProfile(createdProfile)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (!supabase || !isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id, session.user.user_metadata?.full_name, session.user.user_metadata?.phone, session.user.email)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    if (!supabase || !isSupabaseConfigured) return undefined

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id, session.user.user_metadata?.full_name, session.user.user_metadata?.phone, session.user.email)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Sign up
  const signUp = async (email, password, fullName, phone = null) => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone }
        }
      })
      
      if (error) throw error
      
      // Profile is created on first fetch (see fetchProfile)
      if (data?.session?.user) {
        await fetchProfile(data.session.user.id, fullName, phone, email)
      }
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      // Load the role before signIn resolves so callers can route admins correctly.
      if (data?.user) {
        setUser(data.user)
        await fetchProfile(data.user.id, data.user.user_metadata?.full_name, data.user.user_metadata?.phone, data.user.email)
      }
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Sign out
  const signOut = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') }
    
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    loading,
    error,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
