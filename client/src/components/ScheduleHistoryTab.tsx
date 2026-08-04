import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import HorizontalCalendar from './HorizontalCalendar';
import { PeriodHeaderBanner } from './PeriodHeaderBanner';

export interface BookingHistoryItem {
  id: number;
  status: string;
  user_id?: string;
  class_id?: number;
  classes: {
    id?: number;
    title: string;
    start_time: string;
    teacher_name?: string;
  };
  profiles: {
    full_name: string;
    phone: string;
  };
}

interface ScheduleHistoryTabProps {
  historyBookings: BookingHistoryItem[];
}

export default function ScheduleHistoryTab({ historyBookings }: ScheduleHistoryTabProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff';

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerCurrentDate, setPickerCurrentDate] = useState<Date>(new Date());

  // Week calculation helper (Monday as 1st day of week)
  const getMondayOfDate = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMondayOfDate(new Date()));

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const getDaysOfWeek = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
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

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setCurrentWeekStart(getMondayOfDate(day));
  };

  const handleSelectDatePickerDate = (day: Date) => {
    setSelectedDate(day);
    setCurrentWeekStart(getMondayOfDate(day));
    setIsDatePickerOpen(false);
  };

  const handleResetToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentWeekStart(getMondayOfDate(today));
    setPickerCurrentDate(today);
    setIsDatePickerOpen(false);
  };

  // Filtering history bookings according to selected date and viewMode
  const filteredBookings = historyBookings.filter((booking) => {
    if (!booking.classes?.start_time) return false;
    const startTime = new Date(booking.classes.start_time);

    if (viewMode === 'day') {
      return isSameDay(startTime, selectedDate);
    }

    if (viewMode === 'week') {
      const weekStart = new Date(currentWeekStart);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return startTime >= weekStart && startTime <= weekEnd;
    }

    if (viewMode === 'month') {
      return (
        startTime.getMonth() === selectedDate.getMonth() &&
        startTime.getFullYear() === selectedDate.getFullYear()
      );
    }

    return true;
  });

  const now = new Date();

  return (
    <motion.div
      key="history-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-4"
    >
      {/* 1. Header: Month Title & Selected Date Dropdown Pill */}
      <div className="flex justify-between items-end px-1">
        <span className="text-3xl md:text-4xl font-bold tracking-wider uppercase text-slate-900 dark:text-white" style={{ color: theme === 'dark' ? accentColor : undefined }}>
          {selectedDate.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()}
        </span>

        <button
          type="button"
          onClick={() => {
            setPickerCurrentDate(new Date(selectedDate));
            setIsDatePickerOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#CDD2D7] hover:bg-[#c3c8cd] border border-black/10 shadow-sm transition-all text-[#121214] text-xs font-bold rounded-btn cursor-pointer mb-0.5 select-none"
        >
          <span className="text-[#121214] font-bold uppercase">
            {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase()}
            , {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }).toUpperCase()}
          </span>
          <ChevronDown size={14} className="text-[#121214] shrink-0" />
        </button>
      </div>

      {/* 2. Horizontal Calendar (Without dark background wrapper) */}
      <HorizontalCalendar 
        selectedDate={selectedDate}
        onSelectDate={(d) => handleSelectDay(d)}
      />

      {/* 3. Mode Control Bar (Signature Light-Grey Banner) */}
      <PeriodHeaderBanner<'day' | 'week' | 'month'>
        title={
          viewMode === 'day' 
            ? `ИСТОРИЯ ЗА ДЕНЬ (${selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).toUpperCase()})` 
            : viewMode === 'week' 
              ? 'ИСТОРИЯ ЗА НЕДЕЛЮ' 
              : 'ИСТОРИЯ ЗА МЕСЯЦ'
        }
        icon={CalendarDays}
        options={[
          { id: 'day', label: 'День' },
          { id: 'week', label: 'Неделя' },
          { id: 'month', label: 'Месяц' },
        ]}
        activeId={viewMode}
        onSelect={(mode) => setViewMode(mode)}
        layoutId="historyViewModePill"
      />

      {/* 4. History Bookings Card List (Light Card Container) */}
      <div className="bg-[#CDD2D7] border border-black/10 rounded-card overflow-hidden shadow-md text-[#121214]">
        <div className="p-4 md:p-5 border-b border-black/10 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#121214] uppercase tracking-wider">Все прошедшие / архивные записи</h3>
          <span 
            style={{ backgroundColor: accentColor || '#CCFF00' }}
            className="text-xs font-bold text-black px-3 py-1 rounded-btn border border-black/10 shadow-xs tracking-wide"
          >
            {filteredBookings.length} записей
          </span>
        </div>

        <div className="divide-y divide-black/5 overflow-hidden">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const startTime = new Date(booking.classes.start_time);
              const isPast = startTime <= now;
              
              return (
                <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-black/5 transition-all">
                  <div className="space-y-1">
                    <span 
                      style={{ color: accentColor === '#CCFF00' ? '#121214' : accentColor, backgroundColor: `${accentColor}26` }}
                      className="text-xs font-bold px-2.5 py-0.5 rounded-btn uppercase tracking-wider"
                    >
                      {startTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} • {startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 className="text-sm font-medium text-[#121214] mt-1">{booking.classes.title}</h4>
                    <p className="text-xs font-medium text-zinc-600">
                      {booking.profiles.full_name} ({booking.profiles.phone})
                    </p>
                  </div>

                  <div>
                    {booking.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300/70 px-2.5 py-1 rounded-btn uppercase tracking-wider">
                        ✅ Посетил
                      </span>
                    )}
                    {booking.status === 'cancelled' && (
                      <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-300/70 px-2.5 py-1 rounded-btn uppercase tracking-wider">
                        ❌ Отмена
                      </span>
                    )}
                    {booking.status === 'missed' && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300/70 px-2.5 py-1 rounded-btn uppercase tracking-wider">
                        ❓ Пропуск
                      </span>
                    )}
                    {booking.status === 'booked' && isPast && (
                      <span className="text-xs font-bold text-zinc-600 bg-zinc-200 border border-zinc-300 px-2.5 py-1 rounded-btn uppercase tracking-wider">
                        Не явился
                      </span>
                    )}
                    {booking.status === 'booked' && !isPast && (
                      <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300/70 px-2.5 py-1 rounded-btn uppercase tracking-wider">
                        Ожидается
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-medium">
              Записи за выбранный период отсутствуют
            </div>
          )}
        </div>
      </div>

      {/* 5. Interactive Single Date Picker Modal */}
      <AnimatePresence>
        {isDatePickerOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsDatePickerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#161618] border border-white/10 rounded-card p-6 shadow-2xl select-none text-white flex flex-col relative z-[101]"
            >
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold tracking-wider uppercase text-white">
                  {pickerCurrentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\./, '')}
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer border-none"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer border-none ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(wd => (
                  <span key={wd} className="text-xs font-bold text-zinc-400 uppercase tracking-wider py-1">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 my-1">
                {(() => {
                  const year = pickerCurrentDate.getFullYear();
                  const month = pickerCurrentDate.getMonth();
                  
                  const firstDayDate = new Date(year, month, 1);
                  let startDayOfWeek = firstDayDate.getDay();
                  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const prevMonthDaysCount = new Date(year, month, 0).getDate();

                  const cells = [];

                  // Prev month
                  for (let i = startDayOfWeek - 1; i >= 0; i--) {
                    const d = new Date(year, month - 1, prevMonthDaysCount - i);
                    cells.push({ date: d, isCurrentMonth: false });
                  }

                  // Current month
                  for (let i = 1; i <= daysInMonth; i++) {
                    const d = new Date(year, month, i);
                    cells.push({ date: d, isCurrentMonth: true });
                  }

                  // Next month
                  const remaining = 42 - cells.length;
                  for (let i = 1; i <= remaining; i++) {
                    const d = new Date(year, month + 1, i);
                    cells.push({ date: d, isCurrentMonth: false });
                  }

                  return cells.map((cell, idx) => {
                    const isSel = isSameDay(cell.date, selectedDate);
                    const isTod = isDateToday(cell.date);
                    
                    return (
                      <div key={idx} className="h-9 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleSelectDatePickerDate(cell.date)}
                          style={isSel ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                          className={`text-xs transition-all cursor-pointer border-none ${
                            isSel
? 'w-9 h-9 flex items-center justify-center rounded-full font-normal shadow-md'
                              : isTod
? 'w-9 h-9 flex items-center justify-center border border-[#CCFF00]/40 text-white font-bold rounded-full bg-[#CCFF00]/10'
                                : cell.isCurrentMonth
                                  ? 'w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full bg-transparent'
                                  : 'w-9 h-9 flex items-center justify-center text-zinc-600 rounded-full bg-transparent'
                          }`}
                        >
                          {cell.date.getDate()}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Action Footer: "СЕГОДНЯ" Button */}
              <div className="border-t border-white/10 pt-4 mt-3">
                <button
                  type="button"
                  onClick={handleResetToToday}
                  style={{ backgroundColor: accentColor, color: activeTextColor }}
                  className="w-full font-bold text-xs uppercase rounded-btn py-3 text-center transition-all shadow-lg hover:brightness-105 active:scale-95 cursor-pointer border-none"
                >
                  СЕГОДНЯ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
