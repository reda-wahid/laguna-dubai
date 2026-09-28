import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Utensils, Wine, Check } from 'lucide-react';
import { SubCategory, Language } from '../data/menuData';
import { EASE_OUT_EXPO, SOFT_SPRING, TAP_SCALE } from '../animations/variants';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SubCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  activeMainTab: 'food' | 'drinks';
  onSelectMainTab: (tab: 'food' | 'drinks') => void;
  lang: Language;
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategoryId,
  onSelectCategory,
  activeMainTab,
  onSelectMainTab,
  lang,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: EASE_OUT_EXPO }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : SOFT_SPRING}
            className="relative w-full max-w-xl bg-[#030d0a] border-t sm:border border-[#c9a24b]/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden z-10 max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'قائمة التصنيفات' : 'Categories Directory'}
          >
            {/* Drag handle on mobile */}
            <div className="sm:hidden w-12 h-1 bg-[#c9a24b]/30 rounded-full mx-auto mt-2.5 mb-1" />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#c9a24b]/15 flex items-center justify-between">
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-[#f7f4ea] ${isAr ? 'font-arabic-brand' : 'font-serif-brand'}`}>
                  {isAr ? 'أقسام القائمة' : 'Menu Categories'}
                </h3>
                <p className="text-xs text-[#8fa89b]">
                  {isAr ? 'اختر القسم للانتقال السريع' : 'Select a section for quick navigation'}
                </p>
              </div>

              <motion.button
                type="button"
                whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-[#0a1e18] text-[#8fa89b] hover:text-[#f7f4ea] border border-[#c9a24b]/20 hover:border-[#c9a24b]/40 cursor-pointer transition-colors"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Main Section Switcher Pills inside Drawer */}
            <div className="p-4 pb-2">
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#020a07] rounded-2xl border border-[#c9a24b]/20">
                <button
                  type="button"
                  onClick={() => onSelectMainTab('food')}
                  className={`min-h-[42px] flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeMainTab === 'food'
                      ? 'bg-gradient-to-b from-[#153c31] to-[#0a1e18] text-[#f7f4ea] border border-[#c9a24b]/50 shadow-md'
                      : 'text-[#8fa89b] hover:text-[#f7f4ea]'
                  }`}
                >
                  <Utensils size={15} />
                  <span>{isAr ? 'الأكل' : 'FOOD'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMainTab('drinks')}
                  className={`min-h-[42px] flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeMainTab === 'drinks'
                      ? 'bg-gradient-to-b from-[#153c31] to-[#0a1e18] text-[#f7f4ea] border border-[#c9a24b]/50 shadow-md'
                      : 'text-[#8fa89b] hover:text-[#f7f4ea]'
                  }`}
                >
                  <Wine size={15} />
                  <span>{isAr ? 'المشروبات' : 'DRINKS'}</span>
                </button>
              </div>
            </div>

            {/* Categories Grid List */}
            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5 sm:gap-3 flex-1">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategoryId;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-start flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-[#123329] to-[#0a1e18] border-[#c9a24b] text-[#f7f4ea] shadow-lg shadow-black/60'
                        : 'bg-[#0a1e18] hover:bg-[#0f2b23] border-[#c9a24b]/15 text-[#8fa89b] hover:text-[#f7f4ea]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span className={`text-sm sm:text-base font-bold ${isActive ? 'text-[#dfbe6f]' : 'text-[#f7f4ea]'}`}>
                        {isAr ? cat.name_ar : cat.name_en}
                      </span>
                      {isActive && <Check size={16} className="text-[#dfbe6f] shrink-0 mt-0.5" />}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8fa89b]">
                      <span>{isAr ? `${cat.items.length} صنف` : `${cat.items.length} items`}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
