import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { language, narrateElement } = useAccessibility();

  const marqueePhotos = [
    '/assets/about-1.jpg',
    '/assets/about-2.jpg',
    '/assets/about-3.jpg',
    '/assets/about-4.jpg',
    '/assets/about-5.jpg',
    '/assets/about-6.jpg',
    '/assets/about-7.jpg',
  ];

  return (
    <div className="flex flex-col w-full h-full gap-10 md:gap-20 py-10 md:py-18 items-center bg-[#faf5ef]">
      {/* 1. Header & Quick Stats */}
      <div className="content-container grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 justify-between">
        <div className="flex flex-col gap-6">
          <div className="text-4xl md:text-[3.5rem] font-semibold leading-tight">
            <h1 className="text-ink-900">Modern Access to</h1>
            <h1 className="text-primary font-bold">Government Services</h1>
          </div>
          <p className="text-base md:text-lg text-ink-700 leading-relaxed">
            {language === 'hi'
              ? 'अपनी सरकार उत्तराखंड भर में सरकारी सेवाओं, आवेदनों, प्रमाण पत्रों और नागरिक सहायता तक पहुंच को सरल बनाने के लिए तैयार किया गया एकीकृत डिजिटल गवर्नेंस प्लेटफॉर्म है।'
              : 'Apuni Sarkar is a unified digital governance platform designed to simplify access to government services, applications, certificates, and citizen support across Uttarakhand.'}
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl md:text-6xl font-bold text-primary">900+</h2>
            <p className="text-base md:text-lg text-ink-900 font-medium">
              {language === 'hi' ? 'सरकारी सेवाएं उपलब्ध' : 'Government Services Available'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl md:text-6xl font-bold text-primary">1.2 Cr+</h2>
            <p className="text-base md:text-lg text-ink-900 font-medium">
              {language === 'hi' ? 'डिजिटल रूप से निस्तारित आवेदन' : 'Applications Processed Digitally'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl md:text-6xl font-bold text-primary">13</h2>
            <p className="text-base md:text-lg text-ink-900 font-medium">
              {language === 'hi' ? 'उत्तराखंड के सभी जनपद कनेक्टेड' : 'Districts Connected Across Uttarakhand'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl md:text-6xl font-bold text-primary">24x7</h2>
            <p className="text-base md:text-lg text-ink-900 font-medium">
              {language === 'hi' ? 'नागरिक सेवाएं और सहायता' : 'Accessible Citizen Services & Support'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Photo Marquee */}
      <div className="w-full overflow-hidden">
        <div className="rfm-marquee-container">
          <div className="rfm-marquee">
            {[...marqueePhotos, ...marqueePhotos].map((src, idx) => (
              <div key={idx} className="w-[260px] h-[320px] rounded-2xl overflow-hidden mx-3 shrink-0 shadow-md">
                <img alt="" className="w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ITDA & Mission Overview */}
      <div className="content-container flex flex-col md:flex-row gap-8 md:gap-12 xl:gap-16 mt-6">
        <div className="w-full h-96 md:w-[480px] md:h-[520px] shrink-0 rounded-2xl overflow-hidden shadow-lg border border-orange-100">
          <img alt="ITDA Uttarakhand Headquarters" className="w-full h-full object-cover" src="/ITDA.jpg" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-semibold text-ink-900">
            About <span className="text-primary font-bold">Apuni Sarkar</span>
          </h1>
          <h3 className="text-2xl font-semibold text-ink-700 mt-1">Our Government at Your Door</h3>
          <p className="text-base md:text-lg text-ink-700 mt-4 leading-relaxed">
            Information Technology Development Agency (ITDA), Department of Information and Science Technology, Government of Uttarakhand has introduced the Citizen Centric service delivery platform e-Services 'Apuni Sarkar' to enable all services under one umbrella in response to the consistent challenges faced by the citizens of Uttarakhand to avail the services on time.
          </p>
          <p className="text-base md:text-lg text-ink-700 mt-4 leading-relaxed">
            'Apuni Sarkar' carries a vision to transform the State into a Digitally empowered society and deliver Citizen Centric services in a 'Faceless, Paperless and Cashless' manner under a solitary platform. Ultimately, the goal is to introduce a transparent and efficient system covering all facets of Govt sector, State, District and Tehsil HQ.
          </p>
          <p className="text-base md:text-lg text-ink-700 mt-4 leading-relaxed">
            'Apuni Sarkar' project intends to provide multiple services from various departments to citizens. Thus, ensuring easy access to citizen centric services through a variety of service delivery points such as Individual users, e-District Centre, and Common Service Centre (CSC). It utilises backend computerization to enable the delivery of services, ensure transparency and uniform application of rules.
          </p>
        </div>
      </div>

      {/* 4. App Features Feature Grid */}
      <div className="content-container mb-12">
        <div className="flex w-full flex-col items-center gap-6 rounded-[24px] bg-white px-4 py-8 shadow-sm md:px-14 md:py-12 border border-gray-100">
          <h2 className="text-center text-3xl md:text-[2.75rem] font-bold text-ink-900 max-w-3xl">
            Discover Exceptional Features of Apuni Sarkar App
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
            {/* Box 1 */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#FFF5E8] p-8 border border-orange-200/50">
              <span className="text-3xl md:text-4xl font-extrabold uppercase text-primary tracking-wide">
                Apuni Sarkar
              </span>
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-xl font-bold text-ink-900">Get the Official Mobile App</span>
                <div className="flex flex-wrap items-center gap-3">
                  <a href="https://play.google.com/store/apps/details?id=com.apunisarkaarapp" target="_blank" rel="noopener noreferrer">
                    <img alt="Get it on Google Play" className="h-11 w-auto" src="/assets/download-form-play-store.png" />
                  </a>
                  <a href="https://apps.apple.com/in/app/apuni-sarkar/id6446305714" target="_blank" rel="noopener noreferrer">
                    <img alt="Download on the App Store" className="h-11 w-auto" src="/assets/download-from-app-store.png" />
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="relative flex flex-col justify-between rounded-[20px] bg-[#FFDCC7]/40 p-8 border border-orange-200/50">
              <div className="max-w-[70%]">
                <span className="text-2xl font-bold text-ink-900">Access Government Services</span>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                  Access government services anytime, anywhere with the Apuni Sarkar mobile app. Easily verify certificates, track application status, download documents.
                </p>
              </div>
              <img alt="" className="hidden md:block absolute right-4 bottom-2 h-44 object-contain" src="/assets/mobile-ss-1.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
