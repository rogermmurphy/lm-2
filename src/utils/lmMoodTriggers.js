/**
 * LM Mood Trigger Utilities
 * 
 * Provides convenient functions to trigger LM mood changes
 * based on user actions and events throughout the app.
 * 
 * Usage:
 * import { onQuizStart, onAssignmentComplete } from './utils/lmMoodTriggers';
 * 
 * onQuizStart(); // Sets LM to hyped mood
 */

// Activity tracking for idle detection
let lastActivityTime = Date.now();
let idleCheckInterval = null;

/**
 * Initialize activity tracking
 * Automatically sets mood to "tired" after 10 minutes of inactivity
 */
export const initActivityTracking = () => {
  // Reset activity time on user interactions
  const resetActivity = () => {
    lastActivityTime = Date.now();
  };

  // Listen for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, resetActivity, { passive: true });
  });

  // Check for idle every minute
  if (!idleCheckInterval) {
    idleCheckInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityTime;
      const TEN_MINUTES = 10 * 60 * 1000;

      if (idleTime >= TEN_MINUTES) {
        onLowActivity();
      }
    }, 60000); // Check every minute
  }
};

/**
 * Stop activity tracking
 */
export const stopActivityTracking = () => {
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }
};

/**
 * Trigger Functions
 */

// 🏆 Assignment/Task Completion
export const onAssignmentComplete = () => {
  if (window.setLMMood) {
    window.setLMMood('proud');
    console.log('🏆 LM Mood: Assignment completed - Proud!');
  }
};

// 📝 Test/Quiz Completion
export const onTestComplete = (score) => {
  if (window.setLMMood) {
    if (score >= 90) {
      window.setLMMood('proud');
      console.log('🏆 LM Mood: High score - Proud!');
    } else if (score >= 70) {
      window.setLMMood('happy');
      console.log('😊 LM Mood: Good score - Happy!');
    } else {
      window.setLMMood('happy');
      console.log('😊 LM Mood: Keep going - Happy!');
    }
  }
};

// 🔥 Quiz/Game Start
export const onQuizStart = () => {
  if (window.setLMMood) {
    window.setLMMood('hyped');
    console.log('🔥 LM Mood: Quiz starting - Hyped!');
  }
};

// 🎮 Game Start
export const onGameStart = () => {
  if (window.setLMMood) {
    window.setLMMood('hyped');
    console.log('🔥 LM Mood: Game starting - Hyped!');
  }
};

// 🏅 High Score / Achievement
export const onHighScore = () => {
  if (window.setLMMood) {
    window.setLMMood('proud');
    console.log('🏆 LM Mood: High score - Proud!');
  }
};

// 🔥 Streak Milestone
export const onStreakMilestone = (days) => {
  if (window.setLMMood) {
    if (days >= 7) {
      window.setLMMood('hyped');
      console.log(`🔥 LM Mood: ${days}-day streak - Hyped!`);
    } else if (days >= 3) {
      window.setLMMood('proud');
      console.log(`🏆 LM Mood: ${days}-day streak - Proud!`);
    }
  }
};

// 😴 Low Activity / Idle
export const onLowActivity = () => {
  if (window.setLMMood) {
    window.setLMMood('tired');
    console.log('😴 LM Mood: Low activity detected - Tired!');
  }
};

// 📚 Study Session Start
export const onStudySessionStart = () => {
  if (window.setLMMood) {
    window.setLMMood('happy');
    console.log('😊 LM Mood: Study session started - Happy!');
  }
};

// 😴 Long Study Session (90+ minutes)
export const onLongStudySession = (minutes) => {
  if (window.setLMMood && minutes >= 90) {
    window.setLMMood('tired');
    console.log('😴 LM Mood: Long study session - Tired! Time for a break!');
  }
};

// 🎯 Level Up
export const onLevelUp = () => {
  if (window.setLMMood) {
    window.setLMMood('hyped');
    console.log('🔥 LM Mood: Level up - Hyped!');
  }
};

// 📖 Lesson Complete
export const onLessonComplete = () => {
  if (window.setLMMood) {
    window.setLMMood('proud');
    console.log('🏆 LM Mood: Lesson completed - Proud!');
  }
};

// 😊 Login / Session Start
export const onLogin = () => {
  if (window.setLMMood) {
    window.setLMMood('happy');
    console.log('😊 LM Mood: Welcome back - Happy!');
  }
};

// 🎓 Default / Reset
export const resetMood = () => {
  if (window.setLMMood) {
    window.setLMMood('happy');
    console.log('😊 LM Mood: Reset to Happy');
  }
};

/**
 * Bulk trigger helpers for common scenarios
 */

// Dashboard load - check streak and set mood
export const onDashboardLoad = (userData) => {
  const { streak, xp, level } = userData || {};
  
  if (streak >= 7) {
    onStreakMilestone(streak);
  } else if (level && level % 5 === 0) {
    // Milestone level (5, 10, 15, etc.)
    onLevelUp();
  } else {
    onLogin();
  }
};

// Game end - based on result
export const onGameEnd = (result) => {
  const { won, score, highScore } = result || {};
  
  if (won || (score && highScore && score >= highScore)) {
    onHighScore();
  } else {
    resetMood();
  }
};

/**
 * Auto-initialize activity tracking when module loads
 * Call stopActivityTracking() if you need to disable it
 */
if (typeof window !== 'undefined') {
  // Initialize on load
  initActivityTracking();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', stopActivityTracking);
}

export default {
  // Core triggers
  onAssignmentComplete,
  onTestComplete,
  onQuizStart,
  onGameStart,
  onHighScore,
  onStreakMilestone,
  onLowActivity,
  onStudySessionStart,
  onLongStudySession,
  onLevelUp,
  onLessonComplete,
  onLogin,
  resetMood,
  
  // Bulk helpers
  onDashboardLoad,
  onGameEnd,
  
  // Activity tracking
  initActivityTracking,
  stopActivityTracking
};
