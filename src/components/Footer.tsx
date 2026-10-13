import React from 'react';
import { Phone, Mail, User, GraduationCap } from 'lucide-react';
import { SectionId } from '../types';

interface FooterProps {
  onNavigate?: (section: SectionId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (section: SectionId) => {
    if (onNavigate) {
      onNavigate(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Column 2: EXPLORE EDUPREDICT links connected to existing routes
  const exploreLinks: { label: string; section: SectionId }[] = [
    { label: 'Student Performance Prediction', section: 'predict' },
    { label: 'AI Exam Planner', section: 'planner' },
    { label: 'Subject Analysis', section: 'subjects' },
    { label: 'Learning Roadmap', section: 'roadmap' },
    { label: 'Academic Progress', section: 'progress' },
  ];

  // Column 3: FEATURES links connected to existing features
  const featureLinks: { label: string; section: SectionId }[] = [
    { label: 'Performance & Risk Assessment', section: 'predict' },
    { label: 'AI Academic Counselor', section: 'counselor' },
    { label: 'What-If Academic Simulator', section: 'whatif' },
    { label: 'Study Planner', section: 'planner' },
    { label: 'Examination Readiness', section: 'readiness' },
  ];

  return (
    <footer className="w-full bg-[#10182D] text-[#94A3B8] border-t border-[#263247] transition-colors">
      <div className="site-container pt-14 pb-10 sm:pt-16 sm:pb-12">
        {/* 4-column responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: EduPredict AI Brand & Description */}
          <div className="flex flex-col text-left">
            <div
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#633BFF] to-[#8000E8] text-white flex items-center justify-center font-extrabold shadow-lg shadow-[#8000E8]/30 ring-2 ring-white/10 shrink-0 group-hover:shadow-[#8000E8]/50 transition-shadow">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col justify-center text-left leading-tight">
                <span className="text-xl font-bold tracking-tight text-[#F8FAFC] select-none">
                  EduPredict <span className="text-[#8B5CF6]">AI</span>
                </span>
                <span className="text-[11px] font-medium text-[#94A3B8]">
                  Academic Intelligence Platform
                </span>
              </div>
            </div>

            <p className="text-sm text-[#94A3B8] leading-relaxed mt-4 max-w-sm">
              EduPredict AI helps students understand academic performance, identify learning gaps, and build personalized study plans.
            </p>
          </div>

          {/* Column 2: EXPLORE EDUPREDICT */}
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-bold tracking-wider text-[#F8FAFC] uppercase mb-4 sm:mb-5">
              EXPLORE EDUPREDICT
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.section)}
                    className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-150 text-left cursor-pointer flex items-center group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-150">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: FEATURES */}
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-bold tracking-wider text-[#F8FAFC] uppercase mb-4 sm:mb-5">
              FEATURES
            </h3>
            <ul className="space-y-3">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.section)}
                    className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-150 text-left cursor-pointer flex items-center group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-150">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CREATED BY & CONTACT */}
          <div className="flex flex-col text-left">
            {/* Created By Section */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-[#F8FAFC] uppercase mb-3">
                CREATED BY
              </h3>
              <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm mb-1">
                <User className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                <span>Sudarsi Shashi Kumar</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Academic Intelligence &amp; Student Performance Prediction
              </p>
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-[#263247] my-4" />

            {/* Contact & Support Section */}
            <div>
              <h4 className="text-[11px] font-bold tracking-wider text-[#F8FAFC] uppercase mb-2.5">
                CONTACT &amp; SUPPORT
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="tel:6303268680"
                    className="flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors group py-0.5"
                    title="Call 6303268680"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#16213D] border border-[#263247] flex items-center justify-center shrink-0 group-hover:border-[#8B5CF6]/50 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </div>
                    <span className="group-hover:text-[#F8FAFC]">6303268680</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:shashisudarsi@gmail.com"
                    className="flex items-center gap-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors group py-0.5"
                    title="Email shashisudarsi@gmail.com"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#16213D] border border-[#263247] flex items-center justify-center shrink-0 group-hover:border-[#8B5CF6]/50 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </div>
                    <span className="group-hover:text-[#F8FAFC] break-all sm:break-normal">
                      shashisudarsi@gmail.com
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar with Divider */}
        <div className="border-t border-[#263247] pt-8 mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8] text-center sm:text-left">
          <p>© 2026 EduPredict AI. All rights reserved.</p>
          <p className="text-[#94A3B8]">
            Empowering Students Through Academic Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
};
