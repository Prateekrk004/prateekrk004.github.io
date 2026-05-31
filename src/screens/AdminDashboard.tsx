/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { adminService } from '../services/adminService';
import { MenuItem, Order, UserProfile, CategoryType, DashboardStats } from '../types';
import { 
  ShieldAlert, 
  Lock, 
  TrendingUp, 
  Coins, 
  Users, 
  ShoppingBag, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  ChevronRight, 
  Filter, 
  CheckCircle, 
  Clock, 
  Truck, 
  Ban, 
  X, 
  Sparkles,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Preset of luxury meat product mock images in case they want a quick default selection
const PRESET_MOCK_IMAGES = [
  { name: 'A5 Miyazaki Wagyu Ribeye', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600' },
  { name: 'Dry-aged Tomahawk', url: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=600' },
  { name: 'Saffron Lobster Tails', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=600' },
  { name: 'Slow Roasted Rib Glaze', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600' },
  { name: 'Signature Lamb Kebab', url: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&q=80&w=600' }
];

export const AdminDashboard: React.FC = () => {
  const { user, profile } = useFirebase();

  // Root States loaded in real-time
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    topSellingProducts: [],
  });
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Error States
  const [errorText, setErrorText] = useState<string | null>(null);

  // Developer Bypass Toggle: Allows inspecting the gorgeous dashboard within the sandboxed development framework
  const [devBypassAdmin, setDevBypassAdmin] = useState(() => {
    return localStorage.getItem('luxe_meats_dev_admin_bypass') === 'true';
  });

  // Navigation Panel Views: 'analytics' | 'orders' | 'products' | 'users'
  const [currentSection, setCurrentSection] = useState<'analytics' | 'orders' | 'products' | 'users'>('analytics');

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<Order['status'] | 'All'>('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState<CategoryType | 'All'>('All');

  // Interactive Product Forms / Modals
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  
  // Product Form Field States
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<CategoryType>('Signature Mains');
  const [pPrice, setPPrice] = useState(1500);
  const [pRating, setPRating] = useState(4.8);
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');
  const [pAvailable, setPAvailable] = useState(true);
  const [pSpiceLevel, setPSpiceLevel] = useState<MenuItem['spiceLevel']>('Medium');
  const [pSpicyCount, setPSpicyCount] = useState(2);

  // Order Details Modal
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'err' } | null>(null);

  const showToast = (message: string, type: 'success' | 'err' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Determine actual Admin Permission based on role and verified email or dev bypass
  const hasAdminAccess = 
    devBypassAdmin || 
    (profile?.role === 'admin') || 
    (profile?.isAdmin === true) || 
    (user?.email === 'Prateekrk1234@gmail.com');

  // 1. Listeners binding on auth / permission checks
  useEffect(() => {
    if (!hasAdminAccess) return;

    setErrorText(null);
    console.log('[Admin Dashboard] Binding root listeners for real-time order & catalog pipelines...');

    // Orders pipeline
    const unsubOrders = adminService.subscribeToAllOrders(
      (loadedOrders) => {
        setOrders(loadedOrders);
        setLoadingOrders(false);
      },
      (err) => {
        console.error('[Admin Dashboard] Orders pipeline error:', err);
        setErrorText('Authentication / permissions error loading orders database: ' + err.message);
        setLoadingOrders(false);
      }
    );

    // Products pipeline
    const unsubProducts = adminService.subscribeToAllProducts(
      (loadedProducts) => {
        setProducts(loadedProducts);
        setLoadingProducts(false);
      },
      (err) => {
        console.error('[Admin Dashboard] Products catalog pipeline error:', err);
        setLoadingProducts(false);
      }
    );

    // Users pipeline
    const unsubUsers = adminService.subscribeToAllUsers(
      (loadedUsers) => {
        setUsers(loadedUsers);
        setLoadingUsers(false);
      },
      (err) => {
        console.error('[Admin Dashboard] Customers database pipeline error:', err);
        setLoadingUsers(false);
      }
    );

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
    };
  }, [hasAdminAccess]);

  // 2. Re-compute analytics when orders or users update
  useEffect(() => {
    if (orders.length > 0 || users.length > 0) {
      const computedStats = adminService.calculateAnalytics(orders, users.length || 1);
      setStats(computedStats);
    }
  }, [orders, users]);

  // Toggle Dev Bypass mode
  const handleToggleDevBypass = () => {
    const val = !devBypassAdmin;
    setDevBypassAdmin(val);
    localStorage.setItem('luxe_meats_dev_admin_bypass', String(val));
    showToast(val ? '⚡ Simulated proprietor credentials authorized' : '🔒 Secure sandbox lock enabled', 'success');
  };

  // Status update dispatcher
  const handleUpdateStatus = async (order: Order, newStatus: Order['status']) => {
    try {
      // Find matching user in database who placed this order
      const potentialUser = users.find(u => u.email === order.customerDetails?.email || u.name === order.customerDetails?.name);
      await adminService.updateOrderStatus(order, newStatus, potentialUser?.uid);
      showToast(`Order status updated to "${newStatus}"`, 'success');
      if (activeOrderDetails?.id === order.id) {
        setActiveOrderDetails({ ...activeOrderDetails, status: newStatus });
      }
    } catch (err: any) {
      console.error('[Admin] Fails to update status:', err);
      showToast(err.message || 'Permissions rejected.', 'err');
    }
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setPId(`meat-${Math.floor(100 + Math.random() * 900)}`);
    setPName('');
    setPCategory('Signature Mains');
    setPPrice(2000);
    setPRating(4.8);
    setPDescription('');
    setPImage('');
    setPAvailable(true);
    setPSpiceLevel('Medium');
    setPSpicyCount(2);
    setIsEditingProduct(true);
  };

  // Open edit modal
  const handleOpenEditModal = (p: MenuItem) => {
    setSelectedProduct(p);
    setPId(p.id);
    setPName(p.name);
    setPCategory(p.category);
    setPPrice(p.price);
    setPRating(p.rating || 4.7);
    setPDescription(p.description);
    setPImage(p.image || '');
    setPAvailable(p.available !== false);
    setPSpiceLevel(p.spiceLevel || 'Medium');
    setPSpicyCount(p.spicyCount || 1);
    setIsEditingProduct(true);
  };

  // Save product dispatcher
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      showToast('Product name is required.', 'err');
      return;
    }

    try {
      const payload: Omit<MenuItem, 'id'> & { id?: string } = {
        id: pId,
        name: pName,
        category: pCategory,
        price: Number(pPrice),
        description: pDescription,
        rating: Number(pRating),
        image: pImage,
        available: pAvailable,
        spiceLevel: pSpiceLevel,
        spicyCount: Number(pSpicyCount)
      };

      if (selectedProduct) {
        // Edit mode
        await adminService.updateProduct(pId, payload);
        showToast('Bespoke Cut updated successfully in Cloud databases', 'success');
      } else {
        // Add mode
        const idCreated = await adminService.createProduct(payload);
        showToast(`Bespoke Cut "${pName}" successfully cataloged`, 'success');
      }
      setIsEditingProduct(false);
    } catch (err: any) {
      showToast(err.message || 'Exception during catalog update', 'err');
    }
  };

  // Delete product dispatcher
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you wish to permanently remove "${name}" from the sovereign menu?`)) {
      return;
    }
    try {
      await adminService.deleteProduct(id);
      showToast(`"${name}" deleted successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Permissions rejected.', 'err');
    }
  };

  // Selection filters
  const filteredOrders = orders.filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter);
  const filteredProducts = products.filter(p => productCategoryFilter === 'All' || p.category === productCategoryFilter);

  // Formatting currency helper (INR Lakhs / Tens)
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="flex-1 w-full flex flex-col space-y-8 relative pb-24">
      {/* Toast Notification Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 transform px-5 py-3 rounded-xl border font-mono text-xs flex items-center gap-2.5 shadow-2xl ${
              toast.type === 'err' 
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-300' 
                : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${toast.type === 'err' ? 'text-rose-400' : 'text-emerald-400 animate-spin-slow'}`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION WITH TITLE AND BYPASS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-900">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-mono text-[9px] tracking-widest uppercase">Proprietary Imperial Portal</span>
          </div>
          <h1 className="font-serif text-3xl font-light text-stone-100 tracking-wide mt-1.5">
            Proprietor <span className="font-serif italic text-gold-400">Dashboard</span>
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
            Bespoke monitoring controls reserved for Alexander Sterling and the Imperial Sommelier panel. Log statistics, dispatch orders, and catalog menu reserve cuts.
          </p>
        </div>

        {/* Access Configuration Controller */}
        <div className="bg-stone-900/60 border border-stone-850 p-4 rounded-2xl flex flex-col items-start gap-2 max-w-sm">
          <div className="flex items-center justify-between w-full gap-8">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-gold-300 font-semibold block">Proprietor Mode bypass</span>
              <p className="text-[9px] text-stone-500">For review in sandbox environment without full credentials.</p>
            </div>
            <button
              id="bypass-admin-access-toggle"
              onClick={handleToggleDevBypass}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                devBypassAdmin ? 'bg-gold-500' : 'bg-stone-800'
              }`}
            >
              <span className="sr-only">Bypass Auth</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-stone-950 transition-transform ${
                  devBypassAdmin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {user ? (
            <span className="text-[9px] font-mono text-stone-400 border-t border-stone-850/60 pt-1.5 w-full">
              Logged in as: <strong className="text-gold-400">{user.email}</strong>
            </span>
          ) : (
            <span className="text-[9px] font-mono text-rose-400 border-t border-stone-850/60 pt-1.5 w-full flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animated-pulse" />
              Not logged in format. Best behavior in guest sandbox.
            </span>
          )}
        </div>
      </div>

      {/* ACCESS DENIED STATE SCREEN */}
      {!hasAdminAccess && (
        <div className="bg-stone-900/30 border border-stone-900 p-12 rounded-3xl text-center max-w-xl mx-auto space-y-6 shadow-2xl">
          <div className="inline-block p-4 bg-stone-950 border border-stone-850 rounded-full text-gold-500">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-stone-100 font-light">Sovereign Encryption Gate</h2>
            <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
              This terminal is strictly encrypted for the lead purveyor <span className="text-gold-400">Prateekrk1234@gmail.com</span> or users with verified administrative roles.
            </p>
          </div>

          <div className="bg-stone-950/80 p-5 rounded-2xl border border-stone-900 space-y-4">
            <p className="text-[10px] text-stone-550 leading-relaxed font-mono uppercase tracking-widest text-left">
              🔑 System bypass controls for engineers:
            </p>
            <p className="text-left text-xs text-stone-400 leading-relaxed">
              Activate the <strong className="text-stone-200">Proprietor Mode bypass</strong> selector above right to simulate developer administrative capabilities. This instantly opens all Firestore collections, stats counters, orders manager and recipe forms in direct, live preview format.
            </p>
            <button
              onClick={handleToggleDevBypass}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-stone-950 font-serif font-medium tracking-wider text-xs py-2.5 rounded-xl cursor-pointer active:scale-95 transition"
            >
              ⚡ Authorize simulated bypass immediately
            </button>
          </div>
        </div>
      )}

      {/* MAIN ADMIN DASHBOARD ENVIRONMENT */}
      {hasAdminAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: NAVIGATION SIDECAR */}
          <div className="col-span-1 lg:col-span-3 flex flex-col space-y-3 bg-stone-900/10 border border-stone-900/60 p-4 rounded-2xl select-none">
            <span className="text-[9px] font-mono tracking-widest text-stone-500 uppercase px-3 py-1.5 border-b border-stone-900/60">
              Navigation panels
            </span>
            {[
              { id: 'analytics', label: 'Analytics Vault', desc: 'Sovereign ledger & revenue tracking', icon: TrendingUp },
              { id: 'orders', label: 'Orders Reserve', desc: 'Manage cut preparation & dispatch', icon: ShoppingBag, count: orders.length },
              { id: 'products', label: 'Bespoke Menu', desc: 'Catalog prime cuts & recipes', icon: Package, count: products.length },
              { id: 'users', label: 'Sovereign Guests', desc: 'Review member files & portal VIPs', icon: Users, count: users.length },
            ].map((section) => {
              const Icon = section.icon;
              const isSelected = currentSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id as any)}
                  className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-300' 
                      : 'bg-stone-900/10 border-transparent text-stone-400 hover:bg-stone-900/30 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-gold-400' : 'text-stone-500'}`} />
                      <span className="font-serif text-sm font-medium">{section.label}</span>
                    </div>
                    {section.count !== undefined && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-gold-500/20 text-gold-400' : 'bg-stone-900 border border-stone-850 text-stone-500'}`}>
                        {section.count}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-550 italic mt-1 leading-relaxed pl-6.5 font-light">
                    {section.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: RECEPTACLE PANELS */}
          <div className="col-span-1 lg:col-span-9 space-y-6">
            
            {/* ALERT BOX if cloud query failed */}
            {errorText && (
              <div className="bg-rose-950/20 border border-rose-500/25 p-4 rounded-xl flex items-start gap-3.5 text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-mono uppercase font-bold tracking-wider">Cloud Permissions warning</span>
                  <p className="leading-relaxed">{errorText}</p>
                  <p className="font-mono text-[10px] text-rose-400/80 pt-1 border-t border-rose-500/10 mt-2">
                    Ensure firestore.rules is deployed or proprietor toggle is on.
                  </p>
                </div>
              </div>
            )}

            {/* PANEL A: ANALYTICS VAULT */}
            {currentSection === 'analytics' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* 4 BENTO ANALYTICS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { title: 'Gross Premium Revenue', value: formatINR(stats.totalRevenue), desc: 'Excluding waived delivery, includes 8% luxury tax', icon: Coins, textClass: 'text-gold-400 font-serif' },
                    { title: 'Total Sourced Orders', value: stats.totalOrders, desc: 'Real-time order registry count', icon: ShoppingBag, textClass: 'text-stone-200 font-serif' },
                    { title: 'Premium Private Club Users', value: stats.totalUsers, desc: 'Registered user IDs on file', icon: Users, textClass: 'text-stone-200 font-serif' },
                    { title: 'Aesthetic Catalog Cards', value: products.length, desc: 'Active menu gourmet cuts', icon: Package, textClass: 'text-stone-200 font-serif' },
                  ].map((card, idx) => {
                    const CardIcon = card.icon;
                    return (
                      <div key={idx} className="bg-stone-900/30 border border-stone-900 p-5 rounded-2xl space-y-3 shadow-md hover:border-stone-800 transition duration-300">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">{card.title}</span>
                          <div className="p-2 bg-stone-950 border border-stone-850 text-gold-400 rounded-lg">
                            <CardIcon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <h3 className={`text-2xl font-light tracking-wide ${card.textClass}`}>{card.value}</h3>
                          <p className="text-[9px] text-stone-550 leading-relaxed font-sans">{card.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TWO-COLUMN EXPANDED CHARTS / POPULAR PRODUCTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Top-Selling Products List */}
                  <div className="bg-stone-900/30 border border-stone-900 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-900 pb-3">
                      <div>
                        <h4 className="font-serif text-lg font-light text-stone-100">Top Purveyed Selections</h4>
                        <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">By quantity ordered globally</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                    </div>

                    {stats.topSellingProducts.length === 0 ? (
                      <p className="text-xs text-stone-500 italic py-6 text-center">No orders have cleared verification yet.</p>
                    ) : (
                      <div className="space-y-3.5">
                        {stats.topSellingProducts.map((p, idx) => {
                          const maxQty = Math.max(...stats.topSellingProducts.map(x => x.quantity)) || 1;
                          const ratio = (p.quantity / maxQty) * 100;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-serif text-stone-200">{p.name}</span>
                                <div className="space-x-3 text-right">
                                  <span className="text-stone-500 font-mono text-[10px]">{p.quantity} cuts</span>
                                  <span className="text-gold-400 font-mono font-medium">{formatINR(p.revenue)}</span>
                                </div>
                              </div>
                              <div className="w-full bg-stone-950 h-1 rounded-full overflow-hidden border border-stone-900">
                                <div 
                                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Revenue Distribution Gauges / Order preparation speeds */}
                  <div className="bg-stone-900/30 border border-stone-900 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-900 pb-3">
                      <div>
                        <h4 className="font-serif text-lg font-light text-stone-100">Reserve Order Statuses</h4>
                        <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">Kitchen throughput metrics</p>
                      </div>
                      <Clock className="w-4 h-4 text-stone-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: 'Pending Approval', count: orders.filter(o => o.status === 'Pending').length, color: 'bg-gold-500/20 text-gold-400 border-gold-500/20' },
                        { title: 'In Kitchen (Preparing)', count: orders.filter(o => o.status === 'Preparing').length, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' },
                        { title: 'On Carriage (Dispatch)', count: orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Shipped').length, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
                        { title: 'Delivered Sovereign', count: orders.filter(o => o.status === 'Delivered').length, color: 'bg-stone-950 text-stone-400 border-stone-850' },
                      ].map((gauge, idx) => (
                        <div key={idx} className="bg-stone-950 border border-stone-900 p-4 rounded-xl flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-stone-550">{gauge.title}</p>
                            <h5 className="text-xl font-light font-mono text-stone-200">{gauge.count}</h5>
                          </div>
                          <div className="w-1.5 h-7 rounded-full bg-stone-900 overflow-hidden">
                            <div className={`w-full h-full ${gauge.color.split(' ')[0]}`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-900 text-[10px] text-stone-500 leading-relaxed font-sans">
                      💡 <strong>Live Web Sockets:</strong> Any orders submitted via the Black Card checkout slider will instantly update this dashboard with real-time counters.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PANEL B: ORDERS RESERVE */}
            {currentSection === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-stone-900/30 border border-stone-900 p-6 rounded-2xl space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-900">
                    <div>
                      <h4 className="font-serif text-lg font-light text-stone-100">Live Orders Dispatch</h4>
                      <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">Inspect client demands, edit statuses, confirm payment metrics</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none select-none">
                      {(['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider border transition-all cursor-pointer ${
                            orderStatusFilter === st
                              ? 'bg-gold-500 text-stone-950 font-semibold border-gold-500'
                              : 'bg-stone-950 border-stone-900 text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          {st === 'Out for Delivery' ? 'Dispatch' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Table rendering */}
                  {loadingOrders ? (
                    <div className="py-12 flex items-center justify-center gap-3">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">Awaiting dispatch ledger...</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <p className="font-serif text-stone-400 italic">No Matching Orders found.</p>
                      <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest">Adjust filters or await a new order to submit.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-stone-900/60 font-mono text-[9px] text-stone-500 uppercase tracking-widest">
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">VIP Client</th>
                            <th className="py-3 px-4">Cuts & Quantity</th>
                            <th className="py-3 px-4">Total Amount</th>
                            <th className="py-3 px-4">Progress State</th>
                            <th className="py-3 px-4 text-right">Dispatch Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900/40">
                          {filteredOrders.map((ord) => {
                            // Map states to colors
                            const statusColor = 
                              ord.status === 'Pending' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/10' :
                              ord.status === 'Preparing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                              ord.status === 'Out for Delivery' || ord.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                              ord.status === 'Delivered' ? 'bg-stone-900 text-stone-400 border border-stone-850' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/10';

                            return (
                              <tr key={ord.id} className="hover:bg-stone-900/15 transition duration-150">
                                <td className="py-4 px-4 font-mono font-medium text-stone-300">
                                  {ord.id}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-stone-200 block">{ord.customerDetails?.name || 'Anonymous client'}</span>
                                    <span className="text-[10px] text-stone-500 block font-mono">{ord.customerDetails?.phone || '+1 (555) 019-8372'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 font-mono text-[10px] text-stone-400 max-w-[200px] truncate">
                                  {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-mono text-gold-400 font-semibold">{formatINR(ord.total)}</span>
                                    <span className={`text-[8px] font-mono px-1.5 py-0.25 rounded block w-max uppercase ${ord.paymentStatus === 'Paid' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-stone-950 text-stone-600'}`}>
                                      {ord.paymentStatus || 'Paid'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider ${statusColor}`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Trigger popup detailed review */}
                                    <button
                                      onClick={() => setActiveOrderDetails(ord)}
                                      className="p-1.5 hover:bg-stone-900 border border-stone-900 hover:border-stone-800 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer transition"
                                      title="Review Chef Notes & Invoice"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Dropdown status modifier */}
                                    <select
                                      value={ord.status}
                                      onChange={(e) => handleUpdateStatus(ord, e.target.value as any)}
                                      className="bg-stone-950 border border-stone-850 rounded-lg px-2 py-1 text-[10px] font-mono text-stone-300 focus:outline-none focus:border-gold-500/50 cursor-pointer"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Preparing">Preparing</option>
                                      <option value="Out for Delivery">Dispatch</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PANEL C: PRODUCTS MANAGEMENT */}
            {currentSection === 'products' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-stone-900/30 border border-stone-900 p-6 rounded-2xl space-y-6">
                  
                  {/* Title Bar with Catalog Action */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-900">
                    <div>
                      <h4 className="font-serif text-lg font-light text-stone-100">Meat Catalog Inventory</h4>
                      <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">Inject fresh wagyu recipes, edit existing items, configure available states</p>
                    </div>

                    <div className="flex gap-4 items-center self-end md:self-auto select-none">
                      {/* Filter category */}
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value as any)}
                        className="bg-stone-950 border border-stone-850 px-3 py-1.5 rounded-xl font-mono text-[10px] text-stone-300 uppercase tracking-wider focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="Starters">Starters</option>
                        <option value="Signature Mains">Signature Mains</option>
                        <option value="Coastal Seafood">Coastal Seafood</option>
                        <option value="Desserts">Desserts</option>
                      </select>

                      <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 text-stone-950 font-serif text-xs font-semibold px-4 py-2 rounded-xl transition shadow active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Scribe New Cut</span>
                      </button>
                    </div>
                  </div>

                  {/* Render catalog products cards */}
                  {loadingProducts ? (
                    <div className="py-12 flex items-center justify-center gap-3">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">Unpacking cellars...</span>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-center py-12 text-stone-500 italic text-xs font-serif">No products exist under this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((p) => (
                        <div key={p.id} className="bg-stone-950/80 border border-stone-900 p-4 rounded-xl flex gap-4 h-full relative group">
                          
                          {/* Image rendering inside catalogue list */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-900 border border-stone-850 flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img src={p.image} referrerPolicy="no-referrer" alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                              <span className="text-[10px] font-mono text-stone-550 uppercase">No Img</span>
                            )}
                          </div>

                          {/* Data elements */}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <span className="font-serif text-sm font-light text-stone-200 block group-hover:text-gold-400 transition">{p.name}</span>
                              <span className="text-[9px] font-mono text-gold-400">{formatINR(p.price)}</span>
                            </div>
                            
                            <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>

                            <div className="flex items-center justify-between text-[8px] font-mono text-stone-600 uppercase tracking-wider pt-1.5 border-t border-stone-900/60 mt-1">
                              <span>Cat: <strong className="text-stone-400">{p.category}</strong></span>
                              <span>Availability: <strong className={p.available !== false ? 'text-emerald-400' : 'text-stone-550'}>{p.available !== false ? 'LIVE' : 'VAULT' }</strong></span>
                            </div>
                          </div>

                          {/* Float hovering edit delete handlers */}
                          <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition duration-150">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 bg-stone-900 border border-stone-850 rounded-lg hover:border-gold-500/50 text-stone-400 hover:text-gold-400 transition cursor-pointer"
                              title="Modify details"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 bg-stone-900 border border-stone-850 rounded-lg hover:border-rose-500/50 text-stone-400 hover:text-rose-400 transition cursor-pointer"
                              title="Delete from menu"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* PANEL D: SOVEREIGN GUESTS */}
            {currentSection === 'users' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-stone-900/30 border border-stone-900 p-6 rounded-2xl space-y-5">
                  <div className="pb-4 border-b border-stone-900">
                    <h4 className="font-serif text-lg font-light text-stone-100">Private Dining Club Members</h4>
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">Inspect client files, role authorization statuses, VIP club levels</p>
                  </div>

                  {loadingUsers ? (
                    <div className="py-12 flex items-center justify-center gap-3">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">Compiling membership ledger...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-center py-12 text-stone-500 italic text-xs font-serif">No user profile records found on file.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-stone-900/60 font-mono text-[9px] text-stone-500 uppercase tracking-widest">
                            <th className="py-3 px-4">Authorized UID ID</th>
                            <th className="py-3 px-4">User Name</th>
                            <th className="py-3 px-4">Verified Email</th>
                            <th className="py-3 px-4">Phone Credentials</th>
                            <th className="py-3 px-4">Access Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900/40 font-serif">
                          {users.map((srv) => (
                            <tr key={srv.uid} className="hover:bg-stone-900/10 transition duration-150">
                              <td className="py-3.5 px-4 font-mono text-[10px] text-stone-500">
                                {srv.uid}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-stone-200">
                                {srv.name}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[10px] text-stone-400">
                                {srv.email}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[10px] text-stone-400">
                                {srv.phone || 'Not configured'}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  {srv.isAdmin || srv.role === 'admin' ? (
                                    <span className="bg-gold-500/10 text-gold-300 border border-gold-500/20 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
                                      🛡️ Proprietor
                                    </span>
                                  ) : (
                                    <span className="bg-stone-900 text-stone-400 border border-stone-850 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
                                      VIP Club Guest
                                    </span>
                                  )}

                                  {srv.isBlackCard && (
                                    <span className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
                                      ♠️ Black Card
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL 1: PRODUCT ADD & EDIT SHEET */}
      <AnimatePresence>
        {isEditingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProduct(false)}
              className="absolute inset-0 bg-stone-955/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-stone-950 border border-stone-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-900">
                <div>
                  <h3 className="font-serif text-lg font-light text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    <span>{selectedProduct ? 'Edit Reserve Cut' : 'Scribe New Reservation Cut'}</span>
                  </h3>
                  <p className="text-[9px] font-mono text-stone-550 uppercase tracking-widest mt-0.5">Database parameters synchronizer</p>
                </div>
                <button
                  onClick={() => setIsEditingProduct(false)}
                  className="p-1.5 hover:bg-stone-905 rounded-xl border border-stone-900 hover:border-stone-850 text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form entry fields */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5 text-stone-200">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* ID Field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Document unique ID</label>
                    <input
                      type="text"
                      disabled={!!selectedProduct}
                      value={pId}
                      onChange={(e) => setPId(e.target.value)}
                      placeholder="e.g. beef-strip-reserve"
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50 disabled:opacity-40 disabled:cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Display Meat Name</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Sovereign Ribeye Wagyu"
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  {/* Category Selection dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Culinary Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value as any)}
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-3 text-stone-200 focus:outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Signature Mains">Signature Mains</option>
                      <option value="Coastal Seafood">Coastal Seafood</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  {/* Price parameter */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      placeholder="e.g. 2500"
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>

                  {/* Spice rating Level */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Spice Level fallback</label>
                    <select
                      value={pSpiceLevel || 'Medium'}
                      onChange={(e) => setPSpiceLevel(e.target.value as any)}
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-3 text-stone-200 focus:outline-none focus:border-gold-500/50 cursor-pointer"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Extra Spicy">Extra Spicy</option>
                    </select>
                  </div>

                  {/* Spicy rating Flame Count */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Chilies Rating flame Count</label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={pSpicyCount}
                      onChange={(e) => setPSpicyCount(Number(e.target.value))}
                      className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* Cover High-Res Image Url Selection & Helpers */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500 flex justify-between">
                    <span>Recipe Cover Image URL</span>
                    <span className="text-gold-400">Click a preset choice to auto-fill</span>
                  </label>
                  <input
                    type="url"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    placeholder="https://images.unsplash.com/your-custom-luxury-food-image"
                    className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50 font-mono"
                  />
                  
                  {/* Presets grid selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border border-stone-900 p-2.5 rounded-xl bg-stone-955/50">
                    {PRESET_MOCK_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPImage(preset.url)}
                        className="flex flex-col items-center gap-1 p-1 hover:bg-stone-900 rounded-lg group text-center border border-transparent hover:border-gold-500/20"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden bg-stone-900 flex-shrink-0">
                          <img src={preset.url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <span className="text-[8px] text-stone-500 truncate w-full group-hover:text-stone-300 font-sans">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipe detailed description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Detailed Recipe Description</label>
                  <textarea
                    required
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Brief historical details of the cut, flavor enhancements, cook recommendations..."
                    className="w-full text-xs bg-stone-900 border border-stone-850/60 rounded-xl px-3.5 py-2.5 text-stone-200 focus:outline-none focus:border-gold-500/50 leading-relaxed font-sans"
                  />
                </div>

                {/* Available checkbox toggle */}
                <div className="flex items-center gap-3 bg-stone-900/40 p-3.5 rounded-xl border border-stone-900">
                  <input
                    type="checkbox"
                    id="product-available-box"
                    checked={pAvailable}
                    onChange={(e) => setPAvailable(e.target.checked)}
                    className="w-4 h-4 accent-gold-500 cursor-pointer"
                  />
                  <div className="space-y-0.5 cursor-pointer" onClick={() => setPAvailable(!pAvailable)}>
                    <label className="text-xs font-serif font-medium text-stone-200 block">Available in Dynamic Menu Stock</label>
                    <p className="text-[9px] text-stone-500">If unchecked, standard clients won't see this cut in the catalog store.</p>
                  </div>
                </div>

                {/* Submit Area buttons */}
                <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-stone-900">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-5 py-2.5 text-xs text-stone-400 hover:text-stone-250 font-serif border border-transparent hover:border-stone-850 bg-transparent rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-stone-950 font-serif font-semibold text-xs rounded-xl shadow-lg hover:from-gold-500 active:scale-95 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ORDER DETAILED INVOICE INSPECTOR */}
      <AnimatePresence>
        {activeOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOrderDetails(null)}
              className="absolute inset-0 bg-stone-955/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-stone-950 border border-stone-850 rounded-2xl shadow-2xl overflow-hidden p-6 text-stone-200 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-900 pb-3">
                <div>
                  <span className="text-[8px] font-mono text-gold-400 uppercase tracking-widest font-semibold block">Order Profile review</span>
                  <h3 className="font-serif text-lg text-stone-100 font-light mt-0.5">Invoice: {activeOrderDetails.id}</h3>
                </div>
                <button
                  onClick={() => setActiveOrderDetails(null)}
                  className="p-1.5 hover:bg-stone-905 rounded-xl border border-stone-900 hover:border-stone-850 text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status workflow controller */}
              <div className="bg-stone-900/60 p-4 border border-stone-900 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-serif">Quick Progress Modifier</span>
                  <span className="font-mono text-[10px] text-gold-400 font-semibold uppercase">{activeOrderDetails.status}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1.5 border-t border-stone-900/40 select-none">
                  {[
                    { st: 'Pending', label: 'Hold', icon: Clock },
                    { st: 'Preparing', label: 'Prep', icon: Sparkles },
                    { st: 'Out for Delivery', label: 'Dispatch', icon: Truck },
                    { st: 'Delivered', label: 'Done', icon: CheckCircle },
                    { st: 'Cancelled', label: 'Void', icon: Ban }
                  ].map((btn) => {
                    const isCurrent = activeOrderDetails.status === btn.st;
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.st}
                        onClick={() => handleUpdateStatus(activeOrderDetails, btn.st as any)}
                        className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 border text-[9px] font-mono transition-all duration-300 cursor-pointer ${
                          isCurrent 
                            ? 'bg-gold-500 text-stone-950 font-bold border-gold-500' 
                            : 'bg-stone-955 border-stone-900 text-stone-550 hover:text-stone-300 hover:border-stone-850'
                        }`}
                        title={`Move to ${btn.st}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client specifications */}
              <div className="space-y-2 text-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Deliver dispatch coordinates</span>
                <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-900 space-y-1">
                  <p className="font-serif font-medium text-stone-100">{activeOrderDetails.customerDetails?.name}</p>
                  <p className="text-stone-400">Email: <strong className="text-stone-350">{activeOrderDetails.customerDetails?.email}</strong></p>
                  <p className="text-stone-400">Cell: <strong className="text-stone-350">{activeOrderDetails.customerDetails?.phone}</strong></p>
                </div>
              </div>

              {/* Items pricing list */}
              <div className="space-y-2 text-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Purchased Cuts items</span>
                <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-900 divide-y divide-stone-900/60">
                  {activeOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 font-sans">
                      <div className="space-y-0.5">
                        <span className="font-serif text-stone-200 block">{item.name}</span>
                        <span className="text-[9px] text-stone-500 block font-mono">{item.quantity} x {formatINR(item.price)}</span>
                      </div>
                      <span className="font-mono text-stone-300 font-medium">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculations ledger */}
              <div className="bg-stone-900/20 border border-stone-900 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span>{formatINR(activeOrderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Luxury Tax (8%):</span>
                  <span>{formatINR(activeOrderDetails.tax)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>VIP Carriage Fees:</span>
                  <span>{formatINR(activeOrderDetails.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gold-300 font-bold border-t border-stone-900 pt-2 text-sm">
                  <span className="font-serif">Grand Billing Audited:</span>
                  <span>{formatINR(activeOrderDetails.total)}</span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-900">
                <button
                  type="button"
                  onClick={() => setActiveOrderDetails(null)}
                  className="w-full bg-stone-900 hover:bg-stone-850 px-4 py-2.5 font-serif text-xs font-medium rounded-xl border border-stone-850 text-stone-200 active:scale-95 transition cursor-pointer"
                >
                  Close Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
