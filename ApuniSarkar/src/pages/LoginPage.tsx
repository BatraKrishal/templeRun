import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';

export const LoginPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language } = useAccessibility();
  const { speakText } = useVoice();
  const [activeTab, setActiveTab] = useState<'CITIZEN' | 'CSC' | 'EDC' | 'OFFICER'>('CITIZEN');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('7B9K2');

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(res);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    speakText(
      language === 'hi'
        ? `नागरिक पोर्टल में स्वागत है। सत्यापन सफल रहा।`
        : `Welcome to Apuni Sarkar Citizen Portal. Login successful.`
    );
    // Navigate to all services directory
    onNavigate('/all-services');
  };

  return (
    <main id="main-content" className="flex min-h-[calc(100vh-140px)] flex-1 items-center justify-center bg-[#faf5ef] p-4 sm:p-6 lg:p-10">
      <div className="flex w-full max-w-6xl items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Official Login Hero Image */}
        <section className="hidden min-h-0 min-w-0 items-center lg:flex lg:basis-0 lg:flex-1 justify-center">
          <img
            alt="Apuni Sarkar Citizen Portal"
            className="block h-auto w-full max-w-md xl:max-w-lg object-contain rounded-2xl shadow-lg border border-orange-200/60"
            src="/login-hero.png"
          />
        </section>

        {/* Right Side: Login Card */}
        <section className="flex w-full max-w-md flex-col lg:basis-0 lg:flex-1">
          {/* Back to Home Button */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="group mb-4 inline-flex w-fit items-center gap-2.5 rounded-md outline-offset-4 text-sm font-medium text-ink-800 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-300 bg-white shadow-xs group-hover:border-primary/50 group-hover:text-primary">
              <ArrowLeft className="size-4" />
            </span>
            <span>{language === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
          </button>

          {/* Card */}
          <div className="relative w-full rounded-2xl border border-stone-200 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            {/* 4 Tabs: Citizen, CSC, EDC, Officer */}
            <div className="flex border-b border-gray-200 mb-6">
              {(['CITIZEN', 'CSC', 'EDC', 'OFFICER'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'border-primary text-primary font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'CITIZEN' ? 'Citizen' : tab === 'CSC' ? 'CSC' : tab === 'EDC' ? 'EDC' : 'Officer'}
                </button>
              ))}
            </div>

            {/* Login Form */}
            <h2 className="text-xl font-bold text-ink-900 mb-4">
              {activeTab === 'CITIZEN'
                ? 'Citizen Login'
                : activeTab === 'CSC'
                ? 'CSC VLE Login'
                : activeTab === 'EDC'
                ? 'e-District Center (EDC) Login'
                : 'Department Officer Login'}
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  User ID / Email / Mobile
                </label>
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  aria-label="User ID or Email or Mobile"
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter e-mail or mobile number"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    aria-label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Captcha Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-2 bg-stone-100 rounded-lg font-mono text-lg font-extrabold tracking-widest text-ink-900 select-none border border-dashed border-stone-400 text-center">
                    {captchaText}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 cursor-pointer"
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter characters shown above"
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a href="#forgot" className="text-primary hover:underline font-semibold">
                  Forgot password?
                </a>
                <a href="#signup" className="text-primary hover:underline font-semibold">
                  New User? Sign Up
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
              >
                Sign In
              </button>
            </form>

            {/* Single Sign On Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs uppercase text-gray-500 font-semibold">Or Sign In with SSO</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* DigiLocker and Jan Parichay Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  speakText('Connecting to DigiLocker SSO...');
                  onNavigate('/all-services');
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-800 shadow-xs cursor-pointer"
              >
                <img src="/digi-locker-logo.png" alt="DigiLocker" className="h-5 w-auto object-contain" />
                <span>DigiLocker</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  speakText('Connecting to Jan Parichay National Single Sign On...');
                  onNavigate('/all-services');
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-800 shadow-xs cursor-pointer"
              >
                <img src="/janparichay.png" alt="Jan Parichay" className="h-5 w-auto object-contain" />
                <span>Jan Parichay</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

