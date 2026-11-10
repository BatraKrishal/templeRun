import React, { useState } from 'react';
import { Volume2, VolumeX, SlidersHorizontal, Accessibility, Globe } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const AccessibilityBar: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const {
    language,
    setLanguage,
    setTextScale,
    highContrast,
    toggleHighContrast,
    narratorActive,
    toggleNarrator,
    narrateElement,
  } = useAccessibility();

  const [bhashiniOpen, setBhashiniOpen] = useState(false);

  return (
    <div className="shrink-0 overflow-visible bg-navbar text-sm text-white select-none">
      <div className="content-container flex min-h-10 flex-wrap items-center justify-center gap-x-2 gap-y-2 py-2 sm:justify-between sm:gap-x-2 sm:py-1.5 lg:h-10 lg:flex-nowrap lg:py-0">
        {/* Left: Skip & Sitemap */}
        <div className="hidden min-w-0 items-center gap-2 sm:flex sm:gap-3">
          <a
            href="#main-content"
            className="shrink-0 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onMouseEnter={() => narrateElement('Skip to main content')}
          >
            {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
          </a>
          <span className="h-4 w-px shrink-0 bg-white/40" aria-hidden="true" />
          <button
            onClick={() => onNavigate('/sitemap')}
            className="shrink-0 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onMouseEnter={() => narrateElement('Sitemap')}
          >
            {language === 'hi' ? 'साइटमैप' : 'Sitemap'}
          </button>
        </div>

        {/* Right: Languages, Zoom, Controls */}
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:justify-end sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 text-xs leading-none sm:gap-1.5 sm:text-sm">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`inline-flex items-center rounded px-1.5 py-0.5 leading-none transition-colors ${
                language === 'en' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
              aria-pressed={language === 'en'}
            >
              English
            </button>
            <span className="text-white/70" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`inline-flex items-center rounded px-1.5 py-0.5 leading-none transition-colors ${
                language === 'hi' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`}
              aria-pressed={language === 'hi'}
            >
              हिन्दी
            </button>
          </div>

          <span className="hidden h-4 w-px shrink-0 bg-white/40 sm:block" aria-hidden="true" />

          {/* Bhashini Icon */}
          <div className="relative flex h-10 shrink-0 items-center overflow-visible">
            <button
              type="button"
              onClick={() => setBhashiniOpen(!bhashiniOpen)}
              className="inline-flex items-center justify-center rounded p-1 hover:bg-white/10"
              title="Regional Language Translation (Bhashini)"
              aria-label="Language Translator"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M14.125 3.735V12H12.91V3.735H11.815V2.67H15.685V3.735H14.125ZM8.47 2.52C9.25 2.52 9.845 2.715 10.255 3.105C10.675 3.495 10.885 3.985 10.885 4.575C10.885 5.005 10.77 5.395 10.54 5.745C10.32 6.085 9.99 6.355 9.55 6.555C9.11 6.755 8.56 6.865 7.9 6.885L7.825 5.835C8.505 5.815 8.985 5.695 9.265 5.475C9.555 5.255 9.7 4.96 9.7 4.59C9.7 4.23 9.58 3.97 9.34 3.81C9.11 3.65 8.84 3.57 8.53 3.57C8.16 3.57 7.825 3.62 7.525 3.72C7.225 3.82 6.905 3.955 6.565 4.125L6.19 3.09C6.45 2.95 6.77 2.82 7.15 2.7C7.54 2.58 7.98 2.52 8.47 2.52ZM11.05 8.73C11.05 9.19 10.945 9.575 10.735 9.885C10.525 10.195 10.24 10.425 9.88 10.575C9.53 10.725 9.13 10.8 8.68 10.8C8.11 10.8 7.58 10.66 7.09 10.38C6.61 10.1 6.15 9.655 5.71 9.045C5.28 8.435 4.855 7.64 4.435 6.66L5.5 6.27C5.79 6.98 6.09 7.595 6.4 8.115C6.72 8.625 7.06 9.02 7.42 9.3C7.78 9.57 8.165 9.705 8.575 9.705C8.955 9.705 9.265 9.62 9.505 9.45C9.745 9.27 9.865 8.985 9.865 8.595C9.865 8.115 9.7 7.7 9.37 7.35C9.04 7 8.64 6.68 8.17 6.39L9.055 6.345L9.7 6.21C9.84 6.33 9.995 6.475 10.165 6.645C10.335 6.815 10.47 6.985 10.57 7.155L10.645 7.44C10.775 7.63 10.875 7.83 10.945 8.04C11.015 8.25 11.05 8.48 11.05 8.73ZM11.29 6.75C11.77 6.75 12.185 6.715 12.535 6.645C12.885 6.565 13.295 6.44 13.765 6.27V7.35C13.335 7.54 12.945 7.665 12.595 7.725C12.255 7.785 11.88 7.815 11.47 7.815C11.32 7.815 11.145 7.805 10.945 7.785C10.745 7.755 10.555 7.725 10.375 7.695C10.205 7.655 10.08 7.62 10 7.59L9.295 6.75L9.385 6.525C9.675 6.595 9.98 6.65 10.3 6.69C10.62 6.73 10.95 6.75 11.29 6.75Z" fill="#ffffff" />
                <path d="M19.63 22L18.426 18.906H14.464L13.274 22H12L15.906 11.962H17.04L20.932 22H19.63ZM18.048 17.786L16.928 14.762C16.9 14.6873 16.8533 14.552 16.788 14.356C16.7227 14.16 16.6573 13.9593 16.592 13.754C16.536 13.5393 16.4893 13.376 16.452 13.264C16.3773 13.5533 16.298 13.838 16.214 14.118C16.1393 14.3887 16.074 14.6033 16.018 14.762L14.884 17.786H18.048Z" fill="#ffffff" />
              </svg>
            </button>
            {bhashiniOpen && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-lg bg-white p-2 text-ink-900 shadow-xl border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Uttarakhand Regional Dialects</div>
                <button
                  onClick={() => { setLanguage('hi'); setBhashiniOpen(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-orange-50 hover:text-primary rounded font-medium flex items-center justify-between"
                >
                  <span>गढ़वाली (Garhwali)</span>
                  <span className="text-[10px] text-gray-400">Pahari Dialect</span>
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setBhashiniOpen(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-orange-50 hover:text-primary rounded font-medium flex items-center justify-between"
                >
                  <span>कुमाऊँनी (Kumaoni)</span>
                  <span className="text-[10px] text-gray-400">Pahari Dialect</span>
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setBhashiniOpen(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-orange-50 hover:text-primary rounded font-medium flex items-center justify-between"
                >
                  <span>जौनसारी (Jaunsari)</span>
                  <span className="text-[10px] text-gray-400">Tribal Dialect</span>
                </button>
              </div>
            )}
          </div>

          <span className="hidden h-4 w-px bg-white/40 sm:block" aria-hidden="true" />

          {/* Zoom Buttons A+ A= A- */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTextScale('lg')}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-white/50 bg-white text-xs font-bold leading-none text-navbar hover:bg-white/90"
              aria-label="Increase text size A+"
              title="Increase text size"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setTextScale('base')}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-white/50 bg-white text-xs font-bold leading-none text-navbar hover:bg-white/90"
              aria-label="Reset text size A="
              title="Reset text size"
            >
              A=
            </button>
            <button
              type="button"
              onClick={() => setTextScale('sm')}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-white/50 bg-white text-xs font-bold leading-none text-navbar hover:bg-white/90"
              aria-label="Decrease text size A-"
              title="Decrease text size"
            >
              A-
            </button>
          </div>

          <span className="hidden h-4 w-px bg-white/40 sm:block" aria-hidden="true" />

          {/* High Contrast Slider Button */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded border border-white/50 bg-white text-xs font-bold leading-none text-navbar hover:bg-white/90 focus-visible:outline-2 ${
              highContrast ? 'ring-2 ring-amber-400 bg-amber-100' : ''
            }`}
            title="High Contrast / Accessibility Tools"
            aria-label="Accessibility tools"
          >
            <SlidersHorizontal className="size-4" />
          </button>

          {/* Screen Reader / Voice Narrator Button */}
          <button
            type="button"
            onClick={toggleNarrator}
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded border border-white/50 bg-white text-xs font-bold leading-none text-navbar hover:bg-white/90 ${
              narratorActive ? 'ring-2 ring-amber-400 text-amber-700 bg-amber-100' : ''
            }`}
            title={narratorActive ? 'Screen Reader (Narrator) Active - Click to Stop' : 'Screen Reader (ElevenLabs Narrator)'}
            aria-label="Screen Reader"
          >
            <Accessibility className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
