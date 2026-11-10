import React, { useState, useEffect } from 'react';
import { useAccessibility } from './context/AccessibilityContext';
import { useVoice } from './context/VoiceContext';
import { AccessibilityBar } from './components/layout/AccessibilityBar';
import { OfficialHeader } from './components/layout/OfficialHeader';
import { OfficialFooter } from './components/layout/OfficialFooter';
import { VoiceCopilotDock } from './components/voice/VoiceCopilotDock';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesDirectoryPage } from './pages/ServicesDirectoryPage';
import { IncomeCertificatePage } from './pages/forms/IncomeCertificatePage';
import { DomicileCertificatePage } from './pages/forms/DomicileCertificatePage';
import { HillAreaCertificatePage } from './pages/forms/HillAreaCertificatePage';
import { ParivarRegisterPage } from './pages/forms/ParivarRegisterPage';
import { TrackApplicationPage } from './pages/TrackApplicationPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { AdminPoolDashboardPage } from './pages/AdminPoolDashboardPage';
import { SitemapPage } from './pages/SitemapPage';
import { AboutPage } from './pages/AboutPage';
import { FAQsPage } from './pages/FAQsPage';
import { WhatsNewPage } from './pages/WhatsNewPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ImportantGosPage } from './pages/ImportantGosPage';
import { DownloadCertificatesPage } from './pages/DownloadCertificatesPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [telemetry, setTelemetry] = useState<any>(null);
  const { setNavigationHandler } = useVoice();

  // Handle URL changes & register navigation handler for voice intent engine
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    setCurrentRoute(window.location.pathname || '/');

    setNavigationHandler((newRoute: string) => {
      if (newRoute === '__BACK__') {
        window.history.back();
        return;
      }
      window.history.pushState({}, '', newRoute);
      setCurrentRoute(newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Fetch key pool telemetry for header telemetry badge
    fetch('/api/keys/status')
      .then((r) => r.json())
      .then((d) => setTelemetry(d))
      .catch((err) => console.warn('Telemetry fetch error:', err));

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    if (route === '__BACK__') {
      window.history.back();
      return;
    }
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    const baseRoute = currentRoute.split('?')[0];
    switch (baseRoute) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/all-services':
        return <ServicesDirectoryPage onNavigate={navigate} />;
      case '/services/revenue/income-certificate':
        return <IncomeCertificatePage onNavigate={navigate} />;
      case '/services/revenue/domicile-certificate':
        return <DomicileCertificatePage onNavigate={navigate} />;
      case '/services/revenue/hill-area-certificate':
        return <HillAreaCertificatePage onNavigate={navigate} />;
      case '/services/panchayati-raj/pariwar-register':
        return <ParivarRegisterPage onNavigate={navigate} />;
      case '/track':
      case '/user/public/application/status/':
        return <TrackApplicationPage onNavigate={navigate} />;
      case '/verify':
      case '/officer/public/application/verify/certificate/':
        return <VerifyCertificatePage onNavigate={navigate} />;
      case '/download-certificates':
      case '/user/public/application/download-certificates/':
        return <DownloadCertificatesPage onNavigate={navigate} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/important-gos':
        return <ImportantGosPage />;
      case '/admin/pool':
        return <AdminPoolDashboardPage />;
      case '/sitemap':
        return <SitemapPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/faqs':
        return <FAQsPage onNavigate={navigate} />;
      case '/whats-new':
        return <WhatsNewPage onNavigate={navigate} />;
      case '/contact-us':
        return <ContactUsPage onNavigate={navigate} />;
      case '/dashboard':
        return <DashboardPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-ink-900">
      {/* 1. Official Top Accessibility Bar */}
      <AccessibilityBar onNavigate={navigate} />

      {/* 2. Official Government Sticky Header */}
      <OfficialHeader currentRoute={currentRoute} onNavigate={navigate} telemetry={telemetry} />

      {/* 3. Main Content Router View */}
      <main id="main-content" className="flex-1 flex flex-col">
        {renderActivePage()}
      </main>

      {/* 4. Official Government Footer */}
      <OfficialFooter onNavigate={navigate} />

      {/* 5. Floating VaaniSetu Voice Copilot Dock */}
      <VoiceCopilotDock onNavigate={navigate} />
    </div>
  );
};

