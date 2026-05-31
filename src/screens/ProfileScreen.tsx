/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Order, SavedLocation } from '../types';
import { Award, ShieldAlert, Navigation, Plus, MapPin, ListCollapse, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileScreenProps {
  profile: UserProfile;
  orders: Order[];
  savedLocations: SavedLocation[];
  onUpdateProfile: (p: UserProfile) => void;
  onAddLocation: (loc: SavedLocation) => void;
  onRemoveLocation: (id: string) => void;
  user: any; // User | null
  onSignIn: () => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  orders,
  savedLocations,
  onUpdateProfile,
  onAddLocation,
  onRemoveLocation,
  user,
  onSignIn,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [isSaved, setIsSaved] = useState(false);

  // Sync with incoming asynchronous profile updates from Firebase
  React.useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
  }, [profile]);

  // Saved location form
  const [showLocForm, setShowLocForm] = useState(false);
  const [locLabel, setLocLabel] = useState('ANOTHER RESIDENCE');
  const [locAddress, setLocAddress] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locPostal, setLocPostal] = useState('');
  const [locInstructions, setLocInstructions] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      phone,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locAddress.trim() || !locCity.trim() || !locPostal.trim()) return;

    onAddLocation({
      id: `loc-${Date.now()}`,
      label: locLabel.toUpperCase(),
      address: locAddress,
      city: locCity,
      postalCode: locPostal,
      instructions: locInstructions ? `Delivery Instructions: ${locInstructions}` : undefined,
    });

    // Reset Form
    setLocAddress('');
    setLocCity('');
    setLocPostal('');
    setLocInstructions('');
    setLocLabel('ANOTHER RESIDENCE');
    setShowLocForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 pb-12 px-1">
      {/* Black Card Majestic banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-gold-500/20 p-8 rounded-3xl overflow-hidden shadow-2xl flex flex-col xl:flex-row items-center justify-between gap-6"
      >
        {/* Ambient radial gold glare */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2" />

        <div className="flex items-center gap-5 z-10 text-center md:text-left flex-col md:flex-row">
          <div className="p-4 bg-gradient-to-tr from-gold-600/10 to-gold-400/20 border border-gold-500/30 rounded-2xl shadow-xl flex-shrink-0">
            <Award className="w-14 h-14 text-gold-400 stroke-[1.25]" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-gold-500 text-stone-950 text-[9px] font-mono tracking-widest uppercase font-semibold px-2 py-0.5 rounded">
                BLACK CARD EXCLUSIVE
              </span>
              <span className="text-[10px] font-mono text-stone-500 uppercase">MEMBER SINCE 2024</span>
            </div>
            <h2 className="font-serif text-3xl font-light text-stone-100 mt-2">{profile.name}</h2>
            <p className="text-xs font-mono text-stone-400 mt-1 uppercase tracking-wider">
              Status: Sovereign Concierge Invitee
            </p>
          </div>
        </div>

        {/* Member Perks display cards */}
        <div className="flex gap-4 font-mono z-10 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <div className="bg-stone-900/60 border border-stone-850 p-4 rounded-xl text-center flex-1 md:flex-initial md:min-w-[120px]">
            <p className="text-[9px] text-stone-500 tracking-wider">DELIVERY FEES</p>
            <p className="text-gold-400 font-semibold text-xs mt-1.5 uppercase">WAIVED ALWAYS</p>
          </div>
          <div className="bg-stone-900/60 border border-stone-850 p-4 rounded-xl text-center flex-1 md:flex-initial md:min-w-[120px]">
            <p className="text-[9px] text-stone-500 tracking-wider">CELLAR AUDITS</p>
            <p className="text-gold-400 font-semibold text-xs mt-1.5 uppercase">VIP UNLIMITED</p>
          </div>
        </div>

        {/* Firebase Authentication Sync Block */}
        <div className="z-10 w-full md:w-auto flex justify-center flex-shrink-0">
          {user ? (
            <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl flex flex-col items-center gap-1.5 text-center min-w-[200px] font-mono">
              <span className="text-[9px] text-emerald-400 font-semibold tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Synced to Cloud
              </span>
              <p className="text-[9px] text-stone-400 truncate max-w-[170px] mt-0.5" title={user.email}>
                {user.email}
              </p>
              <button
                onClick={onSignOut}
                className="w-full text-[9px] bg-stone-900 hover:bg-stone-850 border border-stone-805 hover:border-rose-500/40 text-stone-400 hover:text-rose-400 tracking-widest py-1.5 rounded-lg uppercase mt-1 cursor-pointer transition font-mono font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="bg-gold-500/5 border border-gold-500/25 p-4 rounded-2xl flex flex-col items-center gap-1 text-center min-w-[200px] font-mono">
              <span className="text-[9px] text-gold-400 font-bold tracking-widest uppercase">
                Cloud Synchronizer
              </span>
              <p className="text-[8px] text-stone-400 leading-snug max-w-[180px]">
                Link with Google to back up reservations and recipes automatically.
              </p>
              <button
                onClick={onSignIn}
                className="w-full text-[9px] bg-gold-500 hover:bg-gold-400 text-stone-950 font-semibold font-sans tracking-wide py-1.5 px-2.5 rounded-lg uppercase mt-1.5 cursor-pointer transition shadow-xl flex items-center justify-center gap-1.5"
              >
                Connect Account
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand: Profile edit & saved coordinates (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Form */}
          <div className="bg-stone-900/10 border border-stone-900 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-xl font-medium tracking-wide text-stone-200">
              Personal Concierge Profile
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest text-stone-500 uppercase font-medium">
                    Full Name Label
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest text-stone-500 uppercase font-medium">
                    Phone Credentials
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-stone-500 uppercase font-medium">
                  Secure Secondary Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 border border-stone-800 hover:border-gold-500/50 hover:bg-stone-850 text-gold-400 font-serif text-xs rounded-md transition duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : 'Apply Preferences'}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Destinations list */}
          <div className="bg-stone-900/10 border border-stone-900 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-medium tracking-wide text-stone-200">
                Dispatch Coordinates
              </h3>
              <button
                onClick={() => setShowLocForm(!showLocForm)}
                className="text-[10px] font-mono tracking-widest uppercase font-semibold text-gold-400 flex items-center gap-1 hover:text-gold-300 bg-stone-900/50 border border-gold-500/20 hover:border-gold-500/40 px-3 py-1.5 rounded transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> ADD COORDS
              </button>
            </div>

            {/* Address Registration slide form */}
            <AnimatePresence>
              {showLocForm && (
                <motion.form
                  id="add-location-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddLocSubmit}
                  className="bg-stone-900/40 border border-stone-850 p-4 rounded-xl space-y-4 overflow-hidden"
                >
                  <p className="text-[9px] uppercase tracking-widest font-mono text-gold-500">
                    Register Private Destination
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[9px] font-mono text-stone-500 uppercase block">Label Name</label>
                      <select
                        value={locLabel}
                        onChange={(e) => setLocLabel(e.target.value)}
                        className="w-full text-xs bg-stone-950 border border-stone-850 p-2.5 rounded text-stone-300 focus:outline-none"
                      >
                        <option value="PRIMARY RESIDENCE">PRIMARY RESIDENCE</option>
                        <option value="OFFICE">OFFICE</option>
                        <option value="SUMMER MANOR">SUMMER MANOR</option>
                        <option value="PRIVATE CHALET">PRIVATE CHALET</option>
                      </select>
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[9px] font-mono text-stone-500 uppercase block">Security Gate Instructions</label>
                      <input
                        type="text"
                        value={locInstructions}
                        onChange={(e) => setLocInstructions(e.target.value)}
                        placeholder="Concierge, ring button, gate code..."
                        className="w-full text-xs bg-stone-950 border border-stone-850 p-2.5 rounded text-stone-300 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[9px] font-mono text-stone-500 uppercase block">Street Address</label>
                      <input
                        type="text"
                        value={locAddress}
                        onChange={(e) => setLocAddress(e.target.value)}
                        placeholder="123 Estate Blvd, Suite 400"
                        className="w-full text-xs bg-stone-950 border border-stone-850 p-2.5 rounded text-stone-300 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[9px] font-mono text-stone-500 uppercase block">City & State</label>
                      <input
                        type="text"
                        value={locCity}
                        onChange={(e) => setLocCity(e.target.value)}
                        placeholder="Beverly Hills, CA"
                        className="w-full text-xs bg-stone-950 border border-stone-850 p-2.5 rounded text-stone-300 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[9px] font-mono text-stone-500 uppercase block">ZIP/Postal Code</label>
                      <input
                        type="text"
                        value={locPostal}
                        onChange={(e) => setLocPostal(e.target.value)}
                        placeholder="90210"
                        className="w-full text-xs bg-stone-950 border border-stone-850 p-2.5 rounded text-stone-300 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLocForm(false)}
                      className="px-4 py-2 border border-stone-850 text-stone-400 hover:text-stone-300 font-mono text-[10px] uppercase rounded"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-stone-950 font-serif font-medium text-[11px] uppercase rounded cursor-pointer"
                    >
                      Authenticate Location
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List of active locations */}
            <div className="space-y-3">
              {savedLocations.map((loc, lIdx) => (
                <div
                  id={`saved-location-item-${loc.id}`}
                  key={`${loc.id}-${lIdx}`}
                  className="flex justify-between items-center p-4 border border-stone-900 bg-stone-900/20 hover:border-stone-800 rounded-xl transition"
                >
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-gold-400/5 border border-gold-500/20 rounded-lg hidden sm:block">
                      <MapPin className="w-4 h-4 text-gold-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-gold-500 uppercase font-bold">
                        {loc.label}
                      </p>
                      <p className="text-xs font-semibold text-stone-200 mt-1">{loc.address}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {loc.city}, {loc.postalCode}
                      </p>
                      {loc.instructions && (
                        <p className="text-[10px] text-stone-400 italic font-mono mt-1 pr-4">{loc.instructions}</p>
                      )}
                    </div>
                  </div>

                  {savedLocations.length > 1 && (
                    <button
                      onClick={() => onRemoveLocation(loc.id)}
                      className="text-[9px] font-mono uppercase text-rose-500 hover:bg-rose-950/20 hover:text-rose-400 p-2 rounded border border-stone-900 hover:border-rose-950 px-2.5 transition cursor-pointer"
                    >
                      REVOKE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Past order ledgers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900/10 border border-stone-900 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-xl font-medium tracking-wide text-stone-200">
              Bespoke Order Historics
            </h3>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-500 font-mono tracking-wider italic text-center py-6">
                No past transactions recorded inside ledger.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord, oIdx) => (
                  <div
                    id={`order-history-item-${ord.id}`}
                    key={`${ord.id}-${oIdx}`}
                    className="border border-stone-900 bg-stone-900/20 hover:bg-stone-900/40 rounded-xl p-4 space-y-3 transition"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-center font-mono">
                      <div>
                        <span className="text-xs font-semibold text-stone-200">{ord.id}</span>
                        <p className="text-[10px] text-stone-500">{ord.date}</p>
                      </div>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                            : ord.status === 'Shipped'
                            ? 'bg-blue-950/10 border-blue-500/30 text-blue-400'
                            : 'bg-gold-950/20 border-gold-500/30 text-gold-400 animate-pulse'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <hr className="border-stone-900" />

                    {/* Items inside past order */}
                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-light">
                          <span className="truncate pr-4 text-stone-300">
                            {it.name} <span className="text-stone-500">x{it.quantity}</span>
                          </span>
                          <span className="font-mono text-stone-400 whitespace-nowrap">
                            ₹{it.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-900/60 pt-3 flex justify-between items-center">
                      <span className="text-[10px] text-stone-500 font-mono uppercase">Full Transaction Billing</span>
                      <span className="font-serif text-sm font-semibold text-gold-300">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
