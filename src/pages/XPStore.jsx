import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useXP } from '../context/XPContext';
import { useLM } from '../context/LMContext';
import StoreItemCard from '../components/StoreItemCard';
import { storeItems } from '../data/storeItems';

/**
 * XP Store - Shop for LM Cosmetics
 * 
 * Features:
 * - Purchase cosmetic items with XP
 * - Filter by category
 * - Ownership tracking
 * - Purchase confirmations
 * - LM mood reactions
 * - Sparkle animations on purchase
 */

const XPStore = () => {
  const { xp, removeXP } = useXP();
  const { inventory, addToInventory } = useLM();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [showXPDeduction, setShowXPDeduction] = useState(false);
  const [deductedAmount, setDeductedAmount] = useState(0);
  const [filter, setFilter] = useState('all');

  const handlePurchaseClick = (item) => {
    const canAfford = xp >= item.cost;
    const alreadyOwned = inventory.includes(item.id);

    if (alreadyOwned) {
      return; // Already owned, do nothing
    }

    if (!canAfford) {
      // Show LM sad reaction (tired mood)
      if (window.setLMMood) {
        window.setLMMood('tired');
      }
      return;
    }

    // Show confirmation modal
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedItem) return;

    // Show XP deduction animation
    setDeductedAmount(selectedItem.cost);
    setShowXPDeduction(true);
    
    // Deduct XP after animation starts
    setTimeout(() => {
      removeXP(selectedItem.cost);
    }, 300);

    // Add to inventory (triggers LM proud mood automatically)
    addToInventory(selectedItem.id);

    // Close modal
    setShowConfirmModal(false);

    // Show success animation
    setShowPurchaseSuccess(true);

    // Hide animations
    setTimeout(() => {
      setShowXPDeduction(false);
    }, 2000);
    
    setTimeout(() => {
      setShowPurchaseSuccess(false);
      setSelectedItem(null);
    }, 3000);
  };

  const cancelPurchase = () => {
    setShowConfirmModal(false);
    setSelectedItem(null);
  };

  // Filter items
  const filteredItems = filter === 'all'
    ? storeItems
    : storeItems.filter(item => item.type === filter);

  // Count items by type
  const itemCounts = {
    all: storeItems.length,
    accessory: storeItems.filter(i => i.type === 'accessory').length,
    effect: storeItems.filter(i => i.type === 'effect').length,
    background: storeItems.filter(i => i.type === 'background').length,
    expression: storeItems.filter(i => i.type === 'expression').length,
    special: storeItems.filter(i => i.type === 'special').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🛍️ XP Store
          </motion.h1>
          <p className="text-gray-300 text-xl mb-6">
            Unlock awesome cosmetics for your LM buddy!
          </p>

          {/* XP Balance */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block bg-gradient-to-r from-[#ff66cc]/20 to-[#a066ff]/20 
                     backdrop-blur-lg rounded-full px-8 py-4 border-2"
            style={{ borderColor: '#ff66cc' }}
          >
            <span className="text-white text-2xl font-bold">
              💰 {xp.toLocaleString()} XP
            </span>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { value: 'all', label: '🎨 All Items', count: itemCounts.all },
              { value: 'accessory', label: '👔 Accessories', count: itemCounts.accessory },
              { value: 'effect', label: '✨ Effects', count: itemCounts.effect },
              { value: 'background', label: '🖼️ Backgrounds', count: itemCounts.background },
              { value: 'expression', label: '😊 Expressions', count: itemCounts.expression },
              { value: 'special', label: '⭐ Special', count: itemCounts.special },
            ].map(category => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105
                  ${filter === category.value
                    ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }
                `}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          {filteredItems.map(item => (
            <StoreItemCard
              key={item.id}
              item={item}
              owned={inventory.includes(item.id)}
              canAfford={xp >= item.cost}
              onPurchase={handlePurchaseClick}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400 text-xl">
              No items in this category yet!
            </p>
          </div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={cancelPurchase}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 
                         max-w-md w-full border-4"
                style={{ borderColor: '#ff66cc' }}
              >
                <div className="text-center">
                  {/* Item Icon */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    {selectedItem.icon}
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-2">
                    Confirm Purchase
                  </h2>
                  <p className="text-xl text-gray-300 mb-4">
                    {selectedItem.name}
                  </p>

                  {/* Cost */}
                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <div className="text-gray-400 text-sm mb-2">Cost</div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {selectedItem.cost} XP
                    </div>
                    <div className="text-sm text-gray-400">
                      You'll have {(xp - selectedItem.cost).toLocaleString()} XP left
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={cancelPurchase}
                      className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold 
                               rounded-lg transition-all"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      onClick={confirmPurchase}
                      className="flex-1 py-3 bg-gradient-to-r from-[#ff66cc] to-[#a066ff] 
                               hover:shadow-lg text-white font-bold rounded-lg transition-all
                               transform hover:scale-105"
                    >
                      ✅ Purchase
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Success */}
        <AnimatePresence>
          {showPurchaseSuccess && selectedItem && (
            <>
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={300}
                gravity={0.3}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="bg-gradient-to-br from-green-900/95 to-emerald-900/95 backdrop-blur-xl 
                             rounded-3xl p-12 border-4 border-green-400 shadow-2xl text-center">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    {selectedItem.icon}
                  </motion.div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Purchase Successful!
                  </h2>
                  <p className="text-2xl text-green-300">
                    {selectedItem.name} is now yours! 🎉
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* XP Deduction Animation */}
        <AnimatePresence>
          {showXPDeduction && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -100, scale: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-red-900/90 backdrop-blur-xl rounded-2xl px-8 py-4 border-3 border-red-500 shadow-2xl">
                <div className="text-5xl font-bold text-white text-center">
                  -{deductedAmount} XP
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-[#ff66cc]/10 to-[#a066ff]/10 backdrop-blur-lg 
                       rounded-xl p-6 border" style={{ borderColor: '#ff66cc' }}>
            <h3 className="text-xl font-bold text-white mb-3">
              💡 How to Earn More XP
            </h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Complete daily tasks (+25 XP each)</li>
              <li>• Finish study sessions (+50-100 XP)</li>
              <li>• Ace quizzes and tests (+50-100 XP)</li>
              <li>• Win games (+25-75 XP)</li>
              <li>• Build study streaks (bonus XP!)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPStore;
