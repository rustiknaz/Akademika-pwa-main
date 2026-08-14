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
  RussianRuble
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

  // Фильтры
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('Все сотрудники');

  // Модалки
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  // Списки
  const displayedStaff = MOCK_STAFF.filter(s => {
    if (roleFilter === 'Тренеры') return s.role === 'trainer';
    if (roleFilter === 'Администраторы') return s.role === 'admin';
    return true;
  });

  const totalPayroll = MOCK_PAYROLL.reduce((acc, p) => acc + p.amount, 0);

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
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          {activeSlide === 0 ? 'Команда' : 'Зарплаты'}
        </h1>
      </header>

      {/* ДВУХСЛАЙДОВЫЙ БАННЕР */}
      <div className="relative h-[200px] w-full my-2 select-none z-20">
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
              style={{ backgroundColor: accentColor || '#CCFF00' }}
              className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/60">
                    УПРАВЛЕНИЕ СТУДИЕЙ
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 mt-0.5">
                    Сотрудники
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
                  <span className="text-[11px] uppercase tracking-wider">Зарплаты</span>
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-baseline gap-2 px-1 mt-2">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                  {displayedStaff.length}
                </span>
                <span className="text-xs font-bold text-slate-900/70 uppercase tracking-wide">
                  активных в штате
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
                    {roleFilter !== 'Все сотрудники' && <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />}
                  </button>

                  {isFilterOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-64"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider block">Роль</label>
                        <CustomFilterDropdown
                          value={roleFilter}
                          options={['Все сотрудники', 'Тренеры', 'Администраторы']}
                          onChange={(val) => {
                            setRoleFilter(val);
                            setIsFilterOpen(false);
                          }}
                        />
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
                  <span className="text-[10px] uppercase tracking-wider">Команда</span>
                </button>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-zinc-400">
                    ФИНАНСЫ
                  </span>
                </div>

                <div className="bg-black/10 dark:bg-white/10 text-slate-900 dark:text-[#CCFF00] text-[11px] font-black px-3 py-1.5 rounded-full font-mono">
                  ЗАРПЛАТЫ
                </div>
              </div>

              <div className="flex flex-col gap-0 px-1 mt-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                  {totalPayroll.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mt-1.5">
                  Ожидает выплаты
                </span>
              </div>

              <div className="relative pt-2 flex items-center justify-between">
                <button
                  onClick={() => toast({ title: "Авторасчет", description: "Расчет зарплат запущен..." })}
                  className="flex items-center gap-2 bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                >
                  <Calculator size={14} className="stroke-[2.5]" />
                  <span>Рассчитать ЗП</span>
                </button>

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

      {/* ТЕЛО СТРАНИЦЫ */}
      <div className="flex-1 pt-4 pb-32 pr-0.5">
        
        {activeSlide === 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                {roleFilter}
              </h3>
            </div>

            <div className="space-y-2.5">
              {displayedStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="w-full bg-white/40 dark:bg-[#161618] border border-transparent dark:border-white/5 backdrop-blur-md rounded-[24px] p-4 flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white shrink-0">
                      {staff.avatar}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {staff.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                        {staff.role === 'trainer' ? 'Тренер' : 'Администратор'} • {staff.rate}
                      </span>
                    </div>
                  </div>

                  <a href={`tel:${staff.phone}`} className="w-10 h-10 rounded-full bg-[#CCFF00]/10 text-lime-600 dark:text-[#CCFF00] hover:bg-[#CCFF00]/20 flex items-center justify-center transition-colors shrink-0">
                    <Phone size={18} />
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                Ведомость к выплате
              </h3>
            </div>

            <div className="space-y-2.5">
              {MOCK_PAYROLL.map((payroll) => (
                <div
                  key={payroll.id}
                  className="w-full bg-white/40 dark:bg-[#161618] border border-transparent dark:border-white/5 backdrop-blur-md rounded-[24px] p-4 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {payroll.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                        {payroll.period}
                      </span>
                    </div>
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white shrink-0">
                      {payroll.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedPayroll(payroll);
                      setIsPayModalOpen(true);
                    }}
                    className="w-full bg-[#CCFF00] hover:bg-[#B5E600] text-black rounded-xl h-10 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Выплатить
                  </Button>
                </div>
              ))}
            </div>
          </>
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