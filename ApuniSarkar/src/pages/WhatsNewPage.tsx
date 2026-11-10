import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const WhatsNewPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();

  return (
    <div className="content-container flex flex-col bg-[#faf5ef] py-6 md:py-10">
      {/* Hero Banner */}
      <div className="relative my-4 min-h-[280px] w-full overflow-hidden rounded-[24px] bg-[#fbf5ed] border border-orange-200/60 md:my-8 shadow-xs">
        <div className="absolute inset-0 bg-[url('/assets/whats-new-hero-bg.png')] bg-cover bg-center opacity-25" />
        <div className="relative flex w-full flex-col justify-between gap-6 md:flex-row">
          <div className="m-6 md:m-10 md:max-w-xl">
            <h1 className="text-ink-900 text-3xl font-semibold md:text-[3.25rem] leading-tight">
              What's New
            </h1>
            <h2 className="text-primary text-4xl font-bold md:text-[3.5rem] leading-tight">
              Apuni Sarkar
            </h2>
            <p className="mt-6 text-ink-700 md:text-lg">
              {language === 'hi'
                ? 'पोर्टल पर जोड़ी गई नवीनतम सेवाओं, सुविधाओं और तकनीकी सुधारों से अपडेट रहें।'
                : 'Stay updated with the latest services, features, and improvements added to the platform.'}
            </p>
          </div>
          <div className="flex items-center justify-center self-center p-4 md:mr-16 md:p-0">
            <img alt="What's New illustration" className="max-h-56 md:max-h-72 object-contain" src="/assets/whats-new-hero-img.png" />
          </div>
        </div>
      </div>

      {/* Updates Cards Container */}
      <div className="mb-10 flex flex-col gap-6 rounded-[20px] border border-orange-100 bg-white p-6 md:p-8 shadow-xs md:mb-20">
        {/* Section 1: Featured Update */}
        <div className="flex flex-col rounded-[16px] border border-gray-100 bg-white shadow-xs overflow-hidden">
          <div className="px-6 pt-5 pb-3 bg-orange-50/50 border-b border-orange-100/50">
            <span className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-white">
              Featured Update
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                Blockchain Integration – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Your Revenue Department Solvency Certificates are now securely integrated with blockchain technology, enabling tamper-proof storage and enhanced authenticity. You can verify your certificate through the 'Verify Certificate' section.
              </p>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                DigiLocker Integration – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Your Apuni Sarkar certificates are now directly accessible through DigiLocker. Securely and instantly fetch, store, and organize all your verified e-certificates in one place for faster access and seamless sharing.
              </p>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                CBDC: Trout Protsahan Yojana – Fisheries Department – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Beneficiaries of the Trout Protsahan Yojana can now receive scheme benefits through a CBDC token. This token can be redeemed only at selected authorized merchants for eligible purchases.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: New Services */}
        <div className="flex flex-col rounded-[16px] border border-gray-100 bg-white shadow-xs overflow-hidden">
          <div className="px-6 pt-5 pb-3 bg-green-50/50 border-b border-green-100/50">
            <span className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider bg-green-600 text-white">
              New Services Added
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                Duplicate Transfer Certificate by Department of Higher Education – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Misplaced your original TC? You can now securely apply for a duplicate online and track your application status in real-time.
              </p>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                Marksheet Correction by Department of Higher Education – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Spot an error on your academic records? Easily submit a correction request for your marksheet directly through the portal. Upload supporting proofs securely for faster verification and resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Improvements */}
        <div className="flex flex-col rounded-[16px] border border-gray-100 bg-white shadow-xs overflow-hidden">
          <div className="px-6 pt-5 pb-3 bg-blue-50/50 border-b border-blue-100/50">
            <span className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider bg-navbar text-white">
              Platform Enhancements
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                WhatsApp Delivery – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Get service updates, SMS receipts, and digitally signed PDF certificates directly on your registered WhatsApp number.
              </p>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-ink-900">
                Single Sign-On (Jan Parichay) – Now Available!
              </h3>
              <p className="mt-1 text-sm text-ink-700 leading-relaxed">
                Log in seamlessly across multiple Uttarakhand state government portals using your unified Jan Parichay credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
