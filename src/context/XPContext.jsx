import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * XP Context - Global XP and Level System
 * 
 * Features:
 * - XP tracking with localStorage persistence
 * - Automatic level calculation
 * - Level up detection
 * - XP gain animations
 * - LM mood integration
 */

const XPContext = createContext();

// XP required for each level (exponential growth)
const XP_PER_LEVEL = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from total XP
const calculateLevel = (xp) => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xp >= xpNeeded + XP_PER_LEVEL(level)) {
    xpNeeded += XP_PER_LEVEL(level);
    level++;
  }
  
  return { level, xpNeeded, xpForNext: XP_PER_LEVEL(level) };
};

export const XPProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [xpInCurrentLevel, setXpInCurrentLevel] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Load XP from localStorage on mount
  useEffect(() => {
    const savedXP = localStorage.getItem('studentXP');
    if (savedXP) {
      const totalXP = parseInt(savedXP);
      setXp(totalXP);
      updateLevel(totalXP);
    }
  }, []);

  // Update level based on total XP
  const updateLevel = (totalXP) => {
    const { level: newLevel, xpNeeded, xpForNext } = calculateLevel(totalXP);
    setLevel(newLevel);
    setXpToNextLevel(xpForNext);
    setXpInCurrentLevel(totalXP - xpNeeded);
  };

  // Add XP and handle level ups
  const addXP = (amount) => {
    const newXP = xp + amount;
    const oldLevel = level;
    
    // Update XP
    setXp(newXP);
    localStorage.setItem('studentXP', newXP.toString());
    
    // Calculate new level
    const { level: newLevel, xpNeeded, xpForNext } = calculateLevel(newXP);
    setLevel(newLevel);
    setXpToNextLevel(xpForNext);
    setXpInCurrentLevel(newXP - xpNeeded);
    
    // Check for level up
    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      
      // Trigger LM hyped mood for level up
      if (window.setLMMood) {
        window.setLMMood('hyped');
      }
      
      // Hide level up notification after 5 seconds
      setTimeout(() => {
        setShowLevelUp(false);
      }, 5000);
    } else {
      // Just regular XP gain - trigger proud mood
      if (window.setLMMood) {
        window.setLMMood('proud');
      }
    }
    
    return newLevel > oldLevel; // Returns true if leveled up
  };

  // Remove XP (for testing or penalties)
  const removeXP = (amount) => {
    const newXP = Math.max(0, xp - amount);
    setXP(newXP);
    localStorage.setItem('studentXP', newXP.toString());
    updateLevel(newXP);
  };

  // Award XP for live answers with speed bonus
  const awardForLiveAnswer = ({ correct, timeMs }) => {
    if (!correct) return 0;

    // Base XP for correct answer
    let earnedXP = 10;

    // Speed bonus (faster = more XP)
    if (timeMs < 3000) {
      earnedXP += 15; // Super fast (< 3s) = +15 bonus
    } else if (timeMs < 5000) {
      earnedXP += 10; // Fast (< 5s) = +10 bonus
    } else if (timeMs < 8000) {
      earnedXP += 5;  // Quick (< 8s) = +5 bonus
    }

    // Add XP
    const didLevelUp = addXP(earnedXP);

    // Emit XP changed event
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('xp:changed', { 
        detail: { delta: earnedXP, correct, timeMs, leveledUp: didLevelUp } 
      });
      window.dispatchEvent(event);
    }

    return earnedXP;
  };

  // Reset XP (for testing)
  const resetXP = () => {
    setXp(0);
    setLevel(1);
    setXpToNextLevel(100);
    setXpInCurrentLevel(0);
    localStorage.removeItem('studentXP');
  };

  // Calculate progress percentage to next level
  const progressToNextLevel = () => {
    return (xpInCurrentLevel / xpToNextLevel) * 100;
  };

  const value = {
    xp,
    level,
    xpToNextLevel,
    xpInCurrentLevel,
    showLevelUp,
    addXP,
    removeXP,
    resetXP,
    awardForLiveAnswer,
    progressToNextLevel,
    XP_PER_LEVEL
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
};

// Custom hook to use XP context
export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
};

export default XPContext;
