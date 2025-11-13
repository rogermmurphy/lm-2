/**
 * Moderation Utilities for Message Boards
 * 
 * Provides content filtering, sanitization, and rate limiting
 * for safe user-generated content
 */

import { bannedWords, containsProfanity } from './profanityList';

// Rate limiting storage (in-memory)
const rateLimitStore = {};

/**
 * Sanitize user message
 * - Trims whitespace
 * - Collapses multiple spaces
 * - Strips HTML/script tags
 * - Replaces banned words with asterisks
 * 
 * @param {string} text - Raw user input
 * @returns {string} Sanitized text
 */
export function sanitizeMessage(text) {
  if (!text) return '';

  let sanitized = text;

  // Trim and collapse whitespace
  sanitized = sanitized.trim();
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Strip HTML tags (especially <script>)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Replace banned words with asterisks
  bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  });

  return sanitized;
}

/**
 * Check if message is allowed
 * - Length check (max 800 characters)
 * - Profanity check
 * - Empty check
 * 
 * @param {string} text - Message to validate
 * @returns {object} { allowed: boolean, reason: string }
 */
export function isAllowed(text) {
  if (!text || !text.trim()) {
    return { allowed: false, reason: 'Message cannot be empty' };
  }

  if (text.length > 800) {
    return { allowed: false, reason: 'Message too long (max 800 characters)' };
  }

  if (containsProfanity(text)) {
    return { allowed: false, reason: 'Message contains inappropriate language' };
  }

  // Check for spam patterns
  if (/(.)\1{10,}/.test(text)) {
    return { allowed: false, reason: 'Message contains spam patterns' };
  }

  // Check for all caps spam (>80% caps and >20 chars)
  if (text.length > 20) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const capsPercent = (capsCount / text.length) * 100;
    if (capsPercent > 80) {
      return { allowed: false, reason: 'Please don\'t use all caps' };
    }
  }

  return { allowed: true, reason: '' };
}

/**
 * Rate limiting check
 * Prevents users from posting too frequently
 * 
 * @param {string} userId - User identifier
 * @param {string} bucket - Rate limit category (default: 'boards')
 * @param {number} windowMs - Time window in milliseconds (default: 3000ms / 3s)
 * @returns {object} { allowed: boolean, waitTime: number }
 */
export function rateLimit(userId, bucket = 'boards', windowMs = 3000) {
  const key = `${bucket}:${userId}`;
  const now = Date.now();

  // Check if user has recent activity
  if (rateLimitStore[key]) {
    const timeSinceLastPost = now - rateLimitStore[key];
    
    if (timeSinceLastPost < windowMs) {
      const waitTime = Math.ceil((windowMs - timeSinceLastPost) / 1000);
      return {
        allowed: false,
        waitTime,
        message: `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before posting again`
      };
    }
  }

  // Update timestamp
  rateLimitStore[key] = now;

  // Clean up old entries (older than 1 minute)
  Object.keys(rateLimitStore).forEach(k => {
    if (now - rateLimitStore[k] > 60000) {
      delete rateLimitStore[k];
    }
  });

  return { allowed: true, waitTime: 0, message: '' };
}

/**
 * Validate entire message (combined check)
 * @param {string} text - Message to validate
 * @param {string} userId - User ID for rate limiting
 * @returns {object} { valid: boolean, sanitized: string, reason: string }
 */
export function validateMessage(text, userId) {
  // Check rate limit first
  const rateCheck = rateLimit(userId, 'boards', 3000);
  if (!rateCheck.allowed) {
    return {
      valid: false,
      sanitized: '',
      reason: rateCheck.message
    };
  }

  // Sanitize
  const sanitized = sanitizeMessage(text);

  // Check if allowed
  const allowCheck = isAllowed(sanitized);
  if (!allowCheck.allowed) {
    return {
      valid: false,
      sanitized: '',
      reason: allowCheck.reason
    };
  }

  return {
    valid: true,
    sanitized,
    reason: ''
  };
}

/**
 * Check if user can moderate (teacher role)
 * @param {string} role - User role
 * @returns {boolean}
 */
export function canModerate(role) {
  return role === 'teacher';
}

/**
 * Reset rate limit for a user (admin action)
 * @param {string} userId
 */
export function resetRateLimit(userId, bucket = 'boards') {
  const key = `${bucket}:${userId}`;
  delete rateLimitStore[key];
}

export default {
  sanitizeMessage,
  isAllowed,
  rateLimit,
  validateMessage,
  canModerate,
  resetRateLimit
};
