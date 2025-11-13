/**
 * Profanity Filter List
 * Banned words for chat moderation
 * 
 * Note: This is a basic example list.
 * In production, use a comprehensive profanity package
 * like 'bad-words' or 'profanity-filter'
 */

export const bannedWords = [
  // Common inappropriate words (sanitized examples)
  'idiot',
  'stupid',
  'dumb',
  'hate',
  'sucks',
  // Add more as needed
];

/**
 * Check if text contains banned words
 * @param {string} text - Text to check
 * @returns {boolean} True if contains banned words
 */
export const containsProfanity = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => lowerText.includes(word));
};

/**
 * Filter/sanitize text
 * @param {string} text - Text to filter
 * @returns {string} Filtered text with asterisks
 */
export const filterProfanity = (text) => {
  if (!text) return '';
  
  let filtered = text;
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  
  return filtered;
};

/**
 * Validate chat message
 * @param {string} message - Message to validate
 * @param {number} maxLength - Max length (default 200)
 * @returns {object} { valid: boolean, reason: string }
 */
export const validateChatMessage = (message, maxLength = 200) => {
  if (!message || !message.trim()) {
    return { valid: false, reason: 'Message cannot be empty' };
  }

  if (message.length > maxLength) {
    return { valid: false, reason: `Message too long (max ${maxLength} characters)` };
  }

  if (containsProfanity(message)) {
    return { valid: false, reason: 'Message contains inappropriate language' };
  }

  return { valid: true, reason: '' };
};

export default {
  bannedWords,
  containsProfanity,
  filterProfanity,
  validateChatMessage
};
