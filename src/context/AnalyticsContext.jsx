import React, { createContext, useContext, useState, useEffect } from 'react';
import { useXP } from './XPContext';
import { useClass } from './ClassContext';

/**
 * Analytics Context - Student Performance Tracking
 * 
 * Tracks and analyzes:
 * - Study time per subject
 * - Assignment completion rates
 * - Quiz/test scores
 * - XP growth over time
 * - Strengths and weaknesses
 */

const AnalyticsContext = createContext();

// Mock analytics data
const generateMockAnalytics = () => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toISOString().split('T')[0],
      studyMinutes: Math.floor(Math.random() * 120) + 30,
      xpEarned: Math.floor(Math.random() * 150) + 50,
      tasksCompleted: Math.floor(Math.random() * 5) + 1
    });
  }

  return {
    weeklyData: last7Days,
    subjectPerformance: {
      chemistry: { avg: 87, trend: 'up', assignments: 12, completed: 10 },
      physics: { avg: 82, trend: 'stable', assignments: 10, completed: 8 },
      math: { avg: 91, trend: 'up', assignments: 15, completed: 14 }
    },
    recentScores: [
      { subject: 'Chemistry', assignment: 'Ch. 6 Test', score: 92, date: '2025-01-18' },
      { subject: 'Physics', assignment: 'Lab Report', score: 85, date: '2025-01-17' },
      { subject: 'Math', assignment: 'Quiz 5', score: 95, date: '2025-01-16' },
      { subject: 'Chemistry', assignment: 'Homework', score: 88, date: '2025-01-15' }
    ],
    strengths: ['Problem Solving', 'Chemistry Labs', 'Math Calculus'],
    weaknesses: ['Physics Concepts', 'Essay Writing'],
    totalStudyTime: 1847, // minutes
    averageScore: 87,
    assignmentCompletionRate: 85
  };
};

export const AnalyticsProvider = ({ children }) => {
  const { xp, level } = useXP();
  const { assignments } = useClass();
  const [analytics, setAnalytics] = useState(generateMockAnalytics());
  const [studyLog, setStudyLog] = useState([]);

  // Load study log from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studyLog');
      if (saved) {
        setStudyLog(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load study log:', e);
    }
  }, []);

  // Log study session
  const logStudySession = (subject, minutes, xpEarned) => {
    const session = {
      id: `session_${Date.now()}`,
      subject,
      minutes,
      xpEarned,
      date: new Date().toISOString()
    };

    const updated = [...studyLog, session];
    setStudyLog(updated);

    try {
      localStorage.setItem('studyLog', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save study log:', e);
    }
  };

  // Get total study time
  const getTotalStudyTime = () => {
    return studyLog.reduce((total, session) => total + session.minutes, 0);
  };

  // Get study time by subject
  const getStudyTimeBySubject = (subject) => {
    return studyLog
      .filter(s => s.subject.toLowerCase() === subject.toLowerCase())
      .reduce((total, session) => total + session.minutes, 0);
  };

  // Calculate current streak
  const getCurrentStreak = () => {
    const streak = localStorage.getItem('studySessionStreak');
    return streak ? parseInt(streak) : 0;
  };

  // Get performance insights
  const getInsights = () => {
    const insights = [];
    
    // Check study consistency
    if (getCurrentStreak() >= 7) {
      insights.push({
        type: 'positive',
        message: 'Amazing 7-day study streak! Keep it up!',
        icon: '🔥'
      });
    }

    // Check assignment completion
    const completionRate = (assignments.filter(a => a.submitted).length / assignments.length) * 100;
    if (completionRate < 50) {
      insights.push({
        type: 'warning',
        message: 'You have several assignments due soon',
        icon: '⚠️'
      });
    }

    // Check XP growth
    if (level >= 10) {
      insights.push({
        type: 'positive',
        message: 'Level 10+! You\'re a dedicated learner!',
        icon: '⭐'
      });
    }

    // Subject recommendations
    if (analytics.subjectPerformance.physics.avg < 75) {
      insights.push({
        type: 'suggestion',
        message: 'Consider extra practice in Physics',
        icon: '📚'
      });
    }

    return insights;
  };

  // Log live event (multiplayer activities)
  const logLiveEvent = (type, payload) => {
    const event = {
      id: `live_${Date.now()}`,
      type, // 'poll', 'quiz', 'reaction', 'chat'
      payload,
      timestamp: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem('liveEvents');
      const events = saved ? JSON.parse(saved) : [];
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('liveEvents', JSON.stringify(events));
      
      console.log(`📊 Live event logged: ${type}`);
    } catch (e) {
      console.error('Failed to log live event:', e);
    }

    // Update analytics with live data
    if (type === 'quiz' && payload.correct !== undefined) {
      // Track correctness rate
      const { correct, responseTime } = payload;
      console.log(`Quiz: ${correct ? 'Correct' : 'Wrong'} in ${responseTime}ms`);
    }
  };

  // Get live event statistics
  const getLiveStats = () => {
    try {
      const saved = localStorage.getItem('liveEvents');
      if (!saved) return { total: 0, byType: {}, avgResponseTime: 0, correctRate: 0 };

      const events = JSON.parse(saved);
      const quizEvents = events.filter(e => e.type === 'quiz');
      
      const correctAnswers = quizEvents.filter(e => e.payload.correct).length;
      const totalQuizzes = quizEvents.length;
      const avgResponseTime = quizEvents.length > 0
        ? quizEvents.reduce((sum, e) => sum + (e.payload.responseTime || 0), 0) / quizEvents.length
        : 0;

      return {
        total: events.length,
        byType: events.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {}),
        avgResponseTime: Math.round(avgResponseTime),
        correctRate: totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0
      };
    } catch (e) {
      console.error('Failed to get live stats:', e);
      return { total: 0, byType: {}, avgResponseTime: 0, correctRate: 0 };
    }
  };

  const value = {
    // State
    analytics,
    studyLog,
    
    // Functions
    logStudySession,
    getTotalStudyTime,
    getStudyTimeBySubject,
    getCurrentStreak,
    getInsights,
    logLiveEvent,
    getLiveStats,
    
    // Quick access
    weeklyData: analytics.weeklyData,
    subjectPerformance: analytics.subjectPerformance,
    recentScores: analytics.recentScores,
    strengths: analytics.strengths,
    weaknesses: analytics.weaknesses
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
