import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const FAQsPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { language, narrateElement } = useAccessibility();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How to Login?',
      qHi: 'लॉगिन कैसे करें?',
      a: 'In case of already registered user, please enter your user ID and password. In case of new users, please select "Sign Up" or "Register Here" and enter your mobile number, email, and details to create your citizen account.',
      aHi: 'पहले से पंजीकृत नागरिक अपनी यूजर आईडी और पासवर्ड दर्ज करें। नए नागरिक "साइन अप" पर क्लिक करके अपना मोबाइल और विवरण दर्ज कर नया खाता बना सकते हैं।',
    },
    {
      q: 'How to reset password?',
      qHi: 'पासवर्ड कैसे रीसेट करें?',
      a: 'Click on "Forgot Password" on the login screen. Enter your registered mobile number or email ID, verify the OTP sent to your phone, and create your new secure password.',
      aHi: 'लॉगिन स्क्रीन पर "पासवर्ड भूल गए?" पर क्लिक करें। पंजीकृत मोबाइल नंबर दर्ज करें, ओटीपी सत्यापित करें और नया पासवर्ड बनाएं।',
    },
    {
      q: 'Will I receive any SMS, EMAIL on completing the application?',
      qHi: 'क्या आवेदन पूरा होने पर SMS या EMAIL प्राप्त होगा?',
      a: 'Yes, instant SMS alerts and email confirmations with your official Application Tracking Number (e.g., UK-REV-2026-9812) are sent immediately upon submission.',
      aHi: 'हाँ, आवेदन जमा होते ही आपके पंजीकृत मोबाइल और ईमेल पर आवेदन संख्या (Application Number) के साथ तुरंत एसएमएस और ईमेल प्राप्त होता है।',
    },
    {
      q: 'Is there any service charges while applying on the apuni sarkar portal?',
      qHi: 'क्या अपनी सरकार पोर्टल पर आवेदन करने पर कोई शुल्क लगता है?',
      a: 'Government prescribed statutory fees (if any) are displayed transparently before payment. There are no hidden or extra surcharges on the citizen portal.',
      aHi: 'संबंधित विभाग द्वारा निर्धारित सरकारी शुल्क ही देय होता है, जिसे भुगतान से पहले स्पष्ट रूप से दिखाया जाता है। कोई अतिरिक्त या छिपा हुआ शुल्क नहीं है।',
    },
    {
      q: 'What are the payment mode available on the apuni sarkar portal?',
      qHi: 'अपनी सरकार पोर्टल पर भुगतान के कौन से तरीके उपलब्ध हैं?',
      a: 'Unified Payments Interface (UPI - Google Pay, PhonePe, Paytm, BHIM), Net Banking across all major banks, Debit/Credit Cards, and CSC Wallets are accepted.',
      aHi: 'यूपीआई (UPI), नेट बैंकिंग, डेबिट/क्रेडिट कार्ड और सीएससी वॉलेट से सुरक्षित भुगतान किया जा सकता है।',
    },
    {
      q: 'Is there any helpdesk available for citizen?',
      qHi: 'क्या नागरिकों के लिए कोई हेल्पलाइन या हेल्पडेस्क उपलब्ध है?',
      a: 'Yes, citizens can contact the official Toll-Free State Helpline 1905 (available all working days from 9:30 AM to 6:00 PM) or write to itda-support@uk.gov.in.',
      aHi: 'हाँ, नागरिक राज्य सरकार के टोल-फ्री हेल्पलाइन नंबर 1905 पर संपर्क कर सकते हैं अथवा सहायता ईमेल पर लिख सकते हैं।',
    },
    {
      q: 'Is there any limitation on downloading the certificate?',
      qHi: 'क्या प्रमाण पत्र डाउनलोड करने की कोई समय सीमा या प्रतिबंध है?',
      a: 'No, digitally signed certificates can be downloaded anytime, 24x7, without any expiry or limitation, from the Download Certificates tab or through DigiLocker.',
      aHi: 'नहीं, डिजिटल हस्ताक्षर युक्त प्रमाण पत्र को कभी भी 24x7 बिना किसी सीमा के डाउनलोड किया जा सकता है।',
    },
    {
      q: 'How to check application status on Apuni Sarkar Portal?',
      qHi: 'अपनी सरकार पोर्टल पर आवेदन की स्थिति कैसे जांचें?',
      a: 'Navigate to "Track Application", enter your Application Reference Number received via SMS, and view the real-time status and approving officer hierarchy.',
      aHi: '"आवेदन स्थिति जांचें" पेज पर जाएं, एसएमएस में प्राप्त आवेदन संख्या दर्ज करें और वास्तविक समय स्थिति देखें।',
    },
    {
      q: 'Can we verify the certificate online?',
      qHi: 'क्या जारी किए गए प्रमाण पत्र को ऑनलाइन सत्यापित किया जा सकता है?',
      a: 'Yes! Visit the "Verify Certificate" section, input the Certificate Number and Document Security Code, or scan the cryptographic QR code printed on the certificate.',
      aHi: 'हाँ! "प्रमाण पत्र सत्यापन" पर जाएं और प्रमाण पत्र संख्या दर्ज करके अथवा क्यूआर कोड स्कैन करके डिजिटल प्रमाण पत्र सत्यापित करें।',
    },
  ];

  return (
    <div className="content-container flex flex-col bg-[#faf5ef] py-6 md:py-10">
      {/* Hero Banner */}
      <div className="relative my-4 min-h-[280px] w-full overflow-hidden rounded-[24px] bg-[#fbf5ed] border border-orange-200/60 md:my-8 shadow-xs">
        <div className="absolute inset-0 bg-[url('/assets/whats-new-hero-bg.png')] bg-cover bg-center opacity-25" />
        <div className="relative flex w-full flex-col justify-between gap-6 md:flex-row">
          <div className="m-6 md:m-10 md:max-w-xl">
            <h1 className="text-ink-900 text-3xl font-semibold md:text-[3.25rem] leading-tight">
              Frequently Asked
            </h1>
            <h2 className="text-primary text-4xl font-bold md:text-[3.5rem] leading-tight">
              Questions
            </h2>
            <p className="mt-6 text-ink-700 md:text-lg">
              {language === 'hi'
                ? 'सेवाओं, आवेदनों, प्रमाण पत्रों और अपनी सरकार पोर्टल से संबंधित सामान्य प्रश्नों के उत्तर प्राप्त करें।'
                : 'Find answers to common questions about services, applications, certificates, and the Apuni Sarkar portal.'}
            </p>
          </div>
          <div className="flex items-center justify-center p-4 md:mr-16 md:p-0">
            <img alt="FAQ illustration" className="max-h-56 w-auto object-contain md:max-h-72" src="/assets/faq.png" />
          </div>
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="mb-10 w-full md:mb-20">
        <div className="flex w-full flex-col gap-3">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            const qText = language === 'hi' ? item.qHi : item.q;
            const aText = language === 'hi' ? item.aHi : item.a;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 bg-white px-6 shadow-xs transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  onMouseEnter={() => narrateElement(qText)}
                  className="flex w-full items-center justify-between py-5 text-left text-base md:text-lg font-bold text-ink-900 cursor-pointer outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{qText}</span>
                  {isOpen ? (
                    <ChevronUp className="size-5 text-primary shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="size-5 text-gray-400 shrink-0 ml-4" />
                  )}
                </button>

                {isOpen && (
                  <div className="pb-5 text-sm md:text-base text-ink-700 leading-relaxed border-t border-gray-100 pt-3 animate-fade-in">
                    <p>{aText}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
