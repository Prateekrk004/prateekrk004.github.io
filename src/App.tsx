/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_USER_PROFILE,
  INITIAL_ORDERS,
  INITIAL_SAVED_LOCATIONS,
} from './data';
import { MenuItem, CartItem, Order, UserProfile, SavedLocation, CategoryType } from './types';
import { useFirebase } from './context/FirebaseContext';
import { productService } from './services/productService';
import { MenuItemCard } from './components/MenuItemCard';
import { CartDrawer } from './components/CartDrawer';
import { ReservationModal } from './components/ReservationModal';
import { ChatOverlay } from './components/ChatOverlay';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './screens/AdminDashboard';
import {
  Award,
  BookOpen,
  User,
  ShoppingBag,
  CalendarDays,
  Search,
  SlidersHorizontal,
  Flame,
  Check,
  Compass,
  Sparkles,
  ChevronRight,
  MapPin,
  UtensilsCrossed,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const {
    user,
    profile,
    orders,
    locations: savedLocations,
    signIn,
    logOut,
    updateUserProfile,
    addSavedLocation,
    removeSavedLocation,
    addOrder,
    addReservation,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<'menu' | 'profile' | 'admin'>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPremium, setOnlyPremium] = useState(false);

  // Firestore Products States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);

  // Fetch Firestore products dynamically
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      setProductFetchError(null);
      try {
        const fetched = await productService.getAllProducts();
        if (active) {
          setMenuItems(fetched);
          console.log(`[App] Successfully initialized ${fetched.length} dynamic Firestore products.`);
        }
      } catch (err) {
        console.error('[App] Failed to load products from Firestore:', err);
        if (active) {
          setProductFetchError(err instanceof Error ? err.message : String(err));
          // Always fallback gracefully to local list so there's never a broken blank screen
          setMenuItems(INITIAL_MENU_ITEMS);
        }
      } finally {
        if (active) {
          setIsProductsLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  // Add Item to global Bag State
  const handleAddToBag = (
    item: MenuItem,
    quantity: number,
    selectedSpice?: 'Mild' | 'Medium' | 'Extra Spicy',
    enhancements: { name: string; price: number }[] = []
  ) => {
    const enhancementSum = enhancements.reduce((sum, e) => sum + e.price, 0);
    const costPerItem = item.price + enhancementSum;

    // Check if matching item is already in cart
    const sameItemIndex = cart.findIndex(
      (c) =>
        c.item.id === item.id &&
        c.selectedSpice === selectedSpice &&
        JSON.stringify(c.enhancements) === JSON.stringify(enhancements)
    );

    if (sameItemIndex > -1) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[sameItemIndex].quantity + quantity;
      updatedCart[sameItemIndex].quantity = newQuantity;
      updatedCart[sameItemIndex].totalPriceCalculated = costPerItem * newQuantity;
      setCart(updatedCart);
    } else {
      const freshCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item,
        quantity,
        selectedSpice,
        enhancements,
        totalPriceCalculated: costPerItem * quantity,
      };
      setCart([...cart, freshCartItem]);
    }
  };

  const handleRemoveItemFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const handleClearCart = () => setCart([]);

  const handleConfirmOrder = (newOrder: Order) => {
    addOrder(newOrder);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    updateUserProfile(updatedProfile);
  };

  const handleAddLocation = (newLoc: SavedLocation) => {
    addSavedLocation(newLoc);
  };

  const handleRemoveLocation = (id: string) => {
    removeSavedLocation(id);
  };

  // Filter computations
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPremium = !onlyPremium || (item.rating && item.rating >= 4.8);
    return matchesCategory && matchesSearch && matchesPremium;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/3 w-full max-w-4xl h-96 bg-gradient-to-b from-gold-950/15 to-transparent blur-[160px] pointer-events-none" />

      {/* LUXURY EMBOSSED NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-xl border-b border-stone-900/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand Brandmark */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-lg shadow-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h1 className="font-serif text-xl tracking-wider text-stone-100 uppercase font-medium flex items-center gap-1.5">
                Luxe Meats
              </h1>
              <p className="text-[8px] font-mono tracking-widest text-gold-400 uppercase">
                Fine Purveyors & Sommelier Reserve
              </p>
            </div>
          </div>

          {/* Core Tab Toggles */}
          <nav className="flex items-center gap-1 bg-stone-900/40 p-1.5 rounded-xl border border-stone-900/80">
            <button
              id="tab-toggle-menu"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-serif tracking-widest uppercase transition-all duration-350 cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-gold-500/10 text-gold-300 border border-gold-500/25'
                  : 'text-stone-400 hover:text-stone-200 border border-transparent'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Signature Menu</span>
            </button>
            <button
              id="tab-toggle-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-serif tracking-widest uppercase transition-all duration-350 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gold-500/10 text-gold-300 border border-gold-500/25'
                  : 'text-stone-400 hover:text-stone-200 border border-transparent'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-gold-500/80" />
              <span>Proprietor Portal</span>
            </button>
          </nav>

          {/* Interactive Actions (Reservation & Basket) */}
          <div className="flex items-center gap-4">
            <button
              id="header-booking-trigger"
              onClick={() => setIsReservationOpen(true)}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-stone-900/50 border border-stone-850 hover:border-gold-500/50 hover:bg-stone-900 rounded-xl text-stone-300 hover:text-gold-300 font-serif text-xs tracking-wider transition duration-300 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-gold-500" />
              <span>Book Table Seating</span>
            </button>

            {/* Shopping cart bag counter badge */}
            <button
              id="header-bag-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 rounded-xl shadow-lg active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950 fill-none" />
              <span className="font-serif font-medium text-xs tracking-wide">My Order</span>
              {cartCount > 0 && (
                <span className="font-mono bg-stone-955 text-stone-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* APP VIEWS SECTION */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'menu' ? (
            /* Tab View A: Bespoke Menu Selection and Sourcing List */
            <motion.div
              key="menu-tab-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              {/* Luxury Welcome banner */}
              <div className="relative bg-gradient-to-tr from-stone-900 via-stone-950 to-stone-900 border border-stone-850 p-8 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] pointer-events-none rounded-full" />
                <div className="space-y-2 z-10">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/10 border border-gold-500/20 text-gold-400 font-mono text-[9px] uppercase tracking-widest rounded-full">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Alexander's Selection Staged
                  </div>
                  <h2 className="font-serif text-3xl font-light text-stone-100 italic pr-4 leading-snug">
                    "Crafting unforgettable culinary landmarks, one cut at a time."
                  </h2>
                </div>

                {/* Micro Action card triggers table reservation inside banner! */}
                <div className="bg-stone-900/60 border border-stone-850/80 p-5 rounded-2xl md:min-w-[240px] z-10 hover:border-gold-500/30 transition duration-300">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-stone-500 block">
                    Bespoke Table Booking
                  </span>
                  <p className="text-sm font-serif font-light text-stone-200 mt-1">Live Fireplace Rooms</p>
                  <button
                    onClick={() => setIsReservationOpen(true)}
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 text-stone-950 font-serif font-medium tracking-wide text-[11px] py-2 rounded-lg mt-4 cursor-pointer active:scale-95 transition"
                  >
                    Select Room Table Map
                  </button>
                </div>
              </div>

              {/* SEARCH, CATEGORY FILTER AND FILTER ENGINE ROW */}
              <div className="sticky top-20 z-20 bg-stone-950/80 backdrop-blur pb-4 pt-1 flex flex-col gap-4 border-b border-stone-900/60">
                {/* Visual Accent */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
                    {(['All', 'Starters', 'Signature Mains', 'Coastal Seafood', 'Desserts'] as const).map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          id={`category-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs font-serif tracking-widest uppercase px-4.5 py-2.5 rounded-xl border transition-all duration-350 shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-gold-500 text-stone-950 font-semibold border-gold-500 shadow-md'
                              : 'bg-stone-900/40 border-stone-900 text-stone-400 hover:border-stone-800 hover:text-stone-200'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search and Advanced Filters */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div id="filter-search-box" className="relative flex-1 md:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Inspect cuts, spices..."
                        className="w-full text-xs bg-stone-900/50 border border-stone-900 rounded-xl pl-10 pr-4 py-2.5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-gold-500/50 transition-colors"
                      />
                    </div>

                    {/* Premium rating filter toggle */}
                    <button
                      onClick={() => setOnlyPremium(!onlyPremium)}
                      className={`p-2.5 rounded-xl border transition-all duration-350 cursor-pointer ${
                        onlyPremium
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                          : 'bg-stone-900/40 border-stone-900 text-stone-500 hover:text-stone-300 hover:border-stone-850'
                      }`}
                      title="Show highly rated (4.8+ only)"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC MENU Gird Renders */}
              {isProductsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-stone-900/30 border border-stone-900/80 rounded-2xl h-[480px] p-6 flex flex-col justify-between animate-pulse">
                      <div className="space-y-4">
                        <div className="w-full h-56 bg-stone-950/80 rounded-xl" />
                        <div className="h-5 bg-stone-950/80 rounded w-2/3" />
                        <div className="space-y-2">
                          <div className="h-3 bg-stone-950/80 rounded w-full" />
                          <div className="h-3 bg-stone-950/80 rounded w-5/6" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-stone-900/40">
                        <div className="h-8 bg-stone-950/80 rounded w-1/4" />
                        <div className="h-10 bg-stone-950/80 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMenuItems.length === 0 ? (
                /* No Results fallback card */
                <div className="bg-stone-900/10 border border-stone-900 p-12 rounded-3xl text-center max-w-md mx-auto space-y-4">
                  <div className="inline-block p-3.5 bg-stone-900 border border-stone-850 rounded-full text-stone-500">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="font-serif text-lg text-stone-400 italic">No Cuts Discovered</p>
                  <p className="text-[10px] text-stone-550 font-mono tracking-widest uppercase">
                    Refine search criteria to locate premium reserve items.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredMenuItems.map((item) => (
                    <div key={item.id}>
                      <MenuItemCard item={item} onAddToBag={handleAddToBag} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'admin' ? (
            /* Tab View C: Proprietor / Lead Purveyor Dashboard */
            <motion.div
              key="admin-tab-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <AdminDashboard />
            </motion.div>
          ) : (
            /* Tab View B: Personal VIP Portal (Profile / stats / coords and old receipts) */
            <motion.div
              key="profile-tab-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <ProfileScreen
                profile={profile}
                orders={orders}
                savedLocations={savedLocations}
                onUpdateProfile={handleProfileUpdate}
                onAddLocation={handleAddLocation}
                onRemoveLocation={handleRemoveLocation}
                user={user}
                onSignIn={signIn}
                onSignOut={logOut}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-900/60 bg-stone-950 py-10 mt-12 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[9px] tracking-widest text-stone-600 uppercase">
          <p>© 2026 Luxe Meats Concierge • All Sovereign Privileges Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gold-500 transition duration-300">Terms of Honor</span>
            <span className="hover:text-gold-500 transition duration-300">Private Cellar Access</span>
          </div>
        </div>
      </footer>

      {/* DRAWERS & DIALOG OVERLAYS */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        savedLocations={savedLocations}
        onRemoveItem={handleRemoveItemFromCart}
        onClearCart={handleClearCart}
        onOrderPlaced={handleConfirmOrder}
      />

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onConfirmReservation={(res) => {
          addReservation(res);
        }}
      />

      <ChatOverlay />
    </div>
  );
}
