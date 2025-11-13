import React from 'react';
import { XPProvider } from './context/XPContext';
import { LMProvider } from './context/LMContext';
import { ClassProvider } from './context/ClassContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { LMMascot } from './components/LMMascot';
import Dashboard from './components/Dashboard';

/**
 * Main App Component
 * 
 * Providers (Nested Order):
 * 1. XPProvider: Global XP/level state
 * 2. LMProvider: LM appearance & inventory state
 * 3. ClassProvider: Classes & assignments
 * 4. AnalyticsProvider: Performance tracking
 * 
 * The LM Mascot will appear on all pages with customized appearance
 */

function App() {
  return (
    <XPProvider>
      <LMProvider>
        <ClassProvider>
          <AnalyticsProvider>
            {/* Student Dashboard with integrated mood triggers */}
            <Dashboard />

            {/* LM Mascot - appears on all pages with custom appearance */}
            <LMMascot />
          </AnalyticsProvider>
        </ClassProvider>
      </LMProvider>
    </XPProvider>
  );
}

export default App;
