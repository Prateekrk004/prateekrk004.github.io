/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CartItem, SavedLocation, Order } from '../types';
import { X, Trash2, MapPin, ClipboardList, ShieldCheck, Truck, Check, Sparkles, Loader2, Award, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { loadRazorpayScript, createOrder, verifyPayment, saveOrderToFirestore } from '../services/razorpayService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  savedLocations: SavedLocation[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  savedLocations,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  const { user, profile } = useFirebase();

  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(
    savedLocations.length > 0 ? savedLocations[0] : null
  );
  const [chefInstructions, setChefInstructions] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeCompleted, setSwipeCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<Order | null>(null);

  // Billing details
  const [customerName, setCustomerName] = useState(profile?.name || 'Alexander Sterling');
  const [customerEmail, setCustomerEmail] = useState(profile?.email || 'a.sterling@example.com');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '+91 99999 99999');

  // Interactive Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Synchronize customer details with Firestore profile as it loads asynchronously
  useEffect(() => {
    if (profile) {
      setCustomerName(profile.name || 'Alexander Sterling');
      setCustomerEmail(profile.email || 'a.sterling@example.com');
      setCustomerPhone(profile.phone || '+91 99999 99999');
    }
  }, [profile]);

  // Auto-dismiss custom toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Drag slider mechanics
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(200);

  useEffect(() => {
    if (trackRef.current && handleRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const handleWidth = handleRef.current.offsetWidth;
      setMaxDrag(trackWidth - handleWidth - 8); // 8px for combined padding/margins
    }
  }, [trackRef.current, isOpen, isProcessing]);

  // Reset swipe on drawer reopen or empty
  useEffect(() => {
    if (!isOpen) {
      setDragX(0);
      setSwipeCompleted(false);
      setIsProcessing(false);
      // Wait to clear receipt state so closure is clean
      setTimeout(() => setOrderReceipt(null), 305);
    }
  }, [isOpen]);

  const handleDrag = (_event: any, info: any) => {
    // Math to crop drag to max bounds
    const x = Math.max(0, Math.min(info.point.x - (trackRef.current?.getBoundingClientRect().left || 0) - 20, maxDrag));
    setDragX(x);
  };

  const handleDragEnd = () => {
    // If dragged 90% or more, complete swipe
    if (dragX >= maxDrag * 0.88) {
      setDragX(maxDrag);
      setSwipeCompleted(true);
      triggerOrderPlacement();
    } else {
      // Snap back to 0
      setDragX(0);
      setSwipeCompleted(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.totalPriceCalculated, 0);
  };

  const handleBypassSimulation = async () => {
    setIsProcessing(true);
    console.log('[Razorpay Sandbox Bypass] Triggering simulated test payment success...');
    try {
      const subtotal = calculateSubtotal();
      const tax = Math.round(subtotal * 0.08); // 8% Luxury tax
      const deliveryFee = subtotal > 5000 ? 0 : 250; // Waived above 5000 INR
      const finalTotal = subtotal + tax + deliveryFee;

      const orderId = `LM-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestampNow = Date.now();
      const dateStr = new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const completedOrder: Order = {
        id: orderId,
        items: cart.map(c => ({
          name: c.item.name + (c.selectedSpice ? ` (${c.selectedSpice})` : ''),
          quantity: c.quantity,
          price: c.totalPriceCalculated / c.quantity,
          image: c.item.image
        })),
        subtotal,
        tax,
        deliveryFee,
        total: finalTotal,
        date: dateStr,
        status: 'Pending',
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        razorpayPaymentId: `pay_sandbox_bypass_${Math.floor(100000 + Math.random() * 900000)}`,
        paymentStatus: 'Paid',
        createdTimestamp: timestampNow
      };

      // Save order document to Firestore collection named "orders"
      await saveOrderToFirestore(completedOrder, user?.uid);
      console.log('[Razorpay Sandbox Bypass] Order successfully synchronized in cloud databases.');

      // Update local visibility states
      setOrderReceipt(completedOrder);
      setToast({
        message: `Simulated Payment authorized successfully! Luxe Meats has queued your cuts!`,
        type: 'success'
      });

      // Hand off order profile updater & clear cart
      onOrderPlaced(completedOrder);
      onClearCart();
    } catch (err: any) {
      console.error('[Razorpay Sandbox Bypass] Error saving order:', err);
      setToast({
        message: err.message || 'Verification failed. Please contact support.',
        type: 'error'
      });
      setSwipeCompleted(false);
      setDragX(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerOrderPlacement = async () => {
    setIsProcessing(true);
    console.log('[Razorpay Flow] Initiating dynamic payment sequence...');

    try {
      // 1. Dynamic safe script loading
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error('Razorpay Gateway script block failed to load. Please verify your connection.');
      }

      const subtotal = calculateSubtotal();
      const tax = Math.round(subtotal * 0.08); // 8% Luxury tax
      const deliveryFee = subtotal > 5000 ? 0 : 250; // Waived above 5000 INR
      const finalTotal = subtotal + tax + deliveryFee;

      // 2. Formulate payment data payload
      const checkoutPayload = {
        amount: finalTotal,
        currency: 'INR',
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        notes: chefInstructions
      };

      // 3. Initiate checkout payload config via service
      const orderConfig = await createOrder(checkoutPayload);
      console.log('[Razorpay Flow] Checkout order configuration ready:', orderConfig);

      // 4. Set up Razorpay Checkout modal parameters
      const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SvsyCHIMLATTVT';
      console.log('[Razorpay Flow] Configuring modal with key ID:', razorpayKey);

      const options = {
        key: razorpayKey,
        amount: orderConfig.amount * 100, // Amount should be in paise (multiplying by 100 for INR cents)
        currency: orderConfig.currency,
        name: 'Luxe Meats Boutique',
        description: 'Bespoke Sommelier Sourced Cuts Billing',
        image: 'https://lh3.googleusercontent.com/aida/ADBb0ugiXl_Logo', 
        handler: async (response: any) => {
          console.log('[Razorpay Flow] Payment completed by user. Handshake response received:', response);

          try {
            // Validate client-side credentials
            const isVerified = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (!isVerified) {
              throw new Error('Payment response token validation failed.');
            }

            console.log('[Razorpay Flow] Verification positive. Packaging order object...');

            const orderId = `LM-${Math.floor(1000 + Math.random() * 9000)}`;
            const timestampNow = Date.now();
            const dateStr = new Date().toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const completedOrder: Order = {
              id: orderId,
              items: cart.map(c => ({
                name: c.item.name + (c.selectedSpice ? ` (${c.selectedSpice})` : ''),
                quantity: c.quantity,
                price: c.totalPriceCalculated / c.quantity,
                image: c.item.image
              })),
              subtotal,
              tax,
              deliveryFee,
              total: finalTotal,
              date: dateStr,
              status: 'Pending',
              customerDetails: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
              },
              razorpayPaymentId: response.razorpay_payment_id,
              paymentStatus: 'Paid',
              createdTimestamp: timestampNow
            };

            // Save order document to Firestore collection named "orders"
            await saveOrderToFirestore(completedOrder, user?.uid);
            console.log('[Razorpay Flow] Order successfully synchronized in cloud databases.');

            // Update local visibility states
            setOrderReceipt(completedOrder);
            setToast({
              message: `Payment authorized: ${response.razorpay_payment_id}. Luxe Meats has queued your cuts!`,
              type: 'success'
            });

            // Hand off order profile updater & clear cart
            onOrderPlaced(completedOrder);
            onClearCart();
          } catch (handlerErr: any) {
            console.error('[Razorpay Flow] Exception handling payment verification:', handlerErr);
            setToast({
              message: handlerErr.message || 'Verification failed. Please contact support.',
              type: 'error'
            });
            setSwipeCompleted(false);
            setDragX(0);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notes: {
          shipping_address: selectedLocation?.address || 'Bespoke Private Location',
          special_chef_notes: chefInstructions
        },
        theme: {
          color: '#D4AF37'
        },
        modal: {
          ondismiss: () => {
            console.warn('[Razorpay Flow] Payment flow cancelled or window closed by client.');
            setToast({
              message: 'Payment sequence cancelled. Order remains unplaced.',
              type: 'error'
            });
            setIsProcessing(false);
            setSwipeCompleted(false);
            setDragX(0);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();

    } catch (checkoutErr: any) {
      console.error('[Razorpay Flow] Checkout initialization encountered a failure:', checkoutErr);
      setToast({
        message: checkoutErr.message || 'Payment module launch failed. Try again.',
        type: 'error'
      });
      setIsProcessing(false);
      setSwipeCompleted(false);
      setDragX(0);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.08);
  const deliveryFee = subtotal > 5000 ? 0 : 250;
  const grandTotal = subtotal + tax + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950 z-40 backdrop-blur-sm"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-stone-950 border-l border-stone-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-900 bg-stone-950 flex justify-between items-center z-10">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-wide text-stone-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  Your Order Reserve
                </h2>
                <p className="text-[10px] font-mono tracking-widest uppercase text-stone-500 mt-1">
                  Bespoke Sourced Fine Meats
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 border border-stone-800 hover:border-gold-500/50 hover:bg-stone-900 rounded-full text-stone-400 hover:text-gold-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {orderReceipt ? (
                /* Success Receipt & Telemetry UI */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-4"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-block p-4 bg-gradient-to-tr from-gold-600/10 to-gold-400/20 border border-gold-500/30 rounded-full mb-2">
                      <ShieldCheck className="w-12 h-12 text-gold-400 animate-pulse" />
                    </div>
                    <h3 className="font-serif text-3xl font-medium text-gold-300">Order Dispatched</h3>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                      Reservation Reference: {orderReceipt.id}
                    </p>
                  </div>

                  {/* Private Butler Progress Telemetry */}
                  <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-5 space-y-4">
                    <h4 className="text-[11px] font-mono tracking-widest uppercase text-stone-400 border-b border-stone-800 pb-2">
                      Live Delivery Progress
                    </h4>
                    <div className="space-y-4">
                      {/* Milestone 1 */}
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-stone-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <div className="w-0.5 h-10 bg-gold-500/30" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-100">Curing & Sourced Selection</p>
                          <p className="text-[10px] text-stone-500 font-light mt-0.5">
                            Alexander's specific cuts selected and pre-staged by Prime Chef.
                          </p>
                        </div>
                      </div>

                      {/* Milestone 2 */}
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full border border-gold-500 bg-stone-950 flex items-center justify-center text-gold-400">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                          </div>
                          <div className="w-0.5 h-10 bg-stone-800" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gold-400">Cryo-Refrigerated Enclosure</p>
                          <p className="text-[10px] text-stone-400 font-light mt-0.5">
                            Sealed in bespoke vacuum micro-cases to maintain temperature integrity.
                          </p>
                        </div>
                      </div>

                      {/* Milestone 3 */}
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full border border-stone-800 bg-stone-950 flex items-center justify-center text-stone-600">
                            <Truck className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-500">VIP Private Courier Transit</p>
                          <p className="text-[10px] text-stone-600 font-light mt-0.5">
                            Dispatched via priority concierge transport.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary receipt info */}
                  <div className="border border-stone-900 rounded-xl p-5 space-y-3 font-mono">
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>MEMBER DESTINATION</span>
                      <span className="text-stone-200 uppercase text-right max-w-[200px] truncate">{selectedLocation?.label}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>FEE SCHEDULING</span>
                      <span className="text-gold-400 font-medium">BLACK CARD WAIVED</span>
                    </div>
                    <div className="border-t border-stone-900 pt-3 flex justify-between text-sm text-stone-200">
                      <span>GRAND BILL</span>
                      <span className="text-gold-300 font-semibold font-sans">
                        ₹{orderReceipt.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-serif font-medium text-xs py-3.5 rounded-lg active:scale-95 transition cursor-pointer"
                  >
                    Return to Boutique
                  </button>
                </motion.div>
              ) : cart.length === 0 ? (
                /* Empty Cart */
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <div className="p-4 bg-gradient-to-tr from-stone-900 to-stone-950 border border-stone-850 rounded-full">
                    <ClipboardList className="w-8 h-8 text-stone-600 animate-pulse" />
                  </div>
                  <p className="font-serif text-lg text-stone-400 italic">Order Reserve is Unoccupied</p>
                  <p className="text-[10px] text-stone-500 font-mono tracking-wider max-w-xs text-center">
                    Select elite items from the signature menu to formulate your bespoke delivery.
                  </p>
                </div>
              ) : (
                /* Cart Items List */
                <div className="space-y-6">
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <motion.div
                        layout
                        id={`cart-item-${cartItem.id}`}
                        key={cartItem.id}
                        className="flex gap-4 bg-stone-900/30 border border-stone-900 hover:border-stone-800/80 p-4 rounded-xl transition"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded bg-stone-950 overflow-hidden flex-shrink-0 border border-stone-900">
                          {cartItem.item.image ? (
                            <img
                              src={cartItem.item.image}
                              alt={cartItem.item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-600">
                              <Sparkles className="w-5 h-5 text-gold-500/40" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-sm font-medium text-stone-200 truncate pr-2">
                              {cartItem.item.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(cartItem.id)}
                              className="text-stone-500 hover:text-rose-500 p-1 rounded hover:bg-stone-950 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] bg-stone-950 text-stone-400 px-2 py-0.5 rounded font-mono">
                              QTY: {cartItem.quantity}
                            </span>
                            <span className="font-mono text-xs text-gold-400 font-light">
                              ₹{cartItem.totalPriceCalculated.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Options description */}
                          {(cartItem.selectedSpice || cartItem.enhancements.length > 0) && (
                            <div className="mt-2 text-[10px] text-stone-500 font-mono space-y-1 bg-stone-950/40 p-2 rounded">
                              {cartItem.selectedSpice && (
                                <p>• Heat Level: <span className="text-rose-400">{cartItem.selectedSpice}</span></p>
                              )}
                              {cartItem.enhancements.map((e, eIdx) => (
                                <p key={`${e.name}-${eIdx}`}>• Addition: <span className="text-gold-400">{e.name}</span> (+₹{e.price})</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <hr className="border-stone-900" />

                  {/* Delivery Location Section */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" />
                      Dispatch Destination
                    </label>

                    {/* Saved Location Selection Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {savedLocations.map((loc, lIdx) => {
                        const isChosen = selectedLocation?.id === loc.id;
                        return (
                          <button
                            key={`${loc.id}-${lIdx}`}
                            id={`location-option-${loc.id}`}
                            onClick={() => {
                              setSelectedLocation(loc);
                              if (loc.instructions) {
                                setChefInstructions(loc.instructions);
                              }
                            }}
                            className={`p-3 text-left border rounded-xl transition duration-300 ${
                              isChosen
                                ? 'bg-gold-500/5 border-gold-500 text-stone-200'
                                : 'bg-stone-900/20 border-stone-900 text-stone-400 hover:border-stone-850'
                            }`}
                          >
                            <p className="text-[9px] uppercase font-mono tracking-wider font-semibold text-gold-500">
                              {loc.label}
                            </p>
                            <p className="text-xs truncate font-medium mt-1">{loc.address}</p>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">{loc.city}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-stone-900" />

                  {/* Client Billing Coords / Prefill Forms */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-gold-500" />
                      Client Billing Identity (Razorpay)
                    </label>
                    <div className="space-y-3.5 bg-stone-900/20 border border-stone-850 p-4 rounded-xl">
                      <div>
                        <p className="text-[9px] text-stone-500 uppercase font-mono mb-1 tracking-wider">Full Billing Name</p>
                        <input
                          id="payment-billing-name"
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Lord Alexander Sterling..."
                          className="w-full text-xs bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 placeholder-stone-700 focus:outline-none focus:border-gold-500/60 font-serif tracking-wide"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <p className="text-[9px] text-stone-500 uppercase font-mono mb-1 tracking-wider">Billing Email</p>
                          <input
                            id="payment-billing-email"
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="billing@londonmeats.com"
                            className="w-full text-xs bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 placeholder-stone-700 focus:outline-none focus:border-gold-500/60 font-mono"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] text-stone-500 uppercase font-mono mb-1 tracking-wider">Mobile Number</p>
                          <input
                            id="payment-billing-phone"
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 99999 99999"
                            className="w-full text-xs bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 placeholder-stone-700 focus:outline-none focus:border-gold-500/60 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-stone-900" />

                  {/* Instructor/Chef Custom Private Area */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 block font-medium">
                      Bespoke Notes to Private Chef
                    </label>
                    <textarea
                      value={chefInstructions}
                      onChange={(e) => setChefInstructions(e.target.value)}
                      placeholder="Specify cuts, dry-age preferences, extra sea salt flakes, or custom culinary requests..."
                      className="w-full text-xs bg-stone-900 border border-stone-800 rounded-xl p-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-gold-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Calculation & Swipe to Submit Area */}
            {cart.length > 0 && !orderReceipt && (
              <div className="p-6 border-t border-stone-900 bg-stone-950 space-y-6">
                {/* Cost Breakdown */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-stone-400">
                    <span>SELECTION SUBTOTAL</span>
                    <span className="text-stone-300">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>DELIVERY TAX (8%)</span>
                    <span className="text-stone-300">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>VIP TRANSPORT FEES</span>
                    <span className={`${deliveryFee === 0 ? 'text-gold-400 font-medium' : 'text-stone-300'}`}>
                      {deliveryFee === 0 ? 'WAIVED' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-stone-900 pt-3 flex justify-between text-sm font-sans font-medium text-stone-100">
                    <span className="font-serif tracking-wide">GRAND BILLING</span>
                    <span className="font-mono text-gold-400 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* SECURE CHECKOUT & SLIDER GESTURE COMBO */}
                {isProcessing ? (
                  <div className="w-full bg-stone-900 border border-stone-850 px-4 py-5 rounded-xl flex flex-col items-center justify-center gap-3.5">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      <span className="text-xs uppercase font-mono text-gold-400 tracking-widest animate-pulse">
                        Processing Vault Order...
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-400 text-center max-w-[280px] leading-relaxed font-sans">
                      Secure Razorpay modal triggered! If your browser or iframe sandbox is blocking the popup window, please use the test-mode bypass helper below:
                    </p>

                    <div className="flex flex-col w-full gap-2 pt-1.5 border-t border-stone-850/60">
                      <button
                        onClick={handleBypassSimulation}
                        className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-serif font-semibold text-xs rounded-lg active:scale-95 transition cursor-pointer"
                      >
                        ⚡ Simulate Test Payment Success
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsProcessing(false);
                          setSwipeCompleted(false);
                          setDragX(0);
                        }}
                        className="w-full py-1.5 px-4 text-[10px] text-stone-500 hover:text-stone-300 font-mono uppercase tracking-wider active:scale-95 transition cursor-pointer"
                      >
                        Cancel & Edit Cart
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Primary Tactile Click Checkout Button */}
                    <button
                      id="click-checkout-btn"
                      onClick={() => {
                        console.log('[Razorpay Flow] Secure Checkout Button clicked. Triggering script and checkout...');
                        triggerOrderPlacement();
                      }}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:to-gold-300 active:scale-[0.99] text-stone-950 rounded-xl font-serif text-sm font-semibold tracking-wide shadow-lg cursor-pointer transition-all duration-200"
                    >
                      <ShieldCheck className="w-4.5 h-4.5" />
                      SECURE CHECKOUT — ₹{grandTotal.toLocaleString('en-IN')}
                    </button>

                    {/* Or Swipe Label Indicator */}
                    <div className="relative flex items-center justify-center py-1">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-900"></div></div>
                      <span className="relative px-3 bg-stone-950 text-[9px] text-stone-500 uppercase font-mono tracking-widest">or swipe handle below</span>
                    </div>

                    {/* Slide to Confirm Track */}
                    <div
                      ref={trackRef}
                      id="swipe-confirm-track"
                      className="relative w-full h-14 bg-stone-900 border border-stone-850 rounded-xl p-1 select-none overflow-hidden opacity-90 hover:opacity-100 transition-opacity"
                    >
                      {/* Sliding Label Backdrop */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase font-medium animate-pulse">
                          » Drag slider to complete order »
                        </span>
                      </div>

                      {/* Left Active Progress Overlay */}
                      <div
                        style={{ width: `${dragX + 24}px` }}
                        className="absolute top-1 bottom-1 left-1 bg-gradient-to-r from-gold-900/40 to-gold-500/20 rounded-lg pointer-events-none transition-all duration-75"
                      />

                      {/* Drag Handle */}
                      <motion.div
                        ref={handleRef}
                        id="swipe-confirm-handle"
                        drag="x"
                        dragConstraints={{ left: 0, right: maxDrag }}
                        dragElastic={0}
                        dragMomentum={false}
                        dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
                        onDragStart={() => setIsSwiping(true)}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        onTap={() => {
                          console.log('[Razorpay Flow] Slider handle tapped/clicked. Executing sequence...');
                          triggerOrderPlacement();
                        }}
                        animate={swipeCompleted ? { x: maxDrag } : { x: dragX }}
                        style={{ touchAction: 'none' }}
                        className="absolute top-1 bottom-1 left-1 w-12 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                      >
                        {swipeCompleted ? (
                          <Check className="w-5 h-5 text-stone-950 font-bold" />
                        ) : (
                          <Award className="w-5 h-5 text-stone-950 font-medium" />
                        )}
                      </motion.div>
                    </div>

                    {/* Iframe sandbox popup blocker helper */}
                    <div className="p-3.5 bg-gold-950/20 border border-gold-900/20 rounded-xl">
                      <p className="text-[10px] leading-relaxed text-gold-300/90 font-sans">
                        💡 <strong className="font-semibold text-gold-400">Sandbox Preview Tip:</strong> If the Razorpay secure login or modal does not render, please click the <strong className="text-gold-200">"Open in New Tab"</strong> button in the top-right corner of AI Studio to escape browser iframe cookie limits.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Floating high-contrast luxury alert toasts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{ zIndex: 99999 }}
            className={`fixed bottom-6 right-6 left-6 md:left-auto md:w-96 p-4 rounded-xl border flex items-start gap-3.5 backdrop-blur-md shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/55 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-955/95 border-rose-500/55 text-rose-300'
                : 'bg-stone-900/95 border-gold-500/25 text-stone-200'
            }`}
          >
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' 
                : toast.type === 'error' 
                ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]' 
                : 'bg-gold-400 shadow-[0_0_10px_#fbbf24]'
            }`} />
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-mono tracking-widest uppercase font-semibold">
                {toast.type === 'success' ? 'Vault Status: Active' : toast.type === 'error' ? 'Vault Alert: Handshake Cancelled' : 'Information'}
              </p>
              <p className="text-xs font-serif leading-relaxed text-stone-300">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-stone-500 hover:text-stone-200 transition p-0.5 hover:bg-stone-950/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
