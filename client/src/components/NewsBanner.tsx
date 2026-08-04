import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, Check, Sparkles, X } from 'lucide-react';
import Banner from './Banner';

export default function NewsBanner() {
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const promoCode = "ACADEMIKA2026";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Акция в AkademikA!',
        text: `Присоединяйся к тренировкам AkademikA по моему промокоду ${promoCode} и мы оба получим бонусные занятия!`,
        url: window.location.origin
      }).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full mb-4">
      {/* TRIGGER COMPACT BANNER CARD */}
      <Banner
        onClick={() => setIsNewsOpen(true)}
        className="bg-card-custom border border-custom hover:border-accent-primary/50"
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-accent-primary animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-secondary-custom text-xs uppercase tracking-wider font-bold">НОВОСТИ И АКЦИИ</span>
              </div>
              <h2 className="text-sm font-medium text-primary-custom leading-tight truncate">
                Акция месяца: Приведи друга!
              </h2>
              <p className="text-secondary-custom text-xs font-bold leading-tight truncate mt-0.5 tracking-wide">
                Получи +2 занятия к своему абонементу
              </p>
            </div>
          </div>

          <div className="text-accent-primary bg-main p-1.5 rounded-full border border-custom shrink-0 flex items-center justify-center">
            <ChevronDown size={14} />
          </div>
        </div>
      </Banner>

      {/* OVERLAY & BOTTOM SHEET */}
      <AnimatePresence>
        {isNewsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewsOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card-custom border-t border-custom rounded-t-outer max-h-[85dvh] flex flex-col z-50 shadow-2xl overflow-hidden text-primary-custom"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mt-3 mb-2 shrink-0" />

              {/* Header */}
              <div className="px-6 pb-3 pt-1 border-b border-custom/40 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-medium text-primary-custom">Акция месяца!</h3>
                  <p className="text-xs font-bold text-accent-primary tracking-wide uppercase mt-0.5">Приведи друга</p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-main border border-custom/60 text-secondary-custom hover:text-accent-primary w-9 h-9 transition-colors flex items-center justify-center cursor-pointer"
                  onClick={() => setIsNewsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-6 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-36 space-y-6 flex-1">
                <p className="text-primary-custom/90 text-xs font-medium leading-relaxed">
                  Приведи друга и получи <span className="text-accent-primary font-medium">+2 занятия</span> к своему действующему абонементу! Поделитесь любовью к танцам с близкими.
                </p>

                {/* Promo Code Box */}
                <div className="p-3.5 bg-main border border-custom/60 rounded-inner space-y-1.5">
                  <div className="text-xs uppercase tracking-wider text-secondary-custom font-bold">ПРОМОКОД ДЛЯ ДРУГА</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-accent-primary tracking-wide font-mono bg-accent-primary/10 border border-accent-primary/20 px-3 py-1 rounded-chip">
                      {promoCode}
                    </span>
                    <span className="text-xs text-secondary-custom font-bold tracking-wide">Активен до 31.08.2026</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleShare}
                    className="w-full bg-accent-primary hover:opacity-90 active:scale-95 text-accent-text font-bold py-3.5 px-4 rounded-control text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 cursor-pointer animate-pulse"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="stroke-[3px]" />
                        <span>Код скопирован!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} className="stroke-[2.5px]" />
                        <span>Поделиться кодом</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsNewsOpen(false)}
                    className="w-full bg-main border border-custom hover:opacity-90 text-primary-custom py-3.5 rounded-control text-xs font-medium transition-all cursor-pointer flex items-center justify-center"
                  >
                    Свернуть
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

