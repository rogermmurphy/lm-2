import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLM } from '../context/LMContext';
import { getRandomQuote, getMotivationalQuote } from '../utils/lmQuotes';
import { storeItems } from '../data/storeItems';

/**
 * LM Mascot Component - Animated personality system
 * 
 * Features:
 * - 4 mood states: happy, tired, hyped, proud
 * - Rotating quotes every 2-3 minutes
 * - Smooth animations with Framer Motion
 * - localStorage persistence
 * - External mood triggers
 * - Speech bubble display
 * - Neon glow effects
 * 
 * Usage:
 * import { LMMascot } from './components/LMMascot';
 * <LMMascot />
 * 
 * To change mood from anywhere:
 * window.setLMMood('hyped');
 */

const LMMascot = () => {
  const { getCurrentAppearance, tempPreview } = useLM();
  
  // Load mood from localStorage or default to 'happy'
  const [mood, setMoodState] = useState(() => {
    return localStorage.getItem('lm-mood') || 'happy';
  });
  
  const [currentQuote, setCurrentQuote] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get customized appearance (with temp preview support)
  const currentAppearance = getCurrentAppearance();
  const lmColor = currentAppearance.color || '#ff66cc';
  const accessory = currentAppearance.accessory ? storeItems.find(i => i.id === currentAppearance.accessory) : null;
  const expression = currentAppearance.expression || '😊';
  const effect = currentAppearance.effect ? storeItems.find(i => i.id === currentAppearance.effect) : null;
  const isPreview = tempPreview !== null;

  // Set mood and persist to localStorage
  const setMood = useCallback((newMood) => {
    const validMoods = ['happy', 'tired', 'hyped', 'proud'];
    if (validMoods.includes(newMood)) {
      setMoodState(newMood);
      localStorage.setItem('lm-mood', newMood);
      
      // Show new quote when mood changes
      const quote = getRandomQuote(newMood);
      setCurrentQuote(quote);
      setShowBubble(true);
      
      // Auto-hide bubble after 5 seconds
      setTimeout(() => setShowBubble(false), 5000);
    }
  }, []);

  // Expose setMood globally so other components can trigger it
  useEffect(() => {
    window.setLMMood = setMood;
    return () => {
      delete window.setLMMood;
    };
  }, [setMood]);

  // Rotate quotes every 2-3 minutes
  useEffect(() => {
    const showQuote = () => {
      const quote = Math.random() > 0.3 
        ? getRandomQuote(mood) 
        : getMotivationalQuote();
      
      setCurrentQuote(quote);
      setShowBubble(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShowBubble(false), 5000);
    };

    // Show first quote after 3 seconds
    const initialTimer = setTimeout(showQuote, 3000);
    
    // Then rotate every 2-3 minutes
    const interval = setInterval(showQuote, 120000 + Math.random() * 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [mood]);

  // Speak function placeholder (for future TTS integration)
  const speak = useCallback((text) => {
    console.log(`🎤 LM says: "${text}"`);
    // TODO: Integrate Web Speech API or external TTS
    // if ('speechSynthesis' in window) {
    //   const utterance = new SpeechSynthesisUtterance(text);
    //   window.speechSynthesis.speak(utterance);
    // }
  }, []);

  // Click handler - show random quote
  const handleClick = () => {
    const quote = getRandomQuote(mood);
    setCurrentQuote(quote);
    setShowBubble(true);
    speak(quote);
    
    setTimeout(() => setShowBubble(false), 5000);
  };

  // Animation variants for different moods
  const moodAnimations = {
    happy: {
      animate: {
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    tired: {
      animate: {
        y: [0, 5, 0],
        opacity: [1, 0.8, 1],
      },
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hyped: {
      animate: {
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 10, -10, 0],
      },
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    proud: {
      animate: {
        scale: [1, 1.08, 1],
        rotate: [0, 3, -3, 0],
      },
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Mood-specific colors and effects
  const moodStyles = {
    happy: {
      glow: 'shadow-[0_0_30px_rgba(255,98,176,0.6)]',
      border: 'border-pink-400',
      filter: 'brightness(1.1) saturate(1.2)',
      emoji: '😊'
    },
    tired: {
      glow: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]',
      border: 'border-purple-400',
      filter: 'brightness(0.8) saturate(0.7) hue-rotate(20deg)',
      emoji: '😴'
    },
    hyped: {
      glow: 'shadow-[0_0_40px_rgba(255,98,176,0.8)]',
      border: 'border-pink-500',
      filter: 'brightness(1.3) saturate(1.5) contrast(1.2)',
      emoji: '🔥'
    },
    proud: {
      glow: 'shadow-[0_0_35px_rgba(251,191,36,0.6)]',
      border: 'border-yellow-400',
      filter: 'brightness(1.2) saturate(1.3) hue-rotate(-10deg)',
      emoji: '🏆'
    }
  };

  const currentStyle = moodStyles[mood] || moodStyles.happy;
  const currentAnimation = moodAnimations[mood] || moodAnimations.happy;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 right-0 pointer-events-auto"
          >
            <div className={`
              relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 
              backdrop-blur-xl rounded-2xl p-4 max-w-xs
              border ${currentStyle.border} ${currentStyle.glow}
            `}>
              <p className="text-white text-sm leading-relaxed">
                {currentQuote}
              </p>
              {/* Speech bubble arrow */}
              <div className={`
                absolute -bottom-2 right-8 w-4 h-4 
                bg-gray-900 border-r border-b ${currentStyle.border}
                transform rotate-45
              `} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LM Character */}
      <motion.div
        {...currentAnimation}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        className="pointer-events-auto cursor-pointer relative"
      >
        {/* Preview Label */}
        {isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2
                     bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full
                     whitespace-nowrap z-10"
          >
            👁️ Preview
          </motion.div>
        )}
        
        <div 
          className={`
            relative w-24 h-24 rounded-full
            flex items-center justify-center
            border-4 ${currentStyle.border}
            ${currentStyle.glow}
            transition-all duration-500
            ${isHovered ? 'scale-110' : 'scale-100'}
            ${isPreview ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
            overflow-hidden
          `}
          style={{ 
            background: `linear-gradient(135deg, ${lmColor}, ${adjustBrightness(lmColor, -20)})` 
          }}
        >
          {/* Expression (customizable) */}
          <div className="text-5xl transition-all duration-500"
               style={{ filter: currentStyle.filter }}>
            {expression}
          </div>
          
          {/* Accessory (if equipped) */}
          {accessory && (
            <motion.div
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -top-8 text-4xl"
            >
              {accessory.icon}
            </motion.div>
          )}
          
          {/* Custom Effect Animations */}
          {effect?.id === 'fx_sparkles' && (
            <>
              <motion.div
                className="absolute top-0 right-0 text-yellow-300 text-xl"
                animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 text-yellow-300 text-xl"
                animate={{ scale: [0, 1, 0], rotate: [0, -180, -360] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.8 }}
              >
                ✨
              </motion.div>
            </>
          )}
          
          {effect?.id === 'fx_fire_aura' && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-orange-500 text-lg"
                  style={{
                    top: `${12 + Math.sin(i * 90 * Math.PI / 180) * 40}px`,
                    left: `${12 + Math.cos(i * 90 * Math.PI / 180) * 40}px`,
                  }}
                  animate={{
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                >
                  🔥
                </motion.div>
              ))}
            </>
          )}
          
          {effect?.id === 'fx_rainbow_glow' && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(255,0,0,0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(255,165,0,0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(255,255,0,0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(0,255,0,0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(0,0,255,0.4) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}

          {/* Sparkle effect for hyped mood */}
          {mood === 'hyped' && (
            <>
              <motion.div
                className="absolute top-0 right-0 text-yellow-300"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 text-yellow-300"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, -180, -360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                }}
              >
                ⚡
              </motion.div>
            </>
          )}

          {/* Zzz animation for tired mood */}
          {mood === 'tired' && (
            <motion.div
              className="absolute -top-6 right-2 text-purple-300 text-xl"
              animate={{
                y: [-5, -15],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              💤
            </motion.div>
          )}

          {/* Trophy effect for proud mood */}
          {mood === 'proud' && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              👑
            </motion.div>
          )}

          {/* Hover indicator */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                         bg-gray-900/90 px-3 py-1 rounded-lg text-white text-xs
                         whitespace-nowrap"
            >
              Click me! 💬
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mood indicator (optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full mt-2 right-0 text-xs text-gray-400 pointer-events-none">
          Mood: {mood}
        </div>
      )}
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

export default LMMascot;
export { LMMascot };
