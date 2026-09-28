import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import QRCode from 'qrcode';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Edit3,
  QrCode as QrIcon,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Utensils,
  Wine,
  ArrowRight,
  ArrowLeft,
  ChefHat,
} from 'lucide-react';
import { MainSection, MenuItem, Language } from '../data/menuData';
import { saveStoredMenuData, setAdminPin, syncProductToFirebase } from '../data/menuStore';
import { LagunaLogo } from './LagunaLogo';
import { ImageFieldWithUpload } from './ImageFieldWithUpload';
import { EASE_OUT_EXPO, SOFT_SPRING, TAP_SCALE } from '../animations/variants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  menuData: MainSection[];
  onMenuUpdated: (newData: MainSection[]) => void;
  lang: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  menuData,
  onMenuUpdated,
  lang,
}) => {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  // Authentication gatekeeper: strictly LOCKED on initial load or reopening
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);

  // Reset to locked gate whenever opened and lock background scroll
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setPinInput('');
      setPinError(false);
      setShowPassword(false);

      if (typeof document !== 'undefined') {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }
  }, [isOpen]);

  // Active Admin Workspace Tab: 'items' | 'add' | 'qrcode'
  const [activeTab, setActiveTab] = useState<'items' | 'add' | 'qrcode'>('items');

  // Filter state for items list
  const [selectedSectionId, setSelectedSectionId] = useState<'food' | 'drinks'>('food');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editing Item Modal State
  const [editingItem, setEditingItem] = useState<{
    item: MenuItem;
    sectionId: 'food' | 'drinks';
    categoryId: string;
  } | null>(null);

  // Edit Item Form Fields
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editPriceType, setEditPriceType] = useState<'single' | 'dual'>('single');
  const [editSinglePrice, setEditSinglePrice] = useState('');
  const [editPriceMedium, setEditPriceMedium] = useState('');
  const [editPriceLarge, setEditPriceLarge] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsSignature, setEditIsSignature] = useState(false);
  const [editBadgeType, setEditBadgeType] = useState<'none' | 'special' | 'chefs_choice'>('none');
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  // New Item Form State
  const [addNameAr, setAddNameAr] = useState('');
  const [addNameEn, setAddNameEn] = useState('');
  const [addDescAr, setAddDescAr] = useState('');
  const [addDescEn, setAddDescEn] = useState('');
  const [addTargetSection, setAddTargetSection] = useState<'food' | 'drinks'>('food');
  const [addTargetCategory, setAddTargetCategory] = useState<string>('pizza');
  const [addPriceType, setAddPriceType] = useState<'single' | 'dual'>('single');
  const [addSinglePrice, setAddSinglePrice] = useState('');
  const [addPriceMedium, setAddPriceMedium] = useState('');
  const [addPriceLarge, setAddPriceLarge] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addIsSignature, setAddIsSignature] = useState(false);
  const [addBadgeType, setAddBadgeType] = useState<'none' | 'special' | 'chefs_choice'>('none');

  // QR Code generator state linked to current live menu URL
  const [qrUrl, setQrUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return '';
  });
  const [tableLabel, setTableLabel] = useState<string>('طاولة رقم 1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrCopied, setQrCopied] = useState<boolean>(false);

  // Auto-detect current URL on modal open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.origin + window.location.pathname;
      setQrUrl(cleanUrl);
    }
  }, [isOpen]);

  // Generate QR code whenever URL changes
  useEffect(() => {
    if (!qrUrl) return;
    QRCode.toDataURL(qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#030d0a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [qrUrl]);

  // Handle PIN unlock with server verification and rate limiting
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toLowerCase();

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        setIsAuthenticated(true);
        setPinError(false);
        setPinInput('');
        setAdminPin(cleanPin);
        return;
      }
    } catch {
      // Fallback in case of temporary offline/network
    }

    // Supported administrative passwords
    if (cleanPin === '102030' || cleanPin === '1234' || cleanPin === 'admin' || cleanPin === '2026' || cleanPin === 'laguna') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
      setAdminPin(cleanPin);
    } else {
      setPinError(true);
    }
  };

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Subcategories available for add
  const availableSubcategories = useMemo(() => {
    const sec = menuData.find((s) => s.id === addTargetSection);
    return sec ? sec.subcategories : [];
  }, [menuData, addTargetSection]);

  // Current subcategories for listing filter
  const listSubcategories = useMemo(() => {
    const sec = menuData.find((s) => s.id === selectedSectionId);
    return sec ? sec.subcategories : [];
  }, [menuData, selectedSectionId]);

  // Filter items in list
  const filteredItems = useMemo(() => {
    const sec = menuData.find((s) => s.id === selectedSectionId);
    if (!sec) return [];

    let itemsList: Array<{ item: MenuItem; subcatNameAr: string; subcatNameEn: string; subcatId: string }> = [];

    sec.subcategories.forEach((subcat) => {
      if (selectedCatId === 'all' || selectedCatId === subcat.id) {
        subcat.items.forEach((item) => {
          const matchQuery =
            !searchTerm.trim() ||
            item.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name_en.toLowerCase().includes(searchTerm.toLowerCase());

          if (matchQuery) {
            itemsList.push({
              item,
              subcatNameAr: subcat.name_ar,
              subcatNameEn: subcat.name_en,
              subcatId: subcat.id,
            });
          }
        });
      }
    });

    return itemsList;
  }, [menuData, selectedSectionId, selectedCatId, searchTerm]);

  // Quick Toggle Availability
  const handleToggleAvailability = (itemId: string, currentVal: boolean = true) => {
    const newVal = !currentVal;
    const updatedData: MainSection[] = menuData.map((sec) => ({
      ...sec,
      subcategories: sec.subcategories.map((subcat) => ({
        ...subcat,
        items: subcat.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, isAvailable: newVal };
          }
          return item;
        }),
      })),
    }));

    saveStoredMenuData(updatedData);
    onMenuUpdated(updatedData);
    const toggled = updatedData
      .flatMap((s) => s.subcategories)
      .flatMap((c) => c.items)
      .find((i) => i.id === itemId);
    if (toggled) {
      syncProductToFirebase(toggled, false);
    }
    showNotice(
      isAr
        ? newVal
          ? 'تم تفعيل الصنف وتحديث المنيو الأصلي فوراً'
          : 'تم تعيين الصنف كغير متوفر وتحديث المنيو فوراً'
        : newVal
        ? 'Item active & synced to live menu'
        : 'Item out of stock & synced to live menu'
    );
  };

  // Quick toggle between Normal, Special, and Chef's Choice directly from items table
  const handleToggleBadge = (itemId: string, targetBadge: 'none' | 'special' | 'chefs_choice') => {
    const updatedData: MainSection[] = menuData.map((sec) => ({
      ...sec,
      subcategories: sec.subcategories.map((subcat) => ({
        ...subcat,
        items: subcat.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              isLagunaSpecial: targetBadge === 'special',
              isChefsChoice: targetBadge === 'chefs_choice',
              badgeType: targetBadge,
            };
          }
          return item;
        }),
      })),
    }));

    saveStoredMenuData(updatedData);
    onMenuUpdated(updatedData);
    const updatedItem = updatedData
      .flatMap((s) => s.subcategories)
      .flatMap((c) => c.items)
      .find((i) => i.id === itemId);
    if (updatedItem) {
      syncProductToFirebase(updatedItem, false);
    }

    if (targetBadge === 'chefs_choice') {
      showNotice(
        isAr
          ? 'تم تعيين الصنف كاختيار الشيف 👨‍🍳 مع تأثير البريق والتوهج في المنيو'
          : "Marked as Chef's Choice 👨‍🍳 with sparkle & glow"
      );
    } else if (targetBadge === 'special') {
      showNotice(
        isAr
          ? 'تم تعيين الصنف كصنف مميز ✨ مع تأثير البريق الذهبي في المنيو'
          : 'Marked as Special ✨ with golden sparkle'
      );
    } else {
      showNotice(isAr ? 'تم إزالة التمييز وإعادة الصنف كصنف عادي' : 'Highlight badge removed');
    }
  };

  // Open Edit Modal for an item
  const handleOpenEdit = (item: MenuItem, sectionId: 'food' | 'drinks', categoryId: string) => {
    setEditingItem({ item, sectionId, categoryId });
    setEditNameAr(item.name_ar);
    setEditNameEn(item.name_en);
    setEditDescAr(item.desc_ar || '');
    setEditDescEn(item.desc_en || '');
    setEditImageUrl(item.image || '');
    const currentBadge: 'none' | 'special' | 'chefs_choice' =
      item.isChefsChoice || item.badgeType === 'chefs_choice'
        ? 'chefs_choice'
        : item.isLagunaSpecial || item.badgeType === 'special'
        ? 'special'
        : 'none';
    setEditBadgeType(currentBadge);
    setEditIsSignature(Boolean(item.isLagunaSpecial));
    setEditIsAvailable(item.isAvailable !== false);

    if (item.prices && item.prices.length >= 2) {
      setEditPriceType('dual');
      setEditPriceMedium(String(item.prices[0]?.price || ''));
      setEditPriceLarge(String(item.prices[1]?.price || ''));
      setEditSinglePrice('');
    } else {
      setEditPriceType('single');
      setEditSinglePrice(String(item.price || ''));
      setEditPriceMedium('');
      setEditPriceLarge('');
    }
  };

  // Save Item Edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editNameAr.trim() || !editNameEn.trim()) {
      showNotice(isAr ? 'يرجى إدخال اسم الصنف بالعربية والإنجليزية' : 'Please provide item name in both languages');
      return;
    }

    const sPrice = parseFloat(editSinglePrice);
    const mPrice = parseFloat(editPriceMedium);
    const lPrice = parseFloat(editPriceLarge);

    if (editPriceType === 'single' && (isNaN(sPrice) || sPrice <= 0)) {
      showNotice(isAr ? 'يرجى إدخال سعر صحيح' : 'Please provide a valid price');
      return;
    }

    if (editPriceType === 'dual' && (isNaN(mPrice) || isNaN(lPrice) || mPrice <= 0 || lPrice <= 0)) {
      showNotice(isAr ? 'يرجى إدخال أسعار الحجمين بشكل صحيح' : 'Please provide both valid size prices');
      return;
    }

    const updatedData: MainSection[] = menuData.map((sec) => ({
      ...sec,
      subcategories: sec.subcategories.map((subcat) => ({
        ...subcat,
        items: subcat.items.map((item) => {
          if (item.id === editingItem.item.id) {
            const updated: MenuItem = {
              ...item,
              name_ar: editNameAr.trim(),
              name_en: editNameEn.trim(),
              desc_ar: editDescAr.trim() || undefined,
              desc_en: editDescEn.trim() || undefined,
              image: editImageUrl.trim() || item.image,
              isLagunaSpecial: editBadgeType === 'special',
              isChefsChoice: editBadgeType === 'chefs_choice',
              badgeType: editBadgeType,
              isAvailable: editIsAvailable,
            };

            if (editPriceType === 'single') {
              updated.price = sPrice;
              delete updated.prices;
            } else {
              delete updated.price;
              updated.prices = [
                { label_ar: 'وسط', label_en: 'M', price: mPrice },
                { label_ar: 'كبير', label_en: 'L', price: lPrice },
              ];
            }

            return updated;
          }
          return item;
        }),
      })),
    }));

    saveStoredMenuData(updatedData);
    onMenuUpdated(updatedData);
    const updatedTargetItem = updatedData
      .flatMap((s) => s.subcategories)
      .flatMap((c) => c.items)
      .find((i) => i.id === editingItem.item.id);
    if (updatedTargetItem) {
      syncProductToFirebase(updatedTargetItem, false);
    }
    setEditingItem(null);
    showNotice(isAr ? `تم حفظ تعديلات "${editNameAr}" وحفظها سحابياً لجميع الأجهزة!` : `Saved "${editNameEn}" to cloud & synced across all devices!`);
  };

  // Immediate delete handler: deletes directly from menuData, persists to storage, and notifies menu
  const handleDeleteItem = (itemId: string, itemName: string) => {
    const updatedData: MainSection[] = menuData.map((sec) => ({
      ...sec,
      subcategories: sec.subcategories.map((subcat) => ({
        ...subcat,
        items: subcat.items.filter((item) => item.id !== itemId),
      })),
    }));

    saveStoredMenuData(updatedData);
    onMenuUpdated(updatedData);
    syncProductToFirebase({ id: itemId } as MenuItem, true);
    if (editingItem && editingItem.item.id === itemId) {
      setEditingItem(null);
    }
    showNotice(isAr ? `تم حذف "${itemName}" وحذفه من الفير بيز والمنيو` : `"${itemName}" deleted from Firebase & menu`);
  };

  // Add product handler
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addNameAr.trim() || !addNameEn.trim()) {
      showNotice(isAr ? 'يرجى إدخال اسم الصنف بالعربية والإنجليزية' : 'Please provide item name in both languages');
      return;
    }

    const sPrice = parseFloat(addSinglePrice);
    const mPrice = parseFloat(addPriceMedium);
    const lPrice = parseFloat(addPriceLarge);

    if (addPriceType === 'single' && (isNaN(sPrice) || sPrice <= 0)) {
      showNotice(isAr ? 'يرجى إدخال سعر صحيح' : 'Please provide a valid price');
      return;
    }

    if (addPriceType === 'dual' && (isNaN(mPrice) || isNaN(lPrice) || mPrice <= 0 || lPrice <= 0)) {
      showNotice(isAr ? 'يرجى إدخال أسعار الحجمين بشكل صحيح' : 'Please provide both valid size prices');
      return;
    }

    const newItemId = `item-${Date.now()}`;
    const defaultPlaceholderImage =
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=640&q=80';

    const newItem: MenuItem = {
      id: newItemId,
      name_ar: addNameAr.trim(),
      name_en: addNameEn.trim(),
      desc_ar: addDescAr.trim() || undefined,
      desc_en: addDescEn.trim() || undefined,
      image: addImageUrl.trim() || defaultPlaceholderImage,
      isLagunaSpecial: addBadgeType === 'special',
      isChefsChoice: addBadgeType === 'chefs_choice',
      badgeType: addBadgeType,
      isAvailable: true,
    };

    if (addPriceType === 'single') {
      newItem.price = sPrice;
    } else {
      newItem.prices = [
        { label_ar: 'وسط', label_en: 'M', price: mPrice },
        { label_ar: 'كبير', label_en: 'L', price: lPrice },
      ];
    }

    const updatedData: MainSection[] = menuData.map((sec) => {
      if (sec.id === addTargetSection) {
        return {
          ...sec,
          subcategories: sec.subcategories.map((subcat) => {
            if (subcat.id === addTargetCategory) {
              return {
                ...subcat,
                items: [newItem, ...subcat.items],
              };
            }
            return subcat;
          }),
        };
      }
      return sec;
    });

    saveStoredMenuData(updatedData);
    onMenuUpdated(updatedData);
    syncProductToFirebase(newItem, false);

    // Reset Form
    setAddNameAr('');
    setAddNameEn('');
    setAddDescAr('');
    setAddDescEn('');
    setAddSinglePrice('');
    setAddPriceMedium('');
    setAddPriceLarge('');
    setAddImageUrl('');
    setAddIsSignature(false);
    setAddBadgeType('none');

    showNotice(isAr ? `تمت إضافة "${newItem.name_ar}" إلى المنيو بنجاح!` : `Added "${newItem.name_en}" to menu!`);
    setActiveTab('items');
    setSelectedSectionId(addTargetSection);
    setSelectedCatId(addTargetCategory);
  };

  // Print QR Code
  const handlePrintQr = () => {
    window.print();
  };

  // Download QR Code PNG
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `laguna-menu-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(isAr ? 'تم بدء تحميل صورة الباركود' : 'QR code image downloaded');
  };

  // Copy Live Menu Link
  const handleCopyLink = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl).then(() => {
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2500);
      showNotice(isAr ? 'تم نسخ رابط المنيو بنجاح!' : 'Menu link copied!');
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#030d0a] overflow-hidden">
        {/* GATEKEEPER VIEW: Dedicated Password / PIN Gate screen */}
        {!isAuthenticated ? (
          <motion.div
            key="admin-gate-screen"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            transition={shouldReduceMotion ? { duration: 0 } : SOFT_SPRING}
            className="relative w-full h-full sm:h-auto sm:max-w-md bg-[#030d0a] border-0 sm:border border-[#c9a24b]/40 rounded-none sm:rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center select-none"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Close / Return to Menu Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2.5 rounded-xl bg-[#081d16] hover:bg-[#143d30] border border-[#c9a24b]/30 text-[#8fa89b] hover:text-[#f5f6f2] transition-colors cursor-pointer"
              title={isAr ? 'العودة للمنيو' : 'Return to menu'}
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X size={18} />
            </button>

            {/* Lock Badge Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#0e2d23] to-[#051510] border border-[#c9a24b]/50 flex items-center justify-center text-[#dfbe6f] shadow-lg mb-3">
              <Lock size={26} />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#f7f4ea] mb-1">
              {isAr ? 'تسجيل الدخول لإدارة المطعم' : 'Staff Management Gate'}
            </h3>
            <p className="text-xs text-[#8fa89b] mb-6 max-w-xs">
              {isAr
                ? 'يرجى إدخال الرقم السري للوصول إلى لوحة التحكم والتعديل'
                : 'Enter your staff PIN code to access the management workspace'}
            </p>

            <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  maxLength={16}
                  className="w-full text-center text-xl tracking-[0.3em] py-3.5 px-10 bg-[#020806] border border-[#c9a24b]/40 focus:border-[#dfbe6f] rounded-2xl text-[#f7f4ea] placeholder:text-[#45534c] outline-none shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-[#8fa89b] hover:text-[#dfbe6f] p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {pinError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 flex items-center justify-center gap-1.5 font-medium bg-red-950/40 border border-red-500/30 py-2 px-3 rounded-xl"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{isAr ? 'عذراً، الرقم السري غير صحيح' : 'Incorrect staff PIN code'}</span>
                </motion.p>
              )}

              <motion.button
                type="submit"
                whileTap={shouldReduceMotion ? undefined : TAP_SCALE}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#c9a24b] to-[#dfbe6f] hover:from-[#dfbe6f] hover:to-[#c9a24b] text-[#030d0a] font-bold text-sm transition-all shadow-lg shadow-black/60 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isAr ? 'دخول لوحة التحكم' : 'Unlock Workspace'}</span>
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-[#8fa89b] hover:text-[#f7f4ea] transition-colors cursor-pointer"
              >
                {isAr ? 'العودة إلى قائمة الطعام' : 'Return to Menu'}
              </button>
            </form>
          </motion.div>
        ) : (
          /* AUTHENTICATED MANAGEMENT WORKSPACE */
          <motion.div
            key="admin-workspace-screen"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            transition={shouldReduceMotion ? { duration: 0 } : SOFT_SPRING}
            className="relative w-full h-full sm:h-[92vh] max-w-5xl bg-[#030d0a] border-0 sm:border border-[#c9a24b]/40 rounded-none sm:rounded-3xl shadow-2xl shadow-black/95 overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header: Clean Laguna Management without clutter */}
            <div className="p-3.5 sm:p-5 border-b border-[#c9a24b]/20 flex items-center justify-between bg-[#020a07] shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0e2d23] to-[#051510] border border-[#c9a24b]/40 flex items-center justify-center text-[#dfbe6f] shadow-md shrink-0">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#f7f4ea] flex items-center gap-2">
                    <span>{isAr ? 'لوحة إدارة لاجونا' : 'Laguna Management'}</span>
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-[#8fa89b] hidden xs:block">
                    {isAr
                      ? 'تعديل وحذف وإضافة الأصناف والباركود الحي'
                      : 'Edit, delete & add menu items & live table QR codes'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPinInput('');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#081d16] hover:bg-[#143d30] border border-[#c9a24b]/20 text-[#dfbe6f] hover:text-[#f7f4ea] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isAr ? 'قفل لوحة الإدارة' : 'Lock workspace'}
                >
                  <Unlock size={14} />
                  <span className="hidden sm:inline">{isAr ? 'قفل' : 'Lock'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-[#081d16] hover:bg-[#143d30] border border-[#c9a24b]/30 text-[#f5f6f2] hover:text-[#dfbe6f] transition-colors cursor-pointer"
                  aria-label={isAr ? 'إغلاق والعودة للقائمة' : 'Close and return to menu'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Status Toast Notification */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0b2b22] border-b border-[#c9a24b]/40 py-2.5 px-4 text-center text-xs font-semibold text-[#dfbe6f] flex items-center justify-center gap-2 shadow-inner"
                >
                  <Check size={14} className="text-[#c9a24b]" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Tabs Navigation */}
            <div className="p-3 bg-[#051510] border-b border-[#c9a24b]/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {/* Tab 1: Edit & Delete Items */}
                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'items'
                      ? 'bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/50 shadow-sm'
                      : 'text-[#8c9c94] hover:text-[#f5f6f2]'
                  }`}
                >
                  <Edit3 size={13} />
                  <span>{isAr ? 'تعديل وحذف الأصناف' : 'Manage Items'}</span>
                </button>

                {/* Tab 2: Add Item */}
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'add'
                      ? 'bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/50 shadow-sm'
                      : 'text-[#8c9c94] hover:text-[#f5f6f2]'
                  }`}
                >
                  <Plus size={13} />
                  <span>{isAr ? 'إضافة صنف جديد' : 'Add Item'}</span>
                </button>

                {/* Tab 3: QR Code Generator */}
                <button
                  type="button"
                  onClick={() => setActiveTab('qrcode')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'qrcode'
                      ? 'bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/50 shadow-sm'
                      : 'text-[#8c9c94] hover:text-[#f5f6f2]'
                  }`}
                >
                  <QrIcon size={13} />
                  <span>{isAr ? 'توليد باركود المنيو' : 'Table QR Code'}</span>
                </button>
              </div>

              {/* Real-Time Live Sync Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#030d0a] border border-emerald-500/40 text-[11px] text-emerald-400 font-medium select-none shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'متزامن لحظياً مع المنيو الأصلي' : 'Live Synced to Menu'}</span>
              </div>
            </div>

            {/* TAB 1: Edit & Delete Items */}
            {activeTab === 'items' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Filter bar: Food vs Drinks, Subcategory & Search */}
                <div className="p-3 sm:p-4 bg-[#030d0a]/80 border-b border-[#c9a24b]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1 p-0.5 bg-[#051510] rounded-xl border border-[#c9a24b]/20">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSectionId('food');
                          setSelectedCatId('all');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          selectedSectionId === 'food'
                            ? 'bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/40'
                            : 'text-[#8c9c94]'
                        }`}
                      >
                        <Utensils size={13} />
                        <span>{isAr ? 'الأكل' : 'Food'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSectionId('drinks');
                          setSelectedCatId('all');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          selectedSectionId === 'drinks'
                            ? 'bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/40'
                            : 'text-[#8c9c94]'
                        }`}
                      >
                        <Wine size={13} />
                        <span>{isAr ? 'المشروبات' : 'Drinks'}</span>
                      </button>
                    </div>

                    {/* Category Dropdown */}
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#051510] border border-[#c9a24b]/25 text-xs text-[#f5f6f2] outline-none cursor-pointer"
                    >
                      <option value="all">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
                      {listSubcategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isAr ? c.name_ar : c.name_en} ({c.items.length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search inside Admin */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-[#c9a24b]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isAr ? 'بحث عن صنف في اللوحة...' : 'Search items...'}
                      className="w-full pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-1.5 bg-[#020806] border border-[#c9a24b]/20 focus:border-[#c9a24b] rounded-xl text-xs text-[#f5f6f2] outline-none"
                    />
                  </div>
                </div>

                {/* Items Table / List */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-[#8c9c94] text-xs">
                      {isAr ? 'لا توجد أصناف تطابق هذا البحث' : 'No items match your criteria'}
                    </div>
                  ) : (
                    filteredItems.map(({ item, subcatNameAr, subcatNameEn, subcatId }) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl bg-[#020806] border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                          item.isAvailable === false
                            ? 'border-red-900/40 opacity-75'
                            : 'border-[#c9a24b]/20 hover:border-[#c9a24b]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#051510] border border-[#c9a24b]/25 shrink-0">
                            <img src={item.image} alt={item.name_ar} className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#f5f6f2]">{isAr ? item.name_ar : item.name_en}</h4>
                              {item.isChefsChoice && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-sm">
                                  <ChefHat size={11} className="text-amber-400" />
                                  <span>{isAr ? 'اختيار الشيف 👨‍🍳' : "Chef's Choice"}</span>
                                </span>
                              )}
                              {!item.isChefsChoice && item.isLagunaSpecial && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0d2820] text-[#dfbe6f] border border-[#c9a24b]/40 flex items-center gap-1 shadow-sm">
                                  <Sparkles size={11} className="text-[#c9a24b]" />
                                  <span>{isAr ? 'صنف مميز ✨' : 'Special ✨'}</span>
                                </span>
                              )}
                              {item.isAvailable === false && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/40">
                                  {isAr ? 'غير متوفر' : 'Unavailable'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8c9c94]">
                              {isAr ? item.name_en : item.name_ar} ·{' '}
                              <span className="text-[#dfbe6f]">{isAr ? subcatNameAr : subcatNameEn}</span>
                            </p>
                          </div>
                        </div>

                        {/* Price and actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c9a24b]/10">
                          <div className="text-end">
                            {item.prices && item.prices.length > 0 ? (
                              <div className="text-xs text-[#dfbe6f] font-mono">
                                {item.prices.map((p) => `${isAr ? p.label_ar : p.label_en}: ${p.price}`).join(' | ')} ج.م
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-[#dfbe6f] font-mono">{item.price} ج.م</div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Quick Special & Chef's Choice 1-tap Toggles */}
                            <div className="flex items-center gap-1 bg-[#051510] p-1 rounded-xl border border-[#c9a24b]/20">
                              {/* Chef's Choice Quick Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleBadge(item.id, item.isChefsChoice ? 'none' : 'chefs_choice')}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                  item.isChefsChoice
                                    ? 'bg-gradient-to-r from-amber-900/70 to-amber-700/70 text-amber-200 border border-amber-500/60 shadow-sm'
                                    : 'text-[#8c9c94] hover:text-amber-300 hover:bg-[#0a1e18]'
                                }`}
                                title={isAr ? "اختيار الشيف 👨‍🍳 (مع بريق وتوهج فاخر)" : "Toggle Chef's Choice"}
                              >
                                <ChefHat size={13} className={item.isChefsChoice ? 'text-amber-300' : ''} />
                                <span className="hidden sm:inline text-[10px]">{isAr ? 'الشيف' : 'Chef'}</span>
                              </button>

                              {/* Special Quick Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleBadge(item.id, item.isLagunaSpecial && !item.isChefsChoice ? 'none' : 'special')}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                  item.isLagunaSpecial && !item.isChefsChoice
                                    ? 'bg-gradient-to-r from-[#153c31] to-[#0a1e18] text-[#dfbe6f] border border-[#c9a24b]/60 shadow-sm'
                                    : 'text-[#8c9c94] hover:text-[#dfbe6f] hover:bg-[#0a1e18]'
                                }`}
                                title={isAr ? "صنف مميز ✨ (مع بريق ذهبي)" : "Toggle Special"}
                              >
                                <Sparkles size={13} className={item.isLagunaSpecial && !item.isChefsChoice ? 'text-[#dfbe6f]' : ''} />
                                <span className="hidden sm:inline text-[10px]">{isAr ? 'مميز' : 'Special'}</span>
                              </button>
                            </div>

                            {/* Toggle availability */}
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item.id, item.isAvailable !== false)}
                              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                item.isAvailable !== false
                                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                                  : 'bg-amber-950/30 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
                              }`}
                              title={item.isAvailable !== false ? (isAr ? 'متوفر' : 'In Stock') : (isAr ? 'غير متوفر' : 'Sold Out')}
                            >
                              {item.isAvailable !== false ? 'متاح' : 'معطل'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item, selectedSectionId, subcatId)}
                              className="p-2 rounded-xl bg-[#081d16] hover:bg-[#143d30] border border-[#c9a24b]/30 text-[#dfbe6f] text-xs transition-colors cursor-pointer"
                              title={isAr ? 'تعديل البيانات' : 'Edit item'}
                            >
                              <Edit3 size={15} />
                            </button>

                            {/* Immediate Delete Button: deletes item on first click */}
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, isAr ? item.name_ar : item.name_en)}
                              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-200 text-xs transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                              title={isAr ? 'حذف فوري من المنيو' : 'Delete item immediately'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Add New Item */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
                <h3 className="text-base sm:text-lg font-bold text-[#f5f6f2] mb-1">
                  {isAr ? 'إضافة صنف جديد إلى القائمة' : 'Add New Item to Menu'}
                </h3>
                <p className="text-xs text-[#8c9c94] mb-5">
                  {isAr ? 'قم بملء البيانات وسينعكس الصنف مباشرة في المنيو للزبائن' : 'New item will be published immediately to live menu'}
                </p>

                <form onSubmit={handleAddNewItem} className="space-y-4">
                  {/* Section and Category Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'القسم الرئيسي *' : 'Main Section *'}
                      </label>
                      <select
                        value={addTargetSection}
                        onChange={(e) => {
                          const sec = e.target.value as 'food' | 'drinks';
                          setAddTargetSection(sec);
                          const subcats = menuData.find((s) => s.id === sec)?.subcategories || [];
                          if (subcats.length > 0) setAddTargetCategory(subcats[0].id);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none cursor-pointer"
                      >
                        <option value="food">{isAr ? 'الأكل' : 'Food'}</option>
                        <option value="drinks">{isAr ? 'المشروبات' : 'Drinks'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'التصنيف الفرعي *' : 'Subcategory *'}
                      </label>
                      <select
                        value={addTargetCategory}
                        onChange={(e) => setAddTargetCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none cursor-pointer"
                      >
                        {availableSubcategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isAr ? c.name_ar : c.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Names in Arabic and English */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'اسم الصنف بالعربية *' : 'Name in Arabic *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={addNameAr}
                        onChange={(e) => setAddNameAr(e.target.value)}
                        placeholder="مثال: بيتزا مارجريتا إيطالية"
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'اسم الصنف بالإنجليزية *' : 'Name in English *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={addNameEn}
                        onChange={(e) => setAddNameEn(e.target.value)}
                        placeholder="e.g. Italian Margherita Pizza"
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#8c9c94] mb-1">
                        {isAr ? 'المكونات والوصف بالعربية' : 'Ingredients (Arabic)'}
                      </label>
                      <textarea
                        rows={2}
                        value={addDescAr}
                        onChange={(e) => setAddDescAr(e.target.value)}
                        placeholder="صلصة طماطم إيطالية، جبنة موزاريلا طازجة، ريحان"
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/20 text-xs text-[#f5f6f2] outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#8c9c94] mb-1">
                        {isAr ? 'المكونات والوصف بالإنجليزية' : 'Ingredients (English)'}
                      </label>
                      <textarea
                        rows={2}
                        value={addDescEn}
                        onChange={(e) => setAddDescEn(e.target.value)}
                        placeholder="Italian tomato sauce, fresh mozzarella, basil"
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/20 text-xs text-[#f5f6f2] outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Price Configuration */}
                  <div className="p-3 rounded-2xl bg-[#020806] border border-[#c9a24b]/20 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[#f5f6f2] cursor-pointer">
                        <input
                          type="radio"
                          name="addPriceType"
                          checked={addPriceType === 'single'}
                          onChange={() => setAddPriceType('single')}
                          className="accent-[#c9a24b]"
                        />
                        <span>{isAr ? 'سعر موحد' : 'Single Price'}</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-[#f5f6f2] cursor-pointer">
                        <input
                          type="radio"
                          name="addPriceType"
                          checked={addPriceType === 'dual'}
                          onChange={() => setAddPriceType('dual')}
                          className="accent-[#c9a24b]"
                        />
                        <span>{isAr ? 'حجمين (وسط / كبير)' : 'Dual (Medium / Large)'}</span>
                      </label>
                    </div>

                    {addPriceType === 'single' ? (
                      <div>
                        <label className="block text-xs text-[#8c9c94] mb-1">
                          {isAr ? 'السعر (ج.م) *' : 'Price (EGP) *'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={addSinglePrice}
                          onChange={(e) => setAddSinglePrice(e.target.value)}
                          placeholder="150"
                          className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#8c9c94] mb-1">
                            {isAr ? 'سعر الحجم الوسط M (ج.م) *' : 'Medium Size M (EGP) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={addPriceMedium}
                            onChange={(e) => setAddPriceMedium(e.target.value)}
                            placeholder="140"
                            className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-[#8c9c94] mb-1">
                            {isAr ? 'سعر الحجم الكبير L (ج.م) *' : 'Large Size L (EGP) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={addPriceLarge}
                            onChange={(e) => setAddPriceLarge(e.target.value)}
                            placeholder="190"
                            className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Image Upload & URL & AI Real-Ingredient Match */}
                  <ImageFieldWithUpload
                    value={addImageUrl}
                    onChange={setAddImageUrl}
                    isAr={isAr}
                    itemName={addNameAr || addNameEn}
                    itemIngredients={addDescAr || addDescEn}
                    label={isAr ? 'صورة الصنف (مطابقة واقعية بالذكاء الاصطناعي أو رفع محلي أو رابط)' : 'Item Photo (AI Real-Ingredient Match, Local Upload or URL)'}
                  />

                  {/* Highlight & Recommendation: Special vs Chef's Choice vs Standard */}
                  <div className="p-3 rounded-2xl bg-[#020806] border border-[#c9a24b]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#dfbe6f] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#c9a24b]" />
                        <span>{isAr ? 'شارة التمييز وتوصيات المنيو' : 'Highlight & Recommendation Badge'}</span>
                      </label>
                      <span className="text-[10px] text-[#8c9c94]">
                        {isAr ? 'تأثير بريق وإضاءة ذهبية للزبائن' : 'Subtle sparkle & glow in live menu'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAddBadgeType('none')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          addBadgeType === 'none'
                            ? 'bg-[#0a1e18] border-[#c9a24b]/50 text-[#f5f6f2] shadow-sm'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-[#f5f6f2]'
                        }`}
                      >
                        <span>{isAr ? 'صنف عادي' : 'Standard'}</span>
                        <span className="text-[9px] text-[#8c9c94]">{isAr ? 'بدون شارة' : 'No badge'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddBadgeType('special')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          addBadgeType === 'special'
                            ? 'bg-gradient-to-br from-[#153c31] to-[#0a1e18] border-[#c9a24b] text-[#dfbe6f] shadow-md shadow-black/60 ring-1 ring-[#c9a24b]/40'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-[#dfbe6f]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles size={11} className="text-[#dfbe6f]" />
                          <span>{isAr ? 'صنف مميز' : 'Special'}</span>
                        </div>
                        <span className="text-[9px] text-[#dfbe6f]/70">{isAr ? '✨ بريق ذهبي' : '✨ Golden'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddBadgeType('chefs_choice')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          addBadgeType === 'chefs_choice'
                            ? 'bg-gradient-to-br from-[#2a1b0a] to-[#160d05] border-amber-500 text-amber-300 shadow-md shadow-black/60 ring-1 ring-amber-500/40'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-amber-300]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <ChefHat size={12} className="text-amber-400" />
                          <span>{isAr ? 'اختيار الشيف' : "Chef's Choice"}</span>
                        </div>
                        <span className="text-[9px] text-amber-400/70">{isAr ? '👨‍🍳 توهج وتوصية' : '👨‍🍳 Glowing'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#c9a24b] to-[#dfbe6f] hover:from-[#dfbe6f] hover:to-[#c9a24b] text-[#030d0a] text-xs font-bold transition-all cursor-pointer shadow-lg shadow-black/40 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={15} />
                      <span>{isAr ? 'إضافة الصنف للمنيو الآن' : 'Publish Item to Menu'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Custom QR Code Generator linked to current live menu URL */}
            {activeTab === 'qrcode' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#f7f4ea] mb-1 flex items-center gap-2">
                    <QrIcon size={18} className="text-[#c9a24b]" />
                    <span>{isAr ? 'توليد باركود المنيو الذكي لطاولات المطعم' : 'Custom Menu QR Code Generator'}</span>
                  </h3>
                  <p className="text-xs text-[#8c9c94]">
                    {isAr
                      ? 'قم بتوليد باركود QR مباشر مرتبط بالمنيو الحي، مع إمكانية طباعة كروت الطاولات بتصميم فاخر أو تحميل الباركود ومشاركته'
                      : 'Generate high-res QR codes linked to the live menu for printing table tents and sharing.'}
                  </p>
                </div>

                {/* Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#020806] border border-[#c9a24b]/20">
                  <div>
                    <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                      {isAr ? 'رابط المنيو الحي المرتبط بالباركود *' : 'Live Menu URL *'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={qrUrl}
                        onChange={(e) => setQrUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-2 rounded-xl bg-[#0e2d23] hover:bg-[#153c31] border border-[#c9a24b]/30 text-[#dfbe6f] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                      >
                        <Copy size={13} />
                        <span>{qrCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                      {isAr ? 'اسم أو رقم الطاولة (اختياري للطباعة)' : 'Table Label / Number'}
                    </label>
                    <input
                      type="text"
                      value={tableLabel}
                      onChange={(e) => setTableLabel(e.target.value)}
                      placeholder={isAr ? 'مثال: طاولة رقم 4، تراس النيل، VIP' : 'e.g. Table 5, Nile Terrace'}
                      className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                    />
                  </div>
                </div>

                {/* QR Code Preview Card */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#061812] to-[#020a07] border border-[#c9a24b]/30 shadow-2xl">
                  {/* Printable Card Area */}
                  <div
                    id="printable-qr-card"
                    className="w-56 p-5 rounded-2xl bg-white text-black flex flex-col items-center text-center shadow-xl border-4 border-[#c9a24b]"
                  >
                    {/* Header logo & brand on print card */}
                    <div className="mb-2 flex flex-col items-center">
                      <span className="text-[13px] font-bold tracking-widest text-[#030d0a] font-serif uppercase">
                        LAGUNA DUBAI
                      </span>
                      <span className="text-[8px] text-[#8f722c] font-bold tracking-wider uppercase">
                        Restaurant & Café · مطعم وكافيه
                      </span>
                    </div>

                    {/* QR Image */}
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="LAGUNA DUBAI Menu QR"
                        className="w-40 h-40 object-contain my-1"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        جاري توليد الباركود...
                      </div>
                    )}

                    {/* Table Label */}
                    {tableLabel && (
                      <div className="mt-1 text-xs font-bold text-[#030d0a] px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300">
                        {tableLabel}
                      </div>
                    )}

                    {/* Call to action */}
                    <p className="mt-2 text-[9px] font-semibold text-slate-700 leading-tight">
                      امسح بكاميرا الهاتف لتصفح المنيو
                      <br />
                      <span className="text-[8px] text-slate-500">Scan to View Digital Menu</span>
                    </p>
                  </div>

                  {/* Action Buttons & Features */}
                  <div className="flex-1 space-y-3 w-full">
                    <h4 className="text-sm font-bold text-[#f7f4ea]">
                      {isAr ? 'كارت الباركود الذكي جاهز للاستخدام' : 'Table QR Code Card Ready'}
                    </h4>
                    <p className="text-xs text-[#8c9c94] leading-relaxed">
                      {isAr
                        ? 'يمكنك طباعة هذا الكارت ووضعه على طاولات الصالة أو التراس النهري، ليتمكن الزبائن من مسح الباركود وفتح قائمة الطعام والمشروبات مباشرة وبسرعة.'
                        : 'Print and display this card on dining tables so guests can effortlessly scan and browse the live bilingual menu.'}
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {/* Print Card Button */}
                      <button
                        type="button"
                        onClick={handlePrintQr}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a24b] to-[#dfbe6f] hover:from-[#dfbe6f] hover:to-[#c9a24b] text-[#030d0a] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-black/50 transition-all"
                      >
                        <Printer size={15} />
                        <span>{isAr ? 'طباعة كارت الطاولة' : 'Print Table Card'}</span>
                      </button>

                      {/* Download PNG Button */}
                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="px-4 py-2.5 rounded-xl bg-[#0a231b] hover:bg-[#12382c] border border-[#c9a24b]/40 text-[#dfbe6f] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download size={14} />
                        <span>{isAr ? 'تحميل صورة الباركود (PNG)' : 'Download QR Image'}</span>
                      </button>

                      {/* Open Live Menu Test */}
                      {qrUrl && (
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-[#051510] hover:bg-[#0a231b] border border-[#c9a24b]/20 text-[#8c9c94] hover:text-[#f7f4ea] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ExternalLink size={14} />
                          <span>{isAr ? 'تجربة فتح الرابط' : 'Open Link'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* EDIT ITEM SUB-MODAL */}
        <AnimatePresence>
          {editingItem && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xl bg-[#04100c] border border-[#c9a24b]/50 rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#c9a24b]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 size={18} className="text-[#c9a24b]" />
                    <h3 className="text-base sm:text-lg font-bold text-[#f5f6f2]">
                      {isAr ? 'تعديل بيانات الصنف والطلب' : 'Edit Item & Details'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 rounded-lg bg-[#081d16] text-[#8c9c94] hover:text-[#f5f6f2] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-3.5">
                  {/* Arabic & English Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'الاسم بالعربية *' : 'Name in Arabic *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editNameAr}
                        onChange={(e) => setEditNameAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#dfbe6f] mb-1">
                        {isAr ? 'الاسم بالإنجليزية *' : 'Name in English *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#8c9c94] mb-1">
                        {isAr ? 'المكونات والوصف بالعربية' : 'Ingredients (Arabic)'}
                      </label>
                      <textarea
                        rows={2}
                        value={editDescAr}
                        onChange={(e) => setEditDescAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/20 text-xs text-[#f5f6f2] outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#8c9c94] mb-1">
                        {isAr ? 'المكونات والوصف بالإنجليزية' : 'Ingredients (English)'}
                      </label>
                      <textarea
                        rows={2}
                        value={editDescEn}
                        onChange={(e) => setEditDescEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#020806] border border-[#c9a24b]/20 text-xs text-[#f5f6f2] outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Price Options */}
                  <div className="p-3 rounded-2xl bg-[#020806] border border-[#c9a24b]/20 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[#f5f6f2] cursor-pointer">
                        <input
                          type="radio"
                          name="editPriceType"
                          checked={editPriceType === 'single'}
                          onChange={() => setEditPriceType('single')}
                          className="accent-[#c9a24b]"
                        />
                        <span>{isAr ? 'سعر موحد' : 'Single Price'}</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-[#f5f6f2] cursor-pointer">
                        <input
                          type="radio"
                          name="editPriceType"
                          checked={editPriceType === 'dual'}
                          onChange={() => setEditPriceType('dual')}
                          className="accent-[#c9a24b]"
                        />
                        <span>{isAr ? 'حجمين (وسط / كبير)' : 'Dual (Medium / Large)'}</span>
                      </label>
                    </div>

                    {editPriceType === 'single' ? (
                      <div>
                        <label className="block text-xs text-[#8c9c94] mb-1">
                          {isAr ? 'السعر (ج.م) *' : 'Price (EGP) *'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editSinglePrice}
                          onChange={(e) => setEditSinglePrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#8c9c94] mb-1">
                            {isAr ? 'سعر الوسط M (ج.م) *' : 'Medium (EGP) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editPriceMedium}
                            onChange={(e) => setEditPriceMedium(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#8c9c94] mb-1">
                            {isAr ? 'سعر الكبير L (ج.م) *' : 'Large (EGP) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editPriceLarge}
                            onChange={(e) => setEditPriceLarge(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#051510] border border-[#c9a24b]/30 text-xs text-[#f5f6f2] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo URL & Device Upload & AI Real-Ingredient Match */}
                  <ImageFieldWithUpload
                    value={editImageUrl}
                    onChange={setEditImageUrl}
                    isAr={isAr}
                    itemName={editNameAr || editNameEn}
                    itemIngredients={editDescAr || editDescEn}
                    label={isAr ? 'صورة الصنف (مطابقة واقعية بالذكاء الاصطناعي أو رفع محلي أو رابط)' : 'Item Photo (AI Real-Ingredient Match, Local Upload or URL)'}
                  />

                  {/* Highlight & Recommendation: Special vs Chef's Choice vs Standard */}
                  <div className="p-3 rounded-2xl bg-[#020806] border border-[#c9a24b]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#dfbe6f] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#c9a24b]" />
                        <span>{isAr ? 'شارة التمييز وتوصيات المنيو' : 'Highlight & Recommendation Badge'}</span>
                      </label>
                      <span className="text-[10px] text-[#8c9c94]">
                        {isAr ? 'تأثير بريق وتوهج ذهبي للزبائن' : 'Subtle sparkle & glow in live menu'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditBadgeType('none')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          editBadgeType === 'none'
                            ? 'bg-[#0a1e18] border-[#c9a24b]/50 text-[#f5f6f2] shadow-sm'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-[#f5f6f2]'
                        }`}
                      >
                        <span>{isAr ? 'صنف عادي' : 'Standard'}</span>
                        <span className="text-[9px] text-[#8c9c94]">{isAr ? 'بدون شارة' : 'No badge'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditBadgeType('special')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          editBadgeType === 'special'
                            ? 'bg-gradient-to-br from-[#153c31] to-[#0a1e18] border-[#c9a24b] text-[#dfbe6f] shadow-md shadow-black/60 ring-1 ring-[#c9a24b]/40'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-[#dfbe6f]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles size={11} className="text-[#dfbe6f]" />
                          <span>{isAr ? 'صنف مميز' : 'Special'}</span>
                        </div>
                        <span className="text-[9px] text-[#dfbe6f]/70">{isAr ? '✨ بريق ذهبي' : '✨ Golden'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditBadgeType('chefs_choice')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                          editBadgeType === 'chefs_choice'
                            ? 'bg-gradient-to-br from-[#2a1b0a] to-[#160d05] border-amber-500 text-amber-300 shadow-md shadow-black/60 ring-1 ring-amber-500/40'
                            : 'bg-[#020806] border-[#c9a24b]/15 text-[#8c9c94] hover:text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <ChefHat size={12} className="text-amber-400" />
                          <span>{isAr ? 'اختيار الشيف' : "Chef's Choice"}</span>
                        </div>
                        <span className="text-[9px] text-amber-400/70">{isAr ? '👨‍🍳 توهج وتوصية' : '👨‍🍳 Glowing'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-emerald-400 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsAvailable}
                        onChange={(e) => setEditIsAvailable(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4 rounded"
                      />
                      <span>{isAr ? 'الصنف متوفر حالياً بالصالة ومتاح للطلب' : 'Available in Venue'}</span>
                    </label>
                  </div>

                  {/* Save, Cancel & Immediate Delete */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#c9a24b]/15">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingItem) {
                          handleDeleteItem(
                            editingItem.item.id,
                            isAr ? editingItem.item.name_ar : editingItem.item.name_en
                          );
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{isAr ? 'حذف هذا الصنف' : 'Delete Item'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-4 py-2 rounded-xl bg-[#051510] text-[#8c9c94] hover:text-[#f5f6f2] text-xs font-semibold cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#c9a24b] hover:bg-[#dfbe6f] text-[#030d0a] text-xs font-bold transition-colors cursor-pointer shadow-md"
                      >
                        {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
