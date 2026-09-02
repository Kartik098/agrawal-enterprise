import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-50/40 text-center p-4">
      <div>
        <p className="text-8xl font-black text-blue-200">404</p>
        <h1 className="mt-4 text-3xl font-black text-blue-950">Page not found</h1>
        <p className="mt-3 max-w-sm text-blue-500">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">Go home</Link>
        <Link href="/products" className="rounded-full border border-blue-200 px-6 py-3 font-bold text-blue-700 hover:border-orange-400">Shop products</Link>
      </div>
    </main>
  )
}
