import React from 'react';
import { Phone, Mail, Sparkles } from 'lucide-react';
import { SectionId } from '../types';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';

interface FooterProps {
  onNavigate?: (section: SectionId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (section: SectionId) => {
    if (onNavigate) {
      onNavigate(section);
    }
    // Smooth scroll to top on both window and dashboard container
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const dashboardMain = document.getElementById('dashboard-main-content');
    if (dashboardMain) {
      dashboardMain.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Column 2: EXPLORE EDUPREDICT AI — verified existing sections
  const exploreLinks: { label: string; section: SectionId }[] = [
    { label: 'Student Dashboard', section: 'dashboard' },
    { label: 'Academic Analysis', section: 'analysis' },
    { label: 'Exam Scheduler', section: 'scheduler' },
    { label: 'Learn & Practice Studio', section: 'learn' },
    { label: 'Recommended Courses', section: 'courses' },
    { label: 'AI Academic Counselor', section: 'counselor' },
  ];

  // Column 3: ABOUT EDUPREDICT AI — verified existing sections & platform features
  const aboutLinks: { label: string; section: SectionId }[] = [
    { label: 'About the Platform', section: 'about' },
    { label: 'Performance Predictor', section: 'predict' },
    { label: 'What-If Scenario Simulator', section: 'whatif' },
    { label: 'Exam Readiness Assessment', section: 'readiness' },
    { label: 'Model Metrics & Analytics', section: 'analytics' },
  ];

  return (
    <footer className="w-full bg-[#0B132B] text-slate-300 border-t border-slate-800/80 transition-colors">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-10 pt-8 pb-4 sm:pt-9 sm:pb-5">
        {/* 4-column balanced grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8 items-start">
          
          {/* Column 1: EduPredict AI Branding & Description */}
          <div className="flex flex-col text-left space-y-3">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 cursor-pointer group select-none text-left w-fit"
            >
              <EduPredictLogoAnimation variant="compact" showWordmark={false} />
              <span className="text-[17px] font-bold tracking-tight text-white select-none">
                EduPredict<span className="text-[#818CF8]">AI</span>
              </span>
            </button>

            <p className="text-[12.5px] text-slate-400 leading-relaxed max-w-xs">
              EduPredict AI helps students understand academic performance, identify skill gaps, plan their studies, discover learning resources, and explore career opportunities.
            </p>
          </div>

          {/* Column 2: EXPLORE EDUPREDICT AI */}
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase mb-3">
              EXPLORE EDUPREDICT AI
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.section)}
                    className="text-[12.5px] text-slate-300 hover:text-[#818CF8] transition-colors duration-150 text-left cursor-pointer block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ABOUT EDUPREDICT AI */}
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase mb-3">
              ABOUT EDUPREDICT AI
            </h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.section)}
                    className="text-[12.5px] text-slate-300 hover:text-[#818CF8] transition-colors duration-150 text-left cursor-pointer block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CONTACT & SUPPORT */}
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase mb-3">
              CONTACT &amp; SUPPORT
            </h3>
            <div className="space-y-2.5">
              <a
                href="tel:6303268680"
                className="flex items-center gap-2.5 text-[12.5px] text-slate-300 hover:text-white transition-colors group"
                title="Call 6303268680"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-[#818CF8]/60 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#818CF8] transition-colors" />
                </div>
                <span>6303268680</span>
              </a>

              <a
                href="mailto:sudarsishashikumar521@gmail.com"
                className="flex items-center gap-2.5 text-[12.5px] text-slate-300 hover:text-white transition-colors group"
                title="Email sudarsishashikumar521@gmail.com"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-[#818CF8]/60 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#818CF8] transition-colors" />
                </div>
                <span className="truncate">sudarsishashikumar521@gmail.com</span>
              </a>

              <button
                onClick={() => handleNav('counselor')}
                className="flex items-center gap-2.5 text-[12.5px] text-slate-300 hover:text-white transition-colors group cursor-pointer text-left"
                title="Open In-App Academic Support"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-[#818CF8]/60 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
                </div>
                <span>In-App Academic Support</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar with Subtle Divider */}
        <div className="border-t border-slate-800/80 pt-4 mt-7 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11.5px] text-slate-400">
          <p>© 2026 EduPredict AI. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-400 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => handleNav('about')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Platform Ethics &amp; Privacy
            </button>
            <span>•</span>
            <button
              onClick={() => handleNav('about')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>•</span>
            <span className="text-slate-400">AI Academic Engine v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
