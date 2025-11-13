import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../context/XPContext';
import {
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
  onDashboardLoad,
  resetMood
} from '../utils/lmMoodTriggers';

/**
 * Student Dashboard Component
 * Demonstrates LM Mood Trigger integration + XP System
 */

const Dashboard = () => {
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [score, setScore] = useState(85);
  const { xp, level, xpToNextLevel, xpInCurrentLevel, showLevelUp, addXP, progressToNextLevel } = useXP();

  // Mock student data (now using real XP/level from context)
  const studentData = {
    name: "Alex Chen",
    xp: xp,
    level: level,
    streak: 7,
    todayTasks: [
      { id: 1, title: "Complete Ch. 7 Quiz", done: false },
      { id: 2, title: "Essay Draft", done: false },
      { id: 3, title: "Review Flashcards", done: false }
    ]
  };

  // Trigger appropriate mood on dashboard load
  useEffect(() => {
    onDashboardLoad(studentData);
  }, []);

  // Simulate study timer
  useEffect(() => {
    const timer = setInterval(() => {
      setStudyMinutes(prev => {
        const newValue = prev + 1;
        if (newValue >= 90) {
          onLongStudySession(newValue);
        }
        return newValue;
      });
    }, 60000); // Every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Level Up Notification */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.5 }}
              className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 
                           rounded-2xl p-6 shadow-2xl border-4 border-yellow-300">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl text-center mb-2"
                >
                  ⭐
                </motion.div>
                <div className="text-3xl font-bold text-white text-center mb-1">
                  LEVEL UP!
                </div>
                <div className="text-xl text-yellow-100 text-center">
                  You reached Level {level}! 🎉
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile XP Badge (Top-Right) */}
        <div className="md:hidden fixed top-4 right-4 z-40">
          <div 
            className="backdrop-blur-lg rounded-full px-4 py-2 shadow-lg border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255,102,204,0.3), rgba(160,102,255,0.3))',
              borderColor: '#ff66cc'
            }}
          >
            <span className="text-white font-bold text-sm">
              Lv.{level} • {xp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Header with XP/Level Display */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {studentData.name}! 👋
              </h1>
              <p className="text-gray-300">
                Let's make today amazing! Your LM buddy is here to support you.
              </p>
            </div>
            
            {/* XP & Level Display (Desktop Only) */}
            <div className="hidden md:block bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg 
                          rounded-2xl p-6 border border-pink-400/30 min-w-[250px]">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-5xl font-bold text-white">
                  {level}
                </div>
                <div>
                  <div className="text-gray-300 text-sm">Level</div>
                  <div className="text-pink-400 font-bold">
                    {xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
              
              {/* Progress Bar to Next Level */}
              <div className="relative">
                <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNextLevel()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {xpInCurrentLevel} / {xpToNextLevel} XP to Level {level + 1}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30">
            <div className="text-3xl font-bold text-white mb-1">
              🔥 {studentData.streak}
            </div>
            <div className="text-gray-300 text-sm">Day Streak</div>
            <div className="text-yellow-400 text-xs mt-2">
              Keep it going!
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
            <div className="text-3xl font-bold text-white mb-1">
              {studyMinutes}m
            </div>
            <div className="text-gray-300 text-sm">Study Time Today</div>
            <div className="text-purple-400 text-xs mt-2">
              📚 Active learning
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
            <div className="text-3xl font-bold text-white mb-1">
              {studentData.todayTasks.filter(t => t.done).length}/{studentData.todayTasks.length}
            </div>
            <div className="text-gray-300 text-sm">Tasks Complete</div>
            <div className="text-green-400 text-xs mt-2">
              ✅ You're doing great!
            </div>
          </div>
        </div>

        {/* XP Test Buttons */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">⚡ Test XP System</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => addXP(50)}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                       hover:from-green-600 hover:to-emerald-700 text-white font-semibold
                       rounded-lg transition-all transform hover:scale-105"
            >
              +50 XP (Study)
            </button>
            <button
              onClick={() => addXP(100)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 
                       hover:from-blue-600 hover:to-cyan-700 text-white font-semibold
                       rounded-lg transition-all transform hover:scale-105"
            >
              +100 XP (Test)
            </button>
            <button
              onClick={() => addXP(25)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 
                       hover:from-purple-600 hover:to-pink-700 text-white font-semibold
                       rounded-lg transition-all transform hover:scale-105"
            >
              +25 XP (Task)
            </button>
            <button
              onClick={() => addXP(500)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 
                       hover:from-orange-600 hover:to-red-700 text-white font-semibold
                       rounded-lg transition-all transform hover:scale-105"
            >
              +500 XP (Level Up Test)
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            Watch LM react when you gain XP! Level ups trigger special animations! ⚡
          </p>
        </div>

        {/* Test Buttons Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            🧪 Test LM Mood Triggers
          </h2>
          <p className="text-gray-300 mb-6">
            Click these buttons to see LM react! Watch the bottom-right corner.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Assignment Complete */}
            <button
              onClick={onAssignmentComplete}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-purple-500/50"
            >
              📝 Complete Task
            </button>

            {/* Quiz Start */}
            <button
              onClick={onQuizStart}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-pink-500/50"
            >
              🔥 Start Quiz
            </button>

            {/* Game Start */}
            <button
              onClick={onGameStart}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-orange-500/50"
            >
              🎮 Start Game
            </button>

            {/* High Score */}
            <button
              onClick={onHighScore}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-yellow-500/50"
            >
              🏆 High Score!
            </button>

            {/* Level Up */}
            <button
              onClick={onLevelUp}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-green-500/50"
            >
              ⬆️ Level Up
            </button>

            {/* Streak Milestone */}
            <button
              onClick={() => onStreakMilestone(7)}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-red-500/50"
            >
              🔥 7-Day Streak
            </button>

            {/* Study Session */}
            <button
              onClick={onStudySessionStart}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-blue-500/50"
            >
              📚 Study Start
            </button>

            {/* Long Study */}
            <button
              onClick={() => onLongStudySession(95)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-purple-600/50"
            >
              😴 Long Study
            </button>

            {/* Test Score (Good) */}
            <button
              onClick={() => {
                const testScore = Math.floor(Math.random() * 20) + 80;
                setScore(testScore);
                onTestComplete(testScore);
              }}
              className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-teal-500/50"
            >
              📊 Test Score
            </button>

            {/* Low Activity */}
            <button
              onClick={onLowActivity}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-gray-600/50"
            >
              💤 Idle Mode
            </button>

            {/* Reset */}
            <button
              onClick={resetMood}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105
                         shadow-lg hover:shadow-gray-500/50"
            >
              🔄 Reset Mood
            </button>
          </div>

          {score && (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg">
              <p className="text-white text-center">
                Last test score: <span className="font-bold text-blue-300">{score}%</span>
              </p>
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">
            📋 Today's Tasks
          </h2>
          
          <div className="space-y-3">
            {studentData.todayTasks.map(task => (
              <div
                key={task.id}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 
                           transition-all cursor-pointer group"
                onClick={() => {
                  task.done = !task.done;
                  if (task.done) {
                    onAssignmentComplete();
                    addXP(25); // Award XP for completing task
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all
                    ${task.done 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400 group-hover:border-pink-400'}
                  `}>
                    {task.done && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`
                    text-lg transition-all
                    ${task.done ? 'text-gray-400 line-through' : 'text-white'}
                  `}>
                    {task.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-6 border border-pink-400/30">
          <h3 className="text-xl font-bold text-white mb-3">
            💡 How it works
          </h3>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong className="text-pink-400">Click any button</strong> to trigger a mood change</li>
            <li>• <strong className="text-purple-400">Watch LM</strong> in the bottom-right corner react!</li>
            <li>• <strong className="text-yellow-400">LM will show</strong> a speech bubble with a mood-appropriate quote</li>
            <li>• <strong className="text-green-400">The mood persists</strong> across page reloads (localStorage)</li>
            <li>• <strong className="text-blue-400">After 10 minutes</strong> of inactivity, LM gets tired automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
