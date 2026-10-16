import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { SandboxScanner } from '../components/landing/SandboxScanner';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { ArchitectureSection } from '../components/landing/ArchitectureSection';
import { IntegrationsSection } from '../components/landing/IntegrationsSection';
import { BenchmarksSection } from '../components/landing/BenchmarksSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-600 selection:text-white">
      {/* 1. Sticky Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero (centered) with radial glow & isometric codebase city graphic */}
        <LandingHero />

        {/* 3. Live Sandbox Scanner (id="scanner") */}
        <SandboxScanner />

        {/* 4. Capabilities (id="capabilities") */}
        <CapabilitiesSection />

        {/* 5. Architecture (id="architecture") */}
        <ArchitectureSection />

        {/* 6. Integrations (id="integrations") */}
        <IntegrationsSection />

        {/* 7. Benchmarks (id="benchmarks") */}
        <BenchmarksSection />
      </main>

      {/* 8. Call to Action Banner & Footer */}
      <LandingFooter />
    </div>
  );
};
