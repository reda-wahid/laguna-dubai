import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search, Globe, X, LayoutGrid } from 'lucide-react';
import { Language, RESTAURANT_INFO } from '../data/menuData';
import { LagunaLogo } from './LagunaLogo';
import { TAP_SCALE } from '../animations/variants';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onOpenDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  searchOpen,
  onToggleSearch,
  onOpenDrawer,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030d0a]/95 border-b border-[#c9a24b]/20 shadow-xl shadow-black/80 transition-all select-none">
      {/* Subtle luxury ambient gold hairline along the top border */}
      <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#c9a24b]/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone: Clean Logo Emblem */}
        <a
          href="#"
          onClick={handleBrandClick}
          className="group flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a24b] rounded-2xl transition-transform active:scale-95 shrink-0"
          aria-label={isAr ? RESTAURANT_INFO.name_ar : RESTAURANT_INFO.name_en}
          title={isAr ? 'العودة لأعلى الصفحة' : 'Scroll to top'}
        >
          <img
            src="/laguna-logo.svg"
            alt={isAr ? RESTAURANT_INFO.name_ar : RESTAURANT_INFO.name_en}
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain p-1 drop-shadow-[0_2px_8px_rgba(201,162,75,0.4)]"
          />
        </a>

        {/* Action Cluster: Categories Drawer, Search & Language */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Categories Drawer Trigger */}
          {onOpenDrawer && (
            <motion.button
              type="button"
              whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
              onClick={onOpenDrawer}
              className="flex min-h-[40px] px-2.5 sm:min-h-[42px] sm:px-3 items-center gap-1.5 rounded-xl bg-[#0a1e18] hover:bg-[#123329] border border-[#c9a24b]/20 hover:border-[#c9a24b]/50 text-[#dfbe6f] text-xs font-semibold cursor-pointer transition-all shadow-sm"
              aria-label={isAr ? 'استعراض كل أقسام القائمة' : 'Browse all categories'}
              title={isAr ? 'دليل الأقسام' : 'All Categories'}
            >
              <LayoutGrid size={15} className="text-[#c9a24b]" />
              <span className="text-xs">{isAr ? 'الأقسام' : 'Menu'}</span>
            </motion.button>
          )}

          {/* Search Trigger */}
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
            onClick={onToggleSearch}
            className={`min-h-[40px] min-w-[40px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
              searchOpen
                ? 'bg-gradient-to-b from-[#153c31] to-[#0a1e18] border-[#c9a24b] text-[#dfbe6f] shadow-md shadow-[#c9a24b]/20'
                : 'bg-[#0a1e18] border-[#c9a24b]/20 text-[#f7f4ea] hover:border-[#c9a24b]/45 hover:text-[#dfbe6f]'
            }`}
            aria-label={isAr ? 'البحث في القائمة' : 'Search menu'}
            title={isAr ? 'بحث في الأصناف' : 'Search items'}
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </motion.button>

          {/* Language Switcher */}
          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
            onClick={onToggleLang}
            className="min-h-[40px] px-2.5 sm:min-h-[42px] sm:px-3 flex items-center gap-1 rounded-xl bg-[#0a1e18] hover:bg-[#123329] border border-[#c9a24b]/25 hover:border-[#c9a24b]/50 text-[#f7f4ea] hover:text-[#dfbe6f] transition-all text-xs font-bold cursor-pointer shadow-sm shadow-black/40"
            aria-label={isAr ? 'التبديل إلى English' : 'التبديل إلى العربية'}
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe size={13} className="text-[#c9a24b]" />
            <span className="font-bold tracking-wide">{isAr ? 'EN' : 'عربي'}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
