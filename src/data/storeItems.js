/**
 * XP Store Items Database
 * 
 * Each item represents a cosmetic unlock for the LM mascot
 * Students spend XP to purchase these items
 */

export const storeItems = [
  // Accessories
  {
    id: 'acc_cool_sunglasses',
    name: 'Cool Sunglasses',
    description: 'Make LM look super cool! 😎',
    cost: 250,
    type: 'accessory',
    icon: '🕶️',
    rarity: 'common',
    preview: 'Adds sunglasses to LM'
  },
  {
    id: 'acc_wizard_hat',
    name: 'Wizard Hat',
    description: 'For the wise scholar!',
    cost: 500,
    type: 'accessory',
    icon: '🧙',
    rarity: 'rare',
    preview: 'Purple wizard hat with stars'
  },
  {
    id: 'acc_crown',
    name: 'Royal Crown',
    description: 'You are the king/queen of learning!',
    cost: 750,
    type: 'accessory',
    icon: '👑',
    rarity: 'epic',
    preview: 'Golden crown for champions'
  },
  {
    id: 'acc_graduation_cap',
    name: 'Graduation Cap',
    description: 'Future graduate!',
    cost: 400,
    type: 'accessory',
    icon: '🎓',
    rarity: 'uncommon',
    preview: 'Academic achievement cap'
  },

  // Glows & Effects
  {
    id: 'fx_rainbow_glow',
    name: 'Rainbow Aura',
    description: 'Multi-color glow effect',
    cost: 600,
    type: 'effect',
    icon: '🌈',
    rarity: 'rare',
    preview: 'Rainbow glow around LM'
  },
  {
    id: 'fx_fire_aura',
    name: 'Fire Aura',
    description: 'Blazing hot streak energy!',
    cost: 800,
    type: 'effect',
    icon: '🔥',
    rarity: 'epic',
    preview: 'Flaming aura effect'
  },
  {
    id: 'fx_sparkles',
    name: 'Sparkle Trail',
    description: 'Leave sparkles wherever you go!',
    cost: 350,
    type: 'effect',
    icon: '✨',
    rarity: 'common',
    preview: 'Sparkle particles around LM'
  },

  // Backgrounds
  {
    id: 'bg_galaxy',
    name: 'Galaxy Background',
    description: 'Study among the stars!',
    cost: 1000,
    type: 'background',
    icon: '🌌',
    rarity: 'legendary',
    preview: 'Animated galaxy backdrop'
  },
  {
    id: 'bg_neon_city',
    name: 'Neon City',
    description: 'Cyberpunk vibes!',
    cost: 900,
    type: 'background',
    icon: '🌃',
    rarity: 'epic',
    preview: 'Neon cityscape background'
  },
  {
    id: 'bg_library',
    name: 'Library Scene',
    description: 'Classic study environment',
    cost: 500,
    type: 'background',
    icon: '📚',
    rarity: 'uncommon',
    preview: 'Cozy library setting'
  },

  // Expressions
  {
    id: 'exp_wink',
    name: 'Wink Expression',
    description: 'Playful wink animation!',
    cost: 300,
    type: 'expression',
    icon: '😉',
    rarity: 'common',
    preview: 'LM winks at you'
  },
  {
    id: 'exp_heart_eyes',
    name: 'Heart Eyes',
    description: 'Show the love for learning!',
    cost: 450,
    type: 'expression',
    icon: '😍',
    rarity: 'uncommon',
    preview: 'Heart eyes expression'
  },

  // Special Items
  {
    id: 'special_wings',
    name: 'Angel Wings',
    description: 'Ascend to new heights!',
    cost: 1500,
    type: 'special',
    icon: '🪽',
    rarity: 'legendary',
    preview: 'Glowing angel wings'
  },
  {
    id: 'special_party_hat',
    name: 'Party Hat',
    description: 'Always celebrating!',
    cost: 200,
    type: 'accessory',
    icon: '🎉',
    rarity: 'common',
    preview: 'Colorful party hat'
  }
];

// Rarity colors for UI
export const rarityColors = {
  common: {
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
    text: 'text-gray-300',
    bg: 'from-gray-500/20 to-gray-600/20'
  },
  uncommon: {
    border: 'border-green-400',
    glow: 'shadow-green-400/50',
    text: 'text-green-300',
    bg: 'from-green-500/20 to-green-600/20'
  },
  rare: {
    border: 'border-blue-400',
    glow: 'shadow-blue-400/50',
    text: 'text-blue-300',
    bg: 'from-blue-500/20 to-blue-600/20'
  },
  epic: {
    border: 'border-purple-400',
    glow: 'shadow-purple-400/50',
    text: 'text-purple-300',
    bg: 'from-purple-500/20 to-purple-600/20'
  },
  legendary: {
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/50',
    text: 'text-yellow-300',
    bg: 'from-yellow-500/20 to-orange-600/20'
  }
};

// Get owned items from localStorage
export const getOwnedItems = () => {
  try {
    const owned = localStorage.getItem('ownedItems');
    return owned ? JSON.parse(owned) : [];
  } catch (e) {
    console.warn('Failed to load owned items:', e);
    return [];
  }
};

// Save owned items to localStorage
export const saveOwnedItems = (ownedIds) => {
  try {
    localStorage.setItem('ownedItems', JSON.stringify(ownedIds));
  } catch (e) {
    console.warn('Failed to save owned items:', e);
  }
};

// Check if item is owned
export const isItemOwned = (itemId) => {
  const owned = getOwnedItems();
  return owned.includes(itemId);
};

// Purchase item
export const purchaseItem = (itemId) => {
  const owned = getOwnedItems();
  if (!owned.includes(itemId)) {
    owned.push(itemId);
    saveOwnedItems(owned);
  }
};
