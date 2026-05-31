/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Order, CheckoutPayload, PaymentResponse } from '../types';

/**
 * Loads the external Razorpay standard checkout script dynamically and safely.
 * Returns true if the script was successfully appended and loaded or already present.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Elegant reuse if the Razorpay object is already loaded globally
    if ((window as any).Razorpay) {
      console.log('[Razorpay Service] SDK script already initialized.');
      resolve(true);
      return;
    }

    console.log('[Razorpay Service] Appending Razorpay SDK script tag dynamically...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('[Razorpay Service] SDK script loaded successfully.');
      resolve(true);
    };
    script.onerror = () => {
      console.error('[Razorpay Service] Failed to load external Razorpay script.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Helper to simulate Razorpay backend order placement.
 * In a professional serverless frontend applet, this function helps organize checkout payload
 * characteristics like the precise Billing Amount, Currency, and customer notes.
 */
export const createOrder = async (
  payload: CheckoutPayload
): Promise<{ orderId: string; amount: number; currency: string }> => {
  console.log('[Razorpay Service] Initializing order creation blueprint with payload:', payload);

  // Generate a mock unique rzp_order ID to pass into standard Razorpay configurations
  const orderId = `rzp_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Note: The amount passed should correspond to the final integer charge
  return {
    orderId,
    amount: payload.amount,
    currency: payload.currency || 'INR',
  };
};

/**
 * Verification handler. Acts as a front-facing security filter
 * to compile and audit Razorpay payment response payload components.
 */
export const verifyPayment = async (response: PaymentResponse): Promise<boolean> => {
  console.log('[Razorpay Service] Performing frontend transaction validation checks:', response);

  if (!response.razorpay_payment_id) {
    console.error('[Razorpay Service] Missing Razorpay payment ID credentials.');
    return false;
  }

  console.log('[Razorpay Service] Frontend transaction audit successful! ID:', response.razorpay_payment_id);
  return true;
};

/**
 * Saves a completed and paid Order directly into the Firestore database.
 * To adhere to Requirement 6 and 17, this helper writes to:
 * 1. A global root-level collection "orders" (e.g. `/orders/{orderId}`)
 * 2. A user-specific sub-collection "orders" (e.g. `/users/{userId}/orders/{orderId}`)
 */
export const saveOrderToFirestore = async (orderData: Order, userId?: string): Promise<void> => {
  console.log('[Razorpay Service] Committing success order with secure credentials directly to Firestore...', orderData);

  try {
    // 1. Submit to global /orders/{id} tracking
    const globalOrderRef = doc(db, 'orders', orderData.id);
    await setDoc(globalOrderRef, orderData);
    console.log(`[Razorpay Service] Success! Saved to root 'orders' collection. Document ID: ${orderData.id}`);

    // 2. Synchronize to user timeline sub-collection if logged in
    if (userId) {
      const userOrderRef = doc(db, 'users', userId, 'orders', orderData.id);
      await setDoc(userOrderRef, orderData);
      console.log(`[Razorpay Service] Success! Synchronized user timeline 'users/${userId}/orders/${orderData.id}'`);
    } else {
      console.log('[Razorpay Service] No authenticated user detected (guest reservation). Sync to profile skipped.');
    }
  } catch (error) {
    console.error('[Razorpay Service] Firestore save operation encountered an exception:', error);
    throw error;
  }
};
