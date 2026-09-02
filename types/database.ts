// Database types matching the backend schema exactly

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: number
  category_id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Size {
  id: number
  name: string
  sort_order: number
}

export interface Color {
  id: number
  name: string
  hex_code: string | null
}

export interface Product {
  id: number
  category_id: number
  subcategory_id: number | null
  brand_id: number | null
  name: string
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex'
  slug: string
  model_no: string | null
  description: string | null
  sku: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  subcategory?: Subcategory
  brand?: Brand
  product_images?: ProductImage[]
  product_sizes?: ProductSize[]
  product_colors?: ProductColor[]
  inventory?: Inventory[]
}

export interface ProductSize {
  id: number
  product_id: number
  size_id: number
  price: number
  mrp: number
  sku: string | null
  is_active: boolean
  size?: Size
}

export interface ProductColor {
  id: number
  product_id: number
  color_id: number
  color?: Color
}

export interface ProductImage {
  id: number
  product_id: number
  color_id: number | null
  image_url: string
  is_primary: boolean
  sort_order: number
  is_active: boolean
  color?: Color
}

export interface Inventory {
  id: number
  product_id: number
  product_size_id: number
  product_color_id: number | null
  quantity: number
  reserved_quantity: number
  reorder_level: number
  warehouse_location: string | null
  created_at: string
  updated_at: string
  product?: Product
  product_size?: ProductSize & { size?: Size }
  product_color?: ProductColor & { color?: Color }
}

export interface User {
  id: string // UUID from Supabase Auth
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: number
  user_id: string
  label: string
  full_name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  is_default: boolean
  created_at: string
}

export interface Cart {
  id: number
  user_id: string
  product_id: number
  product_size_id: number
  product_color_id: number | null
  quantity: number
  created_at: string
  product?: Product
  product_size?: ProductSize & { size?: Size }
  product_color?: ProductColor & { color?: Color }
}

export interface Wishlist {
  id: number
  user_id: string
  product_id: number
  created_at: string
  product?: Product & { product_images?: ProductImage[] }
}

export interface Coupon {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface Order {
  id: number
  user_id: string
  address_id: number
  coupon_id: number | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  payment_id: string | null
  subtotal: number
  discount_amount: number
  delivery_charge: number
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  user?: User
  address?: Address
  coupon?: Coupon
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_size_id: number
  product_color_id: number | null
  quantity: number
  unit_price: number
  total_price: number
  product?: Product & { product_images?: ProductImage[] }
  product_size?: ProductSize & { size?: Size }
  product_color?: ProductColor & { color?: Color }
}

export interface Review {
  id: number
  user_id: string
  product_id: number
  order_item_id: number | null
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  created_at: string
  user?: User
  product?: Product
}

// Analytics types
export interface DashboardStats {
  total_revenue: number
  total_orders: number
  total_customers: number
  total_products: number
  revenue_growth: number
  orders_growth: number
}

// Storefront Videos
export interface Video {
  id: number
  slot: number
  video_url: string
  source_type: 'upload' | 'url'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type NotificationType =
  | 'order_created'
  | 'order_paid'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  entity_type: string | null
  entity_id: number | null
  is_read: boolean
  created_at: string
  read_at: string | null
}

export interface PushSubscriptionRecord {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
  updated_at: string
}


