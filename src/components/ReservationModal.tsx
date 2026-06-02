/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Users, Clock, Loader2, Sparkles, Map, CheckCircle2, Ticket, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reservation } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReservation: (reservation: Reservation) => void;
}

interface SeatingTable {
  id: number;
  name: string;
  capacity: number;
  description: string;
  status: 'Occupied' | 'Vacant';
}

const LUXE_TABLES: SeatingTable[] = [
  { id: 1, name: 'The Hearthside Vault', capacity: 2, description: 'Direct fireplace viewing, plush velvet armchairs.', status: 'Vacant' },
  { id: 2, name: 'The Certified Cellar', capacity: 4, description: 'Framed by 400-year-old French vintage bins, custom stone arches.', status: 'Vacant' },
  { id: 3, name: 'Imperial Courtyard Alcovia', capacity: 6, description: 'Semi-private garden pavilion with raw granite water features.', status: 'Vacant' },
  { id: 4, name: 'Bespoke Piano Suite', capacity: 2, description: 'Adjacent to our live Steinway grand lounge.', status: 'Occupied' },
  { id: 5, name: 'Private Sommelier Round', capacity: 8, description: 'Exclusive center-stage dining beneath our gold crystal rotunda.', status: 'Vacant' },
];

export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onConfirmReservation }) => {
  const [partySize, setPartySize] = useState('4');
  const [date, setDate] = useState('2026-06-15');
  const [time, setTime] = useState('20:00');
  const [selectedTable, setSelectedTable] = useState<SeatingTable | null>(LUXE_TABLES[1]); // Default to Table 2
  const [specialRemarks, setSpecialRemarks] = useState('');
  const [sommelierPairing, setSommelierPairing] = useState('');
  const [sommelierLoading, setSommelierLoading] = useState(false);
  const [confirmedInv, setConfirmedInv] = useState<Reservation | null>(null);

  // Consult Butler Sommelier
  const consultSommelierCellar = async () => {
    if (!selectedTable) return;
    setSommelierLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/reservations/sommelier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestCount: partySize,
          occasion: specialRemarks || 'Luxurious Sovereign Feast',
          timeSlot: time,
          tableNum: selectedTable.id,
        }),
      });
      const data = await response.json();
      setSommelierPairing(data.pairings);
    } catch (e) {
      console.error(e);
      setSommelierPairing('*A divine choice, Mr. Sterling. The cellar is prepared with a bottle of Chateau Margaux 1996 and Dom Pérignon to elevate your evening.*');
    } finally {
      setSommelierLoading(false);
    }
  };

  const handleBookingConfirm = () => {
    const freshReservation: Reservation = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      partySize: `${partySize} Guests`,
      date,
      time,
      specialRequests: `${specialRemarks || 'Standard Royal Preference'} (Reserved: ${selectedTable?.name})`,
      confirmedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setConfirmedInv(freshReservation);
    onConfirmReservation(freshReservation);
  };

  const handleReset = () => {
    setConfirmedInv(null);
    setSommelierPairing('');
    setSpecialRemarks('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header branding */}
            <div className="p-6 border-b border-stone-900 bg-stone-950 flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-gold-500 font-semibold">
                  Sovereign Experience
                </span>
                <h3 className="font-serif text-2xl font-light text-stone-100 mt-1">Book Your Private Table</h3>
              </div>
              <button
                onClick={handleReset}
                className="p-1 px-3 border border-stone-850 hover:border-gold-500/50 hover:bg-stone-900 rounded-md text-stone-500 hover:text-stone-300 transition text-[10px] font-mono tracking-wide"
              >
                CLOSE
              </button>
            </div>

            {/* Inner scrollable area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {confirmedInv ? (
                /* Invitation Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-6"
                >
                  <div className="inline-block p-4 bg-gradient-to-tr from-gold-600/10 to-gold-400/20 border border-gold-500/30 rounded-full mb-1">
                    <CheckCircle2 className="w-12 h-12 text-gold-400" />
                  </div>
                  
                  {/* Fine Invitation Card */}
                  <div className="max-w-md mx-auto border border-gold-500/30 bg-stone-900/40 p-6 rounded-2xl relative shadow-2xl">
                    {/* Golden design accent corner lines */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-gold-500/40" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-gold-500/40" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-gold-500/40" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-gold-500/40" />

                    <div className="space-y-4">
                      <span className="text-[9px] uppercase tracking-widest font-mono text-gold-500 block">
                        INVITATION TO FEAST
                      </span>

                      <h4 className="font-serif text-2xl font-normal text-stone-100">{selectedTable?.name}</h4>

                      <div className="grid grid-cols-3 gap-2 border-y border-stone-800/80 py-4 font-mono text-xs">
                        <div>
                          <p className="text-[9px] text-stone-500 tracking-wider">SOVEREIGNS</p>
                          <p className="text-stone-200 mt-1">{confirmedInv.partySize}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-stone-500 tracking-wider">DATE SCHEDULE</p>
                          <p className="text-stone-200 mt-1">{confirmedInv.date}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-stone-500 tracking-wider">TIME SEATING</p>
                          <p className="text-stone-200 mt-1">{confirmedInv.time}</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-stone-400 font-mono text-left bg-stone-950/60 p-3 rounded-lg border border-stone-900 space-y-1">
                        <p className="text-gold-500/90 font-semibold uppercase tracking-wider text-[9px]">DIRECTIONS & SERVICES</p>
                        <p>• Room: {selectedTable?.description}</p>
                        <p>• Invitation reference: {confirmedInv.id}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 font-light max-w-sm mx-auto leading-relaxed">
                    A certified master butler will be assigned to your suite upon key check-in. The vintage cellar selections are staged for temperature.
                  </p>

                  <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-serif font-medium text-xs tracking-wide rounded-md active:scale-95 transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Assemble Dining Room
                  </button>
                </motion.div>
              ) : (
                /* Primary Reservation Form */
                <div className="space-y-6">
                  {/* Inputs row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gold-400" />
                        GUESTS
                      </label>
                      <select
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} Sovereigns
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold-400" />
                        DATE
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        SESSION TIME
                      </label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-gold-500"
                      >
                        {['12:30', '13:30', '18:00', '19:00', '20:00', '21:00', '22:00'].map((slot) => (
                          <option key={slot} value={slot}>
                            {slot} Hours
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Floor/Bespoke Tables Grid Seating Selector */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 flex items-center gap-1.5 font-medium">
                      <Map className="w-3.5 h-3.5 text-gold-400" />
                      Elite Seating Map & Table Locations
                    </label>

                    <div className="flex flex-col gap-2.5">
                      {LUXE_TABLES.map((table) => {
                        const isSelected = selectedTable?.id === table.id;
                        const isOccupied = table.status === 'Occupied';
                        return (
                          <button
                            key={table.id}
                            id={`table-option-${table.id}`}
                            disabled={isOccupied}
                            onClick={() => setSelectedTable(table)}
                            className={`flex justify-between items-center text-left p-3.5 border rounded-xl transition duration-300 relative overflow-hidden ${
                              isOccupied
                                ? 'bg-stone-900/10 border-stone-950 opacity-40 cursor-not-allowed'
                                : isSelected
                                ? 'bg-gold-500/5 border-gold-500 text-stone-200'
                                : 'bg-stone-900/30 border-stone-900 text-stone-400 hover:border-stone-850 hover:text-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-gold-500">
                                  TABLE 0{table.id}
                                </span>
                                <h5 className="font-serif text-sm font-medium text-stone-100">
                                  {table.name}
                                </h5>
                                <span className="text-[9px] font-mono text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">
                                  UP TO {table.capacity} PAX
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-400 font-light mt-1">
                                {table.description}
                              </p>
                            </div>

                            <span className="text-[10px] font-mono uppercase tracking-widest">
                              {isOccupied ? 'Occupied' : isSelected ? '✓ Selected' : 'Vacant'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Occasion / Guest comments input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono tracking-widest uppercase text-stone-400 block font-medium">
                      Occasion / Culinary Directives
                    </label>
                    <input
                      type="text"
                      value={specialRemarks}
                      onChange={(e) => setSpecialRemarks(e.target.value)}
                      placeholder="e.g. Alexander's Birthday Feast, Wine Tasting Session, Dry-aged Beef focus..."
                      className="w-full text-xs bg-stone-900 border border-stone-850 rounded-xl p-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* AI INTEGRATOR: Consult elite Sommelier advice block */}
                  <div className="border border-gold-500/20 bg-gold-950/10 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                        <div>
                          <h4 className="font-serif text-sm text-gold-400">Sterling Sommelier Pairing</h4>
                          <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                            Real-Turn Gemini Cellar Consultation
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={consultSommelierCellar}
                        disabled={sommelierLoading || !selectedTable}
                        className="px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-950 hover:bg-stone-850 border border-gold-500/30 hover:border-gold-500 text-gold-400 font-serif text-[11px] tracking-wide rounded-md transition shadow active:scale-95 disabled:opacity-40"
                      >
                        {sommelierLoading ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> Cellar Analyst...
                          </div>
                        ) : (
                          'Inspect Pairing'
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {sommelierPairing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-stone-950/70 rounded-xl p-4 border border-stone-900"
                        >
                          <div className="text-xs text-stone-300 leading-relaxed font-light italic font-serif space-y-2 whitespace-pre-line">
                            {sommelierPairing}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action row */}
            {!confirmedInv && (
              <div className="p-6 border-t border-stone-900 bg-stone-950 flex gap-4 flex-shrink-0">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-300 font-serif text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingConfirm}
                  disabled={!selectedTable}
                  className="flex-1 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-serif font-medium tracking-wide text-xs rounded-lg shadow-lg active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  Confirm Dining Reservation
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
