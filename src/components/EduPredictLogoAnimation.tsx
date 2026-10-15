import React from 'react';
import { motion } from 'motion/react';
import { EASINGS } from '../utils/motionPresets';

interface EduPredictLogoAnimationProps {
  variant?: 'hero' | 'splash' | 'compact';
  showWordmark?: boolean;
  className?: string;
}

export const EduPredictLogoAnimation: React.FC<EduPredictLogoAnimationProps> = ({
  variant = 'compact',
  showWordmark = true,
  className = '',
}) => {
  if (variant === 'hero') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {/* Animated Icon Frame */}
        <div className="relative group shrink-0">
          {/* Subtle Ambient Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.45, 0.25], scale: [0.8, 1.15, 1] }}
            transition={{ duration: 1.4, ease: EASINGS.smooth }}
            className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#6D28D9]/40 via-[#4F46E5]/30 to-[#8B5CF6]/40 blur-md pointer-events-none"
          />

          {/* Logo Container with Border Sweep */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASINGS.smooth }}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden p-1 bg-white dark:bg-[#1E293B] border border-[#DDD6FE] dark:border-[#8B5CF6]/40 shadow-sm flex items-center justify-center"
          >
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI Logo"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />

            {/* Light sweep reflection across logo */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '180%', opacity: [0, 0.6, 0] }}
              transition={{ delay: 0.45, duration: 0.85, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
            />
          </motion.div>
        </div>

        {/* Staggered Wordmark */}
        {showWordmark && (
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45, ease: EASINGS.smooth }}
              className="flex items-center gap-1.5"
            >
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-white">
                EduPredict AI
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] dark:border-[#8B5CF6]/40">
                AI
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-[11px] font-semibold tracking-wide text-[#6D28D9] dark:text-[#DDD6FE] uppercase"
            >
              Academic Intelligence Platform
            </motion.p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {/* Animated central icon */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.5, 0.3], scale: [0.85, 1.2, 1] }}
            transition={{ duration: 1.2, ease: EASINGS.smooth }}
            className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#6D28D9]/40 via-[#4F46E5]/30 to-[#8B5CF6]/40 blur-xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASINGS.smooth }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-[#1E293B] flex items-center justify-center border-2 border-[#6D28D9]/40 dark:border-[#8B5CF6]/40 p-2"
          >
            <img
              src="/edupredict-ai-logo.png"
              alt="EduPredict AI"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />

            {/* Sweep effect */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '200%', opacity: [0, 0.7, 0] }}
              transition={{ delay: 0.4, duration: 0.9, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
            />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASINGS.smooth }}
          className="mt-5 text-center space-y-1"
        >
          <p className="text-base font-black tracking-tight text-[#0F172A] dark:text-white">
            EduPredict AI
          </p>
          <p className="text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE] uppercase tracking-widest">
            Academic Intelligence Platform
          </p>
        </motion.div>
      </div>
    );
  }

  // Compact variant for Header & Sidebar
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0 bg-white dark:bg-[#172033] flex items-center justify-center border border-[#6D28D9]/30 dark:border-[#8B5CF6]/30 p-0.5 transition-transform duration-200 hover:scale-105">
        <img
          src="/edupredict-ai-logo.png"
          alt="EduPredict AI"
          className="w-full h-full object-cover rounded-lg"
          referrerPolicy="no-referrer"
        />
      </div>
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
