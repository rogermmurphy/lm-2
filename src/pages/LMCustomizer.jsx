import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLM } from '../context/LMContext';
import { storeItems } from '../data/storeItems';

/**
 * LM Customizer - Personalize Your LM Mascot
 * 
 * Features:
 * - Color picker for LM fur/body
 * - Accessory selector (owned items only)
 * - Expression selector
 * - Live preview
 * - Save preset to localStorage
 * - Randomize button
 * - LM mood reactions
 */

const LMCustomizer = () => {
  const { appearance, inventory, updateAppearance } = useLM();
  const [lmColor, setLmColor] = useState(appearance.color || '#ff66cc');
  const [selectedAccessory, setSelectedAccessory] = useState(appearance.accessory || null);
  const [selectedExpression, setSelectedExpression] = useState(appearance.expression || '😊');
  const [selectedEffect, setSelectedEffect] = useState(appearance.effect || null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Preset colors
  const presetColors = [
    { name: 'Classic Pink', color: '#ff66cc' },
    { name: 'Purple Dream', color: '#a066ff' },
    { name: 'Electric Blue', color: '#00d4ff' },
    { name: 'Lime Green', color: '#00ff88' },
    { name: 'Sunset Orange', color: '#ff6b35' },
    { name: 'Cherry Red', color: '#ff3366' },
    { name: 'Golden Yellow', color: '#ffd700' },
    { name: 'Cool Cyan', color: '#00ffff' }
  ];

  // Sync with appearance context
  useEffect(() => {
    setLmColor(appearance.color || '#ff66cc');
    setSelectedAccessory(appearance.accessory || null);
    setSelectedExpression(appearance.expression || '😊');
    setSelectedEffect(appearance.effect || null);
  }, [appearance]);

  // Get owned items by type
  const getOwnedByType = (type) => {
    return storeItems.filter(item =>
      item.type === type && inventory.includes(item.id)
    );
  };

  // Save appearance to context
  const saveAppearance = () => {
    updateAppearance({
      color: lmColor,
      accessory: selectedAccessory,
      expression: selectedExpression,
      effect: selectedEffect
    });

    setShowSaveSuccess(true);

    // Trigger hyped mood: "New drip acquired!"
    if (window.setLMMood) {
      window.setLMMood('hyped');
    }

    // Hide success message after 3 seconds
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Randomize LM appearance
  const randomize = () => {
    // Random color
    const randomColor = presetColors[Math.floor(Math.random() * presetColors.length)];
    setLmColor(randomColor.color);

    // Random accessory (if any owned)
    const accessories = getOwnedByType('accessory');
    if (accessories.length > 0) {
      const randomAcc = accessories[Math.floor(Math.random() * accessories.length)];
      setSelectedAccessory(randomAcc.id);
    }

    // Random expression
    const expressions = ['😊', '😎', '🤓', '😁', '🥳', '😍', '🤩', '😇'];
    setSelectedExpression(expressions[Math.floor(Math.random() * expressions.length)]);

    // Random effect (if any owned)
    const effects = getOwnedByType('effect');
    if (effects.length > 0) {
      const randomFx = effects[Math.floor(Math.random() * effects.length)];
      setSelectedEffect(randomFx.id);
    }

    // Trigger hyped mood
    if (window.setLMMood) {
      window.setLMMood('hyped');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🎨 Customize Your LM
          </h1>
          <p className="text-gray-300 text-xl">
            Make your LM buddy truly yours!
          </p>
        </motion.div>

        {/* Save Success Toast */}
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50
                     bg-gradient-to-r from-green-500 to-emerald-600 text-white
                     px-8 py-4 rounded-full font-bold shadow-2xl"
          >
            ✅ New drip acquired! LM looks amazing! 🔥
          </motion.div>
        )}

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Customization Options */}
          <div className="space-y-6">
            {/* Color Picker Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎨 Color Palette
              </h2>

              {/* Custom Color Picker */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">Custom Color:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={lmColor}
                    onChange={(e) => setLmColor(e.target.value)}
                    className="w-20 h-20 rounded-lg cursor-pointer border-4 border-white/20"
                  />
                  <div>
                    <div className="text-white font-mono text-lg">{lmColor}</div>
                    <div className="text-gray-400 text-sm">Current Color</div>
                  </div>
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-gray-300 mb-3">Preset Colors:</label>
                <div className="grid grid-cols-4 gap-3">
                  {presetColors.map(preset => (
                    <button
                      key={preset.color}
                      onClick={() => setLmColor(preset.color)}
                      className={`
                        w-full aspect-square rounded-lg transition-all transform hover:scale-110
                        border-4 ${lmColor === preset.color ? 'border-white' : 'border-white/20'}
                      `}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accessories Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                👔 Accessories
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedAccessory(null)}
                  className={`
                    p-4 rounded-lg transition-all transform hover:scale-105
                    ${!selectedAccessory
                      ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                      : 'bg-white/10 text-gray-400 border border-white/20'}
                  `}
                >
                  <div className="text-3xl mb-1">🚫</div>
                  <div className="text-xs">None</div>
                </button>

                {getOwnedByType('accessory').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAccessory(item.id)}
                    className={`
                      p-4 rounded-lg transition-all transform hover:scale-105
                      ${selectedAccessory === item.id
                        ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                        : 'bg-white/10 text-white border border-white/20'}
                    `}
                  >
                    <div className="text-3xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}

                {getOwnedByType('accessory').length === 0 && (
                  <div className="col-span-2 text-center text-gray-400 text-sm py-4">
                    Buy accessories in the store! 🛍️
                  </div>
                )}
              </div>
            </div>

            {/* Expressions Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                😊 Expressions
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {['😊', '😎', '🤓', '😁', '🥳', '😍', '🤩', '😇'].map(exp => (
                  <button
                    key={exp}
                    onClick={() => setSelectedExpression(exp)}
                    className={`
                      p-4 rounded-lg transition-all transform hover:scale-110
                      ${selectedExpression === exp
                        ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white scale-110'
                        : 'bg-white/10 border border-white/20'}
                    `}
                  >
                    <div className="text-4xl">{exp}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Effects Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                ✨ Effects
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedEffect(null)}
                  className={`
                    p-4 rounded-lg transition-all transform hover:scale-105
                    ${!selectedEffect
                      ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                      : 'bg-white/10 text-gray-400 border border-white/20'}
                  `}
                >
                  <div className="text-3xl mb-1">🚫</div>
                  <div className="text-xs">No Effect</div>
                </button>

                {getOwnedByType('effect').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEffect(item.id)}
                    className={`
                      p-4 rounded-lg transition-all transform hover:scale-105
                      ${selectedEffect === item.id
                        ? 'bg-gradient-to-r from-[#ff66cc] to-[#a066ff] text-white'
                        : 'bg-white/10 text-white border border-white/20'}
                    `}
                  >
                    <div className="text-3xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}

                {getOwnedByType('effect').length === 0 && (
                  <div className="col-span-2 text-center text-gray-400 text-sm py-4">
                    Buy effects in the store! ✨
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={randomize}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                         hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg
                         rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🎲 Randomize LM
              </button>

              <button
                onClick={saveAppearance}
                className="w-full py-4 bg-gradient-to-r from-[#ff66cc] to-[#a066ff] 
                         hover:shadow-xl text-white font-bold text-lg
                         rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                💾 Save Appearance
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold
                         rounded-lg transition-all"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="sticky top-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border-4"
                 style={{ borderColor: '#ff66cc', minHeight: '600px' }}>
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Live Preview
              </h2>

              {/* LM Preview */}
              <div className="flex items-center justify-center min-h-[400px] relative">
                {/* Main LM Circle */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div
                    className="w-48 h-48 rounded-full flex items-center justify-center
                             border-8 border-white/30 shadow-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${lmColor}, ${adjustBrightness(lmColor, -20)})`
                    }}
                  >
                    {/* Expression */}
                    <motion.div
                      key={selectedExpression}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-8xl"
                    >
                      {selectedExpression}
                    </motion.div>

                    {/* Accessory Overlay */}
                    {selectedAccessory && (
                      <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="absolute -top-12 text-6xl"
                      >
                        {storeItems.find(i => i.id === selectedAccessory)?.icon}
                      </motion.div>
                    )}

                    {/* Effect Animations */}
                    {selectedEffect === 'fx_sparkles' && (
                      <>
                        <motion.div
                          className="absolute top-4 right-4 text-yellow-300 text-3xl"
                          animate={{
                            scale: [0, 1, 0],
                            rotate: [0, 360],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ✨
                        </motion.div>
                        <motion.div
                          className="absolute bottom-4 left-4 text-yellow-300 text-3xl"
                          animate={{
                            scale: [0, 1, 0],
                            rotate: [0, -360],
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                          ✨
                        </motion.div>
                      </>
                    )}

                    {selectedEffect === 'fx_fire_aura' && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-orange-500 text-2xl"
                            style={{
                              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 80}px`,
                              left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 80}px`,
                            }}
                            animate={{
                              scale: [0, 1.2, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          >
                            🔥
                          </motion.div>
                        ))}
                      </>
                    )}

                    {selectedEffect === 'fx_rainbow_glow' && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          background: [
                            'radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(255,165,0,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(255,255,0,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(0,255,0,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(0,0,255,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)',
                            'radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)',
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Preview Info */}
              <div className="mt-8 text-center">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-300 text-sm mb-2">Current Setup:</div>
                  <div className="text-white font-bold">
                    {lmColor} • {selectedAccessory ? storeItems.find(i => i.id === selectedAccessory)?.name : 'No Accessory'}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Expression: {selectedExpression} • Effect: {selectedEffect ? storeItems.find(i => i.id === selectedEffect)?.name : 'None'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-[#ff66cc]/10 to-[#a066ff]/10 backdrop-blur-lg 
                       rounded-xl p-6 border" style={{ borderColor: '#ff66cc' }}>
            <h3 className="text-xl font-bold text-white mb-3">
              💡 Customization Tips
            </h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Earn XP to unlock more items in the store</li>
              <li>• Try the randomize button for surprise combinations!</li>
              <li>• Mix and match colors with accessories</li>
              <li>• Your appearance saves automatically</li>
              <li>• LM will show off your style across all pages!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

export default LMCustomizer;
