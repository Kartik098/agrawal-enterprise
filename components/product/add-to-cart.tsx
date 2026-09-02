'use client'

import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'

type Props = {
  product: { id: string; name: string; price: number; sizes: string[]; stock: number; tone: string; emoji: string; status: string }
}

export function AddToCartSection({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const outOfStock = product.stock === 0 || product.status === 'Draft'

  function handleAddToCart() {
    if (!selectedSize && product.sizes.length > 1) {
      alert('Please select a size')
      return
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {!outOfStock && product.sizes.length > 1 && (
        <div className="mt-7 border-t border-blue-100 pt-6">
          <p className="text-sm font-bold text-blue-900">Select your size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${selectedSize === size ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-200 text-blue-700 hover:border-orange-400'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {!outOfStock && (
        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-blue-200">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-lg font-bold text-blue-700 hover:text-orange-500">−</button>
            <span className="min-w-[2rem] text-center text-sm font-bold text-blue-900">{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-lg font-bold text-blue-700 hover:text-orange-500">+</button>
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        {outOfStock ? (
          <button disabled className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-200 px-6 py-4 font-bold text-blue-400 cursor-not-allowed">
            Out of Stock
          </button>
        ) : (
          <button onClick={handleAddToCart} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition ${added ? 'bg-green-500 shadow-green-200' : 'bg-orange-500 shadow-orange-200 hover:bg-orange-600'}`}>
            {added ? <><Check size={18} /> Added to bag</> : <><ShoppingBag size={18} /> Add to bag</>}
          </button>
        )}
      </div>
    </>
  )
}
