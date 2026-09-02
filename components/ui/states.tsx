import { AlertCircle, Loader2 } from 'lucide-react'
import type { HTMLAttributes } from 'react'

export function LoadingSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-orange-500 ${className}`} />
}

export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-blue-500">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
      <AlertCircle size={20} className="shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {icon && <p className="text-6xl">{icon}</p>}
      <div>
        <h3 className="text-xl font-black text-blue-950">{title}</h3>
        {description && <p className="mt-2 text-sm text-blue-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-xl bg-blue-100 ${className}`} {...props} />
}

export function ProductCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-3 w-16 rounded" />
      <Skeleton className="mt-2 h-4 w-32 rounded" />
      <Skeleton className="mt-2 h-4 w-20 rounded" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-t">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  )
}

export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl ${colors[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
    </div>
  )
}
