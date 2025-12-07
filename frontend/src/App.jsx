import React from 'react';
import CanvasEditor from './components/Canvas/CanvasEditor';
import OnboardingTutorial from './components/UI/OnboardingTutorial';
import KeyboardShortcutsManager from './components/UI/KeyboardShortcuts'; // Ensure this import
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Onboarding Tutorial - Shows on first visit */}
      <OnboardingTutorial />

      {/* Keyboard Shortcuts Manager - FLOATING BUTTON BOTTOM RIGHT */}
      <KeyboardShortcutsManager />

      {/* Main Canvas Editor (contains everything) */}
      <CanvasEditor />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;