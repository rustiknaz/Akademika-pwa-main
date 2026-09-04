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
  Receipt, 
  SlidersHorizontal, 
  BarChart3, 
  Search,
  X 
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import CustomFilterDropdown from "../components/CustomFilterDropdown";
import FloatingActionButton from "../components/FloatingActionButton";
import BottomNav from "../components/BottomNav";
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Встроенный компонент календаря ---
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200"
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
              className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#C6FF33] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#C6FF33] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      ? 'w-9 h-9 flex items-center justify-center !rounded-full bg-[#003566] text-[#C6FF33] font-bold font-mono text-sm shadow-[0_0_10px_rgba(198,255,51,0.4)]'
                      : isTod
                        ? 'w-9 h-9 flex items-center justify-center border border-[#C6FF33]/40 text-white font-medium rounded-xl bg-[#C6FF33]/5'
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
          className="w-full py-3 !bg-[#18181b] hover:bg-zinc-800 !rounded-full text-[#C6FF33] font-bold text-center mt-4 transition-colors border !border-zinc-800 cursor-pointer"
        >
          Сегодня
        </button>
      </div>
    </div>
  );
}

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
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  // 0 - Сводка, 1 - Касса
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Поиск и фильтры
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [summaryMode, setSummaryMode] = useState<'income' | 'expense' | 'all'>('income');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Модалки
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPOSDrawerOpen, setIsPOSDrawerOpen] = useState(false);
  const [selectedTransactionForDrawer, setSelectedTransactionForDrawer] = useState<any | null>(null);

  // Состояние POS-терминала
  const [posData, setPosData] = useState({
    client: '',
    itemType: 'membership',
    amount: '',
    method: 'card',
    fiscalize: true
  });

  const todayIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const todayExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const todayCashbox = todayIncome - todayExpense;

  const isTodayDate = 
    selectedDate.getDate() === new Date().getDate() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  const isFinanceFilterActive = summaryMode !== 'income' || !isTodayDate;

  const displayedTransactions = MOCK_TRANSACTIONS.filter(t => {
    if (summaryMode !== 'all' && t.type !== summaryMode) return false;
    const tDate = new Date(t.date);
    const isSameDate = tDate.getDate() === selectedDate.getDate() &&
                       tDate.getMonth() === selectedDate.getMonth() &&
                       tDate.getFullYear() === selectedDate.getFullYear();
    if (!isSameDate) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchAmount = t.amount.toString().includes(q);
      if (!matchTitle && !matchCategory && !matchAmount) return false;
    }
    return true;
  });

  const displayAmount = summaryMode === 'income' 
    ? todayIncome 
    : summaryMode === 'expense' 
      ? todayExpense 
      : todayCashbox;

  const handlePOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posData.amount) {
      toast({ variant: "destructive", title: "Ошибка", description: "Введите сумму оплаты" });
      return;
    }
    
    toast({ 
      title: "Оплата проведена ✨", 
      description: posData.fiscalize 
        ? "Транзакция сохранена, чек отправлен в ОФД (ФЗ-54)." 
        : "Транзакция зафиксирована во внутренней кассе."
    });
    setIsPOSDrawerOpen(false);
    setPosData({ client: '', itemType: 'membership', amount: '', method: 'card', fiscalize: true });
  };

  const filterPopupStyle: React.CSSProperties = {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.96)' : 'rgba(20, 20, 22, 0.96)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
    borderRadius: '36px'
  };

  const searchInputStyle: React.CSSProperties = {
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(24, 24, 28, 0.85)',
    borderRadius: '9999px'
  };

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6FF33]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* Оверлей для закрытия фильтра кликом вне его области */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={() => setIsFilterOpen(false)}
            className="fixed inset-0 z-[190] bg-transparent cursor-default pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">

        {/* ─── ВЕРХНИЙ БЛОК: СТАТИЧНЫЙ БАННЕР В ЦВЕТАХ ФИНАНСОВ ─── */}
        <div 
          style={{ backgroundColor: '#003566', color: '#C6FF33' }}
          className="relative min-h-[184px] h-[184px] w-full select-none z-30 p-5 rounded-[42px] shadow-md flex flex-col justify-between border-none overflow-visible"
        >
          {/* Анимируемая текстовая информация: Сводка ↔ Касса */}
          <div className="relative flex-1 flex flex-col justify-between pr-[68px] pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              {activeSlide === 0 ? (
                <motion.div
                  key="content-summary"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C6FF33]/70">
                      ФИНАНСЫ СТУДИИ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#C6FF33] mt-0.5 truncate">
                      Сводка операций
                    </h2>
                  </div>

                  <div className="flex flex-col gap-0 px-0.5">
                    <span className="text-4xl font-black text-[#C6FF33] font-mono tracking-tight leading-none">
                      {displayAmount.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[10px] font-bold text-[#C6FF33]/80 uppercase tracking-wide mt-1.5">
                      {summaryMode === 'income' ? 'Доходы' : summaryMode === 'expense' ? 'Расходы' : 'Касса / Баланс'} за {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content-pos"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C6FF33]/70">
                      КАССОВЫЙ ТЕРМИНАЛ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#C6FF33] mt-0.5 truncate">
                      Касса студии
                    </h2>
                  </div>

                  {/* Быстрые действия в Кассе */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPOSDrawerOpen(true)}
                      className="bg-[#C6FF33]/15 hover:bg-[#C6FF33]/25 border-none p-2.5 rounded-[22px] shadow-sm flex items-center gap-2 transition-all cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#C6FF33] text-[#003566] flex items-center justify-center shrink-0">
                        <ShoppingCart size={16} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-black text-[#C6FF33] uppercase tracking-wider leading-tight">
                        Новая<br/>продажа
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toast({ title: "В разработке", description: "Модуль внесения расхода" })}
                      className="bg-black/20 hover:bg-black/30 border-none p-2.5 rounded-[22px] shadow-sm flex items-center gap-2 transition-all cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500/25 text-rose-300 flex items-center justify-center shrink-0">
                        <ArrowDownRight size={16} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-black text-rose-200 uppercase tracking-wider leading-tight">
                        Внести<br/>расход
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Левая нижняя кнопка фильтра: кружок появляется ТОЛЬКО при нажатии или активном фильтре */}
          <div className="relative z-[200] pointer-events-auto">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterOpen(prev => !prev);
              }}
              style={(isFilterOpen || isFinanceFilterActive) ? { backgroundColor: '#C6FF33', color: '#003566' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none relative ${
                (isFilterOpen || isFinanceFilterActive)
                  ? 'shadow-md scale-100'
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Фильтры операций"
            >
              <SlidersHorizontal size={20} className="stroke-[2.5]" />
              {isFinanceFilterActive && !isFilterOpen && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 border-2 border-[#003566] rounded-full bg-[#C6FF33] shrink-0" />
              )}
            </button>

            {/* Всплывающее меню фильтров поверх всех слоев */}
            {isFilterOpen && (
              <div 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={filterPopupStyle}
                className="absolute top-[calc(100%+12px)] left-0 z-[300] border-none p-5 flex flex-col gap-3.5 w-64 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
              >
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">
                    Тип операций
                  </label>
                  <select
                    value={summaryMode}
                    onChange={(e) => setSummaryMode(e.target.value as any)}
                    className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                  >
                    <option value="income">Доходы</option>
                    <option value="expense">Расходы</option>
                    <option value="all">Все (Касса и Баланс)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">
                    Дата операций
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterOpen(false);
                      setIsDatePickerOpen(true);
                    }}
                    className="w-full flex items-center justify-between bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>{selectedDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    <CalendarDays size={14} className="text-slate-500 dark:text-zinc-400" />
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsFilterOpen(false)} 
                    style={{ backgroundColor: '#003566', color: '#C6FF33' }}
                    className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                  >
                    Применить
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { 
                      setSummaryMode('income');
                      setSelectedDate(new Date());
                    }} 
                    className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
                  >
                    Сброс
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 
            ПРАВАЯ КОЛОНКА ПАРЯЩИХ КНОПОК:
            - top-5, bottom-5, right-5 (выровнены по кнопке фильтра слева)
            - активная кнопка подсвечивается контрастным кружком #C6FF33 / #003566
          */}
          <div className="absolute right-5 top-5 bottom-5 flex flex-col justify-between items-center z-[200] pointer-events-auto">
            {/* 1. Верх: Сводка */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation();
                setIsFilterOpen(false); 
                setActiveSlide(0); 
              }}
              style={activeSlide === 0 ? { backgroundColor: '#C6FF33', color: '#003566' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Сводка"
            >
              <BarChart3 size={20} className="stroke-[2.5]" />
            </button>
            
            {/* 2. Середина: Касса */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation();
                setIsFilterOpen(false); 
                setActiveSlide(1); 
              }}
              style={activeSlide === 1 ? { backgroundColor: '#C6FF33', color: '#003566' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Касса"
            >
              <Wallet size={20} className="stroke-[2.5]" />
            </button>

            {/* 3. Низ: Поиск (на одной высоте с фильтром) */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsFilterOpen(false);
                setIsSearchVisible(prev => !prev); 
              }}
              style={isSearchVisible ? { backgroundColor: '#C6FF33', color: '#003566' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                isSearchVisible 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Поиск транзакций"
            >
              <Search size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩАЯ СТРОКА ПОИСКА ─── */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="z-20 relative overflow-visible"
            >
              <div 
                style={searchInputStyle} 
                className="w-full h-14 flex items-center gap-3 px-5 shadow-md border border-white/10"
              >
                <Search size={20} className="text-slate-500 dark:text-zinc-400 stroke-[2.5] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по клиенту, категории или сумме..."
                  className="flex-1 h-full bg-transparent text-sm font-bold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none border-none p-0 m-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── СПИСОК ТРАНЗАКЦИЙ С GAP-2.5 ─── */}
        <div className="flex flex-col gap-2.5">
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTransactionForDrawer(t)}
                className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md transition group text-left cursor-pointer hover:bg-white/60 dark:hover:bg-black/50"
              >
                <div className={`w-[70px] h-[70px] rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'income' 
                    ? 'bg-[#C6FF33]/20 text-[#003566] dark:text-[#C6FF33]' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {t.type === 'income' ? (
                    <ArrowUpRight size={28} className="stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight size={28} className="stroke-[2.5]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-[#003566] dark:group-hover:text-[#C6FF33]">
                    {t.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                      {t.category}
                    </span>
                  </div>
                </div>

                <div className={`text-lg font-black font-mono whitespace-nowrap ml-auto shrink-0 ${
                  t.type === 'income' 
                    ? 'text-emerald-600 dark:text-[#C6FF33]' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">
              {summaryMode === 'income' ? 'Доходов за этот день нет' : summaryMode === 'expense' ? 'Расходов за этот день нет' : 'Операций не найдено'}
            </div>
          )}
        </div>

      </div>

      <FloatingActionButton
        onClick={() => setIsPOSDrawerOpen(true)}
        ariaLabel="Касса (Продажа)"
        id="floating-add-transaction-btn"
        style={{ backgroundColor: '#003566', color: '#C6FF33' }}
        className="!bg-[#003566] !text-[#C6FF33] shadow-lg shadow-[#003566]/40 hover:opacity-95"
      />

      <ModalDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onUpdate={(date) => setSelectedDate(date)}
      />

      {/* ─── ШТОРКА 1: ДЕТАЛИ ТРАНЗАКЦИИ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedTransactionForDrawer && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransactionForDrawer(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t border-x border-zinc-800 rounded-t-[42px] p-6 pt-7 pb-8 shadow-2xl flex flex-col text-white max-h-[85dvh]"
            >
              <button
                onClick={() => setSelectedTransactionForDrawer(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-start justify-between pb-4 border-b border-zinc-800/60 pr-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Детали операции
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedTransactionForDrawer.title}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-4 pb-6 space-y-4">
                <div className="bg-[#1C1C1E] border border-zinc-800 p-5 rounded-[28px] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Сумма платежа</span>
                  <span className={`text-3xl font-black font-mono mt-1 ${
                    selectedTransactionForDrawer.type === 'income' ? 'text-[#C6FF33]' : 'text-rose-400'
                  }`}>
                    {selectedTransactionForDrawer.type === 'income' ? '+' : '-'}{selectedTransactionForDrawer.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Категория</span>
                    <span className="text-sm font-bold text-white">{selectedTransactionForDrawer.category}</span>
                  </div>

                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Дата и время</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {new Date(selectedTransactionForDrawer.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Receipt size={18} className="text-[#C6FF33]" />
                    <span className="text-xs font-bold text-white">Электронный чек (ОФД)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#C6FF33]/15 text-[#C6FF33] rounded-full">
                    Фискализирован
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      toast({ title: "Чек отправлен", description: "Электронный чек выслан клиенту" });
                      setSelectedTransactionForDrawer(null);
                    }}
                    style={{ backgroundColor: '#003566', color: '#C6FF33' }}
                    className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    Отправить чек клиенту
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 2: POS КАССОВЫЙ ТЕРМИНАЛ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {isPOSDrawerOpen && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPOSDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t border-x border-zinc-800 rounded-t-[42px] p-6 pt-7 pb-8 shadow-2xl flex flex-col text-white max-h-[88dvh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#003566] text-[#C6FF33] flex items-center justify-center font-bold">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">
                      Кассовый терминал
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Прием оплаты и фискализация
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPOSDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePOSSubmit} className="space-y-4 pt-4 flex-1 overflow-y-auto scrollbar-none pr-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Клиент (поиск)</label>
                  <Input
                    value={posData.client}
                    onChange={e => setPosData({ ...posData, client: e.target.value })}
                    placeholder="Имя, телефон или штрихкод..."
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-sm font-bold px-4 focus-visible:border-[#003566]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Что продаем?</label>
                    <select
                      value={posData.itemType}
                      onChange={e => setPosData({ ...posData, itemType: e.target.value })}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#003566]"
                    >
                      <option value="membership">Абонемент</option>
                      <option value="service">Услуга / Аренда</option>
                      <option value="product">Товар (Вода, мерч)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Сумма (₽)</label>
                    <Input
                      required
                      type="number"
                      value={posData.amount}
                      onChange={e => setPosData({ ...posData, amount: e.target.value })}
                      placeholder="0"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-[#C6FF33] font-mono text-base font-black px-4 focus-visible:border-[#003566]"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Способ оплаты</label>
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
                              : 'bg-black/30 border-zinc-800 hover:bg-zinc-800 text-stone-400'
                          }`}
                        >
                          <Icon size={18} className={isSelected ? method.color : ''} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? method.color : ''}`}>
                            {method.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div 
                  onClick={() => setPosData({ ...posData, fiscalize: !posData.fiscalize })}
                  className="bg-black/30 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${posData.fiscalize ? 'bg-[#C6FF33]/20 text-[#C6FF33]' : 'bg-zinc-800 text-zinc-500'}`}>
                      <Receipt size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Фискализация чека</span>
                      <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Отправка в ОФД (ФЗ-54)</span>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${posData.fiscalize ? 'bg-[#003566]' : 'bg-zinc-700'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${posData.fiscalize ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#003566', color: '#C6FF33' }}
                    className="w-full rounded-full h-14 font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 border-none cursor-pointer"
                  >
                    Оплатить {posData.amount ? `${Number(posData.amount).toLocaleString('ru-RU')} ₽` : ''}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}