# 🎯 Study Session Mode - Setup Guide

## Overview

A focused study timer with LM guidance, lo-fi music, and progress tracking.

## Features

✅ **Two Duration Options**
- 25 minutes (Quick Focus) - +50 XP
- 50 minutes (Deep Focus) - +100 XP

✅ **Circular Timer Animation**
- Beautiful gradient progress ring
- Large countdown display
- Smooth animations

✅ **LM Integration**
- LM encourages you every 10 minutes
- Bigger LM presence during sessions
- Mood changes based on progress

✅ **Background Features**
- Dimmed background when active
- Lo-fi music loop (optional)
- Distraction-free environment

✅ **Progress Tracking**
- Sessions completed counter
- Streak tracking
- Saved in localStorage

✅ **Celebration**
- Confetti animation on completion
- +XP reward display
- Special bonus for 3-session streaks

## Installation

### 1. Install Dependencies

```bash
npm install react-confetti
# or
yarn add react-confetti
```

Framer Motion should already be installed from the LM Mascot.

### 2. Add Lo-Fi Music (Optional)

Place a lo-fi music file in your `public` folder:
```
public/
  lofi-music.mp3  # Your lo-fi music file
```

Or use any royalty-free lo-fi track from:
- YouTube Audio Library
- Free Music Archive
- Incompetech

### 3. Add Route (if using React Router)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudySession from './pages/StudySession';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/study" element={<StudySession />} />
      </Routes>
      <LMMascot />
    </BrowserRouter>
  );
}
```

### 4. Add Navigation Button

```jsx
// In Dashboard.jsx
<Link to="/study">
  <button className="...">
    🎯 Study Session
  </button>
</Link>
```

## Usage

### Starting a Session

1. Choose duration (25 or 50 minutes)
2. Click "🚀 Start Session"
3. Focus on your work!
4. LM will encourage you every 10 minutes

### During Session

- **Pause** - Take a quick break
- **Reset** - Start over
- **Resume** - Continue after pause

### After Completion

- See confetti celebration 🎉
- Earn XP (+50 or +100)
- Track your streak
- Start new session or return to dashboard

## Streak Bonuses

Complete 3 sessions in a row to trigger:
- ⚡ Special "3 SESSION STREAK" badge
- LM glow animation (hyped mood)
- Extra motivation message

## Customization

### Change Durations

```jsx
// In StudySession.jsx
const DURATIONS = {
  short: 15,  // 15 minutes
  medium: 25, // 25 minutes
  long: 50    // 50 minutes
};
```

### Change XP Rewards

```jsx
const earnedXP = duration === 25 ? 50 : 100;
// Change to:
const earnedXP = duration === 25 ? 75 : 150;
```

### Disable Music

```jsx
// Comment out or remove:
// <audio ref={audioRef} loop src="/lofi-music.mp3" />
```

### Change Encouragement Frequency

```jsx
// Every 10 minutes (default)
10 * 60 * 1000

// Every 5 minutes
5 * 60 * 1000

// Every 15 minutes
15 * 60 * 1000
```

### Adjust Timer Size

```jsx
// Circular Progress SVG
<svg width="300" height="300">  // Change size
  <circle r="120" />             // Adjust radius
```

### Change Colors

```jsx
// Gradient in SVG
<linearGradient id="gradient">
  <stop offset="0%" stopColor="#ff62b0" />  // Start color
  <stop offset="100%" stopColor="#6b46c1" /> // End color
</linearGradient>
```

## Tips for Users

1. **Silent Mode** - Put phone on silent
2. **Close Tabs** - Close unnecessary browser tabs
3. **Hydration** - Keep water nearby
4. **Posture** - Sit comfortably
5. **Breaks** - Take breaks between sessions

## Troubleshooting

### Music Not Playing

1. Check file path: `/lofi-music.mp3`
2. Verify file is in `public` folder
3. Check browser console for errors
4. Try different audio format (mp3, ogg, wav)

### Confetti Not Showing

1. Check `react-confetti` is installed
2. Verify window dimensions
3. Check for CSS z-index conflicts

### Timer Not Counting

1. Check browser console for errors
2. Verify React state updates
3. Test in different browser

### Progress Not Saving

1. Check localStorage permissions
2. Clear browser cache
3. Test in incognito mode

## Integration Examples

### With Dashboard

```jsx
// Add button to Dashboard
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/study')}>
      🎯 Start Study Session
    </button>
  );
}
```

### With Planner

```jsx
// Quick access from planner
function Planner() {
  return (
    <div>
      <h2>Today's Study Schedule</h2>
      <button onClick={() => navigate('/study')}>
        Focus Time
      </button>
    </div>
  );
}
```

### With Pomodoro Technique

```jsx
// 25-5-25-5-25-5-25-30 pattern
const pomodoroSessions = [25, 5, 25, 5, 25, 5, 25, 30];
```

## Performance

- Lightweight (minimal dependencies)
- Efficient timer (1 second intervals)
- No unnecessary re-renders
- localStorage for persistence

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## Future Enhancements

Potential additions:
- [ ] Multiple timer presets
- [ ] Custom break intervals
- [ ] Statistics dashboard
- [ ] Export study logs
- [ ] Sound effects for timer end
- [ ] Desktop notifications
- [ ] Dark/light mode toggle
- [ ] Study goals tracking

## Credits

- Timer design inspired by Focus apps
- Confetti by react-confetti
- Animations by Framer Motion
- LM mascot integration

---

**Happy Studying! 🎓**

Let LM be your study buddy! 💜
