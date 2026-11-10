import React, { useState } from 'react';
import {
  Landmark,
  BadgeCheck,
  Gauge,
  Headphones,
  Search,
  FileSearch,
  FileDown,
  ShieldCheck,
  MessageSquareText,
  ArrowRight,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const { executeVoiceCommand } = useVoice();
  const [searchQuery, setSearchQuery] = useState('');

  const quickActionCards = [
    {
      id: 'track',
      title: language === 'hi' ? 'आवेदन की स्थिति जांचें' : 'Track Application',
      desc: language === 'hi' ? 'अपने जमा किए गए आवेदन की वास्तविक समय स्थिति जांचें।' : 'Quickly check the real-time status of your submitted application.',
      icon: FileSearch,
      bg: 'bg-[#FFE8D6]',
      text: 'text-[#D96B2B]',
      border: 'border-[#D96B2B]',
      route: '/track',
    },
    {
      id: 'download',
      title: language === 'hi' ? 'प्रमाण पत्र डाउनलोड करें' : 'Download Certificates',
      desc: language === 'hi' ? 'जारी किए गए डिजिटल हस्ताक्षर युक्त प्रमाण पत्र सीधे डाउनलोड करें।' : 'Download your issued certificates directly from the portal.',
      icon: FileDown,
      bg: 'bg-[#DCEEDE]',
      text: 'text-[#2A7A4B]',
      border: 'border-[#2A7A4B]',
      route: '/download-certificates',
    },
    {
      id: 'verify',
      title: language === 'hi' ? 'प्रमाण पत्र सत्यापित करें' : 'Verify Certificate',
      desc: language === 'hi' ? 'ऑनलाइन जारी प्रमाण पत्रों की सत्यता एवं डिजिटल हस्ताक्षर जांचें।' : 'Verify the authenticity of your certificates issued online.',
      icon: ShieldCheck,
      bg: 'bg-[#DCE8F7]',
      text: 'text-[#3568A8]',
      border: 'border-[#3568A8]',
      route: '/verify',
    },
    {
      id: 'survey',
      title: language === 'hi' ? 'नागरिक फीडबैक एवं सर्वे' : 'Citizen Survey',
      desc: language === 'hi' ? 'अपनी राय साझा करें ताकि हम नागरिक सेवाओं को और सुगम बना सकें।' : 'Your feedback is important to us. Participate in our citizen survey.',
      icon: MessageSquareText,
      bg: 'bg-[#F8EFD0]',
      text: 'text-[#B8860B]',
      border: 'border-[#B8860B]',
      route: '/faqs',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeVoiceCommand(searchQuery);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 0. Official 1:1 Hero Section */}
      <section className="relative w-full overflow-hidden" style={{ '--app-header-height': '140px' } as any}>
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 hidden sm:block"
            style={{
              background: 'radial-gradient(70% 110% at 72% 50%, rgb(247, 230, 213) 0%, rgba(247, 230, 213, 0) 100%)',
            }}
          />
          <img
            alt="Uttarakhand citizen family with Kedarnath background"
            className="hero-image-mask absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-center sm:block lg:w-[52%] xl:w-[48%]"
            src="/assets/hero-cover-as.webp"
          />
          <img alt="" className="absolute bottom-0 left-0 w-full object-cover object-bottom" src="/hero-footer.webp" />
        </div>

        <div className="content-container relative z-10 flex min-h-[calc(100dvh-var(--app-header-height))] flex-col justify-between gap-10 pb-8 pt-7 sm:gap-12 sm:pb-9 sm:pt-9 lg:gap-14 lg:pb-10 lg:pt-10">
          <div className="max-w-4xl overflow-visible">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/80 px-3.5 py-2 text-sm font-medium text-secondary-foreground backdrop-blur-sm sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-[15px]">
              <Landmark className="size-4 shrink-0 text-primary sm:size-5" />
              <span>{language === 'hi' ? 'उत्तराखंड सरकार' : 'Government of Uttarakhand'}</span>
            </div>

            {/* Main Title */}
            <h1 className="mt-6 text-[3.25rem] font-bold uppercase leading-[0.95] tracking-[0.06em] text-ink-900 sm:mt-7 sm:text-[4.25rem] lg:mt-8 lg:text-[5.25rem] xl:text-[6rem]">
              APUNI SARKAR
            </h1>

            {/* Subtitle in rich official terracotta brown #8c431d */}
            <p className="mt-4 max-w-xl text-xl font-medium leading-snug text-primary sm:mt-5 sm:text-2xl lg:text-[1.625rem]">
              {language === 'hi' ? 'एक ही पोर्टल से पाएं सभी सरकारी सेवाएं' : 'Get every service done from one single portal'}
            </p>

            {/* Feature Bullets */}
            <ul className="mt-6 flex flex-wrap items-center text-base font-medium text-ink-700 sm:mt-7 sm:text-lg">
              <li className="inline-flex items-center gap-2.5">
                <BadgeCheck className="size-5 shrink-0 text-primary sm:size-6" />
                <span>{language === 'hi' ? 'सुरक्षित पहुंच' : 'Secure Access'}</span>
              </li>
              <li className="inline-flex items-center gap-2.5 ml-5 border-l border-ink-300/50 pl-5 sm:ml-7 sm:pl-7">
                <Gauge className="size-5 shrink-0 text-primary sm:size-6" />
                <span>{language === 'hi' ? 'त्वरित निस्तारण' : 'Fast Processing'}</span>
              </li>
              <li className="inline-flex items-center gap-2.5 ml-5 border-l border-ink-300/50 pl-5 sm:ml-7 sm:pl-7">
                <Headphones className="size-5 shrink-0 text-primary sm:size-6" />
                <span>{language === 'hi' ? 'हेल्प डेस्क 1905' : 'Help Desk Support'}</span>
              </li>
            </ul>

            {/* Search Box */}
            <div className="relative z-30 mt-6 w-full overflow-visible sm:mt-7 lg:mt-8">
              <form onSubmit={handleSearchSubmit} className="w-full max-w-4xl" role="search">
                <div className="relative">
                  <div className="flex w-full overflow-hidden rounded-2xl border border-primary/40 bg-white shadow-sm ring-1 ring-primary/20">
                    <input
                      role="combobox"
                      aria-label="Search for service"
                      placeholder={
                        language === 'hi'
                          ? 'सेवा खोजें (उदा. आय प्रमाण पत्र, निवास प्रमाण पत्र, जाति प्रमाण पत्र...)'
                          : 'Search Services (e.g., Caste Certificate, Domicile Certificate...)'
                      }
                      className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-ink-700 outline-none placeholder:text-ink-300 sm:px-6 sm:py-[1.1rem]"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="m-1.5 inline-flex h-11 shrink-0 items-center gap-2 self-center rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 transition-all sm:h-12 sm:px-7 sm:text-base cursor-pointer shadow-sm"
                    >
                      <Search className="size-4 sm:size-5" />
                      <span>{language === 'hi' ? 'सेवा खोजें' : 'Search Services'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Buttons: Login/Sign Up and Explore Services */}
            <div className="mt-6 flex flex-wrap items-center gap-3.5 sm:mt-7">
              <button
                onClick={() => onNavigate('/login')}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-9 h-14 min-h-14 min-w-36 text-base font-semibold text-white hover:bg-primary/90 transition-all sm:text-lg shadow-sm cursor-pointer"
              >
                {language === 'hi' ? 'लॉगिन / साइन अप' : 'Login/ Sign Up'}
              </button>
              <button
                onClick={() => onNavigate('/all-services')}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-white/80 px-9 h-14 min-h-14 min-w-44 text-base font-semibold text-primary hover:bg-orange-50/60 transition-all sm:text-lg cursor-pointer"
              >
                {language === 'hi' ? 'सभी सेवाएं देखें' : 'Explore Services'}
              </button>
            </div>
          </div>

          {/* 4 Quick Action Cards */}
          <div className="mt-auto grid w-full grid-cols-1 gap-3 pt-1 sm:grid-cols-2 sm:gap-4 sm:pt-2 xl:grid-cols-4">
            {quickActionCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => onNavigate(card.route)}
                  className="group relative flex h-full min-h-34 items-start gap-3.5 rounded-3xl bg-white p-5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.07)] transition-all hover:shadow-[0_6px_20px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 sm:min-h-35 sm:gap-4 sm:p-6 lg:min-h-38 cursor-pointer"
                  onMouseEnter={() => narrateElement(card.title)}
                >
                  <div className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full sm:size-16 ${card.bg} ${card.text}`}>
                    <Icon className="size-7 stroke-[1.75] sm:size-8" />
                  </div>
                  <div className="min-w-0 flex-1 pb-9 pr-1 sm:pb-10">
                    <h2 className="m-0 text-sm font-bold leading-tight text-ink-900 sm:text-base">
                      {card.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-[1.6] text-ink-600 sm:text-sm sm:leading-[1.6]">
                      {card.desc}
                    </p>
                  </div>
                  <span
                    className={`absolute bottom-4 right-4 inline-flex size-8 items-center justify-center rounded-full border bg-white sm:bottom-5 sm:right-5 sm:size-9 ${card.border} ${card.text} group-hover:scale-110 transition-transform`}
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4 stroke-2" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. Designed for Simpler Government Services */}
      <section className="bg-background py-12 sm:py-14 md:py-16" aria-labelledby="government-services-heading">
        <div className="content-container">
          <h2 id="government-services-heading" className="text-center text-2xl font-semibold tracking-tight text-ink-900 sm:text-[28px] md:text-[32px]">
            {language === 'hi' ? 'सरल और पारदर्शी नागरिक सेवाएं' : 'Designed for Simpler Government Services'}
          </h2>
          <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-8">
            <li className="flex">
              <article className="flex w-full flex-col items-start gap-4 rounded-3xl bg-white p-6 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <img alt="All Services in One Place" width="42" height="48" className="h-10 w-auto shrink-0 self-start" src="/assets/svgs/pie.svg" />
                <div className="w-full">
                  <h3 className="text-[17px] leading-snug font-bold text-ink-900">
                    {language === 'hi' ? 'सभी सेवाएं एक स्थान पर' : 'All Services in One Place'}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">
                    {language === 'hi'
                      ? 'एक ही डिजिटल प्लेटफॉर्म से कई विभागों की सेवाएं प्राप्त करें—विभिन्न कार्यालयों के चक्कर काटने की आवश्यकता नहीं।'
                      : 'Access multiple government services through a single platform—no need to visit different offices or websites.'}
                  </p>
                </div>
              </article>
            </li>
            <li className="flex">
              <article className="flex w-full flex-col items-start gap-4 rounded-3xl bg-white p-6 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <img alt="Easy Application & Tracking" width="42" height="48" className="h-10 w-auto shrink-0 self-start" src="/assets/svgs/trend.svg" />
                <div className="w-full">
                  <h3 className="text-[17px] leading-snug font-bold text-ink-900">
                    {language === 'hi' ? 'सहज आवेदन और ट्रैकिंग' : 'Easy Application & Tracking'}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">
                    {language === 'hi'
                      ? 'घर बैठे ऑनलाइन आवेदन करें एवं आवेदन स्थिति को वास्तविक समय में पूरी पारदर्शिता के साथ ट्रैक करें।'
                      : 'Apply for services online and track your application status in real-time with complete transparency.'}
                  </p>
                </div>
              </article>
            </li>
            <li className="flex">
              <article className="flex w-full flex-col items-start gap-4 rounded-3xl bg-white p-6 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <img alt="Secure & Verified" width="42" height="48" className="h-10 w-auto shrink-0 self-start" src="/assets/svgs/shield.svg" />
                <div className="w-full">
                  <h3 className="text-[17px] leading-snug font-bold text-ink-900">
                    {language === 'hi' ? 'सुरक्षित एवं सत्यापित' : 'Secure & Verified'}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">
                    {language === 'hi'
                      ? 'आपका डेटा और दस्तावेज सुरक्षित सर्वर पर डिजिटल रूप से आधिकारिक प्रक्रियाओं द्वारा सुरक्षित रहते हैं।'
                      : 'Your data and documents are protected with secure systems and officially verified processes.'}
                  </p>
                </div>
              </article>
            </li>
            <li className="flex">
              <article className="flex w-full flex-col items-start gap-4 rounded-3xl bg-white p-6 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <img alt="Anytime, Anywhere Access" width="42" height="48" className="h-10 w-auto shrink-0 self-start" src="/assets/svgs/access.svg" />
                <div className="w-full">
                  <h3 className="text-[17px] leading-snug font-bold text-ink-900">
                    {language === 'hi' ? 'कभी भी, कहीं भी पहुंच' : 'Anytime, Anywhere Access'}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">
                    {language === 'hi'
                      ? 'मोबाइल या कंप्यूटर से 24x7 सेवाओं का लाभ उठाएं—बिना कतार, बिना यात्रा, बिना परेशानी।'
                      : 'Use services anytime from your mobile or desktop—no queues, no travel, no hassle.'}
                  </p>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </section>

      {/* 2. Download Apuni Sarkar App Section */}
      <section className="bg-background py-8 sm:py-10" aria-labelledby="mobile-app-download-heading">
        <div className="content-container">
          <div className="grid overflow-hidden rounded-[28px] border border-gray-200 bg-white md:grid-cols-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div className="flex items-center px-7 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="max-w-[520px]">
                <h2 id="mobile-app-download-heading" className="text-[2rem] leading-tight font-semibold tracking-tight text-ink-900">
                  {language === 'hi' ? 'अपनी सरकार ऐप डाउनलोड करें' : 'Download Apuni Sarkar App'}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-700">
                  {language === 'hi'
                    ? 'अपनी सरकार मोबाइल ऐप के साथ कभी भी, कहीं भी सरकारी सेवाओं तक पहुंचें। प्रमाण पत्र आसानी से सत्यापित करें, आवेदन ट्रैक करें और दस्तावेज डाउनलोड करें।'
                    : 'Access government services anytime, anywhere with the Apuni Sarkar mobile app. Easily verify certificates, track application status, download documents, and stay updated with important services, all from your smartphone with a simple, secure, and user-friendly experience.'}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.apunisarkaarapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download from Google Play Store"
                    className="inline-flex hover:opacity-90 transition-opacity"
                  >
                    <img alt="Get it on Google Play" className="h-11 w-auto sm:h-12" src="/assets/download-form-play-store.png" />
                  </a>
                  <a
                    href="https://apps.apple.com/in/app/apuni-sarkar/id6446305714"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download from Apple App Store"
                    className="inline-flex hover:opacity-90 transition-opacity"
                  >
                    <img alt="Download on the App Store" className="h-11 w-auto sm:h-12" src="/assets/download-from-app-store.png" />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center bg-white px-6 py-8 sm:px-8 sm:py-10">
              <img
                alt="Apuni Sarkar mobile app preview"
                className="max-h-80 w-auto rounded-2xl object-contain sm:max-h-96 lg:max-h-[420px]"
                src="/assets/mobile-app.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Media Gallery Carousel */}
      <section className="min-w-0 overflow-x-clip py-12 sm:py-14 md:py-16" aria-labelledby="media-gallery-heading">
        <div className="mx-auto mb-8 max-w-2xl px-4 text-center sm:mb-10">
          <h2 id="media-gallery-heading" className="text-2xl font-semibold tracking-tight text-primary sm:text-[28px] md:text-[32px]">
            {language === 'hi' ? 'मीडिया गैलरी' : 'Media Gallery'}
          </h2>
          <p className="mt-2 text-base text-gray-500 sm:text-lg">
            {language === 'hi' ? 'उत्तराखंड विकास और सांस्कृतिक धरोहर की झलकियां।' : 'Glimpses of development and cultural heritage.'}
          </p>
        </div>
        <div className="content-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <img alt="Award ceremony for administrative reforms and public grievances" className="aspect-[16/10] w-full object-cover" src="/media-gallery2.webp" />
            </div>
            <div className="overflow-hidden rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <img alt="Group photo at a government outreach programme" className="aspect-[16/10] w-full object-cover" src="/media-gallery3.webp" />
            </div>
            <div className="overflow-hidden rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <img alt="Officials reviewing digital services on a laptop" className="aspect-[16/10] w-full object-cover" src="/media-gallery4.webp" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Official Partners Running Marquee */}
      <section className="w-full overflow-x-hidden bg-background py-8 sm:py-10" aria-label="Official partner services and national portals">
        <div className="content-container mb-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {language === 'hi' ? 'राष्ट्रीय पोर्टल एवं एकीकृत सेवाएं' : 'National Portals & Integrated Services'}
          </span>
        </div>
        <div className="w-full overflow-hidden">
          <div className="rfm-marquee-container">
            <div className="rfm-marquee">
              {[
                { name: 'India National Portal', src: '/national-portal-logo.svg', href: 'https://www.india.gov.in/' },
                { name: 'UMANG', src: '/umang.png', href: 'https://web.umang.gov.in/' },
                { name: 'API Setu', src: '/logo-api-setu.png', href: 'https://apisetu.gov.in/' },
                { name: 'DigiLocker', src: '/digi-locker.png', href: 'https://www.digilocker.gov.in/' },
                { name: 'eGazette', src: '/egazette.png', href: 'https://egazette.gov.in/' },
                { name: 'DIPR', src: '/dipr.png', href: 'https://uttarainformation.gov.in/' },
                { name: 'India National Portal', src: '/national-portal-logo.svg', href: 'https://www.india.gov.in/' },
                { name: 'UMANG', src: '/umang.png', href: 'https://web.umang.gov.in/' },
                { name: 'API Setu', src: '/logo-api-setu.png', href: 'https://apisetu.gov.in/' },
                { name: 'DigiLocker', src: '/digi-locker.png', href: 'https://www.digilocker.gov.in/' },
                { name: 'eGazette', src: '/egazette.png', href: 'https://egazette.gov.in/' },
                { name: 'DIPR', src: '/dipr.png', href: 'https://uttarainformation.gov.in/' },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-3 flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-none transition-all hover:border-primary sm:mx-4 sm:h-24 sm:w-52 sm:px-4"
                >
                  <img alt={item.name} className="max-h-full max-w-full object-contain" src={item.src} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Floating WhatsApp Button on Bottom-Left */}
      <a
        href="https://api.whatsapp.com/send?phone=911905&text=Namaste%20Apuni%20Sarkar"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform"
        aria-label="Chat on WhatsApp"
        title="Apuni Sarkar WhatsApp Helpline"
      >
        <svg className="size-8 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2C6.496 2 2 6.48 2 11.996c0 1.905.534 3.684 1.458 5.203L2 22l4.98-1.428a9.923 9.923 0 0 0 5.051 1.424C17.566 22 22.06 17.52 22.06 11.996 22.06 6.48 17.566 2 12.031 2zm5.727 14.167c-.24.673-1.393 1.285-1.928 1.348-.518.06-1.18.084-3.793-.997-3.138-1.299-5.148-4.48-5.305-4.69-.158-.209-1.272-1.691-1.272-3.226 0-1.534.806-2.289 1.092-2.597.286-.307.625-.385.833-.385.208 0 .416.002.598.01.194.01.453-.073.708.54.26.626.885 2.164.963 2.321.078.157.13.34.026.549-.104.209-.156.34-.312.522-.156.183-.328.408-.469.549-.156.156-.319.327-.137.64.182.313.81 1.336 1.737 2.161 1.192 1.062 2.197 1.391 2.509 1.547.312.157.494.13.676-.078.182-.209.78-.913.989-1.226.208-.313.416-.26.702-.157.286.104 1.819.858 2.131 1.014.312.156.52.234.598.364.078.13.078.755-.162 1.428z" />
        </svg>
      </a>
    </div>
  );
};
