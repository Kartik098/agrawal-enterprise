// Database types matching the backend schema exactly

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
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
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Size {
  id: string
  name: string
  sort_order: number
}

export interface Color {
  id: string
  name: string
  hex_code: string | null
}

export interface Product {
  id: string
  category_id: string
  subcategory_id: string | null
  brand_id: string | null
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
  id: string
  product_id: string
  size_id: string
  price: number
  mrp: number
  sku: string | null
  is_active: boolean
  size?: Size
}

export interface ProductColor {
  id: string
  product_id: string
  color_id: string
  color?: Color
}

export interface ProductImage {
  id: string
  product_id: string
  color_id: string | null
  image_url: string
  is_primary: boolean
  sort_order: number
  is_active: boolean
  color?: Color
}

export interface Inventory {
  id: string
  product_id: string
  product_size_id: string
  product_color_id: string | null
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
  id: string
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
  id: string
  user_id: string
  product_id: string
  product_size_id: string
  product_color_id: string | null
  quantity: number
  created_at: string

  product?: Product
  product_size?: ProductSize & { size?: Size }
  product_color?: ProductColor & { color?: Color }
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string

  product?: Product & {
    product_images?: ProductImage[]
  }
}

export interface Coupon {
  id: string
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
  id: string
  user_id: string
  address_id: string
  coupon_id: string | null
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
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
  id: string
  order_id: string
  product_id: string
  product_size_id: string
  product_color_id: string | null
  quantity: number
  unit_price: number
  total_price: number

  product?: Product & {
    product_images?: ProductImage[]
  }

  product_size?: ProductSize & {
    size?: Size
  }

  product_color?: ProductColor & {
    color?: Color
  }
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_item_id: string | null
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
  id: string
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
  entity_id: string | null
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

export interface CarouselItem {
  id: string
  title: string | null
  image_url: string
  brand_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string

  brand?: Brand
}