import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  telemetry?: any;
}

export const OfficialHeader: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: language === 'hi' ? 'होम' : 'Home', route: '/' },
    { label: language === 'hi' ? 'अपनी सरकार' : 'About Apuni Sarkar', route: '/about' },
    { label: language === 'hi' ? 'सेवाओं की सूची' : 'List of Services', route: '/all-services' },
    { label: language === 'hi' ? 'प्रश्नोत्तरी' : 'FAQs', route: '/faqs' },
    { label: language === 'hi' ? 'नया क्या है' : "What's New", route: '/whats-new' },
    { label: language === 'hi' ? 'शासनादेश' : 'Important GOs', route: '/important-gos' },
    { label: language === 'hi' ? 'संपर्क करें' : 'Contact Us', route: '/contact-us' },
    { label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', route: '/dashboard' },
  ];

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b border-navbar-divider bg-white" style={{ height: '100px' }}>
      <div className="content-container flex h-full items-center justify-between gap-2 md:gap-4">
        {/* Left Branding */}
        <button
          onClick={() => onNavigate('/')}
          className="flex min-w-0 shrink-0 items-center gap-2 text-ink-900 md:gap-3 text-left outline-none cursor-pointer"
          onMouseEnter={() => narrateElement('e-Services Apuni Sarkar')}
        >
          <img className="h-14 shrink-0 md:h-20" alt="Government of India Emblem" src="/indian-emblem.svg" />
          <img className="h-14 w-auto shrink-0 object-contain md:h-20" alt="Apuni Sarkar Logo" src="/logo.webp" />
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight md:text-3xl text-ink-900 leading-none">e-Services</div>
            <div className="text-sm font-medium text-ink-700 md:text-base mt-1">Apuni Sarkar</div>
          </div>
        </button>

        {/* Center Desktop Navigation */}
        <nav className="ml-2 hidden min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2.5 md:flex" aria-label="Primary">
          {navLinks.map((item) => {
            const active = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                onMouseEnter={() => narrateElement(item.label)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-1.5 py-1 text-xs lg:text-sm font-medium transition-colors hover:text-ink-900 cursor-pointer ${
                  active ? 'border-ink-900 text-ink-900 font-bold' : 'border-transparent text-ink-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Branding: Digital India */}
        <div className="flex shrink-0 items-center gap-2">
          <img className="h-9 w-auto shrink-0 object-contain md:h-16" alt="Digital India" src="/digital-india.svg" />
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink-900 hover:bg-gray-100 rounded-md cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100px] left-0 w-full bg-white border-b border-gray-200 shadow-xl py-3 px-4 z-50 flex flex-col gap-2">
          {navLinks.map((item) => (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 px-3 text-sm font-medium rounded ${
                currentRoute === item.route ? 'bg-orange-50 text-primary font-bold' : 'text-ink-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
