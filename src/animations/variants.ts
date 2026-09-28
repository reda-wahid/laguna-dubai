/**
 * Reusable animation tokens and Framer Motion variants
 * Designed for luxury hospitality: measured, silky, and tactile.
 */

// Custom easing curve - ease-out-expo feel
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Tactile spring for cards, buttons, modals
export const SOFT_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 24,
} as const;

export const TAP_SCALE = {
  scale: 0.97,
  transition: { duration: 0.15, ease: EASE_OUT_EXPO },
};

// Fade In Up variant for cards and content
export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: Math.min(i * 0.04, 0.28), // Capped stagger to prevent lag on long lists
      ease: EASE_OUT_EXPO,
    },
  }),
};

// Stagger container for category lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Scale in for modal dialogs and overlays
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SOFT_SPRING,
      duration: 0.45,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.22,
      ease: EASE_OUT_EXPO,
    },
  },
};

// Language crossfade container
export const languageCrossfade = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO },
  },
};
