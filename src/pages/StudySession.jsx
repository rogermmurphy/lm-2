import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useXP } from '../context/XPContext';
import { onStudySessionStart, onLongStudySession } from '../utils/lmMoodTriggers';

/**
 * Study Session Mode - Focus Timer with LM Guidance
 * 
 * Features:
 * - 25 or 50 minute focus sessions
 * - Circular countdown animation
 * - LM encouragement every 10 minutes
 * - Dimmed background with lo-fi music
 * - Progress tracking in localStorage
 * - Confetti celebration on completion
 * - Streak tracking for bonus effects
 */

const StudySession = () => {
  const { addXP, level, xp } = useXP();
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  
  const audioRef = useRef(null);
  const encouragementTimerRef = useRef(null);

  // Load completed sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('studySessionsCompleted');
    const streak = localStorage.getItem('studySessionStreak');
    if (saved) setCompletedSessions(parseInt(saved));
    if (streak) setCurrentStreak(parseInt(streak));
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // LM encouragement every 10 minutes
  useEffect(() => {
    if (isActive) {
      encouragementTimerRef.current = setInterval(() => {
        if (window.setLMMood) {
          window.setLMMood('hyped');
        }
      }, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (encouragementTimerRef.current) {
        clearInterval(encouragementTimerRef.current);
      }
    };
  }, [isActive]);

  const startSession = () => {
    setIsActive(true);
    setSessionComplete(false);
    setTimeLeft(duration * 60);
    onStudySessionStart();
    
    // Start lo-fi music
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setSessionComplete(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setSessionComplete(true);
    setShowConfetti(true);
    
    // Calculate XP based on duration
    const earnedXP = duration === 25 ? 50 : 100;
    setXpGained(earnedXP);
    
    // Update completed sessions
    const newTotal = completedSessions + 1;
    const newStreak = currentStreak + 1;
    setCompletedSessions(newTotal);
    setCurrentStreak(newStreak);
    localStorage.setItem('studySessionsCompleted', newTotal.toString());
    localStorage.setItem('studySessionStreak', newStreak.toString());
    
    // Add XP to global system - this triggers LM proud mood automatically
    const didLevelUp = addXP(earnedXP);
    setLeveledUp(didLevelUp);
    
    // Check for 3-session streak bonus
    if (newStreak >= 3 && newStreak % 3 === 0) {
      setShowStreakBonus(true);
      // Bonus XP for streak
      setTimeout(() => {
        addXP(25); // Bonus XP
      }, 1000);
    }
    
    // Stop lo-fi music
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
      setShowStreakBonus(false);
    }, 5000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`
      min-h-screen transition-all duration-1000
      ${isActive 
        ? 'bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950' 
        : 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'}
    `}>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Background music */}
      <audio
        ref={audioRef}
        loop
        src="/lofi-music.mp3" // User needs to add their own lo-fi music file
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {!isActive && !sessionComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              🎯 Study Session Mode
            </h1>
            <p className="text-gray-300 text-lg">
              Focus time with your LM buddy • {completedSessions} sessions completed
            </p>
            {currentStreak > 0 && (
              <div className="mt-4 inline-block bg-gradient-to-r from-orange-500/20 to-red-500/20 
                            border border-orange-400/50 rounded-full px-6 py-2">
                <span className="text-orange-300 font-bold">
                  🔥 {currentStreak} session streak!
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Duration Selection */}
        {!isActive && !sessionComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Choose Your Duration
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setDuration(25);
                  setTimeLeft(25 * 60);
                }}
                className={`
                  p-8 rounded-2xl transition-all transform hover:scale-105
                  ${duration === 25
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/50'
                    : 'bg-white/10 border border-white/20 hover:border-pink-400/50'}
                `}
              >
                <div className="text-4xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-white mb-1">25 Minutes</div>
                <div className="text-gray-300 text-sm">Quick Focus</div>
                <div className="text-pink-300 text-xs mt-2">+50 XP</div>
              </button>

              <button
                onClick={() => {
                  setDuration(50);
                  setTimeLeft(50 * 60);
                }}
                className={`
                  p-8 rounded-2xl transition-all transform hover:scale-105
                  ${duration === 50
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 border border-white/20 hover:border-purple-400/50'}
                `}
              >
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-white mb-1">50 Minutes</div>
                <div className="text-gray-300 text-sm">Deep Focus</div>
                <div className="text-purple-300 text-xs mt-2">+100 XP</div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Timer Display */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="transform -rotate-90" width="300" height="300">
              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <motion.circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff62b0" />
                  <stop offset="100%" stopColor="#6b46c1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1 }}
                className="text-7xl font-bold text-white mb-2"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-gray-400 text-lg">
                {isActive ? 'Stay focused!' : sessionComplete ? 'Complete!' : 'Ready to start?'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          {!isActive && !sessionComplete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 
                       hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xl
                       rounded-full shadow-lg shadow-pink-500/50 transition-all"
            >
              🚀 Start Session
            </motion.button>
          )}

          {isActive && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseSession}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg
                         rounded-full shadow-lg transition-all"
              >
                ⏸️ Pause
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetSession}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg
                         rounded-full shadow-lg transition-all"
              >
                🔄 Reset
              </motion.button>
            </>
          )}

          {!isActive && timeLeft > 0 && timeLeft < duration * 60 && !sessionComplete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg
                       rounded-full shadow-lg transition-all"
            >
              ▶️ Resume
            </motion.button>
          )}

          {sessionComplete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSession}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                       hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl
                       rounded-full shadow-lg shadow-green-500/50 transition-all"
            >
              🎯 New Session
            </motion.button>
          )}
        </div>

        {/* Completion Message */}
        <AnimatePresence>
          {sessionComplete && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl 
                           rounded-3xl p-12 border-4 border-pink-400 shadow-2xl text-center
                           pointer-events-auto">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-5xl font-bold text-white mb-4">
                  Session Complete!
                </h2>
                <p className="text-2xl text-pink-300 mb-6">
                  You earned <span className="font-bold text-yellow-300">+{xpGained} XP</span>!
                </p>
                
                {leveledUp && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 
                             border-2 border-yellow-400 rounded-xl p-6 mb-4"
                  >
                    <motion.div 
                      className="text-5xl mb-2"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⭐
                    </motion.div>
                    <div className="text-3xl font-bold text-yellow-300 mb-1">
                      LEVEL UP!
                    </div>
                    <div className="text-yellow-400">You reached Level {level}! 🎉</div>
                  </motion.div>
                )}
                
                {showStreakBonus && !leveledUp && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-orange-500/30 to-red-500/30 
                             border-2 border-orange-400 rounded-xl p-6 mb-4"
                  >
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-orange-300">
                      3 SESSION STREAK!
                    </div>
                    <div className="text-orange-400">+25 Bonus XP! 🎁</div>
                  </motion.div>
                )}
                
                <p className="text-gray-300">
                  Great focus! Keep up the amazing work! 💪
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        {!isActive && !sessionComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mt-12 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">💡 Study Tips</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Put your phone on silent mode</li>
              <li>• Close unnecessary tabs and apps</li>
              <li>• Have water nearby to stay hydrated</li>
              <li>• LM will encourage you every 10 minutes!</li>
              <li>• Complete 3 sessions in a row for a special bonus! 🔥</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudySession;
