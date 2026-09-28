import React from 'react';

export type LogoVariant =
  | 'navbar'
  | 'hero'
  | 'footer'
  | 'cup-stamp'
  | 'dish-stamp'
  | 'dish-inline'
  | 'badge'
  | 'raw-icon';

interface LagunaLogoProps {
  variant?: LogoVariant;
  className?: string;
  isAr?: boolean;
}

/**
 * Official LAGUNA DUBAI Logo Component
 * Unified with the official logo assets (/laguna-logo.svg and /favicon.svg)
 * used across the Navbar, Hero, Footer, and product cards.
 */
export const LagunaLogo: React.FC<LagunaLogoProps> = ({
  variant = 'navbar',
  className = '',
  isAr = false,
}) => {
  // 1. Raw Icon Mark
  if (variant === 'raw-icon') {
    return (
      <img
        src="/laguna-logo.svg"
        alt="LAGUNA DUBAI"
        className={`w-8 h-8 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(201,162,75,0.35)] select-none ${className}`}
      />
    );
  }

  // 2. Cup Stamp (Brand seal on drinks/cups)
  if (variant === 'cup-stamp') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#030d0a]/95 backdrop-blur-md border border-[#c9a24b]/40 shadow-lg shadow-black/80 group-hover:border-[#dfbe6f] transition-all transform-gpu cursor-pointer select-none ${className}`}
        title="LAGUNA DUBAI"
      >
        <img
          src="/laguna-logo.svg"
          alt=""
          className="w-4 h-4 object-contain brightness-110 drop-shadow"
        />
        <span className="text-[10px] font-bold tracking-widest text-[#dfbe6f] uppercase font-serif-brand">
          LAGUNA
        </span>
      </div>
    );
  }

  // 3. Dish Stamp (Brand seal on gourmet dish photos)
  if (variant === 'dish-stamp') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#030d0a]/95 backdrop-blur-md border border-[#c9a24b]/40 shadow-lg shadow-black/80 group-hover:border-[#dfbe6f] transition-all transform-gpu cursor-pointer select-none ${className}`}
        title="LAGUNA DUBAI"
      >
        <img
          src="/laguna-logo.svg"
          alt=""
          className="w-4 h-4 object-contain brightness-110 drop-shadow"
        />
        <span className="text-[10px] font-bold tracking-widest text-[#dfbe6f] uppercase font-serif-brand">
          DUBAI
        </span>
      </div>
    );
  }

  // 4. Dish Inline (Brand crest next to product titles)
  if (variant === 'dish-inline') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#0a1e18] border border-[#c9a24b]/30 text-[10px] text-[#dfbe6f] font-serif-brand font-semibold select-none ${className}`}
        title="LAGUNA DUBAI"
      >
        <img
          src="/laguna-logo.svg"
          alt=""
          className="w-3.5 h-3.5 object-contain inline-block brightness-110"
        />
        <span className="tracking-wider">LAGUNA</span>
      </span>
    );
  }

  // 5. Badge Variant (Used in management / headers)
  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#0a1e18] to-[#030d0a] border border-[#c9a24b]/40 flex items-center justify-center p-1.5 shadow-md shadow-black/60">
          <img
            src="/laguna-logo.svg"
            alt="LAGUNA DUBAI"
            className="w-full h-full object-contain drop-shadow"
          />
        </div>
        <div className="flex flex-col text-start">
          <span className="text-xs font-bold tracking-widest text-[#f7f4ea] font-serif-brand uppercase">
            LAGUNA DUBAI
          </span>
          <span className="text-[10px] text-[#dfbe6f]">
            {isAr ? 'المطعم والكافيه' : 'Restaurant & Café'}
          </span>
        </div>
      </div>
    );
  }

  // 6. Navbar Variant
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-[#0a1e18] to-[#020a07] border border-[#c9a24b]/45 flex items-center justify-center p-1.5 shadow-md shadow-black/80 hover:border-[#dfbe6f] transition-all shrink-0">
          <img
            src="/laguna-logo.svg"
            alt="LAGUNA DUBAI"
            className="w-full h-full object-contain"
          />
        </div>
        <span className={`text-base sm:text-xl font-bold tracking-wider text-[#f7f4ea] group-hover:text-[#dfbe6f] transition-colors leading-none ${isAr ? 'font-arabic-brand' : 'font-serif-brand uppercase'}`}>
          {isAr ? 'لاجونا' : 'LAGUNA'}
        </span>
      </div>
    );
  }

  // 7. Hero Variant (Majestic emblem for landing section)
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none mb-3 ${className}`}>
        <div className="relative group transition-transform duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-[#c9a24b]/20 blur-2xl rounded-full scale-125 pointer-events-none" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-[#0a1e18]/90 via-[#051510]/95 to-[#020a07] border border-[#c9a24b]/50 p-2.5 sm:p-3 shadow-2xl shadow-black flex items-center justify-center backdrop-blur-md">
            <img
              src="/favicon.svg"
              alt="LAGUNA DUBAI Official Emblem"
              className="w-full h-full object-contain drop-shadow-[0_4px_24px_rgba(201,162,75,0.45)]"
            />
          </div>
        </div>
      </div>
    );
  }

  // 8. Footer Variant (Warm champagne gold brand mark with official logo)
  if (variant === 'footer') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#0a1e18] to-[#020a07] border border-[#c9a24b]/35 hover:border-[#dfbe6f] flex items-center justify-center p-2.5 shadow-xl shadow-black/80 transition-all mb-2">
          <img
            src="/laguna-logo.svg"
            alt="LAGUNA DUBAI"
            className="w-full h-full object-contain drop-shadow-[0_2px_12px_rgba(201,162,75,0.45)]"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src="/laguna-logo.svg"
      alt="LAGUNA DUBAI"
      className={`w-10 h-10 object-contain ${className}`}
    />
  );
};
