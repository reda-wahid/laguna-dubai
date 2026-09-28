import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { TAP_SCALE, EASE_OUT_EXPO } from '../animations/variants';
import { Language } from '../data/menuData';

interface ScrollToTopProps {
  lang: Language;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ lang }) => {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isAr = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: EASE_OUT_EXPO }}
          whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
          onClick={scrollToTop}
          className="fixed bottom-6 right-5 rtl:right-auto rtl:left-5 z-40 min-h-[46px] min-w-[46px] rounded-full bg-[#143d30]/95 hover:bg-[#1b5543] text-[#dfbe6f] border border-[#c9a24b]/40 shadow-xl shadow-black/60 flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
          aria-label={isAr ? 'العودة لأعلى الصفحة' : 'Scroll to top'}
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
