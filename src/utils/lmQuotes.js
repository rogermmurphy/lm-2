// LM Personality Quotes by Mood
// Each mood has multiple quotes that rotate randomly

export const lmQuotes = {
  happy: [
    "You're doing amazing! Keep it up! 🌟",
    "Learning is fun when you're around!",
    "Great job today! I'm so proud of you!",
    "Your progress makes me so happy! ✨",
    "You're on fire! Let's keep learning!",
    "Every day you're getting smarter! 🎉",
    "I love studying with you!",
    "Your dedication is inspiring!"
  ],
  
  tired: [
    "Time for a quick break? 😴",
    "Don't forget to rest your brain...",
    "Yawn... maybe some water would help?",
    "You've been working hard. Stretch time?",
    "Even I need a power nap sometimes...",
    "Remember: breaks make you sharper! 💤",
    "Let's recharge and come back stronger!",
    "A short walk could help clear your mind!"
  ],
  
  hyped: [
    "LET'S GOOOO! You've got this! 🔥",
    "WOOHOO! Streak day! Keep crushing it!",
    "ENERGY MODE ACTIVATED! Time to learn!",
    "You're UNSTOPPABLE today! 💪",
    "MAXIMUM POWER! Let's ace this!",
    "HYPE TRAIN INCOMING! All aboard!",
    "Your motivation is CONTAGIOUS! ⚡",
    "BOOM! Another level up coming!"
  ],
  
  proud: [
    "Look at how far you've come! 👏",
    "I knew you could do it!",
    "That was absolutely brilliant!",
    "You should be so proud of yourself!",
    "Excellence! That's what I'm talking about! 🏆",
    "You're becoming a master at this!",
    "Your hard work really shows!",
    "Standing ovation for that performance! 👏"
  ]
};

//励ational quotes (shown randomly regardless of mood)
export const motivationalQuotes = [
  "Believe in yourself!",
  "One step at a time wins the race.",
  "You can do hard things!",
  "Progress, not perfection!",
  "Every expert was once a beginner.",
  "Your potential is limitless!",
  "Keep going, you're doing great!",
  "Small steps lead to big changes!"
];

// Get random quote from a specific mood
export const getRandomQuote = (mood) => {
  const quotes = lmQuotes[mood] || lmQuotes.happy;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Get random motivational quote
export const getMotivationalQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};
