/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Sparkles, Flame, Plus, Minus, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSpice?: 'Mild' | 'Medium' | 'Extra Spicy',
    enhancements?: { name: string; price: number }[]
  ) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToBag }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSpice, setSelectedSpice] = useState<'Mild' | 'Medium' | 'Extra Spicy' | undefined>(
    item.spiceLevel ? 'Medium' : undefined
  );
  const [selectedEnhancements, setSelectedEnhancements] = useState<{ name: string; price: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showGoldRipple, setShowGoldRipple] = useState(false);

  // High-End enhancements depending on categories
  const getEnhancementsForCategory = (category: string) => {
    switch (category) {
      case 'Starters':
        return [
          { name: 'Toasted Saffron Paratha', price: 150 },
          { name: 'Gold Leaf Garnish', price: 300 }
        ];
      case 'Signature Mains':
        return [
          { name: 'Shaved Black Truffle', price: 350 },
          { name: 'Bone Marrow Infusion', price: 200 }
        ];
      case 'Coastal Seafood':
        return [
          { name: 'Sweet Bay Scallop Pair', price: 400 },
          { name: 'Saffron Cream Glaze', price: 180 }
        ];
      case 'Desserts':
        return [
          { name: 'Madagascar Vanilla Bean Scoop', price: 150 },
          { name: 'Crushed Gold Pistachios', price: 100 }
        ];
      default:
        return [];
    }
  };

  const enhancements = getEnhancementsForCategory(item.category);

  // Toggle enhancement selections
  const toggleEnhancement = (enhNode: { name: string; price: number }) => {
    if (selectedEnhancements.some((e) => e.name === enhNode.name)) {
      setSelectedEnhancements(selectedEnhancements.filter((e) => e.name !== enhNode.name));
    } else {
      setSelectedEnhancements([...selectedEnhancements, enhNode]);
    }
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAdd = () => {
    onAddToBag(item, quantity, selectedSpice, selectedEnhancements);
    setShowGoldRipple(true);
    setTimeout(() => {
      setShowGoldRipple(false);
    }, 1200);
    // Reset state but keep spice selection
    setQuantity(1);
    setSelectedEnhancements([]);
  };

  const calculateCustomPrice = () => {
    const enhancementSum = selectedEnhancements.reduce((sum, e) => sum + e.price, 0);
    return (item.price + enhancementSum) * quantity;
  };

  return (
    <motion.div
      id={`menu-item-card-${item.id}`}
      className="relative flex flex-col justify-between w-full h-full bg-stone-900/50 hover:bg-stone-900 border border-stone-800/80 hover:border-gold-500/50 rounded-2xl overflow-hidden transition-all duration-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Visual background ambient lighting */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-gold-500/10 transition-all duration-500" />

      <div>
        {/* Item Image with Fallback */}
        <div className="relative w-full h-56 bg-stone-950 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-stone-600 bg-stone-950/80 border-b border-stone-800">
              <Sparkles className="w-12 h-12 text-gold-400/40 mb-2 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-serif font-light text-stone-500">Fine Selection</span>
            </div>
          )}

          {/* Badge overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className="bg-stone-950/95 text-gold-400 border border-gold-500/30 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur mx-auto">
              {item.category === 'Signature Mains' ? 'Signature Masterpiece' : item.category}
            </span>
            {item.available !== false ? (
              <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md shadow-lg backdrop-blur self-start leading-none">
                Available
              </span>
            ) : (
              <span className="bg-rose-955/90 text-rose-400 border border-rose-500/30 text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md shadow-lg backdrop-blur self-start leading-none animate-pulse">
                Sold Out
              </span>
            )}
          </div>

          {/* Star Rating Overlay */}
          {item.rating && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-stone-950/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-stone-800 shadow-md">
              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
              <span className="text-[11px] font-mono font-medium text-stone-200">{item.rating}</span>
            </div>
          )}

          {/* Luxury Add Splash Feedback */}
          <AnimatePresence>
            {showGoldRipple && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center z-20"
              >
                <div className="p-3 bg-gold-500/10 border border-gold-500/40 rounded-full mb-2">
                  <ShieldCheck className="w-8 h-8 text-gold-400" />
                </div>
                <p className="text-xl font-serif text-gold-400 font-light italic">Reserved for Order</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mt-1">Ready for check out</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card info body */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif text-xl font-medium tracking-wide text-stone-100 group-hover:text-gold-300 transition-colors duration-300">
              {item.name}
            </h3>
            <span className="font-mono text-lg font-light text-gold-400 whitespace-nowrap pl-2">
              ₹{item.price.toLocaleString('en-IN')}
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed font-light mb-4 min-h-[48px] line-clamp-3">
            {item.description}
          </p>

          <hr className="border-stone-800 mb-4" />

          {/* Spice Options (If Applicable) */}
          {item.spiceLevel && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-stone-400">Heat Profile</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium', 'Extra Spicy'] as const).map((spice) => {
                  const isActive = selectedSpice === spice;
                  return (
                    <button
                      key={spice}
                      onClick={() => setSelectedSpice(spice)}
                      className={`text-[10px] uppercase font-mono tracking-wider py-1.5 rounded-md border transition-all duration-300 ${
                        isActive
                          ? 'bg-rose-950/40 border-rose-500 text-rose-400'
                          : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      {spice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Luxury Custom Enhancements (Black Card Signature Option) */}
          {enhancements.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-400 block mb-2">
                Bespoke Pairings & Additions
              </span>
              <div className="flex flex-col gap-1.5">
                {enhancements.map((enh) => {
                  const isSelected = selectedEnhancements.some((e) => e.name === enh.name);
                  return (
                    <button
                      key={enh.name}
                      onClick={() => toggleEnhancement(enh)}
                      className={`flex justify-between items-center text-[10px] text-left px-3 py-2 rounded-lg border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gold-500/10 border-gold-500/40 text-gold-300'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <span className="truncate pr-1">
                        {isSelected ? '✓ ' : '+ '}
                        {enh.name}
                      </span>
                      <span className="font-mono text-gold-400/90 font-light flex-shrink-0">
                        +₹{enh.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Control Row */}
      <div className="p-6 pt-0 bg-gradient-to-t from-stone-950/40 to-transparent">
        <div className="flex items-center justify-between gap-4 mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-1.5">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || item.available === false}
              className="p-1 disabled:opacity-40 text-stone-400 hover:text-gold-400 hover:bg-stone-900/50 rounded-md transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-xs text-stone-200">{item.available === false ? 0 : quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={item.available === false}
              className="p-1 disabled:opacity-40 text-stone-400 hover:text-gold-400 hover:bg-stone-900/50 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Bag Button / Sold Out State */}
          {item.available !== false ? (
            <button
              onClick={handleAdd}
              className="flex-1 flex justify-between items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-serif font-medium tracking-wide text-xs px-4 py-3 rounded-lg shadow-lg active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span>Add to Order</span>
              <span className="font-mono bg-stone-950/10 text-stone-950 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                ₹{calculateCustomPrice().toLocaleString('en-IN')}
              </span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 flex justify-center items-center gap-2 bg-stone-800/80 border border-stone-750 text-stone-500 font-serif font-light tracking-wide text-xs px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
            >
              <span>Temporarily Sold Out</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
