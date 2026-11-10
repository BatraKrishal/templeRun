import React from 'react';
import { Phone, Clock, Mail } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const ContactUsPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { language, narrateElement } = useAccessibility();

  const edmList = [
    { sNo: 1, district: 'Almora', name: 'E-District Manager Almora', email: 'edmalmora@gmail.com' },
    { sNo: 2, district: 'Bageshwar', name: 'E-District Manager Bageshwar', email: 'edmbageshwar@gmail.com' },
    { sNo: 3, district: 'Chamoli', name: 'E-District Manager Chamoli', email: 'edmchamoli2021@gmail.com' },
    { sNo: 4, district: 'Champawat', name: 'E-District Manager Champawat', email: 'edmchampawat@gmail.com' },
    { sNo: 5, district: 'Dehradun', name: 'E-District Manager Dehradun', email: 'edmdehradun@gmail.com' },
    { sNo: 6, district: 'Haridwar', name: 'E-District Manager Haridwar', email: 'edmharidwar2017@gmail.com' },
    { sNo: 7, district: 'Nainital', name: 'E-District Manager Nainital', email: 'edmnainital@gmail.com' },
    { sNo: 8, district: 'Pauri Garhwal', name: 'E-District Manager Pauri Garhwal', email: 'edmpauri@gmail.com' },
    { sNo: 9, district: 'Pithoragarh', name: 'E-District Manager Pithoragarh', email: 'edmpithoragarh@gmail.com' },
    { sNo: 10, district: 'Rudraprayag', name: 'E-District Manager Rudraprayag', email: 'edmrudraprayag@gmail.com' },
    { sNo: 11, district: 'Tehri Garhwal', name: 'E-District Manager Tehri Garhwal', email: 'edmtehri@gmail.com' },
    { sNo: 12, district: 'Udham Singh Nagar', name: 'E-District Manager Udham Singh Nagar', email: 'edmusnagar@gmail.com' },
    { sNo: 13, district: 'Uttarkashi', name: 'E-District Manager Uttarkashi', email: 'edmuttarkashi@gmail.com' },
  ];

  return (
    <div className="content-container flex flex-col bg-[#faf5ef] py-6 md:py-10">
      {/* Hero Banner */}
      <div className="relative my-4 min-h-[280px] w-full overflow-hidden rounded-[24px] bg-[#fbf5ed] border border-orange-200/60 md:my-8 shadow-xs">
        <div className="absolute inset-0 bg-[url('/assets/whats-new-hero-bg.png')] bg-cover bg-center opacity-25" />
        <div className="relative flex w-full flex-col justify-between gap-6 md:flex-row">
          <div className="m-6 md:m-10 md:max-w-lg">
            <h1 className="text-3xl font-semibold md:text-[3.25rem] leading-tight">
              <span className="text-ink-900">Grievance</span>{' '}
              <span className="text-primary font-bold">Redressal</span>
            </h1>
            <p className="mt-6 text-sm text-ink-700 md:text-lg">
              {language === 'hi'
                ? 'हम आपकी सहायता के लिए सदैव तत्पर हैं। अपनी समस्या या शिकायत दर्ज करें और तुरंत समाधान पाएं।'
                : 'We are here to listen and help. Raise your Grievance and we will help you out.'}
            </p>
          </div>
          <div className="flex items-center justify-center p-4 md:mr-16 md:p-0">
            <img alt="Grievance illustration" className="max-h-56 w-auto object-contain md:max-h-72" src="/assets/grievance.png" />
          </div>
        </div>
      </div>

      {/* Helpdesk Toll-Free Card */}
      <div className="mb-8 rounded-2xl bg-white shadow-xs border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl md:text-2xl font-bold text-ink-900">
            Apuni Sarkar : Helpdesk (Toll free)
          </h2>
        </div>
        <div className="divide-y divide-gray-100 px-6 py-2">
          <div className="flex items-start gap-4 py-4">
            <div className="mt-0.5 text-primary shrink-0">
              <Phone className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">Toll Free Helpline</p>
              <div className="text-sm text-ink-700 font-medium">Dial 1905 and Choose 4</div>
            </div>
          </div>

          <div className="flex items-start gap-4 py-4">
            <div className="mt-0.5 text-primary shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">Contact Timing</p>
              <div className="text-sm text-ink-700 font-medium">10:00 AM - 5:00 PM (Monday - Saturday)</div>
            </div>
          </div>

          <div className="flex items-start gap-4 py-4">
            <div className="mt-0.5 text-primary shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">Support Email</p>
              <div className="text-sm">
                <a href="mailto:e-helpdesk@uk.gov.in" className="font-semibold text-primary hover:underline">
                  e-helpdesk@uk.gov.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E-District Managers Table */}
      <div className="mb-10 rounded-2xl bg-white shadow-xs border border-gray-100 overflow-hidden md:mb-20">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl md:text-2xl font-bold text-ink-900">
            E-District Managers (13 Districts)
          </h2>
        </div>
        <div className="overflow-x-auto p-4 md:p-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/70">
              <tr>
                <th className="px-4 py-3 font-bold text-ink-900">S.No</th>
                <th className="px-4 py-3 font-bold text-ink-900">District</th>
                <th className="px-4 py-3 font-bold text-ink-900">Official Designation</th>
                <th className="px-4 py-3 font-bold text-ink-900">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {edmList.map((row) => (
                <tr key={row.sNo} className="hover:bg-orange-50/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink-900">{row.sNo}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{row.district}</td>
                  <td className="px-4 py-3 text-ink-700">{row.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${row.email}`}
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <Mail className="size-3.5" />
                      <span>{row.email}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
