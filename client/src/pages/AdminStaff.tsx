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
  const { theme, accentColor } = useTheme();
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

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Матовый слайдер, уходящий наверх + Пилюля ─── */}
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Сотрудники
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      {displayedStaff.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
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
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-[24px] p-4 flex flex-col gap-3 shadow-2xl w-64 origin-top-left"
                        >
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Роль</label>
                            <select
                              value={roleFilter}
                              onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setIsFilterOpen(false);
                              }}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все сотрудники">Все сотрудники</option>
                              <option value="Тренеры">Тренеры</option>
                              <option value="Администраторы">Администраторы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setRoleFilter('Все сотрудники');
                                setIsFilterOpen(false);
                              }} 
                              className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
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
                      className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Зарплаты
                    </h2>
                  </div>

                  <div className="flex flex-col gap-0 px-0.5">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      {totalPayroll.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mt-1.5">
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
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-[24px] p-4 flex flex-col gap-3 shadow-2xl w-64 origin-top-left"
                        >
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Роль</label>
                            <select
                              value={roleFilter}
                              onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setIsFilterOpen(false);
                              }}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все сотрудники">Все сотрудники</option>
                              <option value="Тренеры">Тренеры</option>
                              <option value="Администраторы">Администраторы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setRoleFilter('Все сотрудники');
                                setIsFilterOpen(false);
                              }} 
                              className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
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
                      className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-[#161618]/90 border border-black/5 dark:border-white/10 rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-sm shrink-0 backdrop-blur-md">
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(0); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Сотрудники"
            >
              <Users size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(1); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
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
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="z-10 relative"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 dark:text-zinc-500" />
                </div>
                <Input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeSlide === 0 ? "Поиск сотрудника по имени или телефону..." : "Поиск по ведомости..."}
                  className="w-full pl-11 h-14 !rounded-full bg-white dark:bg-[#1C1C1E] !border-none shadow-sm text-sm font-medium focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 transition-all"
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
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] px-5 py-3 flex items-center gap-3.5 shadow-none transition group"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-lg font-black text-slate-900 dark:text-white shrink-0 select-none">
                    {staff.avatar}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-lime-600 dark:group-hover:text-[#CCFF00]">
                      {staff.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                        {staff.role === 'trainer' ? 'Тренер' : 'Администратор'} • {staff.rate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <a 
                      href={`tel:${staff.phone}`} 
                      className="w-10 h-10 rounded-full bg-[#CCFF00]/10 text-lime-600 dark:text-[#CCFF00] hover:bg-[#CCFF00]/20 flex items-center justify-center transition-colors shrink-0"
                    >
                      <Phone size={18} />
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
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] px-5 py-3 flex items-center gap-3.5 shadow-none transition"
                >
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-base text-slate-950 dark:text-white truncate">
                      {payroll.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
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
                      className="bg-[#CCFF00] hover:bg-[#B5E600] text-black rounded-full h-9 px-4 text-[11px] font-black uppercase tracking-wider transition-colors shadow-xs border-none cursor-pointer"
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
      />

      {/* МОДАЛКА ВЫПЛАТЫ */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="!rounded-[28px] !border-zinc-800 bg-[#161618] text-white p-7 max-w-sm shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <RussianRuble size={22} className="text-[#CCFF00]" />
              Выплата ЗП
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePay} className="space-y-4 pt-3">
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{selectedPayroll?.name}</p>
              <p className="text-2xl font-black text-[#CCFF00] font-mono">{selectedPayroll?.amount.toLocaleString('ru-RU')} ₽</p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full rounded-full h-12 font-black text-xs uppercase tracking-wider shadow-md border-none cursor-pointer hover:opacity-90"
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