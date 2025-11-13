/**
 * Join Code Generator
 * 
 * Generates unique 6-character codes for multiplayer sessions
 * Format: LM-XXXX (e.g., LM-A3F9)
 */

/**
 * Generate a unique join code
 * @returns {string} Join code in format LM-XXXX
 */
export const makeJoinCode = () => {
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LM-${code}`;
};

/**
 * Validate join code format
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid format
 */
export const isValidJoinCode = (code) => {
  return /^LM-[A-Z0-9]{4}$/.test(code);
};

/**
 * Generate multiple unique codes
 * @param {number} count - Number of codes to generate
 * @returns {string[]} Array of unique codes
 */
export const generateMultipleCodes = (count) => {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(makeJoinCode());
  }
  return Array.from(codes);
};

/**
 * Parse join code (remove LM- prefix)
 * @param {string} code - Full code (LM-XXXX)
 * @returns {string} Just the XXXX part
 */
export const parseJoinCode = (code) => {
  return code.replace('LM-', '');
};

/**
 * Format join code (add LM- prefix if missing)
 * @param {string} code - Code with or without prefix
 * @returns {string} Formatted code with LM- prefix
 */
export const formatJoinCode = (code) => {
  if (code.startsWith('LM-')) return code;
  return `LM-${code}`;
};

export default {
  makeJoinCode,
  isValidJoinCode,
  generateMultipleCodes,
  parseJoinCode,
  formatJoinCode
};
