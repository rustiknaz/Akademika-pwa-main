import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Search, 
  Plus, 
  Calendar, 
  Award, 
  Check, 
  LogOut, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { getReviews } from '../lib/reviews';
import { useTheme } from '@/context/ThemeContext';
import FloatingActionButton from "../components/FloatingActionButton";
import CustomFilterDropdown from "../components/CustomFilterDropdown";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { X, Pencil } from "lucide-react";

export type LeadStage = 'new' | 'trial_scheduled' | 'trial_attended' | 'bought' | 'lost';
export type LeadSource = 'instagram' | 'site' | 'referral' | 'ads';

export const STAGES_CONFIG: Record<LeadStage, { label: string; color: string; bg: string }> = {
  new: { label: 'Новая заявка', color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  trial_scheduled: { label: 'Назначен пробный', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  trial_attended: { label: 'Пришел на пробный', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  bought: { label: 'Действующий', color: 'text-emerald-600 dark:text-[#CCFF00]', bg: 'bg-emerald-500/10 dark:bg-[#CCFF00]/10 border-emerald-500/20 dark:border-[#CCFF00]/20' },
  lost: { label: 'Отказ', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

export const SOURCES_CONFIG: Record<LeadSource, { label: string; icon: string; bg: string; text: string }> = {
  instagram: { label: 'Instagram', icon: '📸', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  site: { label: 'Сайт', icon: '🌐', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  referral: { label: 'Сарафан', icon: '👥', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  ads: { label: 'Реклама', icon: '⚡', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
};

function ModalDatePicker({
  isOpen,
  onClose,
  expiresAt,
  onUpdate
}: {
  isOpen: boolean;
  onClose: () => void;
  expiresAt: string | null;
  onUpdate: (dateStr: string) => void;
}) {
  const [viewDate, setViewDate] = useState<Date>(() => {
    return expiresAt ? new Date(expiresAt) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return expiresAt ? new Date(expiresAt) : null;
  });

  useEffect(() => {
    if (expiresAt) {
      const d = new Date(expiresAt);
      setSelectedDate(d);
      setViewDate(new Date(d));
    } else {
      setSelectedDate(null);
    }
  }, [expiresAt, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    onUpdate(date.toISOString().split('T')[0]);
    onClose();
  };

  const handleResetToToday = () => {
    const today = new Date();
    handleSelect(today);
  };

  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
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

export default function AdminStudents() {
  const [, setLocation] = useLocation();
  const { theme, accentColor } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // 0 - База (Действующие), 1 - Воронка (Лиды)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Фильтры Базы
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Все филиалы');
  const [selectedHall, setSelectedHall] = useState('Все залы');
  const [selectedDirection, setSelectedDirection] = useState('Все направления');
  const [selectedAge, setSelectedAge] = useState('Все возраста');

  // Фильтры Воронки
  const [selectedFunnelStage, setSelectedFunnelStage] = useState('Все этапы');
  const [selectedFunnelSource, setSelectedFunnelSource] = useState('Все источники');

  const branchesList = ['Филиал: Невский', 'Филиал: Центральный'];
  const directionsList = ['Hip-Hop', 'K-Pop', 'Dancehall', 'High Heels', 'Breakdance'];
  const agesList = ['Дети (4-7)', 'Подростки (8-14)', 'Взрослые (15+)'];
  const funnelStagesList = ['Все этапы', 'Новая заявка', 'Назначен пробный', 'Пришел на пробный', 'Отказ'];
  const funnelSourcesList = ['Все источники', 'Instagram', 'Сайт', 'Сарафан', 'Реклама'];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    phone: '',
    initial_visits: 8,
    source: 'instagram' as LeadSource,
    stage: 'bought' as LeadStage
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<any | null>(null);
  const [selectedSubForDatePicker, setSelectedSubForDatePicker] = useState<{ id: number; expiresAt: string | null; studentName: string } | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        setLocation('/');
        return;
      }

      await fetchStudentsData();
      setLoading(false);
    }
    checkAdminAndFetch();
  }, [setLocation]);

  async function fetchStudentsData() {
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        avatar_url,
        branch,
        direction,
        age_category,
        stage,
        source,
        subscriptions (
          id,
          visits_left,
          expires_at
        )
      `);

    if (pError) {
      console.error('Error fetching students:', pError);
    } else {
      const parsed = (profiles || []).map((p, idx) => ({
        ...p,
        stage: p.stage || (idx % 4 === 0 ? 'new' : idx % 3 === 0 ? 'trial_scheduled' : idx % 2 === 0 ? 'trial_attended' : 'bought'),
        source: p.source || (idx % 4 === 0 ? 'instagram' : idx % 3 === 0 ? 'site' : idx % 2 === 0 ? 'referral' : 'ads')
      }));
      setStudents(parsed);
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert([{
          full_name: newStudent.full_name,
          phone: newStudent.phone,
          stage: activeSlide === 0 ? 'bought' : newStudent.stage,
          source: newStudent.source,
          role: 'user'
        }])
        .select()
        .single();

      if (pError) throw pError;

      const { error: sError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: profile.id,
          visits_left: newStudent.initial_visits,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (sError) throw sError;

      toast({ title: "Успешно", description: "Запись сохранена" });
      setIsAddModalOpen(false);
      setNewStudent({ full_name: '', phone: '', initial_visits: 8, source: 'instagram', stage: 'bought' });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleMoveStage = async (studentId: string, nextStage: LeadStage) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ stage: nextStage })
        .eq('id', studentId);

      if (error) throw error;
      toast({
        title: "Статус обновлен",
        description: `Клиент переведен в: ${STAGES_CONFIG[nextStage].label}`
      });

      setSelectedStudentForDrawer(prev => prev ? { ...prev, stage: nextStage } : null);
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    }
  };

  const handleUpdateExpiry = async (subId: number, newDate: string) => {
    if (!subId) return;
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ expires_at: new Date(newDate).toISOString() })
        .eq('id', subId);
      if (error) throw error;
      toast({ title: "Успешно", description: "Дата окончания обновлена" });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    }
  };

  // Разделение базы: Действующие (bought) vs Лиды (все остальные)
  const activeStudentsList = students.filter(s => (s.stage || 'bought') === 'bought');
  const leadsList = students.filter(s => (s.stage || 'bought') !== 'bought');

  // Подсчет количества лидов по этапам
  const stageCounts = {
    new: leadsList.filter(s => s.stage === 'new').length,
    trial_scheduled: leadsList.filter(s => s.stage === 'trial_scheduled').length,
    trial_attended: leadsList.filter(s => s.stage === 'trial_attended').length,
    lost: leadsList.filter(s => s.stage === 'lost').length,
  };

  // Проверка активности фильтров
  const isBaseFilterActive = selectedBranch !== 'Все филиалы' || selectedHall !== 'Все залы' || selectedDirection !== 'Все направления' || selectedAge !== 'Все возраста';
  const isFunnelFilterActive = selectedFunnelStage !== 'Все этапы' || selectedFunnelSource !== 'Все источники' || selectedBranch !== 'Все филиалы' || selectedDirection !== 'Все направления';

  // Отображаемый список
  const displayedList = (activeSlide === 0 ? activeStudentsList : leadsList).filter((s) => {
    const matchesSearch = 
      (s.full_name?.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone?.includes(search));
    if (!matchesSearch) return false;

    if (activeSlide === 0) {
      if (selectedBranch !== 'Все филиалы' && s.branch && s.branch !== selectedBranch) return false;
      if (selectedDirection !== 'Все направления' && s.direction && s.direction !== selectedDirection) return false;
      if (selectedAge !== 'Все возраста' && s.age_category && s.age_category !== selectedAge) return false;
    } else {
      if (selectedFunnelStage !== 'Все этапы') {
        const stageMap: Record<string, LeadStage> = {
          'Новая заявка': 'new',
          'Назначен пробный': 'trial_scheduled',
          'Пришел на пробный': 'trial_attended',
          'Отказ': 'lost'
        };
        if (s.stage !== stageMap[selectedFunnelStage]) return false;
      }
      if (selectedFunnelSource !== 'Все источники') {
        const sourceMap: Record<string, LeadSource> = {
          'Instagram': 'instagram',
          'Сайт': 'site',
          'Сарафан': 'referral',
          'Реклама': 'ads'
        };
        if (s.source !== sourceMap[selectedFunnelSource]) return false;
      }
      if (selectedBranch !== 'Все филиалы' && s.branch && s.branch !== selectedBranch) return false;
      if (selectedDirection !== 'Все направления' && s.direction && s.direction !== selectedDirection) return false;
    }

    return true;
  });

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
          {activeSlide === 0 ? 'База учеников' : 'Воронка лидов'}
        </h1>
      </header>

      {/* ДВУХСЛАЙДОВЫЙ БАННЕР ТОЛЬКО ПО СВАЙПУ (БЕЗ OVERFLOW-HIDDEN ДЛЯ КОРРЕКТНОГО ОТКРЫТИЯ ФИЛЬТРОВ) */}
      <div className="relative h-[200px] w-full my-2 select-none z-20">
        <AnimatePresence initial={false} mode="wait">
          {activeSlide === 0 ? (
            /* СЛАЙД 1: База действующих учеников */
            <motion.div
              key="base-slide"
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
                    ДЕЙСТВУЮЩИЕ УЧЕНИКИ
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 mt-0.5">
                    База клиентов
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
                  <span className="text-[11px] uppercase tracking-wider">Воронка</span>
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-baseline gap-2 px-1">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {displayedList.length}
                </span>
                <span className="text-xs font-bold text-slate-900/70 uppercase tracking-wide">
                  {displayedList.length === 1
                    ? 'активный ученик'
                    : displayedList.length >= 2 && displayedList.length <= 4
                    ? 'активных ученика'
                    : 'активных учеников'}
                </span>
              </div>

              <div className="relative pt-0.5 flex items-center justify-between">
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
                    {isBaseFilterActive && (
                      <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                    )}
                  </button>

                  {isFilterOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-72"
                    >
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Филиал</label>
                        <CustomFilterDropdown
                          value={selectedBranch}
                          options={['Все филиалы', ...branchesList]}
                          onChange={(newBranch) => {
                            setSelectedBranch(newBranch);
                            setSelectedHall('Все залы');
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Зал</label>
                        <CustomFilterDropdown
                          value={selectedHall}
                          options={['Все залы', 'Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']}
                          onChange={(newHall) => setSelectedHall(newHall)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Направление</label>
                        <CustomFilterDropdown
                          value={selectedDirection}
                          options={['Все направления', ...directionsList]}
                          onChange={(newDir) => setSelectedDirection(newDir)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Возраст</label>
                        <CustomFilterDropdown
                          value={selectedAge}
                          options={['Все возраста', ...agesList]}
                          onChange={(newAge) => setSelectedAge(newAge)}
                        />
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
                            setSelectedBranch('Все филиалы');
                            setSelectedHall('Все залы');
                            setSelectedDirection('Все направления');
                            setSelectedAge('Все возраста');
                          }}
                          className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        >
                          Сброс
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
            /* СЛАЙД 2: Воронка лидов с текстовой статистикой и фильтром */
            <motion.div
              key="funnel-slide"
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
              className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-zinc-900 border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing"
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
                  <span className="text-[10px] uppercase tracking-wider">База</span>
                </button>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-zinc-400">
                    ВОРОНКА ЛИДОВ
                  </span>
                </div>

                <div className="bg-black/10 dark:bg-white/10 text-slate-900 dark:text-[#CCFF00] text-[11px] font-black px-3 py-1.5 rounded-full font-mono">
                  {leadsList.length} лидов
                </div>
              </div>

              {/* ТЕКСТОВАЯ СТАТИСТИЧЕСКАЯ СТРОКА (НЕКЛИКАБЕЛЬНАЯ, ЧИСТЫЙ ТЕКСТ) */}
              <div className="grid grid-cols-4 gap-2 px-1 py-1">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                    {stageCounts.new}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1.5">
                    Заявка
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono leading-none">
                    {stageCounts.trial_scheduled}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1.5">
                    Записан
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-2xl font-black text-violet-600 dark:text-violet-400 font-mono leading-none">
                    {stageCounts.trial_attended}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1.5">
                    Пришел
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono leading-none">
                    {stageCounts.lost}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1.5">
                    Отказ
                  </span>
                </div>
              </div>

              {/* НИЖНЯЯ СТРОКА ВОРОНКИ: КНОПКА ФИЛЬТРА + ТОЧКИ */}
              <div className="relative pt-0.5 flex items-center justify-between">
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    type="button"
                    className="flex items-center gap-2 bg-black/10 dark:bg-white/10 hover:bg-black/15 text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>Фильтры воронки</span>
                    {isFunnelFilterActive && (
                      <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-[#CCFF00] shrink-0" />
                    )}
                  </button>

                  {isFilterOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-72"
                    >
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Этап воронки</label>
                        <CustomFilterDropdown
                          value={selectedFunnelStage}
                          options={funnelStagesList}
                          onChange={(newStage) => setSelectedFunnelStage(newStage)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Источник лида</label>
                        <CustomFilterDropdown
                          value={selectedFunnelSource}
                          options={funnelSourcesList}
                          onChange={(newSrc) => setSelectedFunnelSource(newSrc)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Филиал</label>
                        <CustomFilterDropdown
                          value={selectedBranch}
                          options={['Все филиалы', ...branchesList]}
                          onChange={(newBranch) => setSelectedBranch(newBranch)}
                        />
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
                            setSelectedFunnelStage('Все этапы');
                            setSelectedFunnelSource('Все источники');
                            setSelectedBranch('Все филиалы');
                          }}
                          className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                        >
                          Сброс
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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

      <div className="flex-1 pt-3 pb-32 pr-0.5">
        <div className="mb-4">
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full px-4 py-2.5 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-none">
            <Search className="text-zinc-400 dark:text-slate-200" size={20} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeSlide === 0 ? "Поиск по действующим ученикам..." : "Поиск по лидам и заявкам..."}
              className="
                bg-transparent
                outline-none
                text-sm
                w-full
                text-slate-900 dark:text-white
                placeholder:text-zinc-300 dark:placeholder:text-slate-200
                border-none shadow-none px-0 py-0
                focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none
              "
            />
          </div>
        </div>

        {/* СПИСОК КАРТОЧЕК */}
        <div className="space-y-2.5 mb-6">
          {displayedList.length > 0 ? (
            displayedList.map((student) => {
              const sub = student.subscriptions?.[0];
              const visits = sub?.visits_left ?? 0;
              const isExpired = sub?.expires_at ? new Date(sub.expires_at).getTime() < Date.now() : false;

              const stageKey = (student.stage as LeadStage) || 'bought';
              const sourceKey = (student.source as LeadSource) || 'instagram';
              const stageInfo = STAGES_CONFIG[stageKey] || STAGES_CONFIG.bought;
              const sourceInfo = SOURCES_CONFIG[sourceKey] || SOURCES_CONFIG.instagram;

              const avatar = student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.full_name || ''}
                  className="w-[56px] h-[56px] rounded-full object-cover flex items-center justify-center text-xl font-bold shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-[56px] h-[56px] rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white select-none text-xl font-bold shrink-0">
                  {student.full_name?.trim()[0]?.toUpperCase()
                    || <User size={28} className="text-zinc-400" />
                  }
                </div>
              );

              let badgeClass = "w-8 h-8 rounded-full bg-[#CCFF00] text-black font-bold flex items-center justify-center text-base font-mono";
              if (visits <= 0 || isExpired) {
                badgeClass = "w-8 h-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-base font-mono";
              } else if (visits >= 1 && visits <= 3) {
                badgeClass = "w-8 h-8 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-base font-mono";
              }

              const expiryDate = sub?.expires_at
                ? new Date(sub.expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—';

              return (
                <button
                  key={student.id}
                  type="button"
                  className="
                    w-full min-h-[86px]
                    bg-white/40 dark:bg-black/40 backdrop-blur-md
                    border-none
                    rounded-outer px-4 py-2.5
                    flex items-center gap-3.5
                    shadow-none
                    focus:outline-none transition group active:scale-[.99] cursor-pointer text-left
                  "
                  onClick={() => setSelectedStudentForDrawer(student)}
                >
                  {avatar}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-black dark:text-white truncate max-w-[170px] group-hover:text-lime-600 dark:group-hover:text-[#CCFF00]">
                        {student.full_name || 'Без имени'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${sourceInfo.bg} ${sourceInfo.text}`}>
                        <span>{sourceInfo.icon}</span>
                        <span>{sourceInfo.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${stageInfo.bg} ${stageInfo.color}`}>
                        {stageInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {activeSlide === 0 ? (
                      <>
                        <span className={badgeClass}>{visits}</span>
                        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-black/25 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-xs">
                          <Calendar size={13} className="text-slate-500 dark:text-zinc-400" />
                          {expiryDate}
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold text-slate-900 dark:text-white">
                        Лид
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 font-medium">
              {activeSlide === 0 ? 'Действующие ученики не найдены' : 'Лиды в этой категории отсутствуют'}
            </div>
          )}
        </div>
      </div>

      {/* ШТОРКА ДЕТАЛЕЙ УЧЕНИКА / ЛИДА */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForDrawer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto !bg-[#18181b] border-t !border-zinc-800 rounded-t-[24px] p-6 pb-6 z-50 select-none flex flex-col max-h-[85dvh]"
              style={{ backgroundColor: '#18181b' }}
            >
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 shrink-0" />

              <button
                onClick={() => setSelectedStudentForDrawer(null)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="flex-1 overflow-y-auto scrollbar-none pb-36">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 !rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white overflow-hidden shrink-0">
                      {selectedStudentForDrawer.avatar_url ? (
                        <img
                          src={selectedStudentForDrawer.avatar_url}
                          alt={selectedStudentForDrawer.full_name || 'Avatar'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xl font-semibold">
                          {selectedStudentForDrawer.full_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1.5 min-w-0">
                      <h2 className="text-2xl font-semibold text-white leading-tight truncate">
                        {selectedStudentForDrawer.full_name || 'Без имени'}
                      </h2>
                      {selectedStudentForDrawer.phone && (
                        <a
                          href={`tel:${selectedStudentForDrawer.phone}`}
                          className="!rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 flex items-center gap-2 text-sm text-zinc-300 w-fit select-none m-0 ml-0"
                        >
                          <Phone size={13} className="text-[#CCFF00]" />
                          <span className="truncate">{selectedStudentForDrawer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ЭТАП ВОРОНКИ */}
                  <div className="space-y-2 my-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Этап сделки / Воронка</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['new', 'trial_scheduled', 'trial_attended', 'bought', 'lost'] as LeadStage[]).map((stageKey) => {
                        const isCurrent = (selectedStudentForDrawer.stage || 'bought') === stageKey;
                        const conf = STAGES_CONFIG[stageKey];
                        return (
                          <button
                            key={stageKey}
                            type="button"
                            onClick={() => handleMoveStage(selectedStudentForDrawer.id, stageKey)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                              isCurrent 
                                ? `${conf.bg} ${conf.color} border-current shadow-sm` 
                                : 'bg-zinc-900/60 border-zinc-800 text-stone-400 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{conf.label}</span>
                            {isCurrent && <Check size={12} className="stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 my-4">
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Остаток занятий</span>
                      <span className="text-[#CCFF00] text-lg font-medium font-mono">
                        {selectedStudentForDrawer.subscriptions?.[0]?.visits_left ?? 0}
                      </span>
                    </div>
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1 min-w-0">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Источник</span>
                      <span className="text-white text-sm font-medium truncate capitalize">
                        {SOURCES_CONFIG[(selectedStudentForDrawer.source as LeadSource) || 'instagram']?.label || 'Instagram'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => {
                        toast({
                          title: "Заморозка абонемента",
                          description: `Абонемент для ${selectedStudentForDrawer.full_name} успешно заморожен на 14 дней`,
                        });
                        setSelectedStudentForDrawer(null);
                      }}
                      className="flex-1 py-3 text-xs font-bold border border-zinc-800 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer text-center text-stone-300"
                    >
                      Заморозить
                    </button>
                    <button
                      onClick={() => {
                        toast({
                          title: "История посещений",
                          description: "Раздел истории посещений в разработке",
                        });
                      }}
                      className="flex-1 py-3 text-xs font-bold border border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10 rounded-full transition-all cursor-pointer text-center"
                    >
                      История
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* МОДАЛКА ДОБАВЛЕНИЯ */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="!rounded-[24px] !border-zinc-850 shadow-2xl bg-[#18181b] text-white p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">
              {activeSlide === 0 ? 'Новый ученик' : 'Новый лид'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Имя Фамилия</label>
              <Input
                required
                value={newStudent.full_name}
                onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                placeholder="Иван Иванов"
                className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-black/40 text-white placeholder:text-stone-600 text-sm font-medium px-5 focus-visible:border-[#CCFF00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Телефон</label>
              <Input
                required
                value={newStudent.phone}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})}
                placeholder="79001234567"
                className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-black/40 text-white placeholder:text-stone-600 text-sm font-medium px-5 focus-visible:border-[#CCFF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Источник</label>
                <select
                  value={newStudent.source}
                  onChange={(e) => setNewStudent({ ...newStudent, source: e.target.value as LeadSource })}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3.5 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="instagram">📸 Instagram</option>
                  <option value="site">🌐 Сайт</option>
                  <option value="referral">👥 Сарафан</option>
                  <option value="ads">⚡ Реклама</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Этап сделки</label>
                <select
                  value={newStudent.stage}
                  onChange={(e) => setNewStudent({ ...newStudent, stage: e.target.value as LeadStage })}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3.5 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="bought">Купил (Действующий)</option>
                  <option value="new">Новая заявка</option>
                  <option value="trial_scheduled">Назначен пробный</option>
                  <option value="trial_attended">Пришел на пробный</option>
                  <option value="lost">Отказ</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Начальный баланс (занятий)</label>
              <Input
                required
                type="number"
                value={newStudent.initial_visits}
                onChange={(e) => setNewStudent({...newStudent, initial_visits: parseInt(e.target.value)})}
                className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-[#09090b]/40 bg-black/40 text-white text-sm font-medium px-5 focus-visible:border-[#CCFF00]"
              />
            </div>
            <DialogFooter className="pt-3">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-[#CCFF00] hover:bg-[#B5E600] text-black rounded-full h-12 font-bold text-sm tracking-wide shadow-md shadow-[#CCFF00]/10 border-none cursor-pointer"
              >
                {isCreating ? "Создание..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
        ariaLabel="Добавить ученика"
        id="floating-add-student-btn"
      />

      <ModalDatePicker
        isOpen={selectedSubForDatePicker !== null}
        onClose={() => setSelectedSubForDatePicker(null)}
        expiresAt={selectedSubForDatePicker?.expiresAt || null}
        onUpdate={(dateStr) => {
          if (selectedSubForDatePicker) {
            handleUpdateExpiry(selectedSubForDatePicker.id, dateStr);
          }
        }}
      />

      <BottomNav />
    </div>
  );
}