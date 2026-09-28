import React, { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search, X, ArrowLeft, ArrowRight, Utensils, Wine, AlertCircle } from 'lucide-react';
import { Language, MenuItem } from '../data/menuData';
import { EASE_OUT_EXPO, TAP_SCALE } from '../animations/variants';

export interface SearchMatch {
  item: MenuItem;
  categoryId: string;
  categoryName_en: string;
  categoryName_ar: string;
  sectionId: 'food' | 'drinks';
}

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  lang: Language;
  onClose: () => void;
  resultCount?: number;
  matches?: SearchMatch[];
  onNavigateToItem?: (sectionId: 'food' | 'drinks', categoryId: string, itemId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  lang,
  onClose,
  resultCount = 0,
  matches = [],
  onNavigateToItem,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If there is at least one match, jump directly to the top match!
      if (matches.length > 0 && onNavigateToItem) {
        const top = matches[0];
        onNavigateToItem(top.sectionId, top.categoryId, top.item.id);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleDirectJump = (match: SearchMatch) => {
    if (onNavigateToItem) {
      onNavigateToItem(match.sectionId, match.categoryId, match.item.id);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: EASE_OUT_EXPO }}
      className="w-full bg-[#030d0a]/98 backdrop-blur-xl border-b border-[#c9a24b]/30 px-3 sm:px-4 py-3 overflow-hidden shadow-2xl shadow-black/80 select-none z-40"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 flex items-center">
            <Search
              size={18}
              className="absolute left-3.5 rtl:left-auto rtl:right-3.5 text-[#c9a24b] pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAr
                  ? 'ابحث بالاسم أو المكونات (مثال: بيتزا، كريب، موهيتو)...'
                  : 'Search by dish or drink name (e.g. Pizza, Crepe, Mojito)...'
              }
              className="w-full h-11 pl-10 pr-10 rtl:pl-10 rtl:pr-10 bg-[#0a1e18] text-[#f7f4ea] placeholder-[#647c72] border border-[#c9a24b]/35 focus:border-[#dfbe6f] rounded-2xl text-sm outline-none transition-colors shadow-inner"
              aria-label={isAr ? 'البحث في القائمة' : 'Search the menu'}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:right-auto rtl:left-3 text-[#8fa89b] hover:text-[#f7f4ea] p-1.5 cursor-pointer rounded-full"
                aria-label={isAr ? 'مسح البحث' : 'Clear search'}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Direct Search / Enter Go Button */}
          {searchQuery && matches.length > 0 && onNavigateToItem && (
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
              onClick={() => handleDirectJump(matches[0])}
              className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-[#c9a24b] to-[#dfbe6f] hover:from-[#dfbe6f] hover:to-[#c9a24b] text-[#030d0a] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-105 transition-all shrink-0"
              title={isAr ? 'التوجه المباشر للصنف' : 'Go directly to item'}
            >
              <span>{isAr ? 'ذهاب' : 'Go'}</span>
              {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </motion.button>
          )}

          {/* Close Button */}
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#0a1e18] hover:bg-[#123329] text-[#8fa89b] hover:text-[#f7f4ea] border border-[#c9a24b]/20 hover:border-[#c9a24b]/40 transition-colors cursor-pointer shrink-0"
            aria-label={isAr ? 'إغلاق البحث' : 'Close search'}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Live Quick Matches Dropdown Strip when typing */}
        {searchQuery.trim().length > 0 && matches.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#c9a24b]/15 max-h-56 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between text-[11px] text-[#dfbe6f] px-1 font-medium">
              <span>{isAr ? `نتائج فورية مطابقة (${matches.length}) - اضغط للتوجه المباشر إلى الصنف:` : `Instant matches (${matches.length}) - Tap to jump directly:`}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {matches.slice(0, 6).map((m) => (
                <button
                  key={m.item.id}
                  type="button"
                  onClick={() => handleDirectJump(m)}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#061510] hover:bg-[#0e2d23] border border-[#c9a24b]/20 hover:border-[#dfbe6f]/50 text-start transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#030d0a] border border-[#c9a24b]/20 shrink-0">
                      <img
                        src={m.item.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#f7f4ea] group-hover:text-[#dfbe6f] truncate">
                        {isAr ? m.item.name_ar : m.item.name_en}
                      </div>
                      <div className="text-[10px] text-[#8fa89b] flex items-center gap-1">
                        {m.sectionId === 'food' ? <Utensils size={10} className="text-[#c9a24b]" /> : <Wine size={10} className="text-[#c9a24b]" />}
                        <span className="truncate">{isAr ? m.categoryName_ar : m.categoryName_en}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-xs font-bold text-[#dfbe6f] font-mono">
                      {m.item.price ? `${m.item.price} ج.م` : (m.item.prices?.[0] ? `${m.item.prices[0].price} ج.م` : '')}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-[#0a1e18] group-hover:bg-[#c9a24b] text-[#c9a24b] group-hover:text-[#030d0a] flex items-center justify-center transition-colors">
                      {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Not Found Notice when typing with no results */}
        {searchQuery.trim().length > 0 && matches.length === 0 && (
          <div className="pt-2 border-t border-[#c9a24b]/15 px-2 py-2 text-xs text-[#dfbe6f] flex items-center gap-2 bg-[#0e241c]/60 rounded-xl border border-[#c9a24b]/20">
            <AlertCircle size={15} className="shrink-0 text-[#c9a24b]" />
            <span>
              {isAr
                ? 'هذا العنصر غير موجود حالياً في المنيو. يمكنك تصفح الأقسام أو البحث باسم آخر.'
                : 'This item is not currently found in the menu. Try browsing categories.'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
