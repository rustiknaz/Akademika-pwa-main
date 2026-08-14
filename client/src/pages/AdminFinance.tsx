import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  CalendarDays,
  Plus,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Banknote,
  SplitSquareHorizontal,
  Receipt
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import CustomFilterDropdown from "../components/CustomFilterDropdown";
import FloatingActionButton from "../components/FloatingActionButton";
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Встроенный компонент календаря (как в Базе Клиентов) ---
function ModalDatePicker({
  isOpen,
  onClose,
  selectedDate,
  onUpdate
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onUpdate: (date: Date) => void;
}) {
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));

  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSelect = (date: Date) => {
    onUpdate(date);
    onClose();
  };

  const handleResetToToday = () => {
    handleSelect(new Date());
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const isDateToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayDate = new Date(year, month, 1);
  let startDayOfWeek = firstDayDate.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDaysCount - i);
    cells.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, isCurrentMonth: true });
  }

  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: d, isCurrentMonth: false });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="!bg-[#09090b] border !border-zinc-850 !rounded-[24px] p-5 max-w-sm w-full shadow-2xl shadow-black/80 flex flex-col text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-white tracking-wide">
            {viewDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\./, '').toLowerCase()}
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(wd => (
            <span key={wd} className="text-xs font-bold text-stone-500 uppercase tracking-widest py-1">
              {wd}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            const isSel = isSameDay(cell.date, selectedDate);
            const isTod = isDateToday(cell.date);

            return (
              <div key={idx} className="h-10 flex items-center justify-center">
                <button
                  onClick={() => handleSelect(cell.date)}
                  className={`text-xs transition-all cursor-pointer ${
                    isSel
                      ? 'w-9 h-9 flex items-center justify-center !rounded-full bg-[#CCFF00] text-black font-bold font-mono text-sm shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                      : isTod
                        ? 'w-9 h-9 flex items-center justify-center border border-[#CCFF00]/40 text-white font-medium rounded-xl bg-[#CCFF00]/5'
                        : cell.isCurrentMonth
                          ? 'w-9 h-9 flex items-center justify-center text-white hover:bg-zinc-900 rounded-xl'
                          : 'w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-zinc-900/50 rounded-xl'
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleResetToToday}
          className="w-full py-3 !bg-[#18181b] hover:bg-zinc-800 !rounded-full text-[#CCFF00] font-bold text-center mt-4 transition-colors border !border-zinc-800 cursor-pointer"
        >
          Сегодня
        </button>
      </div>
    </div>
  );
}
// --- Конец компонента календаря ---

// Моковые данные для транзакций
const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Екатерина Иванова', category: 'Абонементы', amount: 6400, type: 'income', date: new Date().toISOString() },
  { id: '2', title: 'Дмитрий Смирнов', category: 'Разовые', amount: 1000, type: 'income', date: new Date().toISOString() },
  { id: '3', title: 'Аренда зала 1', category: 'Аренда', amount: 2400, type: 'income', date: new Date().toISOString() },
  { id: '4', title: 'Анна Павлова', category: 'Абонементы', amount: 4800, type: 'income', date: new Date().toISOString() },
  { id: '5', title: 'Мария Ковалева', category: 'Разовые', amount: 500, type: 'income', date: new Date().toISOString() },
  { id: '6', title: 'Вода и стаканчики', category: 'Хоз. нужды', amount: 850, type: 'expense', date: new Date().toISOString() },
  { id: '7', title: 'Таргет ВК', category: 'Маркетинг', amount: 5000, type: 'expense', date: new Date().toISOString() },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Карта', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'sbp', label: 'СБП', icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'cash', label: 'Наличные', icon: Banknote, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'account', label: 'Со счета', icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'split', label: 'Раздельная', icon: SplitSquareHorizontal, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
];

export default function AdminFinance() {
  const [, setLocation] = useLocation();
  const { theme, accentColor } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Фильтры
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Модалки
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  // Состояние POS-терминала
  const [posData, setPosData] = useState({
    client: '',
    itemType: 'membership',
    amount: '',
    method: 'card',
    fiscalize: true
  });

  const displayedTransactions = MOCK_TRANSACTIONS.filter(t => {
    const isSameType = t.type === transactionType;
    const tDate = new Date(t.date);
    const isSameDate = tDate.getDate() === selectedDate.getDate() &&
                       tDate.getMonth() === selectedDate.getMonth() &&
                       tDate.getFullYear() === selectedDate.getFullYear();
    return isSameType && isSameDate;
  });

  const totalAmount = displayedTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handlePOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posData.amount) {
      toast({ variant: "destructive", title: "Ошибка", description: "Введите сумму оплаты" });
      return;
    }
    
    toast({ 
      title: "Оплата прошла успешно", 
      description: posData.fiscalize 
        ? "Транзакция сохранена, данные отправлены в ОФД (ФЗ-54). Чек сформирован." 
        : "Транзакция сохранена во внутренней базе."
    });
    setIsPOSOpen(false);
    setPosData({ client: '', itemType: 'membership', amount: '', method: 'card', fiscalize: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          {activeSlide === 0 ? 'Финансы' : 'Касса студии'}
        </h1>
      </header>

      {/* ДВУХСЛАЙДОВЫЙ БАННЕР */}
      <div className="relative h-[200px] w-full my-2 select-none z-20">
        <AnimatePresence initial={false} mode="wait">
          {activeSlide === 0 ? (
            /* СЛАЙД 1: Финансы (Сводка) */
            <motion.div
              key="finance-slide"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) {
                  setIsFilterOpen(false);
                  setActiveSlide(1);
                }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              style={{ backgroundColor: accentColor || '#CCFF00' }}
              className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/60">
                    ОПЕРАЦИИ И АНАЛИТИКА
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 mt-0.5">
                    Сводка
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsFilterOpen(false);
                    setActiveSlide(1);
                  }}
                  className="flex items-center gap-1 bg-black/10 hover:bg-black/15 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer border-none"
                >
                  <span className="text-[11px] uppercase tracking-wider">Касса</span>
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="flex flex-col gap-0 px-1 mt-1">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                  {totalAmount.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-xs font-bold text-slate-900/70 uppercase tracking-wide mt-1.5">
                  {transactionType === 'income' ? 'Доходы' : 'Расходы'} за {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              </div>

              <div className="relative pt-2 flex items-center justify-between">
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    type="button"
                    className="flex items-center gap-2 bg-black/10 hover:bg-black/15 text-slate-900 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                  >
                    <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>Фильтры</span>
                  </button>

                  {isFilterOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl w-64"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider block">Тип операции</label>
                        <CustomFilterDropdown
                          value={transactionType === 'income' ? 'Доходы' : 'Расходы'}
                          options={['Доходы', 'Расходы']}
                          onChange={(val) => {
                            setTransactionType(val === 'Доходы' ? 'income' : 'expense');
                            setIsFilterOpen(false);
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider block">Дата операций</label>
                        <button
                          onClick={() => {
                            setIsFilterOpen(false);
                            setIsDatePickerOpen(true);
                          }}
                          className="w-full flex items-center justify-between bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-zinc-700"
                        >
                          <span>{selectedDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          <CalendarDays size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pr-1">
                  <span className="w-4 h-1 rounded-full bg-slate-900 transition-all" />
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterOpen(false);
                      setActiveSlide(1);
                    }}
                    className="w-1.5 h-1 rounded-full bg-black/20 cursor-pointer hover:bg-black/40 transition-all" 
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* СЛАЙД 2: Касса (Управление POS) */
            <motion.div
              key="cashier-slide"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 40) {
                  setIsFilterOpen(false);
                  setActiveSlide(0);
                }
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterOpen(false);
                    setActiveSlide(0);
                  }}
                  className="flex items-center gap-1 bg-black/10 dark:bg-white/10 hover:bg-black/15 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer border-none"
                >
                  <ChevronLeft size={14} className="stroke-[2.5]" />
                  <span className="text-[10px] uppercase tracking-wider">Сводка</span>
                </button>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-zinc-400">
                    УПРАВЛЕНИЕ
                  </span>
                </div>

                <div className="bg-black/10 dark:bg-white/10 text-slate-900 dark:text-[#CCFF00] text-[11px] font-black px-3 py-1.5 rounded-full font-mono">
                  КАССА
                </div>
              </div>

              {/* Блок быстрых действий (Кнопки Кассы) */}
              <div className="grid grid-cols-2 gap-3 px-1 py-1">
                <button
                  onClick={() => setIsPOSOpen(true)}
                  style={{ backgroundColor: accentColor || '#CCFF00' }}
                  className="hover:opacity-90 border border-transparent p-4 rounded-[20px] shadow-sm flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-black/10 text-black flex items-center justify-center shrink-0">
                    <ShoppingCart size={24} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-black uppercase tracking-wider text-center leading-tight">
                    Новая<br/>продажа
                  </span>
                </button>

                <button
                  onClick={() => toast({ title: "В разработке", description: "Модуль создания расхода" })}
                  className="bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-transparent dark:border-white/5 p-4 rounded-[20px] shadow-sm flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowDownRight size={24} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-center leading-tight">
                    Внести<br/>расход
                  </span>
                </button>
              </div>

              <div className="relative pt-0.5 flex items-center justify-between">
                <div />
                <div className="flex items-center gap-1.5 pr-1">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterOpen(false);
                      setActiveSlide(0);
                    }}
                    className="w-1.5 h-1 rounded-full bg-black/20 dark:bg-white/20 cursor-pointer hover:bg-black/40 transition-all" 
                  />
                  <span className="w-4 h-1 rounded-full bg-slate-900 dark:bg-white transition-all" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 pt-4 pb-32 pr-0.5">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
            {transactionType === 'income' ? 'Список доходов' : 'Список расходов'}
          </h3>
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
            Всего: {displayedTransactions.length} транзакций
          </span>
        </div>

        {/* СПИСОК ТРАНЗАКЦИЙ */}
        <div className="space-y-2.5">
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((t) => (
              <div
                key={t.id}
                className="w-full min-h-[76px] bg-white/40 dark:bg-[#161618] border border-transparent dark:border-white/5 backdrop-blur-md rounded-[24px] px-4 py-3.5 flex items-center justify-between gap-3 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} className="stroke-[2.5]" /> : <ArrowDownRight size={20} className="stroke-[2.5]" />}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider truncate">
                      {t.category}
                    </span>
                  </div>
                </div>

                <div className={`text-base font-black font-mono whitespace-nowrap shrink-0 ${
                  t.type === 'income' 
                    ? 'text-emerald-600 dark:text-[#CCFF00]' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">
              {transactionType === 'income' ? 'Доходов за этот день нет' : 'Расходов за этот день нет'}
            </div>
          )}
        </div>
      </div>

      <FloatingActionButton
        onClick={() => setIsPOSOpen(true)}
        ariaLabel="Касса (Продажа)"
        id="floating-add-transaction-btn"
      />

      <ModalDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onUpdate={(date) => setSelectedDate(date)}
      />

      {/* МОДАЛЬНОЕ ОКНО POS (КАССА) */}
      <Dialog open={isPOSOpen} onOpenChange={setIsPOSOpen}>
        <DialogContent className="!rounded-[28px] !border-zinc-800 bg-[#161618] text-white p-7 max-w-md shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart size={22} className="text-[#CCFF00]" />
              Кассовый терминал
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePOSSubmit} className="space-y-5 pt-3">
            
            {/* Клиент */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Клиент (поиск)</label>
              <Input
                value={posData.client}
                onChange={e => setPosData({ ...posData, client: e.target.value })}
                placeholder="Имя, телефон или штрихкод..."
                className="rounded-2xl border-zinc-800 h-12 bg-[#1C1C1E] text-white text-sm font-medium px-4 focus-visible:border-[#CCFF00]"
              />
            </div>

            {/* Тип товара */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Что продаем?</label>
                <select
                  value={posData.itemType}
                  onChange={e => setPosData({ ...posData, itemType: e.target.value })}
                  className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="membership">Абонемент</option>
                  <option value="service">Услуга / Аренда</option>
                  <option value="product">Товар (Вода, мерч)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Сумма (₽)</label>
                <Input
                  required
                  type="number"
                  value={posData.amount}
                  onChange={e => setPosData({ ...posData, amount: e.target.value })}
                  placeholder="0"
                  className="rounded-2xl border-zinc-800 h-12 bg-[#1C1C1E] text-[#CCFF00] font-mono text-lg font-bold px-4 focus-visible:border-[#CCFF00]"
                />
              </div>
            </div>

            {/* Способы оплаты */}
            <div className="space-y-2.5 pt-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Способ оплаты</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = posData.method === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPosData({ ...posData, method: method.id })}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? `${method.bg} border-current shadow-sm` 
                          : 'bg-[#1C1C1E] border-zinc-800 hover:bg-zinc-800 text-stone-400'
                      }`}
                    >
                      <Icon size={20} className={isSelected ? method.color : ''} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? method.color : ''}`}>
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Фискализация (ФЗ-54) */}
            <div 
              onClick={() => setPosData({ ...posData, fiscalize: !posData.fiscalize })}
              className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors mt-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${posData.fiscalize ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Receipt size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Фискализация чека</span>
                  <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mt-0.5">Отправка в ОФД (ФЗ-54)</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${posData.fiscalize ? 'bg-[#CCFF00]' : 'bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${posData.fiscalize ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>

            <DialogFooter className="pt-4 pb-2">
              <Button
                type="submit"
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full rounded-full h-14 font-black text-sm uppercase tracking-wider shadow-md border-none cursor-pointer hover:opacity-90"
              >
                Оплатить {posData.amount ? `${Number(posData.amount).toLocaleString('ru-RU')} ₽` : ''}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav /> {/* <--- ВЕРНУТЬ ЭТУ СТРОКУ СЮДА */}
    </div>
  );
}