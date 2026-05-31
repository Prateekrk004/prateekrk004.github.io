/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { MenuItem, Order, UserProfile, DashboardStats } from '../types';

/**
 * Service Layer targeting Administrative tasks:
 * - Orders Management
 * - Products Management
 * - Users Management
 * - Analytics Computation
 */
export const adminService = {
  /**
   * Listen to all orders in real-time from the root collection "orders"
   */
  subscribeToAllOrders(onUpdate: (orders: Order[]) => void, onError: (err: any) => void) {
    const ordersPath = 'orders';
    const q = query(collection(db, 'orders'));
    
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({ ...(docSnap.data() as Order), id: docSnap.id });
        });
        // Sort descending by created timestamp or ID
        const sorted = orders.sort((a, b) => {
          const timeA = a.createdTimestamp || 0;
          const timeB = b.createdTimestamp || 0;
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });
        onUpdate(sorted);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, ordersPath);
        onError(error);
      }
    );
  },

  /**
   * Listen to all products (MenuItem) in real-time
   */
  subscribeToAllProducts(onUpdate: (products: MenuItem[]) => void, onError: (err: any) => void) {
    const productsPath = 'products';
    return onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const products: MenuItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          products.push({
            id: docSnap.id,
            name: data.name || 'Gourmet Meat Selection',
            category: data.category || 'Signature Mains',
            price: typeof data.price === 'number' ? data.price : 999,
            description: data.description || 'Premium hand-selected gourmet cuts cooked to sheer culinary perfection.',
            rating: typeof data.rating === 'number' ? data.rating : 4.8,
            image: data.image || '',
            available: data.available !== false,
            spiceLevel: data.spiceLevel || 'Medium',
            spicyCount: data.spicyCount || 2,
          });
        });
        onUpdate(products);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, productsPath);
        onError(error);
      }
    );
  },

  /**
   * Listen to all users in real-time
   */
  subscribeToAllUsers(onUpdate: (users: (UserProfile & { uid: string })[]) => void, onError: (err: any) => void) {
    const usersPath = 'users';
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users: (UserProfile & { uid: string })[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserProfile;
          users.push({
            uid: docSnap.id,
            name: data.name || 'Anonymous Epicurean',
            email: data.email || '',
            phone: data.phone || '',
            isBlackCard: !!data.isBlackCard,
            role: data.role || (data.email === 'Prateekrk1234@gmail.com' ? 'admin' : 'customer'),
            isAdmin: data.isAdmin || data.email === 'Prateekrk1234@gmail.com',
          });
        });
        onUpdate(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, usersPath);
        onError(error);
      }
    );
  },

  /**
   * Update the status of an order in both root '/orders/{orderId}' and specific user subcollection '/users/{userId}/orders/{orderId}'
   */
  async updateOrderStatus(
    order: Order,
    newStatus: Order['status'],
    userId?: string
  ): Promise<void> {
    const globalPath = `orders/${order.id}`;
    console.log(`[Admin Service] Updating order ${order.id} status to ${newStatus}`);
    
    try {
      // 1. Update root orders record
      const globalRef = doc(db, 'orders', order.id);
      await updateDoc(globalRef, { status: newStatus });

      // 2. Update user-specific copies if synchronized
      if (userId) {
        const userPath = `users/${userId}/orders/${order.id}`;
        const userRef = doc(db, 'users', userId, 'orders', order.id);
        await updateDoc(userRef, { status: newStatus }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, userPath);
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, globalPath);
    }
  },

  /**
   * Add a new product to root '/products/{id}' and automatically assign random ID if missing
   */
  async createProduct(product: Omit<MenuItem, 'id'> & { id?: string }): Promise<string> {
    const finalId = product.id?.trim() || `prod-${Math.floor(1000 + Math.random() * 9000)}`;
    const productPath = `products/${finalId}`;
    
    console.log(`[Admin Service] Committing new product ${finalId} to Firestore catalog`);
    try {
      const docRef = doc(db, 'products', finalId);
      const payload = {
        name: product.name,
        category: product.category,
        price: Number(product.price),
        description: product.description,
        rating: Number(product.rating || 4.7),
        image: product.image || '',
        available: product.available !== false,
        spiceLevel: product.spiceLevel || 'Medium',
        spicyCount: Number(product.spicyCount || 2)
      };
      await setDoc(docRef, payload);
      return finalId;
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, productPath);
       throw error;
    }
  },

  /**
   * Update existing product details in root '/products/{id}'
   */
  async updateProduct(id: string, productUpdate: Partial<MenuItem>): Promise<void> {
    const productPath = `products/${id}`;
    console.log(`[Admin Service] Saving edits for product ${id}`);
    try {
      const docRef = doc(db, 'products', id);
      const payload: Record<string, any> = {};
      if (productUpdate.name !== undefined) payload.name = productUpdate.name;
      if (productUpdate.category !== undefined) payload.category = productUpdate.category;
      if (productUpdate.price !== undefined) payload.price = Number(productUpdate.price);
      if (productUpdate.description !== undefined) payload.description = productUpdate.description;
      if (productUpdate.rating !== undefined) payload.rating = Number(productUpdate.rating);
      if (productUpdate.image !== undefined) payload.image = productUpdate.image;
      if (productUpdate.available !== undefined) payload.available = productUpdate.available;
      if (productUpdate.spiceLevel !== undefined) payload.spiceLevel = productUpdate.spiceLevel;
      if (productUpdate.spicyCount !== undefined) payload.spicyCount = Number(productUpdate.spicyCount);

      await updateDoc(docRef, payload);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, productPath);
       throw error;
    }
  },

  /**
   * Delete product from root '/products/{id}'
   */
  async deleteProduct(id: string): Promise<void> {
    const productPath = `products/${id}`;
    console.log(`[Admin Service] Deleting product ${id} from database`);
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, productPath);
      throw error;
    }
  },

  /**
   * Calculates dashboard analytics on a supplied array of all orders and users
   */
  calculateAnalytics(allOrders: Order[], totalUsersCount: number): DashboardStats {
    let totalRevenue = 0;
    const productFreq: Record<string, { quantity: number; revenue: number }> = {};

    allOrders.forEach((order) => {
      // Calculate revenue if paid
      if (order.paymentStatus === 'Paid') {
        totalRevenue += order.total;
      }
      
      order.items.forEach((item) => {
        const key = item.name;
        if (!productFreq[key]) {
          productFreq[key] = { quantity: 0, revenue: 0 };
        }
        productFreq[key].quantity += item.quantity;
        productFreq[key].revenue += item.price * item.quantity;
      });
    });

    const topSellingProducts = Object.entries(productFreq)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      totalUsers: totalUsersCount,
      topSellingProducts,
    };
  }
};
