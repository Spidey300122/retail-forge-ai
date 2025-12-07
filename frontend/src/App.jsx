import React from 'react';
import CanvasEditor from './components/Canvas/CanvasEditor';
import OnboardingTutorial from './components/UI/OnboardingTutorial';
import KeyboardShortcutsManager from './components/UI/KeyboardShortcuts';
import ErrorBoundary from './components/UI/ErrorBoundary'; // Add this
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <OnboardingTutorial />
        <KeyboardShortcutsManager />
        <CanvasEditor />
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}

export default App;