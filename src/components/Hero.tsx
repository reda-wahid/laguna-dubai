import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  UtensilsCrossed,
  Wine,
  ChevronDown,
  Sparkles,
  MapPin,
  Compass,
  Award,
} from 'lucide-react';
import { Language, RESTAURANT_INFO } from '../data/menuData';
import { LagunaLogo } from './LagunaLogo';
import { EASE_OUT_EXPO, TAP_SCALE } from '../animations/variants';
import heroWaterfrontBg from '../assets/images/laguna_hero_waterfront_1790460278205.jpg';

interface HeroProps {
  lang: Language;
  activeMainTab: 'food' | 'drinks';
  onSelectMainTab: (tab: 'food' | 'drinks') => void;
  foodCount?: number;
  drinksCount?: number;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  activeMainTab,
  onSelectMainTab,
  foodCount = 100,
  drinksCount = 80,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section className="relative w-full min-h-[76vh] sm:min-h-[82vh] flex flex-col justify-between overflow-hidden border-b border-[#c9a24b]/20 bg-[#030d0a]">
      {/* Background cinematic photograph with deep emerald luxury scrim */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={heroWaterfrontBg}
          alt={isAr ? 'إطلالة لاجونا دبي الفاخرة على النيل' : 'Laguna Dubai luxury waterfront atmosphere'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.32] contrast-[1.1] saturate-[0.85]"
        />
        {/* Measured multi-layer emerald gradient scrims ensuring WCAG AA contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030d0a] via-[#030d0a]/88 to-[#030d0a]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f2e24]/50 via-transparent to-transparent" />
      </div>

      {/* Main Luxury Venue Experience Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 sm:pt-14 pb-8 text-center flex-1 flex flex-col items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center"
        >
          {/* Majestic Laguna Dubai Official Emblem */}
          <motion.div variants={itemVariants} className="mb-2">
            <div className="relative group transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-[#c9a24b]/20 blur-2xl rounded-full scale-125 pointer-events-none" />
              <img
                src="/favicon.svg"
                alt="LAGUNA DUBAI"
                className="relative w-28 sm:w-36 h-auto object-contain drop-shadow-[0_4px_24px_rgba(201,162,75,0.45)] rounded-2xl mx-auto"
              />
            </div>
          </motion.div>

          {/* Official Venue Title */}
          <motion.h1
            variants={itemVariants}
            className={`text-3xl sm:text-5xl md:text-6xl font-normal text-[#f7f4ea] tracking-wide text-balance ${
              isAr ? 'font-arabic-brand font-bold leading-tight' : 'font-serif-brand uppercase'
            }`}
          >
            {isAr ? RESTAURANT_INFO.name_ar : RESTAURANT_INFO.name_en}
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={itemVariants}
            className="mt-1 text-xs sm:text-sm font-light text-[#dfbe6f] tracking-[0.3em] uppercase font-serif-brand"
          >
            {isAr ? RESTAURANT_INFO.subtitle_ar : RESTAURANT_INFO.subtitle_en}
          </motion.div>

          {/* Iconic Tagline */}
          <motion.p
            variants={itemVariants}
            className="mt-2 text-sm sm:text-base text-[#c9a24b] font-medium italic tracking-wide"
          >
            &ldquo;{isAr ? RESTAURANT_INFO.tagline_ar : RESTAURANT_INFO.tagline_en}&rdquo;
          </motion.p>

          {/* Atmospheric Editorial Description */}
          <motion.p
            variants={itemVariants}
            className="mt-2.5 text-xs sm:text-sm text-[#d0dfd8]/90 max-w-xl leading-relaxed font-light"
          >
            {isAr ? RESTAURANT_INFO.welcome_ar : RESTAURANT_INFO.welcome_en}
          </motion.p>

          {/* Distinctive Venue Pillars (Luxury Attributes) */}
          <motion.div
            variants={itemVariants}
            className="mt-5 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs"
          >
            <div className="p-2.5 rounded-2xl bg-[#061510]/85 border border-[#c9a24b]/20 flex flex-col items-center text-center shadow-md">
              <Sparkles size={18} className="text-[#dfbe6f] mb-1.5" />
              <span className="font-bold text-[#f7f4ea] text-xs sm:text-sm">{isAr ? 'كريبات وبيتزا ' : 'Crepes & Artisan Pizza'}</span>
              <span className="text-[11px] text-[#8fa89b] mt-0.5">{isAr ? 'مخبوزات طازجة يومياً بأجود المكونات' : 'Freshly crafted daily'}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#061510]/85 border border-[#c9a24b]/20 flex flex-col items-center text-center shadow-md">
              <Wine size={18} className="text-[#dfbe6f] mb-1.5" />
              <span className="font-bold text-[#f7f4ea] text-xs sm:text-sm">{isAr ? 'مشروبات وعصائر لاجونا' : 'Fresh Juices & Coffee'}</span>
              <span className="text-[11px] text-[#8fa89b] mt-0.5">{isAr ? 'كوكتيلات فاكهة طبيعية طازجة' : 'Handcrafted mocktails'}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#061510]/85 border border-[#c9a24b]/20 flex flex-col items-center text-center shadow-md">
              <Award size={18} className="text-[#dfbe6f] mb-1.5" />
              <span className="font-bold text-[#f7f4ea] text-xs sm:text-sm">{isAr ? 'جلسات راقية ومريحة' : 'Luxury Atmosphere'}</span>
              <span className="text-[11px] text-[#8fa89b] mt-0.5">{isAr ? 'أجواء استثنائية وخدمة راقية' : 'Exceptional hospitality & comfort'}</span>
            </div>
          </motion.div>

          {/* Primary Food / Drinks Switcher & Menu Anchors */}
          <motion.div
            variants={itemVariants}
            className="mt-6 w-full max-w-sm flex flex-col sm:flex-row items-center gap-3"
          >
            {/* Food vs Drinks Tabs */}
            <div className="w-full grid grid-cols-2 gap-1.5 p-1 bg-[#020a07]/95 rounded-2xl border border-[#c9a24b]/35 shadow-xl shadow-black/80 backdrop-blur-md">
              <motion.button
                type="button"
                whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                onClick={() => onSelectMainTab('food')}
                className={`min-h-[46px] flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'food'
                    ? 'bg-gradient-to-b from-[#153c31] to-[#0a1e18] text-[#f7f4ea] border border-[#c9a24b]/60 shadow-md'
                    : 'text-[#8fa89b] hover:text-[#f7f4ea] hover:bg-[#0a1e18]'
                }`}
              >
                <UtensilsCrossed size={16} className={activeMainTab === 'food' ? 'text-[#c9a24b]' : 'text-[#8fa89b]'} />
                <span>{isAr ? `قائمة الأكل (${foodCount})` : `Food (${foodCount})`}</span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                onClick={() => onSelectMainTab('drinks')}
                className={`min-h-[46px] flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'drinks'
                    ? 'bg-gradient-to-b from-[#153c31] to-[#0a1e18] text-[#f7f4ea] border border-[#c9a24b]/60 shadow-md'
                    : 'text-[#8fa89b] hover:text-[#f7f4ea] hover:bg-[#0a1e18]'
                }`}
              >
                <Wine size={16} className={activeMainTab === 'drinks' ? 'text-[#c9a24b]' : 'text-[#8fa89b]'} />
                <span>{isAr ? `المشروبات (${drinksCount})` : `Drinks (${drinksCount})`}</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gentle Scroll Indicator */}
      <div className="relative z-10 pb-3 text-center flex flex-col items-center">
        <a
          href="#menu-content-anchor"
          className="inline-flex flex-col items-center gap-0.5 text-[11px] text-[#8fa89b]/80 hover:text-[#dfbe6f] transition-colors focus:outline-none"
        >
          <span>{isAr ? 'تصفح قائمة الأصناف بالأسفل' : 'Explore Menu Items Below'}</span>
          <ChevronDown size={14} className="text-[#c9a24b] animate-bounce" />
        </a>
      </div>
    </section>
  );
};
