import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Utensils, Wine, Camera, Sparkles } from 'lucide-react';
import { EASE_OUT_EXPO } from '../animations/variants';

interface ProductImageProps {
  src: string;
  alt: string;
  layoutId?: string;
  className?: string;
  aspectRatioClass?: string;
  isFood?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
}

// In-memory module cache: once an image is seen or loaded, it renders with 0ms delay without skeleton
const loadedImagesCache = new Set<string>();

/**
 * Optimizes image URLs for lightning-fast display in the menu:
 * - Downsamples 900x900 pollinations URLs to 560x350 (75% less data, exact card aspect ratio).
 * - Routes via server-side persistent image cache (/api/image-cache) with immutable caching.
 */
function getOptimizedImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('data:image/')) return rawUrl;
  if (rawUrl.startsWith('/uploads/')) return rawUrl;

  let target = rawUrl;
  // If already an Unsplash CDN image, load directly with optimal responsive parameters
  if (target.includes('images.unsplash.com')) {
    if (target.includes('?')) {
      const base = target.split('?')[0];
      return `${base}?auto=format&fit=crop&w=640&q=80`;
    }
    return `${target}?auto=format&fit=crop&w=640&q=80`;
  }

  // Pollinations URLs
  if (target.includes('image.pollinations.ai')) {
    target = target.replace(/width=\d+&height=\d+/, 'width=560&height=350');
    if (!target.includes('width=')) {
      target += (target.includes('?') ? '&' : '?') + 'width=560&height=350&nologo=true';
    }
  }

  if (target.startsWith('http://') || target.startsWith('https://')) {
    return `/api/image-cache?url=${encodeURIComponent(target)}`;
  }
  return target;
}

/**
 * High-performance, zero-CLS Product Image Component
 *
 * Optimizations:
 * 1. Module-level in-memory cache for 0ms re-renders without layout shift.
 * 2. High-speed local server caching proxy (/api/image-cache) serving 5ms cached responses.
 * 3. Priority loading for initial viewport items (loading="eager" + fetchPriority="high").
 * 4. Automatic fallback to direct URL if proxy is unavailable.
 */
export const ProductImage: React.FC<ProductImageProps> = React.memo(({
  src,
  alt,
  layoutId,
  className = '',
  aspectRatioClass = 'aspect-[16/10]',
  isFood = true,
  priority = false,
  width = 560,
  height = 350,
}) => {
  const optimizedUrl = useMemo(() => getOptimizedImageUrl(src), [src]);
  const [currentSrc, setCurrentSrc] = useState<string>(optimizedUrl);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => loadedImagesCache.has(optimizedUrl) || loadedImagesCache.has(src));
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // If initial src changes, update optimized target
  useEffect(() => {
    const nextUrl = getOptimizedImageUrl(src);
    setCurrentSrc(nextUrl);
    setTriedFallback(false);
    if (loadedImagesCache.has(nextUrl) || loadedImagesCache.has(src)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
    setHasError(false);
  }, [src]);

  // Check if browser already has the image decoded in memory
  useEffect(() => {
    if (imgRef.current && (imgRef.current.complete || loadedImagesCache.has(currentSrc) || loadedImagesCache.has(src))) {
      loadedImagesCache.add(currentSrc);
      loadedImagesCache.add(src);
      setIsLoaded(true);
    }
  }, [currentSrc, src]);

  const handleLoad = useCallback(() => {
    loadedImagesCache.add(currentSrc);
    loadedImagesCache.add(src);
    setIsLoaded(true);
    setHasError(false);
  }, [currentSrc, src]);

  const handleError = useCallback(() => {
    if (!triedFallback && currentSrc.startsWith('/api/image-cache')) {
      setTriedFallback(true);
      setCurrentSrc(src);
    } else {
      setHasError(true);
    }
  }, [currentSrc, src, triedFallback]);

  const FallbackIcon = isFood ? Utensils : Wine;

  // Refined, silky-smooth Motion variants for image hover with measured delay
  const imageHoverVariants: Variants = useMemo(
    () => ({
      initial: {
        scale: 1,
        filter: 'brightness(1)',
        transition: {
          duration: 0.55,
          ease: EASE_OUT_EXPO,
        },
      },
      hover: {
        scale: shouldReduceMotion ? 1 : 1.036,
        filter: 'brightness(1.04)',
        transition: {
          duration: 0.65,
          delay: 0.08, // Subtle, measured delay requested by user
          ease: EASE_OUT_EXPO, // Silky luxury ease-out-expo
        },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <div
      className={`relative overflow-hidden bg-[#030d0a] ${aspectRatioClass} ${className} select-none`}
      style={{
        contentVisibility: priority ? 'visible' : 'auto',
        containIntrinsicSize: `${width}px ${height}px`,
      }}
    >
      {/* 1. Low-cost subtle shimmer skeleton while image is loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#04120e] flex flex-col items-center justify-center p-3 text-center z-0 overflow-hidden">
          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-[#c9a24b]/12 to-transparent pointer-events-none" />
          <div className="w-10 h-10 rounded-full bg-[#0a1e18] border border-[#c9a24b]/30 flex items-center justify-center mb-1.5 shadow-inner">
            <FallbackIcon size={18} className="text-[#c9a24b]/80 animate-pulse" />
          </div>
          <span className="text-[9px] tracking-widest text-[#dfbe6f]/70 uppercase font-serif-brand">
            LAGUNA DUBAI
          </span>
        </div>
      )}

      {/* 2. Tasteful branded placeholder card (Deep Emerald background + Gold plate/fork icon) */}
      {hasError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#071d16] via-[#030d0a] to-[#020a07] flex flex-col items-center justify-center p-3 text-center border border-[#c9a24b]/20 group">
          {/* Subtle decorative background pattern */}
          <div className="absolute inset-2 border border-dashed border-[#c9a24b]/15 rounded-xl pointer-events-none" />

          {/* Gold Plate/Fork or Drink Insignia */}
          <div className="relative w-12 h-12 rounded-full bg-[#0a1e18] border border-[#c9a24b]/40 flex items-center justify-center mb-2 shadow-lg shadow-black/80 group-hover:scale-105 transition-transform duration-300">
            <FallbackIcon size={22} className="text-[#dfbe6f]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c9a24b] text-[#030d0a] flex items-center justify-center shadow">
              <Camera size={9} />
            </div>
          </div>

          <span className="relative text-[11px] font-bold text-[#dfbe6f] font-serif-brand tracking-wider uppercase">
            LAGUNA DUBAI
          </span>

          {/* Clearly-marked tasteful indicator that photo is pending */}
          <div className="relative mt-1 px-2.5 py-0.5 rounded-full bg-[#0f2b23]/90 border border-[#c9a24b]/30 inline-flex items-center gap-1 shadow-sm">
            <Sparkles size={9} className="text-[#c9a24b]" />
            <span className="text-[9px] text-[#dfbe6f] font-medium tracking-wide">
              قريباً صُوَر الصنف
            </span>
          </div>

          <span className="relative text-[10px] text-[#8fa89b]/70 mt-1 max-w-[150px] truncate">
            {alt}
          </span>
        </div>
      ) : (
        /* 3. Real Product Photography Image with Motion silky smooth hover & delay */
        <motion.img
          ref={imgRef}
          layoutId={shouldReduceMotion ? undefined : layoutId}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          variants={imageHoverVariants}
          initial="initial"
          whileHover="hover"
          animate="initial"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover object-center transform-gpu will-change-transform ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Measured vignette scrim to enhance card typography contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030d0a]/90 via-transparent to-black/20 pointer-events-none" />

      {/* Subtle luxury edge glow */}
      <div className="absolute inset-0 border border-white/5 rounded-t-2xl pointer-events-none" />
    </div>
  );
});

ProductImage.displayName = 'ProductImage';
