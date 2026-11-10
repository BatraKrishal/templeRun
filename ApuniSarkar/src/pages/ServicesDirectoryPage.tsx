import React, { useState } from 'react';
import { Search, ChevronDown, FileText, CheckCircle2, X } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';
import officialServicesData from '../data/officialServices.json';

interface ServiceItem {
  id: string;
  title: string;
  department: string;
  description: string;
  icon: string;
  route?: string;
  category: string;
}

export const ServicesDirectoryPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const { startListening } = useVoice();
  const [filterType, setFilterType] = useState<'All' | 'Service' | 'Scheme'>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);

  const departments = ['All Departments', ...Array.from(new Set(officialServicesData.map((s) => s.department)))];

  const filteredServices = (officialServicesData as ServiceItem[]).filter((s) => {
    const matchesType = filterType === 'All' || s.category === filterType;
    const matchesDept = selectedDept === 'All Departments' || s.department === selectedDept;
    const matchesSearch =
      searchTerm.trim() === '' ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesDept && matchesSearch;
  });

  const handleApply = (service: ServiceItem) => {
    if (service.route) {
      onNavigate(service.route);
    } else if (service.title.toLowerCase().includes('income')) {
      onNavigate('/services/revenue/income-certificate');
    } else if (service.title.toLowerCase().includes('domicile') || service.title.toLowerCase().includes('caste') || service.title.toLowerCase().includes('residence')) {
      onNavigate('/services/revenue/domicile-certificate');
    } else if (service.title.toLowerCase().includes('hill area')) {
      onNavigate('/services/revenue/hill-area-certificate');
    } else if (service.title.toLowerCase().includes('pariwar') || service.title.toLowerCase().includes('family register')) {
      onNavigate('/services/panchayati-raj/pariwar-register');
    } else {
      onNavigate('/login');
    }
  };

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <section className="bg-background min-h-[60vh] pb-14 pt-8">
        <div className="content-container">
          {/* Header & Controls matching .refrences/allServices_extracted.html */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <h1 className="text-ink-900 flex-1 text-left text-2xl font-semibold tracking-tight md:text-3xl">
              {language === 'hi' ? 'सेवाओं की सूची (List of Services)' : 'List of Services'}
            </h1>
            
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-none">
              {/* Type Switcher */}
              <div className="bg-card flex shrink-0 rounded-lg p-1 shadow-sm ring-1 ring-black/6">
                {(['All', 'Service', 'Scheme'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterType(tab)}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      filterType === tab ? 'bg-primary text-white shadow-xs' : 'text-ink-700 hover:bg-muted'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Department Dropdown Combobox */}
              <div className="relative border-input bg-card flex items-center rounded-md border shadow-xs w-full sm:w-72 h-9.6">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full appearance-none bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none pr-8 cursor-pointer"
                  aria-label="Filter by Department"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-white text-ink-900">
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground" />
              </div>

              {/* Search Field */}
              <div className="border-input focus-within:ring-ring flex items-center overflow-hidden rounded-md border focus-within:ring-1 focus-within:outline-none bg-card w-full h-9.6 sm:w-64">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for service..."
                  aria-label="Search for service"
                  className="placeholder:text-muted-foreground flex h-full min-w-0 flex-1 appearance-none bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none"
                />
                <div className="text-muted-foreground flex shrink-0 items-center justify-center self-stretch px-2">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Showing Count */}
          <div className="space-y-6">
            <p className="text-muted-foreground text-center text-sm md:text-left">
              Showing 1–{filteredServices.length} of 1159 services
            </p>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  data-slot="card"
                  className="group/card flex flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground gap-0 py-0 shadow-sm ring-1 ring-black/6 hover:shadow-md transition-shadow"
                  onMouseEnter={() => narrateElement(`${service.title}, Department: ${service.department}. ${service.description}`)}
                >
                  {/* Card Header with Department badge & Icon */}
                  <div className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-5">
                    <div
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-black/8"
                    >
                      <img
                        alt=""
                        width={28}
                        height={28}
                        className="size-7 object-contain"
                        src={service.icon}
                        onError={(e) => {
                          // Fallback icon
                          (e.target as HTMLImageElement).src = '/icons/services/urban-development-directorate/birth-certificate-within-one-year.png';
                        }}
                      />
                    </div>
                    <span
                      data-slot="badge"
                      title={service.department}
                      className="group/badge inline-flex w-fit shrink-0 items-center gap-1 overflow-hidden rounded-4xl px-2 font-medium bg-primary text-primary-foreground border border-primary/20 shadow-sm max-w-[70%] h-auto justify-end whitespace-normal py-1 text-[0.7rem] leading-snug text-right"
                    >
                      {service.department}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="px-4 flex flex-1 flex-col gap-2 pb-3 pt-0">
                    <div className="text-ink-900 font-heading text-lg leading-snug font-semibold line-clamp-2">
                      {service.title}
                    </div>
                    <div className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                      {service.description}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-border/60 flex flex-row flex-wrap items-center justify-between gap-3 border-t bg-transparent px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceForModal(service)}
                      className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground h-auto max-w-28 w-full py-2 px-4 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(service)}
                      className="group/button inline-flex shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-white hover:bg-primary/90 h-auto max-w-28 w-full py-2 px-4 text-sm font-medium transition-colors shadow-xs"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedServiceForModal(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-black/10">
                <img
                  src={selectedServiceForModal.icon}
                  alt=""
                  className="size-8 object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {selectedServiceForModal.department}
                </span>
                <h3 className="text-xl font-bold text-ink-900 leading-snug">
                  {selectedServiceForModal.title}
                </h3>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-3 space-y-2 text-sm text-gray-700">
              <p><strong>Description:</strong> {selectedServiceForModal.description}</p>
              <p><strong>Applicable Delivery Time:</strong> Within 15 to 30 Working Days (Uttarakhand Right to Service Act, 2011)</p>
              <p><strong>Official Fee:</strong> CSC/EDC Fee ₹40 (Government portal delivery: ₹0)</p>
              <p><strong>Required Documents:</strong> Aadhaar Card, Passport Photo, Proof of Residence / Land Record, Self Declaration.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedServiceForModal(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = selectedServiceForModal;
                  setSelectedServiceForModal(null);
                  handleApply(s);
                }}
                className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
