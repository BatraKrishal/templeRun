import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TextScale, AccessibilitySettings } from '../types/frontend';

interface AccessibilityContextType extends AccessibilitySettings {
  setLanguage: (lang: Language) => void;
  setTextScale: (scale: TextScale) => void;
  toggleHighContrast: () => void;
  toggleSaralMode: () => void;
  toggleNarrator: () => void;
  narrateElement: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [textScale, setTextScale] = useState<TextScale>('base');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [saralMode, setSaralMode] = useState<boolean>(false);
  const [narratorActive, setNarratorActive] = useState<boolean>(false);

  // Apply dark/high-contrast and text size classes to document root
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('dark', 'high-contrast');
    } else {
      root.classList.remove('dark', 'high-contrast');
    }

    root.classList.remove('text-scale-sm', 'text-scale-base', 'text-scale-lg');
    root.classList.add(`text-scale-${textScale}`);
  }, [highContrast, textScale]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleSaralMode = () => setSaralMode((prev) => !prev);
  const toggleNarrator = () => setNarratorActive((prev) => !prev);

  const narrateElement = (text: string) => {
    if (!narratorActive || !text) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        textScale,
        highContrast,
        saralMode,
        narratorActive,
        setLanguage,
        setTextScale,
        toggleHighContrast,
        toggleSaralMode,
        toggleNarrator,
        narrateElement,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

