import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface HorizontalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  className?: string;
}

export const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff';

  const [days, setDays] = useState<Date[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dList: Date[] = [];
    const centerDate = new Date(selectedDate);
    for (let i = -14; i <= 14; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      dList.push(d);
    }
    setDays(dList);
  }, []);

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
      d.getFullYear() === today.getFullYear();
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <div
      ref={scrollContainerRef}
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