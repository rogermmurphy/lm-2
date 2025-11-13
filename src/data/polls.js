/**
 * Prebuilt Poll Questions
 * Quick check-in polls for teachers to launch
 */

export const polls = [
  {
    id: 'confidence_01',
    title: 'Topic Confidence Check',
    question: 'How confident do you feel about today\'s topic?',
    options: [
      { id: 'opt_1', text: 'Very Confident 😊' },
      { id: 'opt_2', text: 'Somewhat Confident 🤔' },
      { id: 'opt_3', text: 'Need More Help 😕' }
    ],
    category: 'check-in'
  },
  {
    id: 'pace_01',
    title: 'Class Pace Check',
    question: 'Is the class moving too fast, too slow, or just right?',
    options: [
      { id: 'opt_1', text: 'Too Fast 🏃' },
      { id: 'opt_2', text: 'Just Right ✅' },
      { id: 'opt_3', text: 'Too Slow 🐌' }
    ],
    category: 'pace'
  },
  {
    id: 'homework_01',
    title: 'Homework Difficulty',
    question: 'How difficult was last night\'s homework?',
    options: [
      { id: 'opt_1', text: 'Easy 👍' },
      { id: 'opt_2', text: 'Moderate 👌' },
      { id: 'opt_3', text: 'Challenging 💪' },
      { id: 'opt_4', text: 'Too Hard 😰' }
    ],
    category: 'homework'
  },
  {
    id: 'ready_01',
    title: 'Test Readiness',
    question: 'Do you feel ready for the upcoming test?',
    options: [
      { id: 'opt_1', text: 'Totally Ready! 💯' },
      { id: 'opt_2', text: 'Almost There 📚' },
      { id: 'opt_3', text: 'Need More Study 📖' },
      { id: 'opt_4', text: 'Not Ready Yet 😰' }
    ],
    category: 'assessment'
  },
  {
    id: 'energy_01',
    title: 'Energy Check',
    question: 'What\'s your energy level right now?',
    options: [
      { id: 'opt_1', text: 'High Energy! ⚡' },
      { id: 'opt_2', text: 'Feeling Good 😊' },
      { id: 'opt_3', text: 'A Bit Tired 😴' },
      { id: 'opt_4', text: 'Need a Break 💤' }
    ],
    category: 'wellness'
  },
  {
    id: 'break_01',
    title: 'Break Time Poll',
    question: 'Ready to continue or need a break?',
    options: [
      { id: 'opt_1', text: 'Let\'s Continue! 🚀' },
      { id: 'opt_2', text: 'Short Break Please 🕐' }
    ],
    category: 'break'
  }
];

// Get polls by category
export const getPollsByCategory = (category) => {
  if (!category || category === 'all') return polls;
  return polls.filter(p => p.category === category);
};

export default polls;
