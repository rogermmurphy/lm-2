# 🎭 LM Mascot Component - Usage Guide

## Overview

The LM Mascot is a React component that adds personality to your app with an animated floating character that displays different moods and motivational quotes.

## Files Created

```
src/
├── components/
│   └── LMMascot.jsx       # Main component
├── utils/
│   └── lmQuotes.js        # Quote database
└── App.jsx                # Example integration
```

## Quick Start

### 1. Install Dependencies

```bash
npm install framer-motion
# or
yarn add framer-motion
```

### 2. Import in Your App

```jsx
import { LMMascot } from './components/LMMascot';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Add LM Mascot - will appear bottom-right */}
      <LMMascot />
    </div>
  );
}
```

## Features

### ✨ 4 Mood States

1. **😊 Happy** (default)
   - Gentle bouncing animation
   - Pink glow
   - Positive, encouraging quotes

2. **😴 Tired**
   - Slow, drowsy animation
   - Purple glow
   - Break reminder quotes
   - 💤 floating effect

3. **🔥 Hyped**
   - Fast, energetic bouncing
   - Bright pink glow
   - Motivational pump-up quotes
   - ✨⚡ sparkle effects

4. **🏆 Proud**
   - Proud standing animation
   - Golden glow
   - Achievement celebration quotes
   - 👑 crown effect

### 🎯 Key Features

- **Automatic Quote Rotation**: Shows new quotes every 2-3 minutes
- **Click Interaction**: Click LM to see a random quote
- **Hover Effect**: Shows "Click me! 💬" on hover
- **localStorage Persistence**: Mood persists between page reloads
- **Speech Bubble**: Animated quote display with mood-based styling
- **Smooth Animations**: Framer Motion for buttery smooth effects
- **Responsive**: Works on all screen sizes

## Usage Examples

### Trigger Moods from Anywhere

```jsx
// When student gets high score
function handleHighScore() {
  window.setLMMood('hyped');
}

// When assignment is completed
function handleAssignmentComplete() {
  window.setLMMood('proud');
}

// After long study session
function handleStudySessionEnd() {
  window.setLMMood('tired');
}

// Back to default
function resetMood() {
  window.setLMMood('happy');
}
```

### In React Components

```jsx
import { useEffect } from 'react';

function QuizComponent() {
  // Set mood when quiz starts
  useEffect(() => {
    window.setLMMood('hyped');
    
    return () => {
      // Reset when leaving
      window.setLMMood('happy');
    };
  }, []);

  const handleQuizComplete = (score) => {
    if (score > 90) {
      window.setLMMood('proud');
    } else {
      window.setLMMood('happy');
    }
  };

  return (
    <div>
      {/* Quiz content */}
    </div>
  );
}
```

### Real-World Scenarios

```jsx
// Student Dashboard
useEffect(() => {
  const streak = getStudentStreak();
  if (streak >= 7) {
    window.setLMMood('hyped'); // Long streak!
  }
}, []);

// Study Session Timer
function StudyTimer() {
  const [minutes, setMinutes] = useState(0);
  
  useEffect(() => {
    if (minutes > 90) {
      window.setLMMood('tired'); // Time for a break!
    }
  }, [minutes]);
}

// Game Score
function GameOver({ score, highScore }) {
  useEffect(() => {
    if (score > highScore) {
      window.setLMMood('proud'); // New record!
    }
  }, [score, highScore]);
}
```

## Customization

### Add New Moods

Edit `src/utils/lmQuotes.js`:

```jsx
export const lmQuotes = {
  // ... existing moods
  
  excited: [
    "This is so cool!",
    "I can't wait to learn more!",
    // ... more quotes
  ]
};
```

Edit `src/components/LMMascot.jsx`:

```jsx
// Add to validMoods
const validMoods = ['happy', 'tired', 'hyped', 'proud', 'excited'];

// Add animation
const moodAnimations = {
  // ... existing animations
  excited: {
    animate: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 1,
      repeat: Infinity,
    }
  }
};

// Add styling
const moodStyles = {
  // ... existing styles
  excited: {
    glow: 'shadow-[0_0_50px_rgba(59,130,246,0.8)]',
    border: 'border-blue-400',
    emoji: '🤩'
  }
};
```

### Change Quote Timing

```jsx
// In LMMascot.jsx, find:
const interval = setInterval(showQuote, 120000 + Math.random() * 60000);

// Change to 1-2 minutes:
const interval = setInterval(showQuote, 60000 + Math.random() * 60000);

// Change to 5 minutes:
const interval = setInterval(showQuote, 300000);
```

### Use Your Own LM Image

Replace the emoji with an image:

```jsx
{/* Replace this: */}
<span className="text-4xl">
  {currentStyle.emoji}
</span>

{/* With this: */}
<img 
  src="/LM mask.png" 
  alt="LM"
  className="w-16 h-16 object-contain"
/>
```

### Change Position

```jsx
{/* Bottom-right (default) */}
<div className="fixed bottom-6 right-6 z-50">

{/* Bottom-left */}
<div className="fixed bottom-6 left-6 z-50">

{/* Top-right */}
<div className="fixed top-6 right-6 z-50">
```

## Advanced Usage

### Custom Speak Function (TTS)

Enable the Web Speech API:

```jsx
// In LMMascot.jsx, uncomment:
const speak = useCallback((text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }
}, []);
```

### Listen for Mood Changes

```jsx
// In another component
useEffect(() => {
  const originalSetMood = window.setLMMood;
  
  window.setLMMood = (mood) => {
    console.log('Mood changed to:', mood);
    // Do something when mood changes
    originalSetMood(mood);
  };
  
  return () => {
    window.setLMMood = originalSetMood;
  };
}, []);
```

### Conditional Display

```jsx
// Only show on certain pages
function App() {
  const location = useLocation();
  const showLM = !['/login', '/register'].includes(location.pathname);
  
  return (
    <div>
      {/* Content */}
      {showLM && <LMMascot />}
    </div>
  );
}
```

## Troubleshooting

### LM Not Appearing

1. Check that Tailwind CSS is configured
2. Verify z-index (should be 50)
3. Check for CSS conflicts with `fixed` positioning

### Quotes Not Showing

1. Open browser console for errors
2. Check that `lmQuotes.js` is imported correctly
3. Verify localStorage isn't blocked

### Animations Not Working

1. Ensure Framer Motion is installed: `npm install framer-motion`
2. Check browser console for errors
3. Test in different browsers

### Performance Issues

```jsx
// Reduce animation frequency
const interval = setInterval(showQuote, 300000); // 5 min instead of 2-3

// Simplify animations
const moodAnimations = {
  happy: {
    animate: { y: [0, -5, 0] }, // Simpler animation
    transition: { duration: 3, repeat: Infinity }
  }
};
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

```json
{
  "framer-motion": "^10.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## Tips

1. **Set mood based on context**: Quiz = hyped, Test complete = proud, Late night = tired
2. **Don't overuse**: Only change mood for significant events
3. **Test on mobile**: Make sure positioning works on small screens
4. **Add your personality**: Customize quotes to match your app's voice
5. **Consider accessibility**: Provide option to disable animations

## Example Integration

```jsx
// Student Dashboard
function Dashboard() {
  const { student } = useAuth();
  
  useEffect(() => {
    // Set mood based on streak
    if (student.streak >= 7) {
      window.setLMMood('hyped');
    } else if (student.streak >= 3) {
      window.setLMMood('proud');
    }
  }, [student.streak]);
  
  return <div>{/* Dashboard content */}</div>;
}

// Game Component
function Game() {
  const handleGameStart = () => {
    window.setLMMood('hyped');
  };
  
  const handleGameWin = () => {
    window.setLMMood('proud');
  };
  
  return <div>{/* Game content */}</div>;
}

// Study Timer
function StudyTimer() {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    if (elapsed > 5400) { // 90 minutes
      window.setLMMood('tired');
    }
  }, [elapsed]);
  
  return <div>{/* Timer content */}</div>;
}
```

## License

Part of Learning Monster project

---

**Built with ❤️ for Learning Monster**

Need help? Check the main documentation or ask in the project repo!
