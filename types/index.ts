export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string | null;
  weight_g: number | null;
  pieces: number | null;
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  category: { id: string; name: string };
}

export interface DeliveryResult {
  available: boolean;
  distance_km?: number;
  delivery_fee?: string;
  min_order_amount?: string;
  zone_name?: string;
  estimated_minutes?: number;
  message?: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: string;
  changed_at: string;
  changed_by: string;
  note: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_fee: string;
  subtotal: string;
  total: string;
  payment_method: string;
  notes: string;
  created_at: string;
  items: OrderItem[];
  status_history?: StatusHistoryEntry[];
  confirmed_at?: string | null;
  cooking_started_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  estimated_delivery_minutes?: number | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
