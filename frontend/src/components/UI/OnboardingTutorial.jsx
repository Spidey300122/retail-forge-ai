import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem('retailforge_tutorial_completed');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const steps = [
    {
      title: 'Welcome to Retail Forge AI! 🚀',
      description: 'Create professional retail media creatives in 5 minutes with AI-powered assistance.',
      icon: '👋',
      highlight: null
    },
    {
      title: 'Step 1: Upload Your Product',
      description: 'Start by uploading your product image in the UPLOAD tab. Our AI will automatically remove backgrounds and extract brand colors.',
      icon: '📸',
      highlight: 'UPLOAD'
    },
    {
      title: 'Step 2: Get AI Layout Suggestions',
      description: 'Go to LAYOUTS tab and click "Generate Layouts". GPT-4 Vision will suggest 3 optimized layouts based on your product category.',
      icon: '✨',
      highlight: 'LAYOUTS'
    },
    {
      title: 'Step 3: Add Smart Copy',
      description: 'Visit the COPY tab to generate compelling headlines. Our AI ensures all copy is compliant with Tesco guidelines.',
      icon: '✍️',
      highlight: 'COPY'
    },
    {
      title: 'Step 4: Validate Compliance',
      description: 'The VALIDATE tab checks your creative against 30+ Tesco rules in real-time. Get instant feedback and suggestions.',
      icon: '✅',
      highlight: 'VALIDATE'
    },
    {
      title: 'Step 5: Export for All Platforms',
      description: 'Generate campaign-ready assets for Instagram, Facebook, and in-store displays with one click in the EXPORT tab.',
      icon: '🎯',
      highlight: 'EXPORT'
    },
    {
      title: 'Pro Tip: Brand Memory',
      description: 'Save your brand settings as a Brand Kit to make future campaigns even faster. Your preferences improve with each use!',
      icon: '💾',
      highlight: 'ASSISTANT'
    },
    {
      title: "You're All Set! 🎉",
      description: "Ready to create your first campaign? Remember: You can always restart this tutorial from the Help menu.",
      icon: '🚀',
      highlight: null
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('retailforge_tutorial_completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime from the Help menu.')) {
      handleComplete();
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            title="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{step.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{step.title}</h2>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Highlight Badge */}
          {step.highlight && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Look for the "{step.highlight}" tab
            </div>
          )}

          {/* Visual Indicator for Features */}
          {currentStep === 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">✨ AI Magic:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Background removal in seconds</li>
                <li>• Automatic brand color extraction</li>
                <li>• Smart image optimization</li>
              </ul>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">🛡️ 30+ Rules Checked:</p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• No T&Cs or competitions</li>
                <li>• Minimum font sizes enforced</li>
                <li>• WCAG contrast ratios verified</li>
                <li>• Tesco tag compliance</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip tutorial
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Restart Tutorial Button Component (add to Help menu)
export const RestartTutorialButton = () => {
  const handleRestart = () => {
    localStorage.removeItem('retailforge_tutorial_completed');
    window.location.reload();
  };

  return (
    <button
      onClick={handleRestart}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
    >
      <Sparkles className="w-4 h-4" />
      Restart Tutorial
    </button>
  );
};

export default OnboardingTutorial;