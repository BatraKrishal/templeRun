import React, { useState } from 'react';
import { Download, FileText, ChevronDown, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface DistrictStat {
  name: string;
  nameHi: string;
  applications: string;
  approved: string;
  rejectionRate: string;
  share: number; // percentage
}

const UTTARAKHAND_DISTRICTS: DistrictStat[] = [
  { name: 'Dehradun', nameHi: 'देहरादून', applications: '28,45,210', approved: '24,75,332', rejectionRate: '12%', share: 88 },
  { name: 'Haridwar', nameHi: 'हरिद्वार', applications: '26,12,050', approved: '22,46,363', rejectionRate: '14%', share: 82 },
  { name: 'Udham Singh Nagar', nameHi: 'उधम सिंह नगर', applications: '22,90,400', approved: '19,69,744', rejectionRate: '14%', share: 74 },
  { name: 'Nainital', nameHi: 'नैनीताल', applications: '15,64,320', approved: '13,45,315', rejectionRate: '13%', share: 55 },
  { name: 'Pauri Garhwal', nameHi: 'पौड़ी गढ़वाल', applications: '11,20,150', approved: '9,74,530', rejectionRate: '13%', share: 42 },
  { name: 'Tehri Garhwal', nameHi: 'टिहरी गढ़वाल', applications: '9,85,600', approved: '8,57,472', rejectionRate: '12%', share: 38 },
  { name: 'Almora', nameHi: 'अल्मोड़ा', applications: '8,75,400', approved: '7,61,598', rejectionRate: '13%', share: 34 },
  { name: 'Pithoragarh', nameHi: 'पिथौरागढ़', applications: '6,45,800', approved: '5,61,846', rejectionRate: '13%', share: 26 },
  { name: 'Chamoli', nameHi: 'चमोली', applications: '5,20,100', approved: '4,57,688', rejectionRate: '12%', share: 22 },
  { name: 'Uttarkashi', nameHi: 'उत्तरकाशी', applications: '4,10,300', approved: '3,61,064', rejectionRate: '12%', share: 18 },
  { name: 'Rudraprayag', nameHi: 'रुद्रप्रयाग', applications: '2,45,600', approved: '2,16,128', rejectionRate: '12%', share: 14 },
  { name: 'Champawat', nameHi: 'चंपावत', applications: '1,98,400', approved: '1,74,592', rejectionRate: '12%', share: 11 },
  { name: 'Bageshwar', nameHi: 'बागेश्वर', applications: '1,82,656', approved: '1,60,737', rejectionRate: '12%', share: 10 }
];

export const DashboardPage: React.FC = () => {
  const { language, narrateElement } = useAccessibility();
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [activeDistrict, setActiveDistrict] = useState<DistrictStat>(UTTARAKHAND_DISTRICTS[0]);

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'District,Applications,Approved,RejectionRate\n' +
      UTTARAKHAND_DISTRICTS.map((d) => `${d.name},${d.applications.replace(/,/g, '')},${d.approved.replace(/,/g, '')},${d.rejectionRate}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ApuniSarkar_Public_Dashboard_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <div className="content-container flex flex-col gap-6 py-6">
        {/* Top Hero Section matching official .refrences/dashboard_extracted.html */}
        <section className="relative isolate overflow-hidden rounded-3xl min-h-80 md:min-h-96">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center"
            src="/dasboard-bg.jpg"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

          <div className="relative flex min-h-80 flex-col justify-between gap-8 p-6 md:min-h-96 md:p-8 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white uppercase drop-shadow-md md:text-3xl">
                  {language === 'hi' ? 'सार्वजनिक डैशबोर्ड (Public Dashboard)' : 'Public Dashboard'}
                </h1>
                <p className="mt-1 text-sm font-medium tracking-[0.2em] text-white/90 uppercase drop-shadow-md md:text-base">
                  Apuni Sarkar
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                className="group/button inline-flex items-center justify-center gap-1.5 h-10 shrink-0 self-start rounded-lg border-0 bg-white px-4 text-ink-900 shadow-sm hover:bg-white/95 text-sm font-semibold transition-all cursor-pointer"
              >
                <Download className="size-4 shrink-0 text-current" />
                <span>Export Data</span>
              </button>
            </div>

            {/* 4 Top Metric Cards */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
              <div
                className="flex min-h-32 flex-col rounded-2xl bg-white/95 backdrop-blur-md p-4 md:min-h-32 md:p-5 shadow-sm"
                onMouseEnter={() => narrateElement('Total Applications Received: 1.44 crore applications')}
              >
                <FileText className="size-5 text-primary" />
                <p className="mt-3 text-sm leading-snug text-gray-700">Total Application Received</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900 tabular-nums md:text-[2rem]">
                  1.44cr
                </p>
                <p className="mt-auto pt-2 text-xs text-gray-500">Applications</p>
              </div>

              <div
                className="flex min-h-32 flex-col rounded-2xl bg-white/95 backdrop-blur-md p-4 md:min-h-32 md:p-5 shadow-sm"
                onMouseEnter={() => narrateElement('Total Applications Processed: 1.43 crore applications')}
              >
                <FileText className="size-5 text-primary" />
                <p className="mt-3 text-sm leading-snug text-gray-700">Total Application Processed</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900 tabular-nums md:text-[2rem]">
                  1.43cr
                </p>
                <p className="mt-auto pt-2 text-xs text-gray-500">Applications</p>
              </div>

              <div
                className="flex min-h-32 flex-col rounded-2xl bg-white/95 backdrop-blur-md p-4 md:min-h-32 md:p-5 shadow-sm"
                onMouseEnter={() => narrateElement('Total Applications Approved: 1.23 crore applications')}
              >
                <FileText className="size-5 text-emerald-600" />
                <p className="mt-3 text-sm leading-snug text-gray-700">Total Application Approved</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900 tabular-nums md:text-[2rem]">
                  1.23cr
                </p>
                <p className="mt-auto pt-2 text-xs text-gray-500">Applications</p>
              </div>

              <div
                className="flex min-h-32 flex-col rounded-2xl bg-white/95 backdrop-blur-md p-4 md:min-h-32 md:p-5 shadow-sm"
                onMouseEnter={() => narrateElement('Average Approval Time: 8 days under Right to Service Act')}
              >
                <Clock className="size-5 text-primary" />
                <p className="mt-3 text-sm leading-snug text-gray-700">Average Approval Time</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900 tabular-nums md:text-[2rem]">
                  08
                </p>
                <p className="mt-auto pt-2 text-xs text-gray-500">Days (Right to Service)</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Section: Heatmap (Left) + Top 5 Departments (Right) */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] xl:grid-cols-[minmax(0,1fr)_28rem] lg:items-stretch">
          {/* Left: Uttarakhand Services Heatmap */}
          <div
            data-slot="card"
            className="group/card gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 flex h-full min-h-0 flex-col shadow-sm lg:min-h-110"
          >
            <div className="grid auto-rows-min items-start rounded-t-xl px-4 gap-3 pb-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="font-heading text-xl font-semibold text-balance md:text-2xl text-ink-900">
                    Uttarakhand Services Heatmap
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Distribution of Applications received across Districts
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">Share of applications received</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-3 shrink-0 rounded-sm bg-orange-100 ring-1 ring-ink-900/10"></span>0-20%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-3 shrink-0 rounded-sm bg-orange-200 ring-1 ring-ink-900/10"></span>21-40%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-3 shrink-0 rounded-sm bg-orange-400 ring-1 ring-ink-900/10"></span>41-60%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-3 shrink-0 rounded-sm bg-orange-600 ring-1 ring-ink-900/10"></span>61-80%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-3 shrink-0 rounded-sm bg-primary ring-1 ring-ink-900/10"></span>81-100%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 flex min-h-0 flex-1 flex-col pt-4">
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
                {/* Stats & Department Selector */}
                <div className="flex h-full min-h-0 flex-col gap-3">
                  <div className="relative flex w-full items-center">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="h-11 w-full rounded-lg border border-primary/40 bg-card px-3 text-sm text-foreground focus:outline-none appearance-none cursor-pointer pr-8"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="Revenue Department">Revenue Department</option>
                      <option value="Panchayati Raj Department">Panchayati Raj Department</option>
                      <option value="Directorate of Training & Employment">Directorate of Training & Employment</option>
                      <option value="Social Welfare Department">Social Welfare Department</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted-foreground" />
                  </div>

                  <div className="shrink-0">
                    <p className="text-sm text-muted-foreground">Total applications received</p>
                    <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground tabular-nums xl:text-3xl text-primary">
                      1,43,15,086
                    </p>
                  </div>

                  {/* Status Progress Bars matching official dashboard */}
                  <div className="flex flex-col gap-2.5 rounded-lg border border-border/50 bg-muted/25 px-3 py-2.5 mt-auto shrink-0">
                    <div className="grid grid-cols-[4.25rem_1fr_2.25rem] items-center gap-2">
                      <span className="text-xs font-medium text-foreground">Approved</span>
                      <div className="h-3.5 overflow-hidden rounded-full bg-emerald-500/20">
                        <div className="h-full rounded-full transition-[width] duration-500 bg-emerald-500" style={{ width: '86%' }}></div>
                      </div>
                      <span className="justify-self-end text-xs font-semibold tabular-nums text-foreground">86%</span>
                    </div>

                    <div className="grid grid-cols-[4.25rem_1fr_2.25rem] items-center gap-2">
                      <span className="text-xs font-medium text-foreground">Pending</span>
                      <div className="h-3.5 overflow-hidden rounded-full bg-amber-400/25">
                        <div className="h-full rounded-full transition-[width] duration-500 bg-amber-400" style={{ width: '0%' }}></div>
                      </div>
                      <span className="justify-self-end text-xs font-semibold tabular-nums text-foreground">00%</span>
                    </div>

                    <div className="grid grid-cols-[4.25rem_1fr_2.25rem] items-center gap-2">
                      <span className="text-xs font-medium text-foreground">Rejected</span>
                      <div className="h-3.5 overflow-hidden rounded-full bg-red-500/20">
                        <div className="h-full rounded-full transition-[width] duration-500 bg-red-500" style={{ width: '14%' }}></div>
                      </div>
                      <span className="justify-self-end text-xs font-semibold tabular-nums text-foreground">14%</span>
                    </div>
                  </div>
                </div>

                {/* District List & Interactive breakdown */}
                <div className="flex flex-col h-full overflow-hidden border border-border/50 rounded-xl bg-white p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 mb-2">
                    <span className="text-xs font-semibold uppercase text-ink-700">13 Districts of Uttarakhand</span>
                    <span className="text-xs text-primary font-bold">{activeDistrict.name} ({activeDistrict.nameHi})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 overflow-y-auto max-h-56 pr-1">
                    {UTTARAKHAND_DISTRICTS.map((dist) => (
                      <button
                        key={dist.name}
                        type="button"
                        onClick={() => setActiveDistrict(dist)}
                        className={`text-left p-2 rounded-lg border text-xs transition-all ${
                          activeDistrict.name === dist.name
                            ? 'border-primary bg-orange-50 font-semibold text-primary'
                            : 'border-border/60 hover:bg-muted/40 text-ink-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{dist.name}</span>
                          <span className="text-[10px] text-muted-foreground">{dist.share}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>App: {dist.applications}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Active District Detail summary card */}
                  <div className="mt-3 pt-2 border-t border-border/40 bg-orange-50/50 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ink-900">{activeDistrict.name} ({activeDistrict.nameHi})</p>
                      <p className="text-muted-foreground text-[11px]">Approved: {activeDistrict.approved}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{activeDistrict.applications}</p>
                      <p className="text-[10px] text-muted-foreground">Rejection: {activeDistrict.rejectionRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Top 5 Departments */}
          <div
            data-slot="card"
            className="group/card gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 flex h-full min-h-0 flex-col shadow-sm"
          >
            <div className="px-4 border-b border-border/60 pb-4 flex items-center justify-between">
              <div>
                <div className="font-heading text-xl font-semibold text-ink-900">Top 5 Departments</div>
                <div className="text-sm text-muted-foreground mt-1">By Applications Received</div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-muted"
              >
                View all
              </button>
            </div>

            <div className="px-4 flex min-h-0 flex-1 flex-col justify-start overflow-y-auto pt-5">
              <ul className="space-y-7 pr-1">
                {/* 1. Revenue Department */}
                <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                    1
                  </span>
                  <div className="min-w-0 space-y-2.5">
                    <p className="text-sm leading-snug font-medium text-foreground line-clamp-2">
                      Revenue Department
                    </p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/15">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-foreground">
                    86.70L
                  </span>
                </li>

                {/* 2. Panchayati Raj Department */}
                <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                    2
                  </span>
                  <div className="min-w-0 space-y-2.5">
                    <p className="text-sm leading-snug font-medium text-foreground line-clamp-2">
                      Panchayati Raj Department
                    </p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/15">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-foreground">
                    43.30L
                  </span>
                </li>

                {/* 3. Directorate of Training & Employment */}
                <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                    3
                  </span>
                  <div className="min-w-0 space-y-2.5">
                    <p className="text-sm leading-snug font-medium text-foreground line-clamp-2">
                      Directorate of Training & Employment
                    </p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/15">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-foreground">
                    8.72L
                  </span>
                </li>

                {/* 4. Social Welfare Department */}
                <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                    4
                  </span>
                  <div className="min-w-0 space-y-2.5">
                    <p className="text-sm leading-snug font-medium text-foreground line-clamp-2">
                      Social Welfare Department
                    </p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/15">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-foreground">
                    41,398
                  </span>
                </li>

                {/* 5. Soldier Welfare Department */}
                <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                    5
                  </span>
                  <div className="min-w-0 space-y-2.5">
                    <p className="text-sm leading-snug font-medium text-foreground line-clamp-2">
                      Soldier Welfare Department
                    </p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-primary/15">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-foreground">
                    26,830
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
