import React from 'react';
import { Home, Info, List, HelpCircle, Phone, Shield, Settings, FileText, Accessibility } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const OfficialFooter: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();

  return (
    <footer id="footer">
      <div className="bg-navbar py-10 text-white lg:py-12">
        <div className="content-container grid grid-cols-1 items-start gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-0 xl:gap-x-14">
          {/* Col 1 */}
          <div className="flex min-h-0 flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <img alt="indian-emblem" className="h-14 w-auto shrink-0 brightness-0 invert" src="/indian-emblem.svg" />
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/35 bg-white/10 p-1.5">
                <img alt="logo" className="h-full w-full object-contain" src="/logo.webp" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-xl font-bold leading-tight tracking-tight">e-Services</div>
                <div className="mt-0.5 text-sm font-medium text-white/90">Apuni Sarkar</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/95">
              Information Technology Development Agency, Plot No IT 07 IT Park, Sahastradhara Road, Dehradun, Uttarakhand, 248001
            </p>
            <button
              onClick={() => onNavigate('/sitemap')}
              className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left"
              onMouseEnter={() => narrateElement('Screen Reader Access')}
            >
              <Accessibility className="size-4 shrink-0 opacity-95" />
              <span>Screen Reader</span>
            </button>
            <p className="mt-auto border-t border-white/15 pt-5 text-xs leading-snug text-white/85 lg:pt-6">
              Last Updated At: <time dateTime="2026-10-14">14/10/2026</time>
            </p>
          </div>

          {/* Col 2 */}
          <nav className="flex flex-col gap-4" aria-label="Resources">
            <button onClick={() => onNavigate('/')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <Home className="size-4 shrink-0 opacity-95" />
              <span>Home</span>
            </button>
            <button onClick={() => onNavigate('/about')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <Info className="size-4 shrink-0 opacity-95" />
              <span>About Apuni Sarkar</span>
            </button>
            <button onClick={() => onNavigate('/all-services')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <List className="size-4 shrink-0 opacity-95" />
              <span>List of Services</span>
            </button>
            <button onClick={() => onNavigate('/faqs')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <HelpCircle className="size-4 shrink-0 opacity-95" />
              <span>FAQs</span>
            </button>
            <button onClick={() => onNavigate('/contact-us')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <Phone className="size-4 shrink-0 opacity-95" />
              <span>Contact Us</span>
            </button>
            <button onClick={() => onNavigate('/privacy-policy')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <Shield className="size-4 shrink-0 opacity-95" />
              <span>Privacy Policy</span>
            </button>
            <button onClick={() => onNavigate('/dashboard')} className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline text-left">
              <Settings className="size-4 shrink-0 opacity-95" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Col 3 */}
          <nav className="flex flex-col gap-4" aria-label="Policies">
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Accessibility Statement (407KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Cancellation and Refund Policy (406KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Copyright Policy (406KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Disclaimer (406KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Hyperlink Policy (407KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Terms and Conditions (407KB)</span>
            </a>
            <a href="#footer" className="flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline">
              <FileText className="size-4 shrink-0 opacity-95" />
              <span>Holidays List (95KB)</span>
            </a>
          </nav>

          {/* Col 4 */}
          <div className="flex w-full justify-start sm:col-span-2 lg:col-span-1 lg:justify-end">
            <a
              href="tel:1905"
              className="flex w-full max-w-[300px] flex-col items-center justify-center rounded-[20px] border border-white/35 bg-white/10 px-8 py-4 text-center shadow-none outline-none ring-0 transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50 sm:py-5"
            >
              <span className="text-sm font-normal text-white">Toll Free Helpline</span>
              <span className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white tabular-nums sm:text-[26px]">
                1905
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="border-t border-navbar bg-[#0b1220] px-4 py-6 text-center text-white sm:py-7">
        <div className="content-container space-y-1.5 text-sm leading-relaxed text-white/95">
          <p>For the best experience, please view the site in 1024 x 768 resolution. It's optimized for modern browsers like Chrome (v84+), Safari (v14+), and Firefox (v90+).</p>
          <p>Contents of this website is published and managed by Information Technology Development Agency (ITDA), Department of IT, Good Governance & Science Technology, Government of Uttarakhand.</p>
          <p>Copyright © 2026 - Information Technology Development Agency | All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};
