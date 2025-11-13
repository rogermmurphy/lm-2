/**
 * Global Leaderboard Data
 * Mock data for leaderboard rankings
 */

// Calculate badges based on stats
export const calculateBadges = (player) => {
  const badges = [];
  
  // Quiz Ace (90%+ average)
  if (player.quizAverage >= 90) {
    badges.push({ id: 'quiz_ace', name: 'Quiz Ace', icon: '🎯', color: '#10b981' });
  }
  
  // Speedster (fast answers)
  if (player.avgAnswerTime < 5) {
    badges.push({ id: 'speedster', name: 'Speedster', icon: '⏱️', color: '#f59e0b' });
  }
  
  // Streak Legend (7+ day streak)
  if (player.streak >= 7) {
    badges.push({ id: 'streak_legend', name: 'Streak Legend', icon: '🔥', color: '#ef4444' });
  }
  
  // Study Beast (3+ sessions/day average)
  if (player.dailySessionAvg >= 3) {
    badges.push({ id: 'study_beast', name: 'Study Beast', icon: '🧠', color: '#8b5cf6' });
  }
  
  return badges;
};

// Mock global leaderboard data
export const globalLeaders = [
  {
    id: 'p1',
    name: 'Alex Chen',
    level: 15,
    xp: 4250,
    streak: 12,
    quizAverage: 94,
    avgAnswerTime: 4.2,
    dailySessionAvg: 3.5,
    class: 'Chemistry'
  },
  {
    id: 'p2',
    name: 'Jordan Lee',
    level: 14,
    xp: 3890,
    streak: 8,
    quizAverage: 91,
    avgAnswerTime: 5.8,
    dailySessionAvg: 2.8,
    class: 'Physics'
  },
  {
    id: 'p3',
    name: 'Sam Wilson',
    level: 13,
    xp: 3520,
    streak: 15,
    quizAverage: 87,
    avgAnswerTime: 6.1,
    dailySessionAvg: 4.2,
    class: 'Math'
  },
  {
    id: 'p4',
    name: 'Taylor Kim',
    level: 13,
    xp: 3450,
    streak: 5,
    quizAverage: 92,
    avgAnswerTime: 3.9,
    dailySessionAvg: 2.5,
    class: 'Chemistry'
  },
  {
    id: 'p5',
    name: 'Morgan Zhang',
    level: 12,
    xp: 3180,
    streak: 9,
    quizAverage: 89,
    avgAnswerTime: 5.2,
    dailySessionAvg: 3.1,
    class: 'Physics'
  },
  {
    id: 'p6',
    name: 'Casey Brown',
    level: 12,
    xp: 2950,
    streak: 6,
    quizAverage: 88,
    avgAnswerTime: 6.8,
    dailySessionAvg: 2.3,
    class: 'Math'
  },
  {
    id: 'p7',
    name: 'Riley Johnson',
    level: 11,
    xp: 2720,
    streak: 4,
    quizAverage: 85,
    avgAnswerTime: 7.2,
    dailySessionAvg: 2.9,
    class: 'Chemistry'
  },
  {
    id: 'p8',
    name: 'Avery Davis',
    level: 11,
    xp: 2580,
    streak: 11,
    quizAverage: 90,
    avgAnswerTime: 5.5,
    dailySessionAvg: 3.4,
    class: 'Physics'
  },
  {
    id: 'p9',
    name: 'Quinn Martinez',
    level: 10,
    xp: 2340,
    streak: 3,
    quizAverage: 86,
    avgAnswerTime: 6.5,
    dailySessionAvg: 2.1,
    class: 'Math'
  },
  {
    id: 'p10',
    name: 'Reese Anderson',
    level: 10,
    xp: 2150,
    streak: 7,
    quizAverage: 88,
    avgAnswerTime: 5.9,
    dailySessionAvg: 2.7,
    class: 'Chemistry'
  }
].map(player => ({
  ...player,
  badges: calculateBadges(player)
}));

// Sort leaderboard by different criteria
export const sortLeaderboard = (leaders, sortBy = 'xp') => {
  const sorted = [...leaders];
  
  switch (sortBy) {
    case 'xp':
      return sorted.sort((a, b) => b.xp - a.xp);
    case 'level':
      return sorted.sort((a, b) => b.level - a.level || b.xp - a.xp);
    case 'streak':
      return sorted.sort((a, b) => b.streak - a.streak);
    case 'quiz':
      return sorted.sort((a, b) => b.quizAverage - a.quizAverage);
    default:
      return sorted;
  }
};

// Filter by class
export const filterByClass = (leaders, className) => {
  if (!className || className === 'all') return leaders;
  return leaders.filter(p => p.class === className);
};

export default globalLeaders;
