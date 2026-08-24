import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface HorizontalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  className?: string;
}

const BATCH_DAYS = 30; // Порция подгрузки дней в каждую сторону

export const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff';

  const [days, setDays] = useState<Date[]>(() => {
    const list: Date[] = [];
    const base = new Date(selectedDate);
    for (let i = -BATCH_DAYS; i <= BATCH_DAYS; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDone = useRef<boolean>(false);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isDateToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Первоначальное центрирование выбранного дня
  useEffect(() => {
    if (scrollContainerRef.current && !isInitialScrollDone.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        isInitialScrollDone.current = true;
      }
    }
  }, [days, selectedDate]);

  // Скролл к выбранной дате при смене через внешний пикер
  useEffect(() => {
    if (scrollContainerRef.current && isInitialScrollDone.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  // Бесконечная подгрузка дней при приближении к границам
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    // Подгрузка в прошлое (скролл влево)
    if (scrollLeft < 150) {
      const firstDay = days[0];
      const newPastDays: Date[] = [];
      for (let i = BATCH_DAYS; i >= 1; i--) {
        const d = new Date(firstDay);
        d.setDate(firstDay.getDate() - i);
        newPastDays.push(d);
      }

      const prevScrollWidth = container.scrollWidth;
      setDays(prev => [...newPastDays, ...prev]);

      // Корректируем позицию скролла, чтобы интерфейс не дергался
      requestAnimationFrame(() => {
        if (container) {
          const addedWidth = container.scrollWidth - prevScrollWidth;
          container.scrollLeft += addedWidth;
        }
      });
    }

    // Подгрузка в будущее (скролл вправо)
    if (scrollWidth - (scrollLeft + clientWidth) < 150) {
      const lastDay = days[days.length - 1];
      const newFutureDays: Date[] = [];
      for (let i = 1; i <= BATCH_DAYS; i++) {
        const d = new Date(lastDay);
        d.setDate(lastDay.getDate() + i);
        newFutureDays.push(d);
      }
      setDays(prev => [...prev, ...newFutureDays]);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`w-full flex items-center gap-2 overflow-x-auto scrollbar-none touch-pan-x snap-x snap-mandatory py-1 px-5 select-none ${className}`}
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDay = isDateToday(day);
        const weekdayStr = day.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase();
        const dayNumStr = day.getDate();

        return (
          <button
            key={day.toISOString()}
            type="button"
            data-selected={isSelected}
            onClick={() => onSelectDate(day)}
            style={isSelected ? { backgroundColor: accentColor || '#CCFF00', color: activeTextColor } : {}}
            className={`w-11 h-11 flex flex-col items-center justify-center transition-all duration-200 select-none shrink-0 cursor-pointer border-none outline-none rounded-full snap-center ${
              isSelected
                ? 'font-normal shadow-md scale-105'
                : isTodayDay
                  ? theme === 'light'
                    ? 'bg-[#CDD2D7] ring-2 ring-[#CCFF00] text-[#121214] font-medium'
                    : 'bg-zinc-800 ring-2 ring-[#CCFF00] text-white font-medium'
                  : theme === 'light'
                    ? 'bg-[#CDD2D7] text-[#121214] hover:bg-[#c3c8cd] font-medium'
                    : 'bg-zinc-800/90 text-stone-300 hover:bg-zinc-700 font-medium'
            }`}
          >
            <span
              className={`text-[8.5px] uppercase tracking-wider font-bold leading-none ${
                isSelected
                  ? activeTextColor === '#000000'
                    ? 'text-black/80'
                    : 'text-white/80'
                  : theme === 'light'
                    ? 'text-zinc-700'
                    : 'text-zinc-400'
              }`}
            >
              {weekdayStr}
            </span>
            <span className="text-xs font-bold mt-0.5 leading-none tracking-wide">
              {dayNumStr}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default HorizontalCalendar;