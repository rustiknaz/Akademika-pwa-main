import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarPlus, User, Clock, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingData: any) => void;
}

const AVAILABLE_DIRECTIONS = [
  'Twerk (Мария Ковалева)',
  'High Heels (Алексей Петров)',
  'Dancehall (Дарья Смирнова)',
  'Hip Hop (Ирина Волк)',
  'Stretching (Кристина Романова)',
  'Jazz Funk (Артем Соколов)'
];

export default function QuickBookModal({ isOpen, onClose, onSuccess }: QuickBookModalProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [selectedDirection, setSelectedDirection] = useState(AVAILABLE_DIRECTIONS[0]);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('19:00');
  const [bookingType, setBookingType] = useState<'trial' | 'regular' | 'one_time'>('trial');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Заполните поля",
        description: "Укажите имя и телефон ученика",
      });
      return;
    }

    const bookingRecord = {
      id: Date.now(),
      studentName: studentName.trim(),
      studentPhone: studentPhone.trim(),
      direction: selectedDirection,
      date: bookingDate,
      time: bookingTime,
      type: bookingType,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage
    try {
      const existingRaw = localStorage.getItem('studio_quick_bookings');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('studio_quick_bookings', JSON.stringify([bookingRecord, ...existing]));
    } catch (e) {
      console.error('Error saving quick booking:', e);
    }

    toast({
      title: "Ученик записан! 🗓️",
      description: `${studentName} записан(а) на ${selectedDirection.split('(')[0]} (${bookingDate} в ${bookingTime})`,
    });

    if (onSuccess) onSuccess(bookingRecord);

    // Reset and close
    setStudentName('');
    setStudentPhone('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-md p-6 rounded-card border border-zinc-800 bg-[#18181b] text-white shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl font-semibold uppercase text-white flex items-center gap-2">
                <CalendarPlus className="text-[#CCFF00]" size={22} />
                Быстрая запись
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Запись ученика на разовое или пробное занятие
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Тип записи */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block">
                ТИП ЗАПИСИ
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-btn border border-zinc-800">
                {[
                  { id: 'trial', label: 'Пробное' },
                  { id: 'regular', label: 'По абонементу' },
                  { id: 'one_time', label: 'Разовое' },
                ].map((item) => {
                  const isActive = bookingType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBookingType(item.id as any)}
                      style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={`py-2 text-xs font-bold rounded-btn transition-all cursor-pointer text-center border-none tracking-wide${
                        isActive
                          ? 'bg-[#CCFF00] text-black shadow-md'
: 'text-zinc-400 hover:text-white bg-transparent font-medium'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Данные ученика */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ФИО УЧЕНИКА *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ТЕЛЕФОН *
                </label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Выбор направления */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                ГРУППА / НАПРАВЛЕНИЕ
              </label>
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                {AVAILABLE_DIRECTIONS.map((dir, idx) => (
                  <option key={idx} value={dir} className="bg-zinc-900 text-white">
                    {dir}
                  </option>
                ))}
              </select>
            </div>

            {/* Дата и Время */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ДАТА
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ВРЕМЯ
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Кнопка отправки */}
            <div className="pt-2">
              <button
                type="submit"
                style={{ backgroundColor: accentColor, color: activeTextColor }}
                className="w-full h-12 font-bold text-sm uppercase rounded-btn flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                <Check size={18} />
                <span>Записать ученика</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
