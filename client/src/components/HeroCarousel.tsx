import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PromoItem {
  type: string;
  title: string;
  desc: string;
  tag: string;
  cardData: {
    id: string;
    color: 'lime' | 'orange' | 'violet';
    badge: string;
    title: string;
    subtitle?: string;
    desc: string;
    actionText?: string;
    details?: Array<{ label: string; value: string }>;
  };
}

export const DEFAULT_PROMOS: PromoItem[] = [
  {
    type: 'СПЕЦПРЕДЛОЖЕНИЕ',
    title: 'Индивидуальный курс PRO',
    desc: 'Персональный разбор техники от топ-хореографов',
    tag: '-15% PRO',
    cardData: {
      id: 'special-offer',
      color: 'lime',
      badge: 'СПЕЦПРЕДЛОЖЕНИЕ • PRO',
      title: 'Индивидуальный курс PRO',
      subtitle: 'Персональный разбор техники',
      desc: 'Персональный разбор техники и план тренировок со скидкой 15% от топ-хореографов Urban Glass.',
      actionText: 'Активировать скидку',
      details: [
        { label: 'Направление', value: 'High Heels Pro Intense' },
        { label: 'Преподаватели', value: 'Яна Смирнова & Кристина' },
        { label: 'Твоя скидка', value: '15% (-4 500 ₽)' }
      ]
    }
  },
  {
    type: 'НОВОСТИ И АКЦИИ',
    title: 'Акция месяца: Приведи друга!',
    desc: 'Получи +2 занятия к своему абонементу',
    tag: '+2 ЗАНЯТИЯ',
    cardData: {
      id: 'bring-friend',
      color: 'lime',
      badge: 'АКЦИЯ МЕСЯЦА',
      title: 'Приведи друга!',
      subtitle: 'Получи +2 бесплатные тренировки',
      desc: 'Поделись промокодом с другом и получи +2 бесплатные тренировки к своему абонементу!',
      actionText: 'Поделиться с другом',
      details: [
        { label: 'Промокод для друга', value: 'DANCE-FRIEND-2026' },
        { label: 'Твой бонус', value: '+2 занятия к абонементу' },
        { label: 'Бонус другу', value: 'Скидка 10% на 1-й абонемент' }
      ]
    }
  },
  {
    type: 'СЕЗОННЫЙ ЧЕЛЛЕНДЖ',
    title: 'Летний марафон: 30 тренировок',
    desc: 'Закрой 30 занятий до конца августа и забери мерч',
    tag: '30 УРОКОВ',
    cardData: {
      id: 'challenge',
      color: 'lime',
      badge: 'ПРОГРЕСС • ЧЕЛЛЕНДЖ',
      title: 'Летний марафон',
      subtitle: 'Пройдено 12 из 30 тренировок',
      desc: 'Посети 30 тренировок до конца августа и забери эксклюзивный лимитированный мерч от Urban Glass!',
      actionText: 'Посмотреть правила',
      details: [
        { label: 'Период марафона', value: '1 июня - 31 августа' },
        { label: 'Твой прогресс', value: '12 тренировок (40%)' },
        { label: 'Награда', value: 'Свитшот Urban Glass' }
      ]
    }
  }
];

interface HeroCarouselProps {
  onSelectPromo: (cardData: any) => void;
  promos?: PromoItem[];
}

export default function HeroCarousel({ onSelectPromo, promos = DEFAULT_PROMOS }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, promos.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    }
  };

  const currentPromo = promos[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: '0%',
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      className="w-full relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        onClick={() => onSelectPromo(currentPromo.cardData)}
        className="w-full h-[160px] bg-[#CCFF00] text-black rounded-outer p-5 shadow-lg cursor-pointer relative overflow-hidden flex flex-col justify-between transition-transform active:scale-[0.99]"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (offset.x < -50 || swipe < -500) {
                paginate(1);
              } else if (offset.x > 50 || swipe > 500) {
                paginate(-1);
              }
            }}
            className="flex flex-col justify-between h-full w-full min-h-0"
          >
            {/* Upper row: Type label + Right side tag badge */}
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-black/70 tracking-wider uppercase">
                {currentPromo.type}
              </span>
              <span className="bg-black text-[#CCFF00] px-3 py-1 rounded-chip text-xs font-medium shadow-sm">
                {currentPromo.tag}
              </span>
            </div>

            {/* Content: Title & Description */}
            <div className="my-auto text-left min-w-0">
              <h3 className="text-xl font-semibold text-black leading-tight line-clamp-1">
                {currentPromo.title}
              </h3>
              <p className="text-sm text-black/80 mt-1 line-clamp-1 font-medium">
                {currentPromo.desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators (Pagination) */}
        <div className="flex justify-center items-center gap-1.5 mt-2">
          {promos.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-black" : "w-1.5 bg-black/30 hover:bg-black/50"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
