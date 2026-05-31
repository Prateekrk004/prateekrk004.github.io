/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'Starters' | 'Signature Mains' | 'Coastal Seafood' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  rating?: number;
  description: string;
  image?: string;
  icon?: string; // fallback icon name if no image
  spiceLevel?: 'Mild' | 'Medium' | 'Extra Spicy';
  spicyCount?: number; // number of chilies/flames
  available?: boolean;
}

export interface CartItem {
  id: string; // unique random id for instance in cart (to allow varying customizations)
  item: MenuItem;
  quantity: number;
  selectedSpice?: 'Mild' | 'Medium' | 'Extra Spicy';
  enhancements: { name: string; price: number }[];
  totalPriceCalculated: number; // calculated full item price (item + selected enhancements) * quantity
}

export interface Reservation {
  id: string;
  partySize: string;
  date: string;
  time: string;
  specialRequests?: string;
  confirmedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isBlackCard: boolean;
  role?: 'customer' | 'admin';
  isAdmin?: boolean;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  date: string;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Shipped';
  customerDetails?: CustomerDetails;
  razorpayPaymentId?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  createdTimestamp?: number;
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface CheckoutPayload {
  amount: number;
  currency: string;
  customerDetails: CustomerDetails;
  notes?: string;
}

export interface SavedLocation {
  id: string;
  label: string; // "PRIMARY RESIDENCE", "OFFICE", etc.
  address: string;
  city: string;
  postalCode: string;
  instructions?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
}
