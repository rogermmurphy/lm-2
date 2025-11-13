import React from 'react';
import { motion } from 'framer-motion';
import { useClass } from '../context/ClassContext';
import { onAssignmentComplete } from '../utils/lmMoodTriggers';
import { useXP } from '../context/XPContext';

/**
 * Class Hub - Student's Class Overview
 * 
 * Features:
 * - View all enrolled classes
 * - See assignments per class
 * - Submit assignments
 * - Track completion rates
 * - Quick access to class materials
 */

const ClassHub = () => {
  const { classes, assignments, getClassAssignments, getUpcomingAssignments, 
          getOverdueAssignments, submitAssignment, getClassCompletionRate } = useClass();
  const { addXP } = useXP();

  const upcomingAssignments = getUpcomingAssignments();
  const overdueAssignments = getOverdueAssignments();

  const handleSubmit = (assignmentId, points) => {
    submitAssignment(assignmentId);
    addXP(points); // Award XP equal to assignment points
    onAssignmentComplete();
  };

  const getTypeColor = (type) => {
    const colors = {
      test: 'from-red-500 to-orange-500',
      quiz: 'from-blue-500 to-cyan-500',
      assignment: 'from-purple-500 to-pink-500',
      homework: 'from-green-500 to-emerald-500',
      project: 'from-yellow-500 to-amber-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue!';
    if (days === 0) return 'Due Today!';
    if (days === 1) return 'Due Tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1
            className="text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff66cc, #a066ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📚 My Classes
          </h1>
          <p className="text-gray-300 text-xl">
            Stay on top of your assignments and class work!
          </p>
        </motion.div>

        {/* Alert Banners */}
        {overdueAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-xl p-4 backdrop-blur-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="text-red-300 font-bold">
                  {overdueAssignments.length} Overdue Assignment{overdueAssignments.length > 1 ? 's' : ''}!
                </div>
                <div className="text-red-400 text-sm">
                  LM is worried... Let's catch up!
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/10
                       hover:border-white/30 transition-all cursor-pointer group"
              style={{
                borderColor: cls.color + '40',
              }}
            >
              {/* Class Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {cls.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {cls.teacher} • Period {cls.period}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {cls.room}
                  </p>
                </div>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: cls.color + '30', color: cls.color }}
                >
                  📖
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Completion Rate</span>
                  <span className="text-white font-bold">
                    {getClassCompletionRate(cls.id)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cls.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${getClassCompletionRate(cls.id)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  />
                </div>
              </div>

              {/* Assignment Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {getClassAssignments(cls.id).filter(a => !a.submitted).length} pending
                </span>
                <span className="text-gray-400">
                  {getClassAssignments(cls.id).filter(a => a.submitted).length} completed
                </span>
              </div>

              {/* Quick Action */}
              <button
                className="mt-4 w-full py-2 bg-white/10 group-hover:bg-white/20 text-white rounded-lg transition-all"
              >
                View Details →
              </button>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Assignments */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            📅 Upcoming Assignments
          </h2>

          {upcomingAssignments.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-300 text-xl">
                All caught up! No assignments due soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map(assignment => {
                const cls = classes.find(c => c.id === assignment.classId);
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border-2 border-white/10
                             hover:border-white/30 transition-all"
                    style={{ borderLeftWidth: '6px', borderLeftColor: cls?.color }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Type Badge */}
                        <div className="inline-block mb-2">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-bold text-white
                            bg-gradient-to-r ${getTypeColor(assignment.type)}
                          `}>
                            {assignment.type.toUpperCase()}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {assignment.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            📚 {cls?.name}
                          </span>
                          <span className="text-gray-400">
                            💯 {assignment.points} pts
                          </span>
                          <span className={`font-bold ${
                            formatDate(assignment.dueDate).includes('Overdue') ? 'text-red-400' :
                            formatDate(assignment.dueDate).includes('Today') ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            🕐 {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {!assignment.submitted ? (
                        <button
                          onClick={() => handleSubmit(assignment.id, assignment.points)}
                          className="px-6 py-3 bg-gradient-to-r from-[#ff66cc] to-[#a066ff] 
                                   hover:shadow-lg text-white font-bold rounded-lg transition-all
                                   transform hover:scale-105 whitespace-nowrap"
                        >
                          ✅ Submit
                        </button>
                      ) : (
                        <div className="px-6 py-3 bg-green-900/50 text-green-300 font-bold 
                                      rounded-lg border-2 border-green-500">
                          ✓ Submitted
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-blue-400/30">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-bold text-white mb-1">
              {upcomingAssignments.length}
            </div>
            <div className="text-blue-300 text-sm">
              Due This Week
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-green-400/30">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-white mb-1">
              {assignments.filter(a => a.submitted).length}
            </div>
            <div className="text-green-300 text-sm">
              Completed
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg 
                       rounded-xl p-6 border border-purple-400/30">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round((assignments.filter(a => a.submitted).length / assignments.length) * 100)}%
            </div>
            <div className="text-purple-300 text-sm">
              Overall Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHub;
