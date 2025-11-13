import React from 'react';
import { motion } from 'framer-motion';
import { useXP } from '../context/XPContext';

/**
 * XP Navbar Component
 * 
 * Global navigation bar showing XP, level, and progress
 * Appears at top of all pages
 */

const XPNavbar = () => {
  const { xp, level, xpInCurrentLevel, xpToNextLevel, progressToNextLevel } = useXP();

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b"
      style={{ borderColor: '#ff66cc' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div>
            <h2 className="text-white font-bold text-lg">
              Learning Monster
            </h2>
          </div>

          {/* Center: XP Progress Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center gap-3">
              {/* Level Icon */}
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border-3"
                  style={{
                    background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
                    borderColor: '#ffffff'
                  }}
                >
                  {level}
                </div>
              </div>

              {/* XP Bar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm">
                    {xp.toLocaleString()} XP
                  </span>
                  <span className="text-gray-400 text-xs">
                    Lv. {level + 1}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ff66cc, #a066ff)',
                      width: `${progressToNextLevel()}%`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNextLevel()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {xpInCurrentLevel} / {xpToNextLevel} to next level
                </div>
              </div>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
            >
              🏠 Home
            </button>
            <button
              onClick={() => window.location.href = '/store'}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
            >
              🛍️ Store
            </button>
            <button
              onClick={() => window.location.href = '/customize'}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
            >
              🎨 Customize
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default XPNavbar;
