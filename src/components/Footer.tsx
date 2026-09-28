import React from 'react';
import { MapPin, QrCode } from 'lucide-react';
import { Language, RESTAURANT_INFO } from '../data/menuData';
import { LagunaLogo } from './LagunaLogo';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  return (
    <footer className="w-full bg-[#020a07] border-t border-[#c9a24b]/20 text-[#8fa89b] py-12 px-4 mt-16 select-none">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Laguna Dubai Official Logo */}
        <LagunaLogo variant="footer" isAr={isAr} />

        {/* Brand Wordmark */}
        <div className="flex flex-col items-center">
          <span className={`text-xl sm:text-2xl font-bold tracking-widest text-[#f7f4ea] ${isAr ? 'font-arabic-brand' : 'font-serif-brand uppercase'}`}>
            {isAr ? RESTAURANT_INFO.name_ar : RESTAURANT_INFO.name_en}
          </span>
          <span className="text-xs text-[#dfbe6f] tracking-wider mt-0.5">
            {isAr ? RESTAURANT_INFO.subtitle_ar : RESTAURANT_INFO.subtitle_en}
          </span>
        </div>

        {/* Tagline */}
        <p className={`text-sm text-[#f7f4ea]/85 max-w-md ${isAr ? 'font-arabic-brand font-medium' : 'font-serif-brand italic text-[#dfbe6f]'}`}>
          &ldquo;{isAr ? RESTAURANT_INFO.tagline_ar : RESTAURANT_INFO.tagline_en}&rdquo;
        </p>

        {/* Location & QR Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#8fa89b] pt-2">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-[#c9a24b] shrink-0" />
            <span>{isAr ? RESTAURANT_INFO.location_ar : RESTAURANT_INFO.location_en}</span>
          </div>
          <span className="hidden sm:inline text-[#c9a24b]/30" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <QrCode size={13} className="text-[#c9a24b] shrink-0" />
            <span>{isAr ? 'قائمة طعام رقمية عبر رمز QR' : 'In-Venue Digital QR Menu'}</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/lagunadubaii?stkn=ZG05OHAzNm1xYzNq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#c9a24b]/40 bg-[#041711] text-[#dfbe6f] hover:text-[#fff] hover:border-[#c9a24b] hover:bg-[#c9a24b]/20 hover:scale-110 active:scale-95 transition-all shadow-[0_2px_10px_rgba(201,162,75,0.15)] group"
            aria-label="Instagram @lagunadubaii"
            title="Instagram - Laguna Dubai"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@laguna4579?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#c9a24b]/40 bg-[#041711] text-[#dfbe6f] hover:text-[#fff] hover:border-[#c9a24b] hover:bg-[#c9a24b]/20 hover:scale-110 active:scale-95 transition-all shadow-[0_2px_10px_rgba(201,162,75,0.15)] group"
            aria-label="TikTok @laguna4579"
            title="TikTok - Laguna Dubai"
          >
            <svg className="w-4.5 h-4.5 fill-current transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49V8.58a8.28 8.28 0 0 0 4.84 1.55V6.69h-.93z"/>
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/201118884194"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#c9a24b]/40 bg-[#041711] text-[#dfbe6f] hover:text-[#25D366] hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:scale-110 active:scale-95 transition-all shadow-[0_2px_10px_rgba(201,162,75,0.15)] group"
            aria-label="WhatsApp Laguna Dubai 01118884194"
            title="WhatsApp - 01118884194"
          >
            <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.115-.067-.24-.076-.55-.175-1.02-.38-2.008-.87-3.32-2.906-3.42-3.04-.102-.134-.816-1.085-.816-2.07 0-.984.516-1.468.7-.666.184.184.444.229.651.229.208 0 .416-.009.598-.018.192-.01.448-.073.699.535.257.625.877 2.14.954 2.298.077.157.129.34.026.545-.103.205-.154.333-.308.513-.154.179-.324.4-.462.537-.154.154-.314.321-.135.628.179.308.795 1.312 1.706 2.124 1.172 1.045 2.161 1.368 2.469 1.522.308.154.487.128.666-.077.179-.205.769-.897.974-1.205.205-.308.41-.257.692-.154.282.103 1.795.846 2.103 1.001.308.154.513.231.59.359.077.128.077.744-.067 1.149z"/>
            </svg>
          </a>
        </div>

        {/* Subtle divider */}
        <div className="w-24 h-[1px] bg-[#c9a24b]/20 my-1" />

        {/* Developer attribution & WhatsApp contact */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs text-[#8fa89b] pt-1">
          <span className="font-medium text-[#c9a24b] tracking-wide">
            create by reda wahid
          </span>
          <span className="hidden sm:inline text-[#c9a24b]/40">·</span>
          <a
            href="https://wa.me/201025192832"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-[#dfbe6f] hover:text-[#25D366] transition-colors font-semibold tracking-wider hover:underline"
            title={isAr ? 'تواصل معنا عبر واتساب: 01025192832' : 'Chat with us on WhatsApp: 01025192832'}
          >
            <svg className="w-3.5 h-3.5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.115-.067-.24-.076-.55-.175-1.02-.38-2.008-.87-3.32-2.906-3.42-3.04-.102-.134-.816-1.085-.816-2.07 0-.984.516-1.468.7-.666.184.184.444.229.651.229.208 0 .416-.009.598-.018.192-.01.448-.073.699.535.257.625.877 2.14.954 2.298.077.157.129.34.026.545-.103.205-.154.333-.308.513-.154.179-.324.4-.462.537-.154.154-.314.321-.135.628.179.308.795 1.312 1.706 2.124 1.172 1.045 2.161 1.368 2.469 1.522.308.154.487.128.666-.077.179-.205.769-.897.974-1.205.205-.308.41-.257.692-.154.282.103 1.795.846 2.103 1.001.308.154.513.231.59.359.077.128.077.744-.067 1.149z"/>
            </svg>
            contact us 01025192832
          </a>
        </div>
      </div>
    </footer>
  );
};
