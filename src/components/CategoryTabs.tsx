import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { SubCategory, Language } from '../data/menuData';
import { SOFT_SPRING, TAP_SCALE } from '../animations/variants';

interface CategoryTabsProps {
  categories: SubCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenDirectory?: () => void;
  lang: Language;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenDirectory,
  lang,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundary state to show/hide indicators
  const checkScrollState = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Account for potential RTL scroll coordinates
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);
    setCanScrollLeft(absScroll > 8);
    setCanScrollRight(absScroll < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState, categories]);

  // Smooth scroll active tab into view horizontally with centering
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategoryId, shouldReduceMotion]);

  const handleScrollBy = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: isAr ? -offset : offset, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-14 sm:top-16 z-30 w-full bg-[#030d0a]/95 backdrop-blur-md border-b border-[#c9a24b]/20 shadow-lg shadow-black/80">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 relative">
        {/* Quick Directory Trigger */}
        {onOpenDirectory && (
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
            onClick={onOpenDirectory}
            className="min-h-[42px] px-2.5 sm:px-3 flex items-center gap-1.5 rounded-xl bg-[#0a1e18] hover:bg-[#123329] border border-[#c9a24b]/30 text-[#dfbe6f] text-xs font-semibold shrink-0 cursor-pointer shadow-sm transition-colors"
            aria-label={isAr ? 'عرض جميع الأقسام' : 'All categories'}
            title={isAr ? 'عرض الأقسام في شبكة' : 'Browse categories directory'}
          >
            <LayoutGrid size={15} className="text-[#c9a24b]" />
            <span className="hidden sm:inline">{isAr ? 'الأقسام' : 'All'}</span>
          </motion.button>
        )}

        {/* Scroll Left Chevron (Desktop/Tablet) */}
        <button
          type="button"
          onClick={() => handleScrollBy('left')}
          className="hidden sm:flex min-h-[38px] w-7 items-center justify-center rounded-lg bg-[#0a1e18]/80 hover:bg-[#123329] border border-[#c9a24b]/20 text-[#dfbe6f] hover:text-[#f7f4ea] transition-colors shrink-0 cursor-pointer"
          aria-label={isAr ? 'تمرير للأمام' : 'Scroll left'}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Horizontal Scrollable Tabs Strip with Visual Overflow Fades */}
        <div className="relative flex-1 overflow-hidden">
          {/* Subtle Left Fade Cue */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#030d0a] to-transparent z-10 pointer-events-none" />
          )}

          {/* Scrollable Container */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 touch-pan-x"
            role="tablist"
            aria-label={isAr ? 'تصنيفات القائمة' : 'Menu categories'}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <motion.button
                  key={cat.id}
                  ref={isActive ? activeBtnRef : null}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative min-h-[42px] px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive
                      ? 'text-[#f7f4ea] font-bold shadow-md shadow-black/50'
                      : 'text-[#8fa89b] hover:text-[#f7f4ea] hover:bg-[#0a1e18]'
                  }`}
                >
                  {/* Sliding/morphing background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBackground"
                      transition={shouldReduceMotion ? { duration: 0 } : SOFT_SPRING}
                      className="absolute inset-0 bg-gradient-to-b from-[#153c31] to-[#0a1e18] border border-[#c9a24b]/60 rounded-xl -z-10 shadow-md"
                    />
                  )}

                  <span className="relative z-10">{isAr ? cat.name_ar : cat.name_en}</span>

                  {/* Subcategory item count */}
                  <span
                    className={`relative z-10 text-[11px] tabular-nums font-normal ${
                      isActive ? 'text-[#dfbe6f]' : 'text-[#647c72]'
                    }`}
                  >
                    ({cat.items.length})
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Subtle Right Fade Cue */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#030d0a] to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {/* Scroll Right Chevron (Desktop/Tablet) */}
        <button
          type="button"
          onClick={() => handleScrollBy('right')}
          className="hidden sm:flex min-h-[38px] w-7 items-center justify-center rounded-lg bg-[#0a1e18]/80 hover:bg-[#123329] border border-[#c9a24b]/20 text-[#dfbe6f] hover:text-[#f7f4ea] transition-colors shrink-0 cursor-pointer"
          aria-label={isAr ? 'تمرير للخلف' : 'Scroll right'}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

CategoryTabs.displayName = 'CategoryTabs';
