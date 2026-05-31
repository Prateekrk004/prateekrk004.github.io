/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, MessageSquare, ShieldCheck, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "A marvelous day, Mr. Sterling. It is my absolute privilege to attend to your private culinary bookings today. Would you like a vintage red recommendation for your Mutton Rogan Josh feast, or perhaps details regarding our master cuts?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatScrollEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatScrollEndRef.current) {
      chatScrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (!response.ok) {
        throw new Error('Our vintage cellar network is experiencing difficulties.');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "My humblest apologies, Mr. Sterling, but my digital cellar connection of fine wines seems momentarily delayed. I can confidently assure you that a dry, oak-infused Cabernet Sauvignon pairs majestically with our Signature Rogan Josh.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  const starterPrompts = [
    { label: '🍷 Suggest Mutton Rogan Josh wine pairing', text: 'Recommend a grand wine pairing for the 12-hour Mutton Rogan Josh.' },
    { label: '🥩 What is A5 Wagyu?', text: 'Explain the origin and quality levels of our Wagyu Burger cuts.' },
    { label: '🍮 Dessert recommendations', text: 'Recommend dessert options matched with sweet wines.' },
  ];

  return (
    <div id="sterling-service-concierge" className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!isOpen ? (
          /* Concierge Floating Bubble Button */
          <motion.button
            key="chat-badge-button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 px-4 py-3 rounded-full shadow-2xl active:scale-95 transition duration-350 select-none z-40 border border-gold-400/30 font-serif font-medium text-xs tracking-wider cursor-pointer"
          >
            <Award className="w-4 h-4 text-stone-950 animate-pulse" />
            <span>Consult Butler Sommelier</span>
          </motion.button>
        ) : (
          /* Full Screen Pane Overlay */
          <motion.div
            key="chat-overlay-pane"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-96 h-[510px] bg-stone-950 border border-stone-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-stone-900 bg-stone-950 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <div>
                  <h4 className="font-serif text-sm font-medium text-stone-200">Butler Sommelier Consultation</h4>
                  <p className="text-[9px] font-mono tracking-widest text-gold-500 uppercase mt-0.5">
                    Private Cellar Ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 px-2 border border-stone-850 hover:border-gold-500/50 hover:bg-stone-900 rounded text-stone-400 hover:text-stone-200 transition text-[9px] font-mono"
              >
                CLOSE
              </button>
            </div>

            {/* Chat message thread panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-950/20">
              {messages.map((message, idx) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1`}
                  >
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest px-1">
                      {isAssistant ? 'Sterling Butler' : 'Alexander Sterling'}
                    </span>
                    <div
                      className={`max-w-[85%] text-xs font-light leading-relaxed p-3.5 rounded-xl border ${
                        isAssistant
                          ? 'bg-stone-900/60 border-stone-850 text-stone-300 rounded-tl-none font-serif tracking-wide italic'
                          : 'bg-gold-500/10 border-gold-500/30 text-gold-200 rounded-tr-none'
                      }`}
                    >
                      {/* Simple formatted paragraphs renderer for Butler responses */}
                      {message.content.split('\n').map((para, pIdx) => (
                        <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Loader */}
              {isLoading && (
                <div className="flex flex-col items-start space-y-1">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest px-1">
                    Sterling Butler
                  </span>
                  <div className="flex items-center gap-2 bg-stone-900/30 border border-stone-900 p-3 rounded-xl rounded-tl-none">
                    <Loader2 className="w-3.5 h-3.5 text-gold-500 animate-spin" />
                    <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">
                      Decanting cellar logs...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatScrollEndRef} />
            </div>

            {/* Quick Context Prompt Helpers */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-stone-900 bg-stone-950 space-y-1.5 flex-shrink-0">
                <p className="text-[8px] font-mono text-stone-500 uppercase tracking-widest pl-1">
                  Quick Consult Queries
                </p>
                <div className="flex flex-col gap-1">
                  {starterPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.text)}
                      className="text-left text-[10px] text-stone-400 hover:text-gold-400 bg-stone-900 hover:bg-stone-850 px-2.5 py-1.5 border border-stone-900 rounded transition truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form container */}
            <div className="p-3 border-t border-stone-900 bg-stone-950 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeys}
                placeholder="Ask our Certified Sommelier Butler..."
                className="flex-1 text-xs bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-gold-500"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 text-stone-950 rounded-lg transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
