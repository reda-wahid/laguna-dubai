/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { MainSection, MenuItem, Language, RESTAURANT_INFO } from './data/menuData';
import { getStoredMenuData } from './data/menuStore';
import {
  UtensilsCrossed,
  Wine,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  CornerDownLeft,
} from 'lucide-react';
import { EASE_OUT_EXPO, TAP_SCALE } from './animations/variants';

// Code Splitting: Lazy load modal interfaces
const AdminPanel = React.lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
const SearchBar = React.lazy(() =>
  import('./components/SearchBar').then((m) => ({ default: m.SearchBar }))
);
const CategoryDrawer = React.lazy(() =>
  import('./components/CategoryDrawer').then((m) => ({ default: m.CategoryDrawer }))
);

export default function App() {
  const shouldReduceMotion = useReducedMotion();

  // Menu data state with persistence in localStorage
  const [menuData, setMenuData] = useState<MainSection[]>(() => getStoredMenuData());

  // Ensure the menu always starts from the very top on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Listen to menu updates in real-time across tabs and SSE
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEv = e as CustomEvent<MainSection[]>;
      if (customEv.detail && Array.isArray(customEv.detail) && customEv.detail.length > 0) {
        setMenuData(customEv.detail);
      } else {
        setMenuData(getStoredMenuData());
      }
    };
    window.addEventListener('laguna-menu-updated', handleUpdate);
    return () => window.removeEventListener('laguna-menu-updated', handleUpdate);
  }, []);

  // Default language is Arabic
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('laguna_lang');
      if (saved === 'en' || saved === 'ar') return saved;
    }
    return 'ar';
  });

  const [activeMainTab, setActiveMainTab] = useState<'food' | 'drinks'>('food');
  const [activeFoodCategory, setActiveFoodCategory] = useState<string>('crepes');
  const [activeDrinksCategory, setActiveDrinksCategory] = useState<string>('fresh-juices');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Admin panel open state driven by URL route /admin-laguna, #/admin-laguna, or ?admin=1
  const checkIsAdminRoute = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.includes('admin-laguna') ||
      hash.includes('admin-laguna') ||
      search.includes('admin=1')
    );
  }, []);

  const [adminOpen, setAdminOpen] = useState<boolean>(() => checkIsAdminRoute());

  // Listen to browser navigation & URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setAdminOpen(true);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [checkIsAdminRoute]);

  const handleCloseAdmin = useCallback(() => {
    setAdminOpen(false);
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('admin-laguna')) {
        const cleaned = window.location.pathname.replace(/\/admin-laguna\/?/, '/') || '/';
        window.history.pushState(null, '', cleaned);
      }
      if (window.location.hash.includes('admin-laguna')) {
        window.history.pushState(null, '', window.location.pathname || '/');
      }
    }
  }, []);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAr = lang === 'ar';

  // Synchronize <html> dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('laguna_lang', lang);
    } catch {
      // ignore
    }
  }, [lang, isAr]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  // Stable tab switch handlers
  const handleSelectMainTab = useCallback((tab: 'food' | 'drinks') => {
    setActiveMainTab(tab);
    setSearchQuery('');
  }, []);

  const handleToggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
    setSearchQuery('');
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // Get current main section from reactive state
  const currentSection = useMemo(() => {
    return menuData.find((s) => s.id === activeMainTab) || menuData[0];
  }, [menuData, activeMainTab]);

  // Counts for Food and Drinks
  const foodCount = useMemo(() => {
    const sec = menuData.find((s) => s.id === 'food');
    return sec ? sec.subcategories.reduce((acc, c) => acc + c.items.length, 0) : 0;
  }, [menuData]);

  const drinksCount = useMemo(() => {
    const sec = menuData.find((s) => s.id === 'drinks');
    return sec ? sec.subcategories.reduce((acc, c) => acc + c.items.length, 0) : 0;
  }, [menuData]);

  const activeCategoryId = activeMainTab === 'food' ? activeFoodCategory : activeDrinksCategory;

  // Robust smooth scroll to top of viewport across all devices and iframe containers
  const scrollToTopSmoothly = useCallback(() => {
    if (typeof window === 'undefined') return;

    const performScroll = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.body.scrollTop = 0;
      }
    };

    performScroll();
    requestAnimationFrame(() => {
      performScroll();
      setTimeout(performScroll, 50);
      setTimeout(performScroll, 160);
    });
  }, []);

  const setActiveCategoryId = useCallback(
    (id: string) => {
      if (activeMainTab === 'food') {
        setActiveFoodCategory(id);
      } else {
        setActiveDrinksCategory(id);
      }
    },
    [activeMainTab]
  );

  // Active subcategory object
  const currentSubCategory = useMemo(() => {
    return (
      currentSection.subcategories.find((c) => c.id === activeCategoryId) ||
      currentSection.subcategories[0]
    );
  }, [currentSection, activeCategoryId]);

  // Preload images of the current subcategory into browser cache for instant rendering
  useEffect(() => {
    if (typeof window === 'undefined' || !currentSubCategory) return;
    const itemsToPreload = currentSubCategory.items.slice(0, 10);
    itemsToPreload.forEach((item) => {
      if (item.image) {
        let target = item.image;
        if (target.includes('image.pollinations.ai')) {
          target = target.replace(/width=\d+&height=\d+/, 'width=560&height=350');
          if (!target.includes('width=')) {
            target += (target.includes('?') ? '&' : '?') + 'width=560&height=350&nologo=true';
          }
        }
        const img = new Image();
        img.src = `/api/image-cache?url=${encodeURIComponent(target)}`;
      }
    });
  }, [currentSubCategory]);

  // Global search filtering across both food & drinks with category identifiers
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();

    const matches: Array<{
      item: MenuItem;
      categoryId: string;
      categoryName_en: string;
      categoryName_ar: string;
      sectionId: 'food' | 'drinks';
    }> = [];

    menuData.forEach((sec) => {
      sec.subcategories.forEach((cat) => {
        cat.items.forEach((item) => {
          const matchEn =
            item.name_en.toLowerCase().includes(query) ||
            (item.desc_en && item.desc_en.toLowerCase().includes(query));
          const matchAr =
            item.name_ar.includes(query) ||
            (item.desc_ar && item.desc_ar.includes(query));

          if (matchEn || matchAr) {
            matches.push({
              item,
              categoryId: cat.id,
              categoryName_en: cat.name_en,
              categoryName_ar: cat.name_ar,
              sectionId: sec.id,
            });
          }
        });
      });
    });

    return matches;
  }, [searchQuery, menuData]);

  // Direct smooth navigation to a searched item in the live menu
  const handleNavigateToItem = useCallback(
    (sectionId: 'food' | 'drinks', categoryId: string, itemId: string) => {
      setActiveMainTab(sectionId);
      if (sectionId === 'food') {
        setActiveFoodCategory(categoryId);
      } else {
        setActiveDrinksCategory(categoryId);
      }
      setSearchOpen(false);
      setSearchQuery('');

      // Allow DOM to settle and render target item
      setTimeout(() => {
        const targetEl = document.getElementById(`product-card-${itemId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.remove('search-target-highlight');
          // Force reflow
          void targetEl.offsetWidth;
          targetEl.classList.add('search-target-highlight');
          setTimeout(() => {
            targetEl.classList.remove('search-target-highlight');
          }, 3000);
        } else {
          const menuAnchor = document.getElementById('menu-content-anchor');
          menuAnchor?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    },
    []
  );

  // Next subcategory in line for fluid browsing
  const nextSubcategory = useMemo(() => {
    const list = currentSection.subcategories;
    const currentIndex = list.findIndex((c) => c.id === currentSubCategory.id);
    if (currentIndex >= 0 && currentIndex < list.length - 1) {
      return list[currentIndex + 1];
    }
    return null;
  }, [currentSection, currentSubCategory]);

  const handleOpenDrawer = useCallback(() => setDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="min-h-screen bg-[#030d0a] text-[#f7f4ea] flex flex-col font-sans selection:bg-[#c9a24b]/30 selection:text-[#faedd0] pb-16 sm:pb-0">
      {/* Sticky Top Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLanguage}
        searchOpen={searchOpen}
        onToggleSearch={handleToggleSearch}
        onOpenDrawer={handleOpenDrawer}
      />

      {/* Expandable Live Search Bar with Lazy Loaded Component */}
      <AnimatePresence>
        {searchOpen && (
          <Suspense fallback={null}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              lang={lang}
              onClose={handleCloseSearch}
              resultCount={searchResults.length}
              matches={searchResults}
              onNavigateToItem={handleNavigateToItem}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Language Crossfade Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: EASE_OUT_EXPO }}
          className="flex-1 flex flex-col"
        >
          {/* Professional, Distinctive Laguna Dubai Waterfront Hero */}
          <Hero
            lang={lang}
            activeMainTab={activeMainTab}
            foodCount={foodCount}
            drinksCount={drinksCount}
            onSelectMainTab={(tab) => {
              setActiveMainTab(tab);
              scrollToTopSmoothly();
            }}
          />

          {/* Subcategory Sliding Tabs with Smooth Horizontal Scroll & Directory trigger */}
          {!searchQuery && (
            <CategoryTabs
              categories={currentSection.subcategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={(id) => {
                setActiveCategoryId(id);
                scrollToTopSmoothly();
              }}
              onOpenDirectory={handleOpenDrawer}
              lang={lang}
            />
          )}

          {/* Main Content Area: Details rendered directly on cards */}
          <main id="menu-content-anchor" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <AnimatePresence mode="wait">
              {searchQuery ? (
                /* Search Results Mode with direct jump capabilities and smooth Not Found state */
                <motion.div
                  key="search-results-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: EASE_OUT_EXPO }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#c9a24b]/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#f7f4ea]">
                      {isAr ? 'نتائج البحث' : 'Search Results'}
                    </h2>
                    <span className="text-xs text-[#dfbe6f] font-semibold tabular-nums">
                      {searchResults.length} {isAr ? 'صنف متطابق' : 'matching items'}
                    </span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-xs text-[#8fa89b]">
                        {isAr
                          ? 'اضغط على زر "انتقال إلى موقعه في المنيو" للتوجه مباشرة إلى القسم المخصص للصنف.'
                          : 'Click any item card or the jump button to navigate directly to its section in the menu.'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-5">
                        {searchResults.map(({ item, sectionId, categoryId, categoryName_ar, categoryName_en }, index) => (
                          <div key={item.id} className="relative flex flex-col">
                            <ProductCard
                              item={item}
                              lang={lang}
                              index={index}
                              isFood={sectionId === 'food'}
                            />
                            {/* Direct Jump Action Button */}
                            <motion.button
                              type="button"
                              whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                              onClick={() => handleNavigateToItem(sectionId, categoryId, item.id)}
                              className="mt-2 w-full py-2 px-3 rounded-xl bg-[#061812] hover:bg-[#0e2d23] border border-[#c9a24b]/30 hover:border-[#dfbe6f] text-[#dfbe6f] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              <CornerDownLeft size={13} className="text-[#c9a24b]" />
                              <span>
                                {isAr
                                  ? `الانتقال إلى موقعه في قسم (${categoryName_ar})`
                                  : `Go to item in (${categoryName_en})`}
                              </span>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Distinctive, Smooth Not Found Presentation */
                    <div className="text-center py-16 px-4 bg-gradient-to-b from-[#0a1e18] to-[#04100c] rounded-3xl border border-[#c9a24b]/30 shadow-2xl max-w-xl mx-auto">
                      <div className="w-16 h-16 rounded-3xl bg-[#030d0a] border border-[#c9a24b]/40 flex items-center justify-center text-[#dfbe6f] mx-auto mb-4 shadow-inner">
                        <Search size={28} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#f7f4ea] mb-1">
                        {isAr ? 'عذراً، هذا الصنف غير موجود في المنيو' : 'No matching items found'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#8fa89b] max-w-md mx-auto leading-relaxed mb-6">
                        {isAr
                          ? 'لم نتمكن من العثور على صنف يطابق بحثك. يمكنك تجربة كلمة أخرى أو تصفح الأقسام المميزة مباشرة بالأسفل:'
                          : 'We could not find any dish or drink matching your query. Explore our top menu sections below:'}
                      </p>

                      {/* Quick Category Suggestion Chips */}
                      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                        {[
                          { id: 'crepes', name_ar: 'الكريبات', name_en: 'Crepes', sec: 'food' as const },
                          { id: 'combo', name_ar: 'وجبات الكومبو', name_en: 'Combo', sec: 'food' as const },
                          { id: 'pizza', name_ar: 'البيتزا', name_en: 'Pizza', sec: 'food' as const },
                          { id: 'sandwiches', name_ar: 'الساندوتشات', name_en: 'Sandwiches', sec: 'food' as const },
                          { id: 'desserts', name_ar: 'الحلويات', name_en: 'Desserts', sec: 'food' as const },
                          { id: 'fresh-juices', name_ar: 'عصائر فريش', name_en: 'Fresh Juices', sec: 'drinks' as const },
                          { id: 'coffee', name_ar: 'قهوة', name_en: 'Coffee', sec: 'drinks' as const },
                          { id: 'soda-mojito', name_ar: 'موهيتو الصودا', name_en: 'Soda Mojito', sec: 'drinks' as const },
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => {
                              setActiveMainTab(chip.sec);
                              if (chip.sec === 'food') setActiveFoodCategory(chip.id);
                              else setActiveDrinksCategory(chip.id);
                              setSearchQuery('');
                              setSearchOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#030d0a] hover:bg-[#0e2d23] border border-[#c9a24b]/30 hover:border-[#dfbe6f] text-xs text-[#dfbe6f] font-medium transition-colors cursor-pointer"
                          >
                            {isAr ? chip.name_ar : chip.name_en}
                          </button>
                        ))}
                      </div>

                      <motion.button
                        type="button"
                        whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                        onClick={() => setSearchQuery('')}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a24b] to-[#dfbe6f] hover:from-[#dfbe6f] hover:to-[#c9a24b] text-[#030d0a] text-xs font-bold cursor-pointer shadow-lg shadow-black/60 transition-all"
                      >
                        {isAr ? 'عرض القائمة الكاملة' : 'Clear search and view all'}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Category Browse Mode */
                <motion.div
                  key={`${activeMainTab}-${currentSubCategory.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: EASE_OUT_EXPO }}
                  className="space-y-6"
                >
                  {/* Category Title Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#c9a24b]/20">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#dfbe6f] uppercase tracking-wider mb-1">
                        {activeMainTab === 'food' ? (
                          <UtensilsCrossed size={14} className="text-[#c9a24b]" />
                        ) : (
                          <Wine size={14} className="text-[#c9a24b]" />
                        )}
                        <span>{isAr ? currentSection.name_ar : currentSection.name_en}</span>
                        <span className="text-[#c9a24b]/40">·</span>
                        <span className="text-[#8fa89b]">
                          {isAr ? currentSubCategory.name_ar : currentSubCategory.name_en}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f4ea] tracking-tight">
                        {isAr ? currentSubCategory.name_ar : currentSubCategory.name_en}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8fa89b] tabular-nums">
                        {currentSubCategory.items.length} {isAr ? 'صنف متوفر' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Grid of Product Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-5">
                    {currentSubCategory.items.map((item, index) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        lang={lang}
                        index={index}
                        isFood={activeMainTab === 'food'}
                      />
                    ))}
                  </div>

                  {/* Fluid Next Category Navigation Teaser */}
                  {nextSubcategory ? (
                    <div className="pt-8 pb-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategoryId(nextSubcategory.id);
                          scrollToTopSmoothly();
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0a1e18] hover:bg-[#123329] border border-[#c9a24b]/30 hover:border-[#dfbe6f] text-xs font-bold text-[#dfbe6f] transition-all cursor-pointer shadow-md group"
                      >
                        <span>
                          {isAr
                            ? `الانتقال إلى القسم التالي: ${nextSubcategory.name_ar}`
                            : `Next Category: ${nextSubcategory.name_en}`}
                        </span>
                        {isAr ? (
                          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        ) : (
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    </div>
                  ) : (
                    activeMainTab === 'food' && (
                      <div className="pt-8 pb-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMainTab('drinks');
                            setActiveDrinksCategory('fresh-juices');
                            scrollToTopSmoothly();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0a1e18] to-[#123329] hover:from-[#123329] hover:to-[#1a473a] border border-[#c9a24b]/40 hover:border-[#dfbe6f] text-xs font-bold text-[#dfbe6f] transition-all cursor-pointer shadow-md group"
                        >
                          <span>
                            {isAr
                              ? 'الانتقال إلى القسم التالي: المشروبات والعصائر'
                              : 'Next: Drinks & Fresh Juices'}
                          </span>
                          {isAr ? (
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                          ) : (
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          )}
                        </button>
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer (Admin link removed as requested) */}
          <Footer lang={lang} />
        </motion.div>
      </AnimatePresence>

      {/* Quick Category Directory Drawer (Lazy Loaded) */}
      <Suspense fallback={null}>
        {drawerOpen && (
          <CategoryDrawer
            isOpen={drawerOpen}
            onClose={handleCloseDrawer}
            categories={currentSection.subcategories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={(id) => {
              setActiveCategoryId(id);
              handleCloseDrawer();
              scrollToTopSmoothly();
            }}
            activeMainTab={activeMainTab}
            onSelectMainTab={setActiveMainTab}
            lang={lang}
          />
        )}
      </Suspense>

      {/* Admin Panel Gatekeeper & Workspace accessed strictly via /admin-laguna URL link (Lazy Loaded) */}
      <Suspense fallback={null}>
        {adminOpen && (
          <AdminPanel
            isOpen={adminOpen}
            onClose={handleCloseAdmin}
            menuData={menuData}
            onMenuUpdated={(newData) => setMenuData(newData)}
            lang={lang}
          />
        )}
      </Suspense>

      {/* Scroll To Top Button */}
      <ScrollToTop lang={lang} />
    </div>
  );
}
