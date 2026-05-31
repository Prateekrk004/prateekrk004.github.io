/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { products, Product } from '../data/products';

/**
 * HELPER FUNCTION (For Future Integration)
 * ----------------------------------------
 * Fetches all uploaded food products from the Firestore "products" collection.
 * This can be used on any home page, menu screen or store routing component to display
 * the dynamically uploaded food menu items live from the database.
 * 
 * @returns A promise that resolves to an array of Products fetched from Firestore.
 */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const productsColRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsColRef);
    const fetchedList: Product[] = [];
    
    querySnapshot.forEach((docSnap) => {
      fetchedList.push(docSnap.data() as Product);
    });
    
    console.log(`[Firestore] Successfully fetched ${fetchedList.length} products for render lifecycle.`);
    return fetchedList;
  } catch (error) {
    console.error('[Firestore] Error fetching products:', error);
    return [];
  }
}

/**
 * UTILITY: SLUG GENERATOR FOR ID DETERMINISM
 * -----------------------------------------
 * Converts a food item name (e.g., "Aged Basmati Mutton Biryani") into a URL-safe, lowercase ID
 * (e.g., "aged-basmati-mutton-biryani").
 * 
 * Why this is crucial:
 * If we use random Firestore auto-IDs (like addDoc), every time the page refreshes during development,
 * a brand new duplicate duplicate document is saved, driving up database storage cost and creating mess.
 * By using a static slug as the Document ID, subsequent runs of the upload script overwrite/refresh the same documents
 * instead of creating duplicates.
 */
function generateDocumentId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special symbols with hyphens
    .replace(/(^-|-$)+/g, '');   // Clean trailing/leading hyphens
}

/**
 * MAIN BULK UPLOADER FUNCTION
 * ---------------------------
 * How this upload system works:
 * 1. Loops through our list of 25 premium non-veg items in `products.ts`.
 * 2. Generates a unique, reproducible Document ID using each item's name.
 * 3. Checks if the document already exists in Firestore.
 * 4. Checks status and makes a setDoc() call to store/match the object.
 * 5. Logs detailed upload status metrics.
 * 
 * ⚠️ IMPORTANT PRODUCTION INSTRUCTIONS:
 * -----------------------------------
 * Once the console logs successful upload, you SHOULD remove the upload trigger import 
 * inside `main.tsx`!
 * Keeping this auto-run execution inside the main.tsx bootstrap file means every application client in the 
 * wild will repeatedly attempt to re-upload the static catalog on page loads, consuming unnecessary network/database activity.
 */
export async function uploadProductsToFirestore(): Promise<void> {
  console.log('🚀 [Menu Uploader] Initiating bulk upload of 25 gourmet restaurant products to Firestore...');
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const docId = generateDocumentId(product.name);
    const docRef = doc(db, 'products', docId);

    try {
      // 1. Check if the product already exists to protect data integrity and avoid duplicate writes
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        // Check if there are any updates, if yes update, otherwise skip to prevent redundant billing cycles.
        if (
          existingData.price === product.price &&
          existingData.available === product.available &&
          existingData.category === product.category &&
          existingData.rating === product.rating &&
          existingData.image === product.image
        ) {
          skippedCount++;
          continue;
        }
      }

      // 2. Perform write/update
      await setDoc(docRef, {
        ...product,
        id: docId, // append deterministic id inside document structure for general convenience
        uploadedAt: new Date().toISOString()
      }, { merge: true });

      successCount++;
      console.log(`✅ [Menu Uploader] Succesfully synced product: "${product.name}" (ID: ${docId})`);
    } catch (error) {
      errorCount++;
      console.error(`❌ [Menu Uploader] Failed to upload product "${product.name}":`, error);
    }
  }

  console.log('========================================================================');
  console.log('🎉 [Menu Uploader] Bulk sync execution report:');
  console.log(`   - Total Processed : ${products.length}`);
  console.log(`   - Newly Uploaded/Updated: ${successCount}`);
  console.log(`   - Skipped (Up-to-date)  : ${skippedCount}`);
  console.log(`   - Encountered Errors    : ${errorCount}`);
  console.log('🌟 [Menu Uploader] Pro tip: Comment out uploadProductsToFirestore() in main.tsx now!');
  console.log('========================================================================');
}
