import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  UserPlus,
  Banknote,
  Phone,
  MoreVertical,
  CheckCircle2,
  Calculator,
  RussianRuble,
  SlidersHorizontal,
  Search
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

// Моковые данные сотрудников
const MOCK_STAFF = [
  { id: '1', name: 'Мария Ковалева', role: 'trainer', phone: '+7 (911) 111-11-11', rate: '1200 ₽ / час', avatar: 'М' },
  { id: '2', name: 'Алексей Петров', role: 'admin', phone: '+7 (922) 222-22-22', rate: '3000 ₽ / смена', avatar: 'А' },
  { id: '3', name: 'Дарья Смирнова', role: 'trainer', phone: '+7 (933) 333-33-33', rate: '1500 ₽ / час', avatar: 'Д' },
  { id: '4', name: 'Евгения Морозова', role: 'trainer', phone: '+7 (944) 444-44-44', rate: '1000 ₽ / час', avatar: 'Е' },
];

// Моковые данные по зарплатам
const MOCK_PAYROLL = [
  { id: '1', name: 'Мария Ковалева', role: 'trainer', amount: 36000, period: 'Июль 2026 (I часть)', status: 'pending' },
  { id: '2', name: 'Алексей Петров', role: 'admin', amount: 45000, period: 'Июль 2026 (I часть)', status: 'pending' },
  { id: '3', name: 'Дарья Смирнова', role: 'trainer', amount: 28500, period: 'Июль 2026 (I часть)', status: 'pending' },
];

export default function AdminStaff() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Фильтры и поиск
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('Все сотрудники');
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Модалки
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  // Списки с учетом фильтра и поиска
  const displayedStaff = MOCK_STAFF.filter(s => {
    if (roleFilter === 'Тренеры' && s.role !== 'trainer') return false;
    if (roleFilter === 'Администраторы' && s.role !== 'admin') return false;
    if (search.trim()) {
      const matchName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchPhone = s.phone.includes(search);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const displayedPayroll = MOCK_PAYROLL.filter(p => {
    if (roleFilter === 'Тренеры' && p.role !== 'trainer') return false;
    if (roleFilter === 'Администраторы' && p.role !== 'admin') return false;
    if (search.trim()) {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      if (!matchName) return false;
    }
    return true;
  });

  const totalPayroll = displayedPayroll.reduce((acc, p) => acc + p.amount, 0);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ 
      title: "Зарплата выплачена", 
      description: `Сотрудник ${selectedPayroll?.name} получил выплату.` 
    });
    setIsPayModalOpen(false);
  };

  const filterPopupStyle: React.CSSProperties = {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 18, 20, 0.88)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
    borderRadius: '36px'
  };

  const searchInputStyle: React.CSSProperties = {
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(18, 18, 20, 0.75)',
    borderRadius: '9999px'
  };

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A3728]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Сплошной баннер #4A3728, уходящий наверх + Пилюля ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом (уходит за верхний край экрана) */}
          <div className="flex-1 relative h-[calc(100%+12px)] -mt-3">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* СЛАЙД 1: КОМАНДА */
                <motion.div
                  key="team-slide"
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-[#4A3728] text-white shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                      Сотрудники
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      {displayedStaff.length}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                      активных<br/>в штате
                    </span>
                  </div>

                  {/* Низ баннера: Круглая кнопка Фильтров слева, Поиск справа */}
                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFilterOpen(!isFilterOpen);
                        }} 
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#4A3728] rounded-full bg-white shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()} 
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-64 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Роль</label>
                            <select
                              value={roleFilter}
                              onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setIsFilterOpen(false);
                              }}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все сотрудники">Все сотрудники</option>
                              <option value="Тренеры">Тренеры</option>
                              <option value="Администраторы">Администраторы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#4A3728] text-white text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setRoleFilter('Все сотрудники');
                                setIsFilterOpen(false);
                              }} 
                              className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onPointerDown={(e) => e.stopPropagation()} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsSearchVisible(!isSearchVisible); 
                      }} 
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 2: ЗАРПЛАТЫ */
                <motion.div
                  key="payroll-slide"
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-[#4A3728] text-white shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                      Зарплаты
                    </h2>
                  </div>

                  <div className="flex flex-col gap-0 px-0.5">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      {totalPayroll.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide mt-1.5">
                      Ожидает выплаты
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFilterOpen(!isFilterOpen);
                        }} 
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#4A3728] rounded-full bg-white shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-64 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Роль</label>
                            <select
                              value={roleFilter}
                              onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setIsFilterOpen(false);
                              }}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все сотрудники">Все сотрудники</option>
                              <option value="Тренеры">Тренеры</option>
                              <option value="Администраторы">Администраторы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#4A3728] text-white text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setRoleFilter('Все сотрудники');
                                setIsFilterOpen(false);
                              }} 
                              className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onPointerDown={(e) => e.stopPropagation()} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsSearchVisible(!isSearchVisible); 
                      }} 
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(0); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'bg-[#4A3728] text-white shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Сотрудники"
            >
              <Users size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(1); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'bg-[#4A3728] text-white shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Зарплаты"
            >
              <Calculator size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩАЯ СТРОКА ПОИСКА ─── */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="z-10 relative overflow-visible"
            >
              <div style={searchInputStyle} className="relative w-full h-14 flex items-center shadow-none border-none overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-500 dark:text-zinc-400 stroke-[2.5]" />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeSlide === 0 ? "Поиск сотрудника по имени или телефону..." : "Поиск по ведомости..."}
                  className="w-full h-full pl-13 pr-6 bg-transparent text-sm font-bold text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 focus:outline-none border-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── СПИСКИ СОТРУДНИКОВ И ЗАРПЛАТ С GAP-2.5 ─── */}
        {activeSlide === 0 ? (
          <div className="flex flex-col gap-2.5">
            {displayedStaff.length > 0 ? (
              displayedStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md transition group text-left"
                >
                  <div className="w-[70px] h-[70px] rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shrink-0 select-none shadow-xs">
                    {staff.avatar}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-[#4A3728] dark:group-hover:text-amber-200">
                      {staff.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                        {staff.role === 'trainer' ? 'Тренер' : 'Администратор'} • {staff.rate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <a 
                      href={`tel:${staff.phone}`} 
                      className="w-11 h-11 rounded-full bg-[#4A3728]/15 text-[#4A3728] dark:text-amber-200 hover:bg-[#4A3728]/25 flex items-center justify-center transition-all shadow-xs"
                      title="Позвонить сотруднику"
                    >
                      <Phone size={18} className="stroke-[2.5]" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">
                Сотрудники не найдены
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {displayedPayroll.length > 0 ? (
              displayedPayroll.map((payroll) => (
                <div
                  key={payroll.id}
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-4 pr-3 flex items-center gap-3.5 shadow-md transition text-left"
                >
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-base text-slate-950 dark:text-white truncate">
                      {payroll.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                        {payroll.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto shrink-0">
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                      {payroll.amount.toLocaleString('ru-RU')} ₽
                    </span>

                    <Button
                      onClick={() => {
                        setSelectedPayroll(payroll);
                        setIsPayModalOpen(true);
                      }}
                      className="bg-[#4A3728] hover:bg-[#382a1e] text-white rounded-full h-10 px-4 text-[11px] font-black uppercase tracking-wider transition-all shadow-xs border-none cursor-pointer"
                    >
                      Выплатить
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">
                Записей к выплате не найдено
              </div>
            )}
          </div>
        )}

      </div>

      <FloatingActionButton
        onClick={() => setIsAddStaffOpen(true)}
        ariaLabel={activeSlide === 0 ? "Добавить сотрудника" : "Начислить бонус/штраф"}
        id="floating-action-btn"
        style={{ backgroundColor: '#4A3728', color: '#FFFFFF' }}
        className="!bg-[#4A3728] !text-white shadow-lg shadow-[#4A3728]/30 hover:opacity-95"
      />

      {/* МОДАЛКА ВЫПЛАТЫ */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="!rounded-[28px] !border-zinc-800 bg-[#161618] text-white p-7 max-w-sm shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <RussianRuble size={22} className="text-[#4A3728] dark:text-amber-200" />
              Выплата ЗП
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePay} className="space-y-4 pt-3">
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{selectedPayroll?.name}</p>
              <p className="text-2xl font-black text-amber-200 font-mono">{selectedPayroll?.amount.toLocaleString('ru-RU')} ₽</p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-full h-12 font-black text-xs uppercase tracking-wider shadow-md bg-[#4A3728] hover:bg-[#382a1e] text-white border-none cursor-pointer hover:opacity-90"
              >
                Подтвердить выплату
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}