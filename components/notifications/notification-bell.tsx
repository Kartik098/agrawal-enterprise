'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ShoppingBag,
  CircleDollarSign,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  CheckCheck,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { notificationsService } from '@/services/notifications'
import type { Notification } from '@/types/database'

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'order_created':
      return <ShoppingBag size={16} className="text-blue-600" />
    case 'order_paid':
      return <CircleDollarSign size={16} className="text-green-600" />
    case 'order_processing':
      return <Package size={16} className="text-orange-600" />
    case 'order_shipped':
      return <Truck size={16} className="text-indigo-600" />
    case 'order_delivered':
      return <CheckCircle2 size={16} className="text-emerald-600" />
    case 'order_cancelled':
      return <AlertCircle size={16} className="text-red-600" />
    default:
      return <Bell size={16} className="text-blue-600" />
  }
}

export function NotificationBell({ isAdmin = false }: { isAdmin?: boolean }) {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const count = await notificationsService.getUnreadCount(user.id)
      setUnreadCount(count)

      const { data } = await notificationsService.getAll(user.id, { pageSize: 5 })
      setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const viewAllHref = isAdmin ? '/admin/notifications' : '/account/notifications'

  const handleMarkAllRead = async () => {
    if (!user) return
    try {
      await notificationsService.markAllAsRead(user.id)
      setUnreadCount(0)
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleItemClick = async (notif: Notification) => {
    setOpen(false)
    if (!user) return

    if (!notif.is_read) {
      try {
        await notificationsService.markAsRead(user.id, notif.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev =>
          prev.map(n =>
            n.id === notif.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    if (notif.entity_type === 'order' && notif.entity_id) {
      const orderPath = isAdmin
        ? `/admin/orders/${notif.entity_id}`
        : `/account/orders/${notif.entity_id}`
      router.push(orderPath)
    } else {
      router.push(viewAllHref)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-blue-100 bg-white p-3 shadow-xl">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between border-b border-blue-50 pb-2 px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-blue-950 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-orange-500 transition-colors"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="my-2 max-h-80 overflow-y-auto space-y-1">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-blue-400">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition ${
                    notif.is_read
                      ? 'hover:bg-blue-50/60'
                      : 'bg-orange-50/50 hover:bg-orange-50'
                  }`}
                >
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white border border-blue-100 shadow-sm">
                    <NotificationIcon type={notif.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          notif.is_read
                            ? 'font-semibold text-blue-900'
                            : 'font-bold text-blue-950'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-semibold text-blue-400">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-xs text-blue-500">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-semibold text-blue-400">
                No notifications yet
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="border-t border-blue-50 pt-2 px-2 text-center">
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              <span>View all notifications</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
