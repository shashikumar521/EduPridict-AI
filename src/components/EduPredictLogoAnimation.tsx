import React from 'react';
import { motion, useReducedMotion, TargetAndTransition } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export interface EduPredictLogoAnimationProps {
  variant?: 'hero' | 'splash' | 'compact' | 'sidebar' | 'header' | 'login';
  showWordmark?: boolean;
  className?: string;
  isCollapsed?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const EduPredictLogoAnimation: React.FC<EduPredictLogoAnimationProps> = ({
  variant = 'compact',
  showWordmark = true,
  className = '',
  isCollapsed = false,
  size,
  onClick
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const shouldReduceMotion = useReducedMotion();

  // Floating oscillation: 4-6s cycle, 4-7px vertical travel
  const floatAnimation: TargetAndTransition = shouldReduceMotion
    ? { y: 0 }
    : {
        y: [0, -6, 0],
        transition: {
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Header micro-float: 3-4px travel for tight navbar spaces
  const headerFloatAnimation: TargetAndTransition = shouldReduceMotion
    ? { y: 0 }
    : {
        y: [0, -3, 0],
        transition: {
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Ambient breathing aura (turquoise & indigo glow)
  const auraAnimation: TargetAndTransition = shouldReduceMotion
    ? { opacity: 0.3, scale: 1 }
    : {
        opacity: [0.35, 0.65, 0.35],
        scale: [0.98, 1.06, 0.98],
        transition: {
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Border highlight sweep: sweeps across circuit edge once per floating cycle (~5.5s)
  const sweepAnimation: TargetAndTransition = shouldReduceMotion
    ? { opacity: 0 }
    : {
        x: ['-130%', '240%'],
        opacity: [0, 0.65, 0],
        transition: {
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 3.8,
          ease: 'easeInOut'
        }
      };

  // =========================================================================
  // 1. HERO VARIANT (Public Homepage Hero Section)
  // Expressive entrance, soft floating cycle, turquoise glow aura, and bold typography
  // =========================================================================
  if (variant === 'hero') {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        {/* Animated Icon Frame with Ambient Aura & Perimeter Glow */}
        <motion.div
          animate={floatAnimation}
          className="relative group shrink-0"
        >
          {/* Subtle Ambient Turquoise & Violet Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={auraAnimation}
            className={`absolute -inset-2 rounded-2xl blur-lg pointer-events-none transition-colors ${
              isLight
                ? 'bg-gradient-to-tr from-[#0D9488]/25 via-[#4F46E5]/20 to-[#06B6D4]/30'
                : 'bg-gradient-to-tr from-[#14B8A6]/35 via-[#6366F1]/25 to-[#06B6D4]/35'
            }`}
          />

          {/* Logo Container with Rounded Circuit Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden p-1 border shadow-md flex items-center justify-center transition-all ${
              isLight
                ? 'bg-white border-[#5EEAD4]/70 shadow-[0_6px_20px_rgba(13,148,136,0.14)]'
                : 'bg-[#111A2E] border-[#2DD4BF]/50 shadow-[0_6px_24px_rgba(45,212,191,0.22)]'
            }`}
          >
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI Logo"
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />

            {/* Delicate highlight sweep across the emblem */}
            <motion.div
              animate={sweepAnimation}
              className={`absolute inset-y-0 w-1/2 skew-x-12 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/45 to-transparent'
              }`}
            />
          </motion.div>
        </motion.div>

        {/* Wordmark with Entrance Stagger */}
        {showWordmark && (
          <div className="min-w-0 text-left">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5"
            >
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0F172A] dark:text-white">
                EduPredict AI
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] dark:border-[#8B5CF6]/40">
                AI
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="text-[11px] font-semibold tracking-wider text-[#0D9488] dark:text-[#2DD4BF] uppercase"
            >
              Predictive Learning Platform
            </motion.p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. SPLASH VARIANT (App Initialization & Loading)
  // =========================================================================
  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <motion.div
          animate={floatAnimation}
          className="relative group shrink-0"
        >
          {/* Pulsing Turquoise Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={auraAnimation}
            className={`absolute -inset-4 rounded-3xl blur-xl pointer-events-none ${
              isLight
                ? 'bg-gradient-to-tr from-[#0D9488]/30 via-[#4F46E5]/20 to-[#06B6D4]/35'
                : 'bg-gradient-to-tr from-[#14B8A6]/40 via-[#6366F1]/30 to-[#06B6D4]/40'
            }`}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-2xl p-2 border-2 flex items-center justify-center ${
              isLight
                ? 'bg-white border-[#5EEAD4]/80 shadow-[0_10px_35px_rgba(13,148,136,0.2)]'
                : 'bg-[#111A2E] border-[#2DD4BF]/60 shadow-[0_10px_40px_rgba(45,212,191,0.28)]'
            }`}
          >
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI"
              className="w-full h-full object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />

            <motion.div
              animate={sweepAnimation}
              className={`absolute inset-y-0 w-2/3 skew-x-12 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/50 to-transparent'
              }`}
            />
          </motion.div>
        </motion.div>

        {/* Brand Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-center space-y-1"
        >
          <p className="text-lg font-black tracking-tight text-[#0F172A] dark:text-white">
            EduPredict AI
          </p>
          <p className="text-xs font-bold text-[#0D9488] dark:text-[#2DD4BF] uppercase tracking-widest">
            Academic Intelligence &amp; Predictive Learning
          </p>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 3. SIDEBAR BRAND VARIANT (Stationary Sidebar Header)
  // =========================================================================
  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 min-w-0 select-none ${className}`}>
        <motion.div
          animate={floatAnimation}
          className="relative group shrink-0"
        >
          {/* Subtle Ambient Glow */}
          <motion.div
            animate={auraAnimation}
            className={`absolute -inset-1 rounded-xl blur-sm pointer-events-none ${
              isLight
                ? 'bg-gradient-to-tr from-[#0D9488]/20 to-[#6D28D9]/20'
                : 'bg-gradient-to-tr from-[#14B8A6]/30 to-[#8B5CF6]/30'
            }`}
          />

          <div
            className={`relative w-9 h-9 rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center p-0.5 border transition-all ${
              isLight
                ? 'bg-white border-[#5EEAD4]/60 shadow-[0_2px_8px_rgba(13,148,136,0.12)]'
                : 'bg-[#111A2E] border-[#2DD4BF]/40 shadow-[0_2px_10px_rgba(45,212,191,0.18)]'
            }`}
          >
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI Logo"
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            {/* Occasional Circuit Border Highlight */}
            <motion.div
              animate={sweepAnimation}
              className={`absolute inset-y-0 w-1/2 skew-x-12 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/45 to-transparent'
              }`}
            />
          </div>
        </motion.div>

        {!isCollapsed && showWordmark && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold tracking-tight text-sm truncate ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                EduPredict AI
              </span>
              <span
                className={`text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 border ${
                  isLight
                    ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                    : 'bg-[#6D28D9]/25 text-[#DDD6FE] border-[#8B5CF6]/40'
                }`}
              >
                AI
              </span>
            </div>
            <p className={`text-[11px] font-medium truncate ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
              Academic Intelligence
            </p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. HEADER BREADCRUMB VARIANT (Micro-Emblem in Header)
  // =========================================================================
  if (variant === 'header') {
    return (
      <motion.div
        animate={headerFloatAnimation}
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      >
        <span
          className={`relative w-4.5 h-4.5 rounded-full overflow-hidden p-0.5 border shadow-2xs flex items-center justify-center ${
            isLight
              ? 'bg-white border-[#5EEAD4]/80'
              : 'bg-[#111A2E] border-[#2DD4BF]/60'
          }`}
        >
          <img
            src="/edupredict-ai-logo.png"
            alt="EduPredict AI"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </span>
      </motion.div>
    );
  }

  // =========================================================================
  // 5. LOGIN BANNER VARIANT (Compact Fit-to-Screen Banner)
  // =========================================================================
  if (variant === 'login') {
    return (
      <motion.div
        animate={floatAnimation}
        className={`relative group shrink-0 select-none ${className}`}
      >
        <motion.div
          animate={auraAnimation}
          className={`absolute -inset-1 rounded-xl blur-sm pointer-events-none ${
            isLight
              ? 'bg-gradient-to-tr from-[#0D9488]/20 to-[#6D28D9]/20'
              : 'bg-gradient-to-tr from-[#14B8A6]/30 to-[#8B5CF6]/30'
          }`}
        />

        <div
          className={`relative w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-sm flex items-center justify-center p-0.5 border transition-all ${
            isLight
              ? 'bg-white border-[#5EEAD4]/70 shadow-[0_2px_10px_rgba(13,148,136,0.12)]'
              : 'bg-[#111A2E] border-[#2DD4BF]/50 shadow-[0_2px_12px_rgba(45,212,191,0.2)]'
          }`}
        >
          <img
            src="/edupredict-ai-logo.png"
            alt="EduPredict AI Logo"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <motion.div
            animate={sweepAnimation}
            className={`absolute inset-y-0 w-1/2 skew-x-12 pointer-events-none ${
              isLight
                ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/45 to-transparent'
            }`}
          />
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // 6. COMPACT DEFAULT VARIANT
  // =========================================================================
  const dimensions =
    size === 'xs'
      ? 'w-6 h-6 rounded-md'
      : size === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : size === 'lg'
      ? 'w-11 h-11 rounded-xl'
      : 'w-8 h-8 rounded-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <motion.div
        animate={floatAnimation}
        className="relative group shrink-0"
      >
        <motion.div
          animate={auraAnimation}
          className={`absolute -inset-1 rounded-xl blur-xs pointer-events-none ${
            isLight
              ? 'bg-gradient-to-tr from-[#0D9488]/20 to-[#6D28D9]/20'
              : 'bg-gradient-to-tr from-[#14B8A6]/30 to-[#8B5CF6]/30'
          }`}
        />

        <div
          className={`relative ${dimensions} overflow-hidden shadow-2xs shrink-0 flex items-center justify-center p-0.5 border transition-all ${
            isLight
              ? 'bg-white border-[#5EEAD4]/60 shadow-[0_2px_8px_rgba(13,148,136,0.1)]'
              : 'bg-[#111A2E] border-[#2DD4BF]/40 shadow-[0_2px_10px_rgba(45,212,191,0.18)]'
          }`}
        >
          <img
            src="/edupredict-ai-logo.png"
            alt="EduPredict AI"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <motion.div
            animate={sweepAnimation}
            className={`absolute inset-y-0 w-1/2 skew-x-12 pointer-events-none ${
              isLight
                ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/40 to-transparent'
            }`}
          />
        </div>
      </motion.div>

      {showWordmark && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-sm truncate text-[#172033] dark:text-white">
              EduPredict AI
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 border bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] dark:border-[#8B5CF6]/40">
              AI
            </span>
          </div>
          <p className="text-[11px] font-medium truncate text-[#526078] dark:text-slate-300">
            Academic Intelligence
          </p>
        </div>
      )}
    </div>
  );
};
