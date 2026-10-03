export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  category: 'electronics' | 'lifestyle' | 'comfort' | 'accessories';
  inStock: boolean;
  stockCount: number;
  badge?: string;
  image: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isHotDropship?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type PaymentMethod = 'cod' | 'local_wallet' | 'card';

export interface OrderDetails {
  orderId: string;
  createdAt: string;
  fullDate: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentStatus: 'unpaid_cod' | 'paid_verified' | 'pending_verification';
  customer: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    notes?: string;
  };
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface StorePaymentConfig {
  storeName: string;
  currency: string;
  codEnabled: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankAccountInfo: string;
  whatsappSupportNumber: string;
}
