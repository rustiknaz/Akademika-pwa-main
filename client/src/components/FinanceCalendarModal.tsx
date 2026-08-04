import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FinanceCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onSelectRange: (start: string, end: string) => void;
  onSelectToday: () => void;
  accentColor?: string;
  activeTextColor?: string;
}

const RU_MONTHS = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
];

export default function FinanceCalendarModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  onSelectRange,
  onSelectToday,
  accentColor = '#CCFF00',
  activeTextColor = '#000000',
}: FinanceCalendarModalProps) {
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(6); // July (0-indexed 6)

  const [rangeStart, setRangeStart] = useState<string | null>(startDate || null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(endDate || null);

  useEffect(() => {
    if (isOpen) {
      setRangeStart(startDate || null);
      setRangeEnd(endDate || null);
      if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      }
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const formatYMD = (year: number, month: number, day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (dStr: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // First click: set start date
      setRangeStart(dStr);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      if (dStr < rangeStart) {
        // Earlier than start: reset start date
        setRangeStart(dStr);
        setRangeEnd(null);
      } else if (dStr === rangeStart) {
        // Single day range
        setRangeEnd(dStr);
        onSelectRange(dStr, dStr);
        onClose();
      } else {
        // Second click: set end date
        setRangeEnd(dStr);
        onSelectRange(rangeStart, dStr);
        onClose();
      }
    }
  };

  // Build grid days
  const firstDayObj = new Date(viewYear, viewMonth, 1);
  const firstDayOfWeek = (firstDayObj.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6

  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDays: { day: number; dStr: string; isCurrent: boolean }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    prevMonthDays.push({
      day,
      dStr: formatYMD(prevY, prevM, day),
      isCurrent: false,
    });
  }

  const currentMonthDays: { day: number; dStr: string; isCurrent: boolean }[] = [];
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    currentMonthDays.push({
      day,
      dStr: formatYMD(viewYear, viewMonth, day),
      isCurrent: true,
    });
  }

  const totalSoFar = prevMonthDays.length + currentMonthDays.length;
  const totalCells = Math.ceil(totalSoFar / 7) * 7;
  const nextMonthDaysCount = totalCells - totalSoFar;

  const nextMonthDays: { day: number; dStr: string; isCurrent: boolean }[] = [];
  for (let day = 1; day <= nextMonthDaysCount; day++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    nextMonthDays.push({
      day,
      dStr: formatYMD(nextY, nextM, day),
      isCurrent: false,
    });
  }

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="rounded-outer bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-5 w-full max-w-[340px] text-white relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="font-bold text-white text-base tracking-wider uppercase">
              {RU_MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-x-1 items-center justify-items-center mb-1">
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((d) => (
              <span key={d} className="text-xs font-bold text-zinc-400 text-center uppercase tracking-wider py-2">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-1 items-center justify-items-center my-2">
            {allDays.map((item, idx) => {
              if (!item.isCurrent) {
                return (
                  <div key={idx} className="text-zinc-600 font-medium pointer-events-none w-9 h-9 flex items-center justify-center text-xs">
                    {item.day}
                  </div>
                );
              }

              const isStart = rangeStart === item.dStr;
              const isEnd = rangeEnd === item.dStr;
              const isInRange = rangeStart && rangeEnd && item.dStr > rangeStart && item.dStr < rangeEnd;

              return (
                <div key={idx} className="w-full flex justify-center relative items-center">
                  {/* Background connector strip for range */}
                  {isInRange && (
                    <div className="absolute inset-0 bg-[#CCFF00]/20 z-0" />
                  )}
                  {isStart && rangeEnd && rangeStart !== rangeEnd && (
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#CCFF00]/20 z-0" />
                  )}
                  {isEnd && rangeStart && rangeStart !== rangeEnd && (
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#CCFF00]/20 z-0" />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDayClick(item.dStr)}
                    style={isStart || isEnd ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                    className={`relative z-10 w-9 h-9 flex items-center justify-center text-xs transition-all border-none cursor-pointer ${
                      isStart || isEnd
? 'font-normal rounded-chip shadow-md'
                        : isInRange
? 'text-white font-medium rounded-none bg-transparent'
: 'text-white font-medium hover:bg-white/10 rounded-chip bg-transparent'
                    }`}
                  >
                    {item.day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Footer Divider */}
          <div className="border-t border-white/10 my-3" />

          {/* "СЕГОДНЯ" Button */}
          <button
            type="button"
            onClick={() => {
              onSelectToday();
              onClose();
            }}
            style={{ backgroundColor: accentColor, color: activeTextColor }}
            className="w-full font-bold text-sm uppercase rounded-control py-3.5 text-center transition-all shadow-lg hover:brightness-105 active:scale-[0.98] cursor-pointer border-none"
          >
            СЕГОДНЯ
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
