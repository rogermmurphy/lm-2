/**
 * Realtime Adapter - Multiplayer Game Session Manager
 * 
 * Provides high-level API for multiplayer features
 * Built on top of realtimeBus
 */

import { on, off, emit, emitWithDelay } from './realtimeBus';
import { makeJoinCode } from './joinCode';

/**
 * Game Session Manager
 */
class GameSession {
  constructor(code, hostId) {
    this.code = code;
    this.hostId = hostId;
    this.players = [];
    this.state = 'lobby'; // lobby, playing, finished
    this.currentQuestion = null;
    this.scores = {};
    this.createdAt = Date.now();
  }

  addPlayer(player) {
    if (!this.players.find(p => p.id === player.id)) {
      this.players.push(player);
      this.scores[player.id] = 0;
    }
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    delete this.scores[playerId];
  }

  updateScore(playerId, points) {
    if (this.scores[playerId] !== undefined) {
      this.scores[playerId] += points;
    }
  }

  getLeaderboard() {
    return this.players
      .map(player => ({
        ...player,
        score: this.scores[player.id] || 0
      }))
      .sort((a, b) => b.score - a.score);
  }
}

// Active sessions storage
const activeSessions = new Map();

/**
 * Create a new game session (Host)
 * @param {object} config - Game configuration
 * @returns {object} Session info with join code
 */
export const createSession = (config = {}) => {
  const code = makeJoinCode();
  const session = new GameSession(code, config.hostId || 'host');
  
  activeSessions.set(code, session);

  // Auto-cleanup after 2 hours
  setTimeout(() => {
    activeSessions.delete(code);
  }, 2 * 60 * 60 * 1000);

  console.log(`🎮 Session created: ${code}`);
  
  return {
    code,
    session,
    playerCount: 0
  };
};

/**
 * Join an existing session (Student)
 * @param {string} code - Join code
 * @param {object} player - Player info
 * @returns {object|null} Session info or null if not found
 */
export const joinSession = (code, player) => {
  const session = activeSessions.get(code);
  
  if (!session) {
    console.warn(`❌ Session not found: ${code}`);
    return null;
  }

  if (session.state !== 'lobby') {
    console.warn(`⚠️ Session ${code} already in progress`);
    return null;
  }

  session.addPlayer(player);
  
  // Notify all players
  emitWithDelay(`session:${code}:player-joined`, {
    player,
    playerCount: session.players.length
  });

  console.log(`✅ ${player.name} joined session ${code}`);

  return {
    code,
    session,
    playerCount: session.players.length
  };
};

/**
 * Leave a session
 * @param {string} code - Join code
 * @param {string} playerId - Player ID
 */
export const leaveSession = (code, playerId) => {
  const session = activeSessions.get(code);
  
  if (session) {
    session.removePlayer(playerId);
    
    emitWithDelay(`session:${code}:player-left`, {
      playerId,
      playerCount: session.players.length
    });

    console.log(`👋 Player ${playerId} left session ${code}`);
  }
};

/**
 * Start game (Host only)
 * @param {string} code - Join code
 */
export const startGame = (code) => {
  const session = activeSessions.get(code);
  
  if (session && session.state === 'lobby') {
    session.state = 'playing';
    
    emit(`session:${code}:game-started`, {
      playerCount: session.players.length,
      startTime: Date.now()
    });

    console.log(`🎮 Game started: ${code} with ${session.players.length} players`);
  }
};

/**
 * Send question to all players
 * @param {string} code - Join code
 * @param {object} question - Question data
 */
export const broadcastQuestion = (code, question) => {
  const session = activeSessions.get(code);
  
  if (session) {
    session.currentQuestion = question;
    
    emitWithDelay(`session:${code}:new-question`, question, 50);
    
    console.log(`📝 Question sent to session ${code}`);
  }
};

/**
 * Submit answer (Student)
 * @param {string} code - Join code
 * @param {string} playerId - Player ID
 * @param {any} answer - Answer data
 */
export const submitAnswer = (code, playerId, answer) => {
  const session = activeSessions.get(code);
  
  if (session) {
    emitWithDelay(`session:${code}:answer-submitted`, {
      playerId,
      answer,
      timestamp: Date.now()
    }, 80);

    console.log(`✍️ Answer submitted by ${playerId} in ${code}`);
  }
};

/**
 * Update player score
 * @param {string} code - Join code
 * @param {string} playerId - Player ID
 * @param {number} points - Points to add
 */
export const updateScore = (code, playerId, points) => {
  const session = activeSessions.get(code);
  
  if (session) {
    session.updateScore(playerId, points);
    
    emitWithDelay(`session:${code}:score-updated`, {
      playerId,
      newScore: session.scores[playerId],
      leaderboard: session.getLeaderboard()
    }, 100);

    console.log(`🏆 Score updated: ${playerId} +${points} pts`);
  }
};

/**
 * End game and show results
 * @param {string} code - Join code
 */
export const endGame = (code) => {
  const session = activeSessions.get(code);
  
  if (session) {
    session.state = 'finished';
    
    const results = {
      leaderboard: session.getLeaderboard(),
      duration: Date.now() - session.createdAt
    };

    emit(`session:${code}:game-ended`, results);

    console.log(`🏁 Game ended: ${code}`);
    
    // Cleanup after 5 minutes
    setTimeout(() => {
      activeSessions.delete(code);
      console.log(`🧹 Session ${code} cleaned up`);
    }, 5 * 60 * 1000);
  }
};

/**
 * Get session info
 * @param {string} code - Join code
 * @returns {object|null} Session data or null
 */
export const getSession = (code) => {
  return activeSessions.get(code) || null;
};

/**
 * Get active session count
 * @returns {number} Number of active sessions
 */
export const getActiveSessionCount = () => {
  return activeSessions.size;
};

/**
 * Subscribe to session events
 * @param {string} code - Join code
 * @param {object} handlers - Event handlers
 * @returns {function} Unsubscribe function
 */
export const subscribeToSession = (code, handlers) => {
  const unsubscribers = [];

  if (handlers.onPlayerJoined) {
    unsubscribers.push(on(`session:${code}:player-joined`, handlers.onPlayerJoined));
  }
  if (handlers.onPlayerLeft) {
    unsubscribers.push(on(`session:${code}:player-left`, handlers.onPlayerLeft));
  }
  if (handlers.onGameStarted) {
    unsubscribers.push(on(`session:${code}:game-started`, handlers.onGameStarted));
  }
  if (handlers.onNewQuestion) {
    unsubscribers.push(on(`session:${code}:new-question`, handlers.onNewQuestion));
  }
  if (handlers.onAnswerSubmitted) {
    unsubscribers.push(on(`session:${code}:answer-submitted`, handlers.onAnswerSubmitted));
  }
  if (handlers.onScoreUpdated) {
    unsubscribers.push(on(`session:${code}:score-updated`, handlers.onScoreUpdated));
  }
  if (handlers.onGameEnded) {
    unsubscribers.push(on(`session:${code}:game-ended`, handlers.onGameEnded));
  }

  // Return unsubscribe-all function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

export default {
  createSession,
  joinSession,
  leaveSession,
  startGame,
  broadcastQuestion,
  submitAnswer,
  updateScore,
  endGame,
  getSession,
  getActiveSessionCount,
  subscribeToSession
};
