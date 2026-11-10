import React, { useState } from 'react';
import { FileText, Search, ExternalLink } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import officialGosData from '../data/officialGos.json';

interface GoItem {
  sNo: string;
  goNumber: string;
  goDate: string;
  department: string;
  subject: string;
  pdfUrl: string;
}

export const ImportantGosPage: React.FC = () => {
  const { language, narrateElement } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGos = (officialGosData as GoItem[]).filter((go) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      go.subject.toLowerCase().includes(q) ||
      go.department.toLowerCase().includes(q) ||
      go.goNumber.toLowerCase().includes(q)
    );
  });

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <div className="content-container flex flex-col bg-background">
        {/* Hero Banner matching official site */}
        <div className="relative my-4 min-h-[280px] w-full overflow-hidden rounded-[24px] md:my-8 bg-[#fbf5ed] border border-orange-200/60">
          <div className="absolute inset-0 bg-[url('/assets/whats-new-hero-bg.png')] bg-cover bg-center opacity-30"></div>
          <div className="relative flex w-full flex-col justify-between gap-6 md:flex-row">
            <div className="m-6 md:m-10 md:max-w-lg">
              <h1 className="text-3xl font-semibold md:text-[3.25rem]">
                <span className="text-ink-900">Important</span>{' '}
                <span className="text-secondary-foreground font-serif italic text-primary">Government Orders</span>
              </h1>
              <p className="mt-6 text-sm text-ink-700 md:text-lg">
                {language === 'hi'
                  ? 'विभिन्न विभागों द्वारा जारी आधिकारिक शासनादेश, अधिसूचनाएं, परिपत्र एवं महत्वपूर्ण आदेश।'
                  : 'Access official government orders, notifications, circulars, and important updates issued by various departments.'}
              </p>
            </div>
            <div className="flex items-center justify-center p-4 md:mr-16 md:p-0">
              <img
                alt=""
                className="max-h-56 w-auto object-contain md:max-h-72"
                src="/assets/government-orders.png"
              />
            </div>
          </div>
        </div>

        {/* Section Table matching official .refrences/importantGos_extracted.html */}
        <section className="mb-10 w-full rounded-2xl bg-white p-4 shadow-md md:mb-20 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-ink-900 text-xl font-semibold md:text-2xl">
              {language === 'hi' ? 'महत्वपूर्ण शासनादेश (Important GOs)' : 'Important GOs'}
            </h2>
            <div className="focus-within:ring-ring flex items-center overflow-hidden border focus-within:ring-1 focus-within:outline-none h-10 w-full max-w-md rounded-lg border-border bg-white px-3">
              <input
                className="placeholder:text-muted-foreground flex h-full min-w-0 flex-1 appearance-none bg-transparent py-1 text-sm shadow-sm focus:outline-none"
                placeholder="Search GOs"
                aria-label="Search GOs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="size-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table data-slot="table" className="w-full caption-bottom text-sm border-collapse">
              <thead data-slot="table-header">
                <tr className="border-none">
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900 first:rounded-tl-lg">
                    S.No
                  </th>
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900">
                    GO Number
                  </th>
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900">
                    GO Date
                  </th>
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900">
                    Department Name
                  </th>
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900">
                    Subject
                  </th>
                  <th className="h-10 text-left align-middle whitespace-nowrap bg-[#fde6d2] px-3 py-3 font-semibold text-ink-900 last:rounded-tr-lg">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody data-slot="table-body">
                {filteredGos.map((go) => (
                  <tr
                    key={go.sNo}
                    data-slot="table-row"
                    className="border-b transition-colors border-border/60 hover:bg-orange-50/40"
                    onMouseEnter={() => narrateElement(`GO number ${go.goNumber}, Department ${go.department}, Subject: ${go.subject}`)}
                  >
                    <td className="p-2 align-middle whitespace-nowrap px-3 py-3 text-ink-900 font-medium">
                      {go.sNo}
                    </td>
                    <td className="p-2 align-middle max-w-48 px-3 py-3 whitespace-normal text-ink-700 font-mono text-xs">
                      {go.goNumber}
                    </td>
                    <td className="p-2 align-middle whitespace-nowrap px-3 py-3 text-ink-700">
                      {go.goDate}
                    </td>
                    <td className="p-2 align-middle max-w-40 px-3 py-3 whitespace-normal text-ink-700 font-medium">
                      {go.department}
                    </td>
                    <td className="p-2 align-middle max-w-xs px-3 py-3 whitespace-normal text-ink-900 font-medium">
                      {go.subject}
                    </td>
                    <td className="p-2 align-middle whitespace-nowrap px-3 py-3">
                      <a
                        href={go.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        <FileText className="size-4 shrink-0 text-primary" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

