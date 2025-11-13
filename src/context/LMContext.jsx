import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * LM Appearance Context
 * 
 * Manages LM mascot's appearance state:
 * - Color/hue
 * - Accessories (hats, glasses, etc.)
 * - Expression (face)
 * - Effects (glow, sparkles, etc.)
 * - Background
 * 
 * Persists to localStorage
 */

const LMContext = createContext();

// Default appearance
const DEFAULT_APPEARANCE = {
  color: '#ff66cc',
  accessory: null,
  expression: '😊',
  effect: null,
  background: null
};

export const LMProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE);
  const [inventory, setInventory] = useState([]);
  const [tempPreview, setTempPreview] = useState(null);

  // Load appearance and inventory from localStorage
  useEffect(() => {
    try {
      // Load appearance
      const savedAppearance = localStorage.getItem('lmAppearance');
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }

      // Load inventory (owned items)
      const savedInventory = localStorage.getItem('ownedItems');
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }
    } catch (e) {
      console.warn('Failed to load LM appearance/inventory:', e);
    }
  }, []);

  // Update appearance
  const updateAppearance = (newAppearance) => {
    const updated = {
      ...appearance,
      ...newAppearance,
      updatedAt: new Date().toISOString()
    };

    setAppearance(updated);

    try {
      localStorage.setItem('lmAppearance', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save appearance:', e);
    }

    // Trigger LM happy mood when appearance changes
    if (window.setLMMood) {
      window.setLMMood('happy');
    }
  };

  // Update just the color
  const updateColor = (color) => {
    updateAppearance({ color });
  };

  // Update accessory
  const updateAccessory = (accessoryId) => {
    updateAppearance({ accessory: accessoryId });
  };

  // Update expression
  const updateExpression = (expression) => {
    updateAppearance({ expression });
  };

  // Update effect
  const updateEffect = (effectId) => {
    updateAppearance({ effect: effectId });
  };

  // Update background
  const updateBackground = (backgroundId) => {
    updateAppearance({ background: backgroundId });
  };

  // Add item to inventory
  const addToInventory = (itemId) => {
    if (!inventory.includes(itemId)) {
      const updated = [...inventory, itemId];
      setInventory(updated);

      try {
        localStorage.setItem('ownedItems', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save inventory:', e);
      }

      // Trigger LM proud mood when new item acquired
      if (window.setLMMood) {
        window.setLMMood('proud');
      }
    }
  };

  // Check if item is owned
  const ownsItem = (itemId) => {
    return inventory.includes(itemId);
  };

  // Reset to default appearance
  const resetAppearance = () => {
    setAppearance(DEFAULT_APPEARANCE);
    try {
      localStorage.setItem('lmAppearance', JSON.stringify(DEFAULT_APPEARANCE));
    } catch (e) {
      console.error('Failed to reset appearance:', e);
    }
  };

  // Randomize appearance (using owned items)
  const randomizeAppearance = () => {
    const colors = ['#ff66cc', '#a066ff', '#00d4ff', '#00ff88', '#ff6b35', '#ff3366', '#ffd700', '#00ffff'];
    const expressions = ['😊', '😎', '🤓', '😁', '🥳', '😍', '🤩', '😇'];

    const randomized = {
      color: colors[Math.floor(Math.random() * colors.length)],
      expression: expressions[Math.floor(Math.random() * expressions.length)],
      accessory: appearance.accessory, // Keep current if owned
      effect: appearance.effect,       // Keep current if owned
      background: appearance.background
    };

    updateAppearance(randomized);

    // Trigger LM hyped mood
    if (window.setLMMood) {
      window.setLMMood('hyped');
    }
  };

  // Set temporary preview (for store hover)
  const previewItem = (item) => {
    if (!item) {
      setTempPreview(null);
      return;
    }
    
    setTempPreview({
      type: item.type,
      id: item.id,
      value: item
    });
  };
  
  // Clear preview
  const clearPreview = () => {
    setTempPreview(null);
  };
  
  // Get current appearance (with temp preview if active)
  const getCurrentAppearance = () => {
    if (!tempPreview) return appearance;
    
    // Merge temp preview with current appearance
    const preview = { ...appearance };
    
    if (tempPreview.type === 'accessory') {
      preview.accessory = tempPreview.id;
    } else if (tempPreview.type === 'effect') {
      preview.effect = tempPreview.id;
    } else if (tempPreview.type === 'expression') {
      preview.expression = tempPreview.value.icon;
    }
    
    return preview;
  };

  // LM React to events (mapping events to moods and quotes)
  const lmReact = (eventName) => {
    const eventMoodMap = {
      // Positive events
      'correct_answer': 'proud',
      'fast_answer': 'hyped',
      'perfect_score': 'hyped',
      'streak_milestone': 'hyped',
      'level_up': 'hyped',
      'first_place': 'proud',
      'badge_earned': 'proud',
      'session_complete': 'proud',
      
      // Neutral/encouraging events
      'wrong_answer': 'happy',
      'try_again': 'happy',
      'joined_session': 'happy',
      
      // Break/rest events
      'multiple_wrong': 'tired',
      'session_timeout': 'tired',
      'break_time': 'tired',
      'low_energy': 'tired',
      
      // Celebration events
      'victory': 'hyped',
      'comeback': 'hyped',
      'improvement': 'proud'
    };

    const eventQuoteMap = {
      'correct_answer': "Nice work! That's correct! 🎯",
      'fast_answer': "WOW! Lightning fast! ⚡",
      'perfect_score': "PERFECT! You're unstoppable! 🏆",
      'wrong_answer': "Not quite, but keep trying! 💪",
      'multiple_wrong': "Take a deep breath... you've got this! 😊",
      'streak_milestone': "STREAK MASTER! Keep it going! 🔥",
      'level_up': "LEVEL UP! You're crushing it! ⭐",
      'first_place': "NUMBER ONE! Amazing work! 👑",
      'break_time': "Time for a quick break? 💤",
      'joined_session': "Welcome! Let's learn together! 😊",
      'session_complete': "Great session! You did awesome! 🎉"
    };

    const mood = eventMoodMap[eventName] || 'happy';
    const quote = eventQuoteMap[eventName] || "You're doing great!";

    // Trigger mood
    if (window.setLMMood) {
      window.setLMMood(mood);
    }

    // Log the reaction
    console.log(`💜 LM reacts to ${eventName}: ${mood} - "${quote}"`);

    return { mood, quote };
  };

  const value = {
    // State
    appearance,
    inventory,
    tempPreview,
    
    // Appearance updates
    updateAppearance,
    updateColor,
    updateAccessory,
    updateExpression,
    updateEffect,
    updateBackground,
    resetAppearance,
    randomizeAppearance,
    
    // Preview
    previewItem,
    clearPreview,
    getCurrentAppearance,
    
    // Inventory
    addToInventory,
    ownsItem,
    
    // LM Reactions
    lmReact,
    
    // Defaults
    DEFAULT_APPEARANCE
  };

  return <LMContext.Provider value={value}>{children}</LMContext.Provider>;
};

// Custom hook
export const useLM = () => {
  const context = useContext(LMContext);
  if (!context) {
    throw new Error('useLM must be used within LMProvider');
  }
  return context;
};

export default LMContext;
