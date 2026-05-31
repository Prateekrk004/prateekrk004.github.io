/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../lib/firebase';
import { collection, getDocs, DocumentData, doc, deleteDoc } from 'firebase/firestore';
import { CategoryType, MenuItem } from '../types';

/**
 * Interface representing the structure of a Product stored in Firestore.
 */
export interface FirestoreProduct {
  id: string;
  name: string;
  price: number;
  category: CategoryType;
  rating: number;
  available: boolean;
  image: string;
  description?: string;
  spiceLevel?: 'Mild' | 'Medium' | 'Extra Spicy';
  spicyCount?: number;
  uploadedAt?: string;
}

/**
 * Service to interact with parent product structures in Firestore.
 */
export const productService = {
  /**
   * Fetches all gourmet products from the Firestore "products" collection.
   * Transforms raw Firestore documents into standardized MenuItem objects 
   * to ensure full compatibility with existing UI components and cart logic.
   * 
   * Includes loading/error state safety and logs achievements to the logging stream.
   */
  async getAllProducts(): Promise<MenuItem[]> {
    console.log('[Product Service] Initiating real-time Firestore catalog fetch from "products" collection...');
    try {
      const colRef = collection(db, 'products');
      const querySnapshot = await getDocs(colRef);
      
      const items: MenuItem[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        const productName = data.name;
        const productImage = data.image;
        const productRating = data.rating;

        // Check if the item is corrupt or is the specific unwanted "Gourmet Selection" item
        // specified by the user (no image, has rating of 4.8, or named Gourmet Selection with no image)
        const isTargetForRemoval =
          !productName ||
          productName === 'Gourmet Selection' ||
          (productName.toLowerCase() === 'gourmet selection' && (!productImage || productImage.trim() === '')) ||
          (!productImage && productRating === 4.8);

        if (isTargetForRemoval) {
          console.warn(`[Product Service] Detected unwanted / corrupt Gourmet Selection item (ID: ${docSnap.id}, Name: ${productName}, Rating: ${productRating}). Deleting from Firestore and filtering out of view...`);
          try {
            const docRef = doc(db, 'products', docSnap.id);
            deleteDoc(docRef);
          } catch (e) {
            console.error('[Product Service] Error executing background delete of corrupt document:', e);
          }
          return; // Skip adding this item to the dynamic loading list
        }

        const validName = productName || 'Gourmet Selection';
        const productCategory = data.category || 'Signature Mains';
        
        // Generate beginner-friendly default description if not explicitly provided in the DB
        const fallbackDesc = getDefaultDescription(validName, productCategory);

        // Map Firestore document data to MenuItem format
        const menuItem: MenuItem = {
          id: docSnap.id || data.id,
          name: validName,
          category: productCategory as CategoryType,
          price: typeof data.price === 'number' ? data.price : 999,
          rating: typeof productRating === 'number' ? productRating : 4.8,
          description: data.description || fallbackDesc,
          image: productImage || '',
          available: data.available !== false, // Default to true if not specified
          spiceLevel: data.spiceLevel || getSpiceLevelFallback(validName),
          spicyCount: data.spicyCount || getSpicyCountFallback(validName),
        };
        
        items.push(menuItem);
      });
      
      console.log(`✅ [Product Service] Successfully fetched and typed ${items.length} products dynamically from Firestore.`);
      return items;
    } catch (error) {
      console.error('❌ [Product Service] Failed to retrieve products from Firestore:', error);
      throw error;
    }
  }
};

/**
 * HELPER: Generates rich, realistic descriptions for products missing a static description field.
 */
function getDefaultDescription(name: string | undefined | null, category: string | undefined | null): string {
  const nameStr = (name || '').toString();
  const categoryStr = (category || '').toString();
  const nameLower = nameStr.toLowerCase();
  
  if (nameLower.includes('burger')) {
    return 'Gourmet hand-crafted patty griddled to perfection, stacked with melted artisanal cheese, heirloom tomatoes, and custom-infused house glaze.';
  }
  if (nameLower.includes('biryani')) {
    return 'Aged premium basmati rice parboiled with exotic spices, layered with tender charcoal-cooked proteins, and sealed for full slow-dum perfection.';
  }
  if (nameLower.includes('wings') || nameLower.includes('crispy')) {
    return 'Marinated in signature heat rub, cooked until crisp, and tossed extensively in our custom honey-glazed soy and wild peppercorn reduction.';
  }
  if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('seafood') || nameLower.includes('lobster') || nameLower.includes('crab') || nameLower.includes('prawn')) {
    return 'Fresh wild-caught luxury seafood hand-seared by culinary masters, served alongside saffron-infused reduction and fresh microgreens.';
  }
  if (nameLower.includes('curry') || nameLower.includes('nihari') || nameLower.includes('kebab')) {
    return 'A legendary slow-cooked dish infused with roasted cardamoms and hand-ground spices, creating a luxuriously rich and velvety master gravy.';
  }
  if (categoryStr === 'Desserts') {
    return 'A luxury sweet confection prepared by our master pastry chef with delicate floral essences, rich cream, and gold-leaf garnishes.';
  }
  
  return 'Sovereign kitchen masterpiece. Meticulously selected by Alexander Sterling and prepared over live open flames for an unforgettable fine dining experience.';
}

/**
 * HELPER: Suggests appropriate spice level based on product names.
 */
function getSpiceLevelFallback(name: string | undefined | null): 'Mild' | 'Medium' | 'Extra Spicy' | undefined {
  const nameStr = (name || '').toString();
  const nameLower = nameStr.toLowerCase();
  if (nameLower.includes('peri-peri') || nameLower.includes('crab') || nameLower.includes('wings')) {
    return 'Extra Spicy';
  }
  if (nameLower.includes('biryani') || nameLower.includes('nihari') || nameLower.includes('curry')) {
    return 'Medium';
  }
  if (nameLower.includes('kebab') || nameLower.includes('prawn') || nameLower.includes('tikka')) {
    return 'Mild';
  }
  return undefined;
}

/**
 * HELPER: Suggests spicy visual chilies count based on name.
 */
function getSpicyCountFallback(name: string | undefined | null): number | undefined {
  const level = getSpiceLevelFallback(name);
  if (level === 'Extra Spicy') return 3;
  if (level === 'Medium') return 2;
  if (level === 'Mild') return 1;
  return undefined;
}
