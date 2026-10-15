import React from 'react';
import { motion, useReducedMotion, TargetAndTransition } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export interface FloatingLogoBackgroundProps {
  className?: string;
  /**
   * Optional custom position override.
   * Defaults to 'top-right' which places the logo in the upper-right ambient canvas,
   * safe from the left sidebar, top header, and bottom-right AI Assistant.
   */
  position?: 'top-right' | 'subtle-drift' | 'center-offset';
}

/**
 * FloatingLogoBackground
 * 
 * Signature EduPredict AI background effect:
 * - One subtle, translucent EduPredict AI logo floating slowly behind the interface
 * - Gentle vertical drift (8-10px) with smooth 8s sinusoidal easing
 * - Soft turquoise and purple glow around the circular emblem
 * - Occasional delicate highlight sweep across the emblem
 * - Fully theme-aware (soft lavender/turquoise in Light, luminous cyan/violet in Dark)
 * - Zero layout shifts, no horizontal scrollbars, 100% pointer-events: none
 * - Respects prefers-reduced-motion
 */
export const FloatingLogoBackground: React.FC<FloatingLogoBackgroundProps> = ({
  className = '',
  position = 'top-right'
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const shouldReduceMotion = useReducedMotion();

  // Floating vertical drift: 8-second cycle, 8-10px travel with subtle breathing scale
  const driftAnimation: TargetAndTransition = shouldReduceMotion
    ? { y: 0, scale: 1 }
    : {
        y: [0, -9, 0],
        scale: [1, 1.025, 1],
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Ambient breathing glow aura behind the emblem (synchronized 8s cycle)
  const glowAnimation: TargetAndTransition = shouldReduceMotion
    ? { opacity: 0.45, scale: 1 }
    : {
        opacity: [0.38, 0.7, 0.38],
        scale: [0.94, 1.06, 0.94],
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Occasional delicate highlight sweep across the circular emblem (every ~8.2s)
  const sweepAnimation: TargetAndTransition = shouldReduceMotion
    ? { opacity: 0 }
    : {
        x: ['-140%', '240%'],
        opacity: [0, isLight ? 0.35 : 0.48, 0],
        transition: {
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 6.4,
          ease: 'easeInOut'
        }
      };

  // Perimeter ring highlight pulse
  const ringPulseAnimation: TargetAndTransition = shouldReduceMotion
    ? { opacity: 0.4 }
    : {
        opacity: [0.3, 0.65, 0.3],
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      };

  // Placement coordinates based on variant
  const positionClasses =
    position === 'center-offset'
      ? 'top-1/3 right-1/4'
      : position === 'subtle-drift'
      ? 'top-24 sm:top-28 right-6 sm:right-16 lg:right-28'
      : 'top-16 sm:top-24 md:top-28 right-3 sm:right-8 md:right-14 lg:right-20 xl:right-28';

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
    >
      {/* Container positioned in ambient canvas behind foreground content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute ${positionClasses}`}
      >
        <motion.div
          animate={driftAnimation}
          className="relative flex items-center justify-center w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-60 lg:h-60"
        >
          {/* 1. Ambient Turquoise & Purple Radial Glow Aura */}
          <motion.div
            animate={glowAnimation}
            className={`absolute -inset-4 sm:-inset-6 md:-inset-8 rounded-full blur-2xl sm:blur-3xl transition-colors duration-700 pointer-events-none ${
              isLight
                ? 'bg-gradient-to-tr from-[#0D9488]/15 via-[#7C3AED]/12 to-[#06B6D4]/18'
                : 'bg-gradient-to-tr from-[#14B8A6]/25 via-[#8B5CF6]/20 to-[#06B6D4]/25'
            }`}
          />

          {/* 2. Secondary soft lavender/teal halo */}
          <div
            className={`absolute -inset-2 rounded-full blur-xl transition-colors duration-700 pointer-events-none ${
              isLight
                ? 'bg-[#5EEAD4]/10 dark:bg-transparent'
                : 'bg-[#2DD4BF]/15'
            }`}
          />

          {/* 3. Outer delicate perimeter highlight ring */}
          <motion.div
            animate={ringPulseAnimation}
            className={`absolute -inset-0.5 rounded-full border pointer-events-none transition-colors duration-700 ${
              isLight
                ? 'border-[#0D9488]/25 shadow-[0_0_15px_rgba(13,148,136,0.12)]'
                : 'border-[#2DD4BF]/35 shadow-[0_0_20px_rgba(45,212,191,0.18)]'
            }`}
          />

          {/* 4. The Translucent EduPredict AI Circular Emblem */}
          <div
            className={`relative w-full h-full rounded-full overflow-hidden p-1 sm:p-1.5 border transition-all duration-700 flex items-center justify-center shadow-xl ${
              isLight
                ? 'bg-white/40 border-[#0D9488]/20 shadow-[0_8px_30px_rgba(13,148,136,0.08)]'
                : 'bg-[#0B132B]/50 border-[#2DD4BF]/25 shadow-[0_8px_35px_rgba(45,212,191,0.14)]'
            }`}
          >
            {/* The Authentic EduPredict AI Logo Asset */}
            <img
              src="/edupredict-ai-logo.png"
              alt=""
              className={`w-full h-full object-contain rounded-full transition-opacity duration-700 filter ${
                isLight
                  ? 'opacity-[0.13] sm:opacity-[0.16] contrast-105'
                  : 'opacity-[0.18] sm:opacity-[0.24] brightness-110 contrast-110'
              }`}
              referrerPolicy="no-referrer"
            />

            {/* 5. Occasional Delicate Highlight Sweep */}
            <motion.div
              animate={sweepAnimation}
              className={`absolute inset-y-0 w-1/2 skew-x-12 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#5EEAD4]/35 to-transparent'
              }`}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
