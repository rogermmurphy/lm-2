import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLM } from '../context/LMContext';
import { rarityColors } from '../data/storeItems';

/**
 * Store Item Card Component
 * 
 * Displays a purchasable item in the XP Store
 * Shows rarity, cost, and ownership status
 * Supports hover preview
 */

const StoreItemCard = ({ item, owned, canAfford, onPurchase }) => {
  const { previewItem, clearPreview } = useLM();
  const [showTooltip, setShowTooltip] = useState(false);
  const rarity = rarityColors[item.rarity] || rarityColors.common;

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (!owned && (item.type === 'accessory' || item.type === 'effect' || item.type === 'expression')) {
      previewItem(item);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    clearPreview();
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative bg-gradient-to-br ${rarity.bg}
        backdrop-blur-lg rounded-2xl p-6
        border-2 ${rarity.border}
        ${owned ? 'opacity-75' : ''}
        transition-all cursor-pointer
        ${!owned && canAfford ? rarity.glow : ''}
      `}
    >
      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold 
                      px-3 py-1 rounded-full">
          ✓ OWNED
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`absolute top-3 left-3 ${rarity.text} text-xs font-bold uppercase`}>
        {item.rarity}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50 w-64"
          >
            <div className={`
              bg-gray-900/95 backdrop-blur-xl rounded-xl p-3 
              border-2 ${rarity.border} ${rarity.glow} shadow-2xl
            `}>
              <div className="text-xs text-gray-400 mb-1">
                {item.type.toUpperCase()} • <span className={rarity.text}>{item.rarity.toUpperCase()}</span>
              </div>
              <div className="text-white font-bold mb-1">{item.name}</div>
              <div className="text-gray-300 text-xs mb-2">{item.preview}</div>
              <div className="text-yellow-300 text-sm font-bold">{item.cost} XP</div>
              {!owned && canAfford && item.type !== 'background' && (
                <div className="text-blue-300 text-xs mt-1">Hover to preview! 👁️</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Icon */}
      <motion.div
        animate={
          !owned && canAfford
            ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl text-center mb-4 mt-6"
      >
        {item.icon}
      </motion.div>

      {/* Item Info */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {item.name}
        </h3>
        <p className="text-gray-300 text-sm mb-3">
          {item.description}
        </p>
        <div className="text-xs text-gray-400">
          {item.preview}
        </div>
      </div>

      {/* Cost & Purchase Button */}
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {item.cost} XP
          </div>
        </div>

        <button
          onClick={() => onPurchase(item)}
          disabled={owned || !canAfford}
          className={`
            w-full py-3 rounded-lg font-bold transition-all
            transform hover:scale-105 disabled:scale-100
            ${owned
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : canAfford
              ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white hover:shadow-lg'
              : 'bg-red-900/50 text-red-300 cursor-not-allowed border-2 border-red-500'
            }
          `}
        >
          {owned ? '✓ Owned' : canAfford ? '🛒 Purchase' : '❌ Not Enough XP'}
        </button>
      </div>

      {/* Sparkle effects for affordable items */}
      {!owned && canAfford && (
        <>
          <motion.div
            className="absolute top-4 right-12 text-yellow-300 text-xl"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-12 text-yellow-300 text-xl"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, -180, -360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            ✨
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default StoreItemCard;
