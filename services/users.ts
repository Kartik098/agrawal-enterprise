import { supabase } from '@/lib/supabase'
import type { User, Address } from '@/types/database'

export const authService = {
  async signUp(email: string, password: string, fullName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  async getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  onAuthChange(callback: (user: import('@supabase/supabase-js').User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  },
}
export const usersService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return null
    return data
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAllCustomers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()
    return data?.is_admin || false
  },
}

export const addressesService = {
  async getAll(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(userId: string, address: Omit<Address, 'id' | 'user_id' | 'created_at'>): Promise<Address> {
    // If setting as default, clear other defaults first
    if (address.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    }
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...address, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: number, userId: string, updates: Partial<Address>): Promise<Address> {
    if (updates.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    }
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (error) throw error
  },

  async setDefault(id: number, userId: string): Promise<void> {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  },
}

