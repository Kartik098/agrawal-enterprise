'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { notificationsService } from '@/services/notifications'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { PageLoader, Toast } from '@/components/ui/states'
import {
  NotificationIcon,
  formatRelativeTime,
} from '@/components/notifications/notification-bell'
import type { Notification, NotificationType } from '@/types/database'

export default function AdminNotificationsPage() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login?next=/admin/notifications')
      } else if (profile && !isAdmin) {
        router.replace('/account')
      }
    }
  }, [user, profile, authLoading, isAdmin, router])

  const fetchNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const isReadParam =
        filterRead === 'unread' ? false : filterRead === 'read' ? true : undefined
      const typeParam = filterType !== 'all' ? (filterType as NotificationType) : undefined

      const { data, count } = await notificationsService.getAll(user.id, {
        page,
        pageSize,
        isRead: isReadParam,
        type: typeParam,
      })

      setNotifications(data)
      setTotalCount(count)
    } catch (err) {
      console.error('Error fetching admin notifications:', err)
      setToast({ msg: 'Failed to load notifications', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchNotifications()
    }
  }, [user, isAdmin, page, filterRead, filterType])

  const handleMarkAsRead = async (id: string) => {
    if (!user) return
    try {
      await notificationsService.markAsRead(user.id, id)
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      )
      setToast({ msg: 'Notification marked as read', type: 'success' })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      setToast({ msg: 'Failed to update notification', type: 'error' })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await notificationsService.markAllAsRead(user.id)
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setToast({ msg: 'All notifications marked as read', type: 'success' })
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setToast({ msg: 'Failed to update notifications', type: 'error' })
    }
  }

  if (authLoading || !user || !isAdmin) {
    return (
      <main className="min-h-screen bg-blue-50">
        <AdminNav active="/admin/notifications" />
        <div className="lg:pl-72">
          <AdminTopbar onMenuClick={() => setMenuOpen(true)} />
          <PageLoader label="Checking admin permissions..." />
        </div>
      </main>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/notifications" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => setMenuOpen(true)} />

        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                Console
              </p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Admin Notifications</h1>
              <p className="mt-2 text-sm text-blue-500">
                System alerts and new order activity for administrators.
              </p>
            </div>

            {notifications.some(n => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition"
              >
                <CheckCheck size={18} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm">
            {/* Read status tabs */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'read', label: 'Read' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setFilterRead(tab.id as any)
                    setPage(1)
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    filterRead === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-blue-400" />
              <select
                value={filterType}
                onChange={e => {
                  setFilterType(e.target.value)
                  setPage(1)
                }}
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-900 outline-none focus:border-orange-400"
              >
                <option value="all">All Types</option>
                <option value="order_created">New Orders</option>
                <option value="order_paid">Payment Received</option>
                <option value="order_processing">Processing</option>
                <option value="order_shipped">Shipped</option>
                <option value="order_delivered">Delivered</option>
                <option value="order_cancelled">Cancelled</option>
                <option value="system">System Alerts</option>
              </select>
            </div>
          </div>

          {/* Notification List */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="rounded-2xl border bg-white p-12 text-center text-sm font-semibold text-blue-400 shadow-sm">
                Loading admin notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 transition shadow-sm ${
                    notif.is_read
                      ? 'bg-white border-blue-100'
                      : 'bg-orange-50/40 border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white border border-blue-100 shadow-sm">
                      <NotificationIcon type={notif.type} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm ${
                            notif.is_read
                              ? 'font-bold text-blue-950'
                              : 'font-black text-blue-950'
                          }`}
                        >
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">
                            New
                          </span>
                        )}
                        <span className="text-xs text-blue-400">
                          • {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-blue-600">{notif.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {notif.entity_type === 'order' && notif.entity_id && (
                      <Link
                        href={`/admin/orders/${notif.entity_id}`}
                        className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:border-orange-400 hover:text-orange-500 transition"
                      >
                        View Order #{notif.entity_id}
                      </Link>
                    )}

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="rounded-xl bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-200 transition"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-400 mb-4">
                  <Bell size={28} />
                </div>
                <h3 className="text-lg font-black text-blue-950">No notifications</h3>
                <p className="mt-1 text-sm text-blue-400">
                  No admin notifications matching your current filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-blue-100 pt-6">
              <p className="text-xs font-semibold text-blue-500">
                Showing page {page} of {totalPages} ({totalCount} total)
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:border-orange-400 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:border-orange-400 disabled:opacity-50 transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
