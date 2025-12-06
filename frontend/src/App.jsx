import React from 'react';
import CanvasEditor from './components/Canvas/CanvasEditor';
import BrandKitPanel from './components/UI/BrandKitPanel'; // NEW - Day 17
import OnboardingTutorial from './components/UI/OnboardingTutorial'; // NEW - Day 17
import KeyboardShortcutsManager from './components/UI/KeyboardShortcuts'; // NEW - Day 18
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Onboarding Tutorial - Shows on first visit */}
      <OnboardingTutorial />

      {/* Keyboard Shortcuts Manager */}
      <KeyboardShortcutsManager />

      {/* Main Canvas Editor (contains everything) */}
      <CanvasEditor />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;