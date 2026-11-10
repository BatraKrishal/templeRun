import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const SitemapPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();

  const mainPages = [
    { label: language === 'hi' ? 'मुख्य पृष्ठ (होम)' : 'Home', route: '/' },
    { label: language === 'hi' ? 'अपनी सरकार परिचय' : 'About Apuni Sarkar', route: '/about' },
    { label: language === 'hi' ? 'सेवाओं की सूची' : 'List of Services', route: '/all-services' },
    { label: language === 'hi' ? 'प्रश्नोत्तरी (FAQs)' : 'FAQs', route: '/faqs' },
    { label: language === 'hi' ? 'नया क्या है' : "What's New", route: '/whats-new' },
    { label: language === 'hi' ? 'शासनादेश (GOs)' : 'Important GOs', route: '/important-gos' },
    { label: language === 'hi' ? 'संपर्क करें' : 'Contact Us', route: '/contact-us' },
    { label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', route: '/dashboard' },
  ];

  const citizenServices = [
    { label: language === 'hi' ? 'आवेदन की स्थिति जांचें' : 'Track Application', route: '/track' },
    { label: language === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download Certificates', route: '/download-certificates' },
    { label: language === 'hi' ? 'प्रमाण पत्र सत्यापित करें' : 'Verify Certificate', route: '/verify' },
    { label: language === 'hi' ? 'नागरिक सर्वे एवं फीडबैक' : 'Citizen Survey', route: '/faqs' },
  ];

  const accountLinks = [
    { label: language === 'hi' ? 'लॉगिन' : 'Login', route: '/login' },
    { label: language === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Login', route: '/login' },
    { label: language === 'hi' ? 'अधिकारी लॉगिन' : 'Officer Login', route: '/login' },
    { label: language === 'hi' ? 'सीएससी लॉगिन (CSC)' : 'CSC Login', route: '/login' },
    { label: language === 'hi' ? 'ईडीसी लॉगिन (EDC)' : 'EDC Login', route: '/login' },
    { label: language === 'hi' ? 'नया पंजीकरण (Sign Up)' : 'Sign Up', route: '/login' },
    { label: language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?', route: '/login' },
  ];

  const policies = [
    { label: 'Accessibility Statement', route: '#footer' },
    { label: 'Cancellation and Refund Policy', route: '#footer' },
    { label: 'Copyright Policy', route: '#footer' },
    { label: 'Disclaimer', route: '#footer' },
    { label: 'Hyperlink Policy', route: '#footer' },
    { label: 'Privacy Policy', route: '#footer' },
    { label: 'Terms and Conditions', route: '#footer' },
    { label: 'Holidays List', route: '#footer' },
    { label: 'Contingency Management Plan', route: '#footer' },
  ];

  return (
    <div className="content-container flex flex-col bg-background py-6 md:py-10">
      {/* Sitemap Hero Banner */}
      <div className="relative my-4 min-h-[240px] w-full overflow-hidden rounded-[24px] bg-[#fbf5ed] border border-orange-100/60 md:my-8 shadow-xs">
        <div className="absolute inset-0 bg-[url('/assets/whats-new-hero-bg.png')] bg-cover bg-center opacity-25" />
        <div className="relative m-6 md:m-10 md:max-w-2xl">
          <h1 className="text-3xl font-semibold md:text-[3.25rem]">
            <span className="text-ink-900">Site</span> <span className="text-primary font-bold">Map</span>
          </h1>
          <p className="mt-6 text-sm text-ink-700 md:text-lg">
            {language === 'hi'
              ? 'इस पोर्टल पर सभी मुख्य पृष्ठों, नागरिक सेवाओं, खाता लिंक, नीतियों और सुगम्यता संसाधनों को ब्राउज़ करें।'
              : 'Browse all main pages, citizen services, account links, policies, and accessibility resources on this portal.'}
          </p>
        </div>
      </div>

      {/* Grid of Sitemap Sections */}
      <div className="mb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 md:mb-20">
        {/* Main Pages */}
        <section aria-labelledby="sitemapSectionMain">
          <h2 id="sitemapSectionMain" className="mb-4 text-lg font-semibold text-ink-900">
            {language === 'hi' ? 'मुख्य पृष्ठ' : 'Main pages'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {mainPages.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => narrateElement(item.label)}
                  className="text-sm text-ink-700 underline-offset-4 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Citizen Services */}
        <section aria-labelledby="sitemapSectionCitizenServices">
          <h2 id="sitemapSectionCitizenServices" className="mb-4 text-lg font-semibold text-ink-900">
            {language === 'hi' ? 'नागरिक सेवाएं' : 'Citizen services'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {citizenServices.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => narrateElement(item.label)}
                  className="text-sm text-ink-700 underline-offset-4 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Account */}
        <section aria-labelledby="sitemapSectionAccount">
          <h2 id="sitemapSectionAccount" className="mb-4 text-lg font-semibold text-ink-900">
            {language === 'hi' ? 'खाता (Account)' : 'Account'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {accountLinks.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => narrateElement(item.label)}
                  className="text-sm text-ink-700 underline-offset-4 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Policies & Documents */}
        <section aria-labelledby="sitemapSectionPolicies">
          <h2 id="sitemapSectionPolicies" className="mb-4 text-lg font-semibold text-ink-900">
            {language === 'hi' ? 'नीतियां एवं दस्तावेज' : 'Policies & documents'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {policies.map((item, idx) => (
              <li key={idx}>
                <a
                  href="#footer"
                  className="text-sm text-ink-700 underline-offset-4 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Accessibility */}
        <section aria-labelledby="sitemapSectionAccessibility">
          <h2 id="sitemapSectionAccessibility" className="mb-4 text-lg font-semibold text-ink-900">
            {language === 'hi' ? 'सुगम्यता (Accessibility)' : 'Accessibility'}
          </h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <button
                onClick={() => onNavigate('/')}
                className="text-sm text-ink-700 underline-offset-4 hover:text-primary hover:underline text-left cursor-pointer transition-colors"
              >
                {language === 'hi' ? 'स्क्रीन रीडर (वाणी-सेतु AI)' : 'Screen Reader (VaaniSetu AI)'}
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
