import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem, Language, RESTAURANT_INFO } from '../data/menuData';
import { ProductImage } from './ProductImage';
import { LagunaLogo } from './LagunaLogo';
import { EASE_OUT_EXPO } from '../animations/variants';

interface ProductCardProps {
  item: MenuItem;
  lang: Language;
  index: number;
  isFood?: boolean;
}

/**
 * Memoized ProductCard component
 * Features:
 * - Direct, clean card without disruptive popups
 * - Prominent LAGUNA DUBAI brand seal on every cup & dish photo
 * - Inline LAGUNA DUBAI brand mark next to product title
 * - Rich deep emerald & warm gold palette matching menu imagery
 * - GPU-accelerated motion (transform & opacity only)
 * - All details, ingredients, and prices displayed directly on card face
 */
export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  item,
  lang,
  index,
  isFood = true,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const isAvailable = item.isAvailable !== false;
  const isSpecial = Boolean(item.isLagunaSpecial || item.badgeType === 'special');
  const isChefsChoice = Boolean(item.isChefsChoice || item.badgeType === 'chefs_choice');
  const isHighlighted = isSpecial || isChefsChoice;

  const primaryName = isAr ? item.name_ar : item.name_en;
  const secondaryName = isAr ? item.name_en : item.name_ar;
  const description = isAr ? item.desc_ar : item.desc_en;
  const currency = isAr ? RESTAURANT_INFO.currency_ar : RESTAURANT_INFO.currency_en;

  // Stagger capped to 0.15s to guarantee snappy rendering
  const revealDelay = shouldReduceMotion ? 0 : Math.min((index % 6) * 0.02, 0.1);

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '120px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        delay: revealDelay,
        ease: EASE_OUT_EXPO,
      }}
      id={`product-card-${item.id}`}
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#0a1e18] hover:bg-[#0f2b23] border transition-all duration-300 overflow-hidden transform-gpu will-change-transform ${
        isHighlighted
          ? 'border-[#dfbe6f]/45 hover:border-[#dfbe6f] shadow-[0_0_24px_-4px_rgba(201,162,75,0.32)] hover:shadow-[0_0_32px_-2px_rgba(201,162,75,0.45)]'
          : 'border-[#c9a24b]/20 hover:border-[#c9a24b]/50 shadow-md shadow-black/60 hover:shadow-2xl hover:shadow-black/80'
      } ${!isAvailable ? 'opacity-70 grayscale-[0.3]' : ''}`}
    >
      {/* Luxury Golden Ambient Glow Strip for Special / Chef's Choice */}
      {isHighlighted && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#dfbe6f] to-transparent pointer-events-none z-10 animate-pulse" />
      )}

      {/* Top Product Image Container */}
      <div className="relative w-full overflow-hidden bg-[#030d0a]">
        <ProductImage
          src={item.image}
          alt={primaryName}
          aspectRatioClass="aspect-[16/10] sm:aspect-[16/9]"
          isFood={isFood}
          priority={index < 8}
          width={640}
          height={400}
        />

        {/* Official LAGUNA DUBAI Brand Crest Stamp */}
        <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-10 pointer-events-none">
          {isFood ? (
            <LagunaLogo variant="dish-stamp" isAr={isAr} />
          ) : (
            <LagunaLogo variant="cup-stamp" isAr={isAr} />
          )}
        </div>

        {/* Chef's Choice Badge with Sparkle Icon and Ambient Glow */}
        {isChefsChoice && (
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2.5 py-1 rounded-full bg-[#030d0a]/95 backdrop-blur-md border border-[#dfbe6f]/60 flex items-center gap-1 shadow-lg shadow-black/80 z-10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={11} className="text-[#dfbe6f] animate-pulse" />
            <span className="text-[10px] font-bold text-[#dfbe6f] tracking-wide">
              {isAr ? 'اختيار الشيف 👨‍🍳' : "Chef's Choice 👨‍🍳"}
            </span>
          </div>
        )}

        {/* Special / Laguna Signature Badge with Sparkle Icon */}
        {!isChefsChoice && isSpecial && (
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 px-2.5 py-1 rounded-full bg-[#030d0a]/95 backdrop-blur-md border border-[#c9a24b]/50 flex items-center gap-1 shadow-lg shadow-black/80 z-10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={11} className="text-[#dfbe6f] animate-pulse" />
            <span className="text-[10px] font-bold text-[#dfbe6f] tracking-wide">
              {isAr ? 'صنف مميز ✨' : 'Special ✨'}
            </span>
          </div>
        )}

        {/* Sold Out / Unavailable Notice */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="px-3.5 py-1.5 rounded-full bg-[#1e0a0a]/90 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-1.5 shadow-xl">
              <AlertCircle size={14} className="text-red-400" />
              <span>{isAr ? 'غير متوفر حالياً' : 'Sold Out Today'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content: Details displayed clearly */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Header: Item Titles & Laguna Inline Crest Stamp */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className={`text-base sm:text-lg font-bold text-[#f7f4ea] group-hover:text-[#dfbe6f] transition-colors leading-snug ${isAr ? 'font-arabic-brand' : 'font-sans'}`}>
                  {primaryName}
                </h3>

                {/* Subtle Sparkle Icon Badge for Special or Chef's Choice */}
                {isHighlighted && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#dfbe6f]/15 border border-[#dfbe6f]/35 text-[#dfbe6f] text-[10px] font-semibold shadow-sm"
                    title={isChefsChoice ? (isAr ? 'اختيار الشيف' : "Chef's Choice") : (isAr ? 'صنف مميز' : 'Special')}
                  >
                    <Sparkles size={10} className="text-[#dfbe6f] animate-pulse" />
                    <span>
                      {isChefsChoice
                        ? (isAr ? 'الشيف' : "Chef's")
                        : (isAr ? 'مميز' : 'Special')}
                    </span>
                  </span>
                )}

                {/* Laguna Crest Seal beside item */}
                <LagunaLogo variant="dish-inline" isAr={isAr} />
              </div>
              <p className="text-[11px] sm:text-xs text-[#8fa89b] font-light mt-0.5">
                {secondaryName}
              </p>
            </div>
          </div>

          {/* Complete Ingredients & Details */}
          {description ? (
            <div className="mt-2.5 pt-2 border-t border-[#c9a24b]/15">
              <p className="text-xs text-[#d0dfd8] leading-relaxed font-normal bg-[#061510]/70 p-2.5 rounded-xl border border-[#c9a24b]/15">
                {description}
              </p>
            </div>
          ) : (
            <div className="mt-2 text-[11px] text-[#8fa89b]/70 italic">
              {isAr ? 'مُحضر طازجاً بأجود المكونات في لاجونا دبي' : 'Prepared fresh with premium ingredients at Laguna'}
            </div>
          )}
        </div>

        {/* Bottom Pricing Row: Displayed directly on card */}
        <div className="pt-3 border-t border-[#c9a24b]/20 flex items-center justify-between gap-2">
          {item.prices && item.prices.length > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full">
              {item.prices.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="flex-1 min-w-[70px] flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0e261f] border border-[#c9a24b]/20"
                >
                  <span className="text-[11px] text-[#8fa89b] font-medium">
                    {isAr ? p.label_ar : p.label_en}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-bold text-[#dfbe6f] tabular-nums text-sm sm:text-base">
                      {p.price}
                    </span>
                    <span className="text-[9px] text-[#8fa89b]">{currency}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#8fa89b]">
                {isAr ? 'السعر' : 'Price'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold text-[#dfbe6f] tabular-nums">
                  {item.price}
                </span>
                <span className="text-xs text-[#8fa89b] font-medium">{currency}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
});

ProductCard.displayName = 'ProductCard';
