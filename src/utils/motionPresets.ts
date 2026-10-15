/**
 * EduPredict AI - Unified Motion Design Presets & Animation System
 * Powered by motion/react with WCAG AA & prefers-reduced-motion compliance.
 */

import { Variants, Transition } from 'motion/react';

// Common Easing Curves
export const EASINGS = {
  smooth: [0.16, 1, 0.3, 1] as const, // Custom cubic-bezier for fluid, responsive feel
  entrance: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  bounceSubtle: [0.34, 1.56, 0.64, 1] as const,
  standard: [0.2, 0, 0, 1] as const,
};

// Timings (in seconds)
export const TIMINGS = {
  micro: 0.16,
  card: 0.24,
  panel: 0.28,
  page: 0.35,
  hero: 0.6,
  logoIntro: 1.4,
};

// Common Transitions
export const TRANSITIONS = {
  micro: {
    duration: TIMINGS.micro,
    ease: EASINGS.smooth,
  } satisfies Transition,
  card: {
    duration: TIMINGS.card,
    ease: EASINGS.smooth,
  } satisfies Transition,
  panel: {
    duration: TIMINGS.panel,
    ease: EASINGS.smooth,
  } satisfies Transition,
  page: {
    duration: TIMINGS.page,
    ease: EASINGS.smooth,
  } satisfies Transition,
  stagger: (staggerChildren = 0.06, delayChildren = 0.05): Transition => ({
    staggerChildren,
    delayChildren,
  }),
};

// Page and Container Variants
export const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMINGS.page,
      ease: EASINGS.smooth,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: EASINGS.exit,
    },
  },
};

// Staggered Container Variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

// Card Entrance Variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMINGS.card,
      ease: EASINGS.smooth,
    },
  },
};

// Simple Fade In & Slide Up
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMINGS.card,
      ease: EASINGS.smooth,
    },
  },
};

// Modal & Dialog Transitions
export const modalOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 14,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASINGS.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.18,
      ease: EASINGS.exit,
    },
  },
};

// Dropdown / Popover Variants
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -6,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: EASINGS.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: {
      duration: 0.12,
      ease: 'easeIn',
    },
  },
};

// Micro-interaction hover presets
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -2,
    scale: 1.008,
    transition: { duration: 0.18, ease: EASINGS.smooth },
  },
  tap: {
    y: 0,
    scale: 0.985,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
};

export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.15, ease: EASINGS.smooth } },
  tap: { scale: 0.96, transition: { duration: 0.08, ease: 'easeOut' } },
};

// Chat Panel Specific Animation
export const chatPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 18,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: EASINGS.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 14,
    transition: {
      duration: 0.18,
      ease: EASINGS.exit,
    },
  },
};

// Chat message entrance
export const messageBubbleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: EASINGS.smooth,
    },
  },
};

// Progress bar animation helper
export const progressBarVariants = (targetPercent: number): Variants => ({
  hidden: { width: '0%' },
  visible: {
    width: `${Math.max(0, Math.min(100, targetPercent))}%`,
    transition: {
      duration: 0.5,
      ease: EASINGS.smooth,
    },
  },
});

