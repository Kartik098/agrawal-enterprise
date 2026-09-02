import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'

export interface NotificationFilters {
  type?: Notification['type']
  isRead?: boolean
  page?: number
  pageSize?: number
}

export const notificationsService = {
  async getAll(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<{ data: Notification[]; count: number }> {
    const { type, isRead, page = 1, pageSize = 20 } = filters

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (type) {
      query = query.eq('type', type)
    }

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead)
    }

    query = query.order('created_at', { ascending: false })

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query

    if (error) throw error

    return { data: data || [], count: count || 0 }
  },

  async getById(
    userId: string,
    id: string
  ): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error

    return count || 0
  },

  async markAsRead(
    userId: string,
    id: string
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  },

  async create(
    notification: Omit<
      Notification,
      'id' | 'created_at' | 'is_read' | 'read_at'
    >
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error

    return data
  },
}