import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';

  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allFit, setAllFit] = useState(false);

  // Sync currentWeekStart when selectedDate changes externally
  useEffect(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }, [selectedDate]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDaysOfWeek = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDaysOfMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

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

  const checkOverflow = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setAllFit(scrollWidth <= clientWidth + 4);
    }
  };

  useEffect(() => {
    checkOverflow();
    const timer = setTimeout(checkOverflow, 100);
    return () => clearTimeout(timer);
  }, [isDesktop, selectedDate, currentWeekStart]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const handlePrev = () => {
    if (isDesktop) {
      if (scrollContainerRef.current && scrollContainerRef.current.scrollLeft > 10) {
        scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      } else {
        const prevMonth = new Date(selectedDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        onSelectDate(prevMonth);
      }
    } else {
      const prev = new Date(currentWeekStart);
      prev.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(prev);
    }
  };

  const handleNext = () => {
    if (isDesktop) {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft < scrollWidth - clientWidth - 10) {
          scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        } else {
          const nextMonth = new Date(selectedDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          onSelectDate(nextMonth);
        }
      }
    } else {
      const next = new Date(currentWeekStart);
      next.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(next);
    }
  };

  const daysToRender = isDesktop ? getDaysOfMonth(selectedDate) : getDaysOfWeek(currentWeekStart);
  const showArrows = !allFit || !isDesktop;

  return (
    <div className={`flex items-center justify-between gap-1 sm:gap-1.5 py-1 px-1 ${className}`}>
      {showArrows && (
        <button
          type="button"
          onClick={handlePrev}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 border-none outline-none cursor-pointer ${
            theme === 'light'
              ? 'bg-[#CDD2D7] text-[#121214] hover:bg-[#c3c8cd]'
              : 'bg-zinc-800 text-stone-300 hover:bg-zinc-700'
          }`}
          aria-label="Предыдущий период"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center justify-between md:justify-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1 px-0.5"
      >
        {daysToRender.map((day) => {
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
              className={`w-11 h-11 sm:w-12 sm:h-12 flex flex-col items-center justify-center transition-all duration-200 select-none shrink-0 cursor-pointer border-none outline-none rounded-full ${
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
                className={`text-xs sm:text-[8.5px] uppercase tracking-wider font-bold leading-none${
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
              <span className="text-xs sm:text-xs font-bold mt-0.5 leading-none tracking-wide">
                {dayNumStr}
              </span>
            </button>
          );
        })}
      </div>

      {showArrows && (
        <button
          type="button"
          onClick={handleNext}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 border-none outline-none cursor-pointer ${
            theme === 'light'
              ? 'bg-[#CDD2D7] text-[#121214] hover:bg-[#c3c8cd]'
              : 'bg-zinc-800 text-stone-300 hover:bg-zinc-700'
          }`}
          aria-label="Следующий период"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default HorizontalCalendar;
