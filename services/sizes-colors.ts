import { supabase } from '@/lib/supabase'
import type { Size, Color } from '@/types/database'

export const sizesService = {
  async getAll(): Promise<Size[]> {
    const { data, error } = await supabase.from('sizes').select('*').order('sort_order')
    if (error) throw error
    return data || []
  },

  async create(name: string, sortOrder = 0): Promise<Size> {
    const { data, error } = await supabase.from('sizes').insert({ name, sort_order: sortOrder }).select().single()
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Size>): Promise<Size> {
    const { data, error } = await supabase.from('sizes').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('sizes').delete().eq('id', id)
    if (error) throw error
  },
}

export const colorsService = {
  async getAll(): Promise<Color[]> {
    const { data, error } = await supabase.from('colors').select('*').order('name')
    if (error) throw error
    return data || []
  },

  async create(name: string, hexCode?: string): Promise<Color> {
    const { data, error } = await supabase.from('colors').insert({ name, hex_code: hexCode || null }).select().single()
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Color>): Promise<Color> {
    const { data, error } = await supabase.from('colors').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('colors').delete().eq('id', id)
    if (error) throw error
  },
}
