/**
 * Realtime Event Bus - Mock Realtime Layer
 * 
 * Simulates WebSocket-style pub/sub for multiplayer features
 * without needing a real server.
 * 
 * Usage:
 * import { on, emit } from './lib/realtimeBus';
 * 
 * on('player-joined', (data) => console.log(data));
 * emit('player-joined', { name: 'Alex' });
 */

const listeners = {};

/**
 * Subscribe to an event
 * @param {string} event - Event name
 * @param {function} fn - Callback function
 * @returns {function} Unsubscribe function
 */
export function on(event, fn) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
  
  // Return unsubscribe function
  return () => off(event, fn);
}

/**
 * Unsubscribe from an event
 * @param {string} event - Event name
 * @param {function} fn - Callback to remove
 */
export function off(event, fn) {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter(f => f !== fn);
  }
}

/**
 * Emit an event immediately
 * @param {string} event - Event name
 * @param {any} payload - Data to send
 */
export function emit(event, payload) {
  if (listeners[event]) {
    listeners[event].forEach(fn => {
      try {
        fn(payload);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    });
  }
}

/**
 * Emit an event with delay (simulates network latency)
 * @param {string} event - Event name
 * @param {any} payload - Data to send
 * @param {number} delay - Delay in ms (default 120ms)
 */
export const emitWithDelay = (event, payload, delay = 120) => {
  setTimeout(() => emit(event, payload), delay);
};

/**
 * Clear all listeners (useful for cleanup)
 */
export function clearAll() {
  Object.keys(listeners).forEach(key => {
    delete listeners[key];
  });
}

/**
 * Get active listener count
 */
export function getListenerCount(event) {
  return listeners[event] ? listeners[event].length : 0;
}

/**
 * Debug: Log all active events
 */
export function debugListeners() {
  console.log('Active Event Listeners:', Object.keys(listeners));
  Object.entries(listeners).forEach(([event, fns]) => {
    console.log(`  ${event}: ${fns.length} listeners`);
  });
}

export default {
  on,
  off,
  emit,
  emitWithDelay,
  clearAll,
  getListenerCount,
  debugListeners
};
