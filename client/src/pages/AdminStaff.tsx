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
  Search,
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import CustomFilterDropdown from "../components/CustomFilterDropdown";
import FloatingActionButton from "../components/FloatingActionButton";
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Моковые данные сотрудников
const INITIAL_STAFF = [
  { id: '1', name: 'Мария Ковалева', role: 'trainer', phone: '+7 (911) 111-11-11', rate: '1200 ₽ / час', avatar: 'М', activeClasses: 4 },
  { id: '2', name: 'Алексей Петров', role: 'admin', phone: '+7 (922) 222-22-22', rate: '3000 ₽ / смена', avatar: 'А', activeClasses: 0 },
  { id: '3', name: 'Дарья Смирнова', role: 'trainer', phone: '+7 (933) 333-33-33', rate: '1500 ₽ / час', avatar: 'Д', activeClasses: 3 },
  { id: '4', name: 'Евгения Морозова', role: 'trainer', phone: '+7 (944) 444-44-44', rate: '1000 ₽ / час', avatar: 'Е', activeClasses: 2 },
];

// Моковые данные по зарплатам
const INITIAL_PAYROLL = [
  { id: '1', name: 'Мария Ковалева', role: 'trainer', amount: 36000, period: 'Июль 2026 (I часть)', hours: 30, status: 'pending' },
  { id: '2', name: 'Алексей Петров', role: 'admin', amount: 45000, period: 'Июль 2026 (I часть)', hours: 15, status: 'pending' },
  { id: '3', name: 'Дарья Смирнова', role: 'trainer', amount: 28500, period: 'Июль 2026 (I часть)', hours: 19, status: 'pending' },
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

  // Списки
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [payrollList, setPayrollList] = useState(INITIAL_PAYROLL);

  // Шторки
  const [isAddStaffDrawerOpen, setIsAddStaffDrawerOpen] = useState(false);
  const [selectedStaffForDrawer, setSelectedStaffForDrawer] = useState<any | null>(null);
  const [selectedPayrollForDrawer, setSelectedPayrollForDrawer] = useState<any | null>(null);

  // Форма добавления нового сотрудника
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    phone: '',
    role: 'trainer',
    rate: '1200 ₽ / час'
  });

  // Списки с учетом фильтра и поиска
  const displayedStaff = staffList.filter(s => {
    if (roleFilter === 'Тренеры' && s.role !== 'trainer') return false;
    if (roleFilter === 'Администраторы' && s.role !== 'admin') return false;
    if (search.trim()) {
      const matchName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchPhone = s.phone.includes(search);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const displayedPayroll = payrollList.filter(p => {
    if (roleFilter === 'Тренеры' && p.role !== 'trainer') return false;
    if (roleFilter === 'Администраторы' && p.role !== 'admin') return false;
    if (search.trim()) {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      if (!matchName) return false;
    }
    return true;
  });

  const totalPayroll = displayedPayroll.reduce((acc, p) => acc + p.amount, 0);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffData.name.trim() || !newStaffData.phone.trim()) {
      toast({ variant: "destructive", title: "Ошибка", description: "Заполните имя и телефон сотрудника" });
      return;
    }

    const newStaff = {
      id: Date.now().toString(),
      name: newStaffData.name.trim(),
      phone: newStaffData.phone.trim(),
      role: newStaffData.role,
      rate: newStaffData.rate.trim() || '1200 ₽ / час',
      avatar: newStaffData.name.trim()[0].toUpperCase(),
      activeClasses: newStaffData.role === 'trainer' ? 1 : 0
    };

    setStaffList([newStaff, ...staffList]);
    toast({
      title: "Сотрудник добавлен ✨",
      description: `${newStaff.name} успешно внесен в штат команды.`
    });

    setIsAddStaffDrawerOpen(false);
    setNewStaffData({
      name: '',
      phone: '',
      role: 'trainer',
      rate: '1200 ₽ / час'
    });
  };

  const handlePay = () => {
    if (!selectedPayrollForDrawer) return;
    setPayrollList(prev => prev.filter(p => p.id !== selectedPayrollForDrawer.id));
    toast({ 
      title: "Выплата проведена ✨", 
      description: `Зарплата ${selectedPayrollForDrawer.amount.toLocaleString('ru-RU')} ₽ успешно переведена (${selectedPayrollForDrawer.name}).` 
    });
    setSelectedPayrollForDrawer(null);
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
        <Loader2 className="w-8 h-8 animate-spin text-[#FCA311]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: С баннером и боковой пилюлей ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом с симметричным скруглением [42px] */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* СЛАЙД 1: КОМАНДА (#14213D фон, #FCA311 текст) */
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
                  style={{ backgroundColor: '#14213D', color: '#FCA311' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#FCA311] leading-tight">
                      Сотрудники
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#FCA311] font-mono tracking-tight leading-none">
                      {displayedStaff.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#FCA311]/80 uppercase tracking-wide leading-tight">
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
                        className="w-11 h-11 rounded-full bg-[#FCA311]/20 hover:bg-[#FCA311]/30 text-[#FCA311] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#14213D] rounded-full bg-[#FCA311] shrink-0" />}
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
                              style={{ backgroundColor: '#FCA311', color: '#14213D' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
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
                      className="w-11 h-11 rounded-full bg-[#FCA311]/20 hover:bg-[#FCA311]/30 text-[#FCA311] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 2: ЗАРПЛАТЫ (#FCA311 фон, #14213D текст) */
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
                  style={{ backgroundColor: '#FCA311', color: '#14213D' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#14213D] leading-tight">
                      Зарплаты
                    </h2>
                  </div>

                  <div className="flex flex-col gap-0 px-0.5">
                    <span className="text-4xl font-black text-[#14213D] font-mono tracking-tight leading-none">
                      {totalPayroll.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[10px] font-bold text-[#14213D]/80 uppercase tracking-wide mt-1.5">
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
                        className="w-11 h-11 rounded-full bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {roleFilter !== 'Все сотрудники' && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#FCA311] rounded-full bg-[#14213D] shrink-0" />}
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
                              style={{ backgroundColor: '#14213D', color: '#FCA311' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
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
                      className="w-11 h-11 rounded-full bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
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
              style={activeSlide === 0 ? { backgroundColor: '#FCA311', color: '#14213D' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Сотрудники"
            >
              <Users size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(1); }}
              style={activeSlide === 1 ? { backgroundColor: '#14213D', color: '#FCA311' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
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
                  onClick={() => setSelectedStaffForDrawer(staff)}
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md transition group text-left cursor-pointer hover:bg-white/60 dark:hover:bg-black/50"
                >
                  <div className="w-[70px] h-[70px] rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shrink-0 select-none shadow-xs">
                    {staff.avatar}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-[#FCA311]">
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
                      onClick={(e) => e.stopPropagation()}
                      className="w-11 h-11 rounded-full bg-[#FCA311]/15 text-[#FCA311] hover:bg-[#FCA311]/25 flex items-center justify-center transition-all shadow-xs"
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
                  onClick={() => setSelectedPayrollForDrawer(payroll)}
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-4 pr-3 flex items-center gap-3.5 shadow-md transition text-left cursor-pointer hover:bg-white/60 dark:hover:bg-black/50"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayrollForDrawer(payroll);
                      }}
                      style={{ backgroundColor: '#FCA311', color: '#14213D' }}
                      className="rounded-full h-10 px-4 text-[11px] font-black uppercase tracking-wider transition-all shadow-xs border-none cursor-pointer hover:opacity-90"
                    >
                      Выплата
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
        onClick={() => setIsAddStaffDrawerOpen(true)}
        ariaLabel="Добавить сотрудника"
        id="floating-action-btn"
        style={{ backgroundColor: '#14213D', color: '#FCA311' }}
        className="!bg-[#14213D] !text-[#FCA311] shadow-lg shadow-[#14213D]/40 hover:opacity-95"
      />

      {/* ─── ШТОРКА 1: ПРОФИЛЬ СОТРУДНИКА (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedStaffForDrawer && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaffForDrawer(null)}
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
                onClick={() => setSelectedStaffForDrawer(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-800/60 pr-8">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-md">
                  {selectedStaffForDrawer.avatar}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-2xl font-black text-white truncate">{selectedStaffForDrawer.name}</h3>
                  <span className="text-xs font-bold text-[#FCA311] uppercase tracking-wider mt-0.5">
                    {selectedStaffForDrawer.role === 'trainer' ? 'Преподаватель / Хореограф' : 'Администратор студии'}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-2 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Ставка</span>
                    <span className="text-sm font-black font-mono text-white">{selectedStaffForDrawer.rate}</span>
                  </div>

                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Активных групп</span>
                    <span className="text-sm font-black font-mono text-white">{selectedStaffForDrawer.activeClasses || 0} групп</span>
                  </div>
                </div>

                <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#FCA311]" />
                    <span className="text-xs font-mono font-bold text-white">{selectedStaffForDrawer.phone}</span>
                  </div>

                  <a
                    href={`tel:${selectedStaffForDrawer.phone}`}
                    style={{ backgroundColor: '#FCA311', color: '#14213D' }}
                    className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-xs"
                  >
                    Позвонить
                  </a>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      toast({ title: "Расписание преподавателя", description: "Загрузка календаря смен" });
                      setSelectedStaffForDrawer(null);
                    }}
                    style={{ backgroundColor: '#14213D', color: '#FCA311' }}
                    className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    Открыть расписание сотрудника
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 2: ВЫПЛАТА ЗАРПЛАТЫ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedPayrollForDrawer && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayrollForDrawer(null)}
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
                onClick={() => setSelectedPayrollForDrawer(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-start justify-between pb-3 border-b border-zinc-800/60 pr-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Ведомость начислений
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedPayrollForDrawer.name}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-4 pb-6 space-y-4">
                <div className="bg-[#1C1C1E] border border-zinc-800 p-5 rounded-[28px] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Сумма к выплате</span>
                  <span className="text-3xl font-black font-mono text-[#FCA311] mt-1">
                    {selectedPayrollForDrawer.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                    {selectedPayrollForDrawer.period}
                  </span>
                </div>

                <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-[#FCA311]" />
                    <span className="text-xs font-bold text-white">Учтено часов / смен</span>
                  </div>
                  <span className="text-sm font-black font-mono text-white">
                    {selectedPayrollForDrawer.hours || 0} ч.
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handlePay}
                    style={{ backgroundColor: '#FCA311', color: '#14213D' }}
                    className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    Подтвердить и выплатить
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 3: ДОБАВЛЕНИЕ СОТРУДНИКА (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {isAddStaffDrawerOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStaffDrawerOpen(false)}
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
                  <div className="w-9 h-9 rounded-full bg-[#FCA311]/20 text-[#FCA311] flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">
                      Новый сотрудник
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Добавление в команду студии
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddStaffDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4 pt-4 flex-1 overflow-y-auto scrollbar-none pr-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Имя и Фамилия</label>
                  <Input
                    required
                    value={newStaffData.name}
                    onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                    placeholder="Например: Артем Соколов"
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-sm font-bold px-4 focus-visible:border-[#FCA311]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Телефон</label>
                  <Input
                    required
                    value={newStaffData.phone}
                    onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                    placeholder="+7 (999) 000-00-00"
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-sm font-bold px-4 focus-visible:border-[#FCA311]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Должность</label>
                    <select
                      value={newStaffData.role}
                      onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#FCA311]"
                    >
                      <option value="trainer">Преподаватель</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ставка оплаты</label>
                    <Input
                      required
                      value={newStaffData.rate}
                      onChange={(e) => setNewStaffData({ ...newStaffData, rate: e.target.value })}
                      placeholder="1200 ₽ / час"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-xs font-bold px-4 focus-visible:border-[#FCA311]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#14213D', color: '#FCA311' }}
                    className="w-full rounded-full h-14 font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 border-none cursor-pointer"
                  >
                    Сохранить в штат
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