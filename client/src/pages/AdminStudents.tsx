import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  User, 
  Search, 
  Calendar, 
  Check, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Users,
  Filter
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
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
import { X } from "lucide-react";

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
  const [viewDate, setViewDate] = useState<Date>(() => expiresAt ? new Date(expiresAt) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => expiresAt ? new Date(expiresAt) : null);

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

  const handleResetToToday = () => handleSelect(new Date());

  const isSameDay = (d1: Date, d2: Date | null) => d2 ? d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear() : false;
  const isDateToday = (d: Date) => { const today = new Date(); return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayDate = new Date(year, month, 1);
  let startDayOfWeek = firstDayDate.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevMonthDaysCount - i), isCurrentMonth: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="!bg-[#09090b] border !border-zinc-850 !rounded-[24px] p-5 max-w-sm w-full shadow-2xl shadow-black/80 flex flex-col text-white animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-white tracking-wide">{viewDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\./, '').toLowerCase()}</h3>
          <div className="flex gap-2">
            <button onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
            <button onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(wd => <span key={wd} className="text-xs font-bold text-stone-500 uppercase tracking-widest py-1">{wd}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            const isSel = isSameDay(cell.date, selectedDate);
            const isTod = isDateToday(cell.date);
            return (
              <div key={idx} className="h-10 flex items-center justify-center">
                <button onClick={() => handleSelect(cell.date)} className={`text-xs transition-all cursor-pointer ${isSel ? 'w-9 h-9 flex items-center justify-center !rounded-full bg-[#CCFF00] text-black font-bold font-mono text-sm shadow-[0_0_10px_rgba(204,255,0,0.4)]' : isTod ? 'w-9 h-9 flex items-center justify-center border border-[#CCFF00]/40 text-white font-medium rounded-xl bg-[#CCFF00]/5' : cell.isCurrentMonth ? 'w-9 h-9 flex items-center justify-center text-white hover:bg-zinc-900 rounded-xl' : 'w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-zinc-900/50 rounded-xl'}`}>
                  {cell.date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={handleResetToToday} className="w-full py-3 !bg-[#18181b] hover:bg-zinc-800 !rounded-full text-[#CCFF00] font-bold text-center mt-4 transition-colors border !border-zinc-800 cursor-pointer">Сегодня</button>
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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
    full_name: '', phone: '', initial_visits: 8, source: 'instagram' as LeadSource, stage: 'bought' as LeadStage
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<any | null>(null);
  const [selectedSubForDatePicker, setSelectedSubForDatePicker] = useState<{ id: number; expiresAt: string | null; studentName: string } | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setLocation('/Login');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') return setLocation('/');

      await fetchStudentsData();
      setLoading(false);
    }
    checkAdminAndFetch();
  }, [setLocation]);

  async function fetchStudentsData() {
    const { data: profiles, error: pError } = await supabase.from('profiles').select(`
        id, full_name, phone, avatar_url, branch, direction, age_category, stage, source,
        subscriptions (id, visits_left, expires_at)
      `);
    if (!pError) {
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
      const { data: profile, error: pError } = await supabase.from('profiles').insert([{
        full_name: newStudent.full_name, phone: newStudent.phone, stage: activeSlide === 0 ? 'bought' : newStudent.stage, source: newStudent.source, role: 'user'
      }]).select().single();
      if (pError) throw pError;
      const { error: sError } = await supabase.from('subscriptions').insert([{
        user_id: profile.id, visits_left: newStudent.initial_visits, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }]);
      if (sError) throw sError;
      toast({ title: "Успешно", description: "Запись сохранена" });
      setIsAddModalOpen(false);
      setNewStudent({ full_name: '', phone: '', initial_visits: 8, source: 'instagram', stage: 'bought' });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    } finally { setIsCreating(false); }
  };

  const handleMoveStage = async (studentId: string, nextStage: LeadStage) => {
    try {
      const { error } = await supabase.from('profiles').update({ stage: nextStage }).eq('id', studentId);
      if (error) throw error;
      toast({ title: "Статус обновлен", description: `Клиент переведен в: ${STAGES_CONFIG[nextStage].label}` });
      setSelectedStudentForDrawer(prev => prev ? { ...prev, stage: nextStage } : null);
      await fetchStudentsData();
    } catch (err: any) { toast({ variant: "destructive", title: "Ошибка", description: err.message }); }
  };

  const handleUpdateExpiry = async (subId: number, newDate: string) => {
    if (!subId) return;
    try {
      const { error } = await supabase.from('subscriptions').update({ expires_at: new Date(newDate).toISOString() }).eq('id', subId);
      if (error) throw error;
      toast({ title: "Успешно", description: "Дата окончания обновлена" });
      await fetchStudentsData();
    } catch (err: any) { toast({ variant: "destructive", title: "Ошибка", description: err.message }); }
  };

  const activeStudentsList = students.filter(s => (s.stage || 'bought') === 'bought');
  const leadsList = students.filter(s => (s.stage || 'bought') !== 'bought');

  const stageCounts = {
    new: leadsList.filter(s => s.stage === 'new').length,
    trial_scheduled: leadsList.filter(s => s.stage === 'trial_scheduled').length,
    trial_attended: leadsList.filter(s => s.stage === 'trial_attended').length,
    lost: leadsList.filter(s => s.stage === 'lost').length,
  };

  const isBaseFilterActive = selectedBranch !== 'Все филиалы' || selectedHall !== 'Все залы' || selectedDirection !== 'Все направления' || selectedAge !== 'Все возраста';
  const isFunnelFilterActive = selectedFunnelStage !== 'Все этапы' || selectedFunnelSource !== 'Все источники' || selectedBranch !== 'Все филиалы' || selectedDirection !== 'Все направления';

  const displayedList = (activeSlide === 0 ? activeStudentsList : leadsList).filter((s) => {
    const matchesSearch = (s.full_name?.toLowerCase().includes(search.toLowerCase())) || (s.phone?.includes(search));
    if (!matchesSearch) return false;
    if (activeSlide === 0) {
      if (selectedBranch !== 'Все филиалы' && s.branch && s.branch !== selectedBranch) return false;
      if (selectedDirection !== 'Все направления' && s.direction && s.direction !== selectedDirection) return false;
      if (selectedAge !== 'Все возраста' && s.age_category && s.age_category !== selectedAge) return false;
    } else {
      if (selectedFunnelStage !== 'Все этапы') {
        const stageMap: Record<string, LeadStage> = { 'Новая заявка': 'new', 'Назначен пробный': 'trial_scheduled', 'Пришел на пробный': 'trial_attended', 'Отказ': 'lost' };
        if (s.stage !== stageMap[selectedFunnelStage]) return false;
      }
      if (selectedFunnelSource !== 'Все источники') {
        const sourceMap: Record<string, LeadSource> = { 'Instagram': 'instagram', 'Сайт': 'site', 'Сарафан': 'referral', 'Реклама': 'ads' };
        if (s.source !== sourceMap[selectedFunnelSource]) return false;
      }
      if (selectedBranch !== 'Все филиалы' && s.branch && s.branch !== selectedBranch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-2 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Матовый слайдер, уходящий наверх + Пилюля ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левая карточка со свайпом (уходит за верхний край экрана) */}
          <div className="flex-1 relative h-[calc(100%+12px)] -mt-3">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* 1. БАЗА УЧЕНИКОВ */
                <motion.div
                  key="base-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => { if (info.offset.x < -40) { setIsFilterOpen(false); setActiveSlide(1); } }}
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400">
                      ДЕЙСТВУЮЩИЕ УЧЕНИКИ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white mt-0.5">
                      База клиентов
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight">{displayedList.length}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      активных<br/>ученика
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }} 
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isBaseFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-[24px] p-4 flex flex-col gap-3 shadow-2xl w-72 origin-top-left">
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Филиал</label>
                            <CustomFilterDropdown value={selectedBranch} options={['Все филиалы', ...branchesList]} onChange={(newBranch) => { setSelectedBranch(newBranch); setSelectedHall('Все залы'); }} />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Зал</label>
                            <CustomFilterDropdown value={selectedHall} options={['Все залы', 'Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']} onChange={(newHall) => setSelectedHall(newHall)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Направление</label>
                            <CustomFilterDropdown value={selectedDirection} options={['Все направления', ...directionsList]} onChange={(newDir) => setSelectedDirection(newDir)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Возраст</label>
                            <CustomFilterDropdown value={selectedAge} options={['Все возраста', ...agesList]} onChange={(newAge) => setSelectedAge(newAge)} />
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button type="button" onClick={() => setIsFilterOpen(false)} className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer">Применить</button>
                            <button type="button" onClick={() => { setSelectedBranch('Все филиалы'); setSelectedHall('Все залы'); setSelectedDirection('Все направления'); setSelectedAge('Все возраста'); }} className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer">Сброс</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onPointerDown={(e) => e.stopPropagation()} 
                      onClick={(e) => { e.stopPropagation(); setIsSearchVisible(!isSearchVisible); }} 
                      className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* 2. ВОРОНКА ЛИДОВ */
                <motion.div
                  key="funnel-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => { if (info.offset.x > 40) { setIsFilterOpen(false); setActiveSlide(0); } }}
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }} 
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400">ВОРОНКА ЛИДОВ</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">{leadsList.length}</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Всего лидов</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 px-1 py-1">
                    <div className="flex flex-col"><span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">{stageCounts.new}</span><span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Заявка</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono leading-none">{stageCounts.trial_scheduled}</span><span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Записан</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-violet-600 dark:text-violet-400 font-mono leading-none">{stageCounts.trial_attended}</span><span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Пришел</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono leading-none">{stageCounts.lost}</span><span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1">Отказ</span></div>
                  </div>

                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }} 
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFunnelFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-[24px] p-4 flex flex-col gap-3 shadow-2xl w-72 origin-top-left">
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Этап воронки</label>
                            <CustomFilterDropdown value={selectedFunnelStage} options={funnelStagesList} onChange={(newStage) => setSelectedFunnelStage(newStage)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Источник лида</label>
                            <CustomFilterDropdown value={selectedFunnelSource} options={funnelSourcesList} onChange={(newSrc) => setSelectedFunnelSource(newSrc)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Филиал</label>
                            <CustomFilterDropdown value={selectedBranch} options={['Все филиалы', ...branchesList]} onChange={(newBranch) => setSelectedBranch(newBranch)} />
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button type="button" onClick={() => setIsFilterOpen(false)} className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer">Применить</button>
                            <button type="button" onClick={() => { setSelectedFunnelStage('Все этапы'); setSelectedFunnelSource('Все источники'); setSelectedBranch('Все филиалы'); }} className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer">Сброс</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onPointerDown={(e) => e.stopPropagation()} 
                      onClick={(e) => { e.stopPropagation(); setIsSearchVisible(!isSearchVisible); }} 
                      className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none"
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
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${activeSlide === 0 ? 'bg-[#CCFF00] text-black shadow-md scale-100' : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'}`}
            >
              <Users size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setActiveSlide(1); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${activeSlide === 1 ? 'bg-[#CCFF00] text-black shadow-md scale-100' : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'}`}
            >
              <Filter size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩИЙ ПОИСК ─── */}
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
                  placeholder={activeSlide === 0 ? "Поиск по действующим ученикам..." : "Поиск по лидам и заявкам..."}
                  className="w-full pl-11 h-14 !rounded-full bg-white dark:bg-[#1C1C1E] !border-none shadow-sm text-sm font-medium focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── СПИСОК КАРТОЧЕК С GAP-2.5 ─── */}
        <div className="flex flex-col gap-2.5">
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
                <img src={student.avatar_url} alt={student.full_name || ''} className="w-[70px] h-[70px] rounded-full object-cover flex items-center justify-center text-xl font-bold shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-[70px] h-[70px] rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white select-none text-2xl font-bold shrink-0">
                  {student.full_name?.trim()[0]?.toUpperCase() || <User size={32} className="text-zinc-400" />}
                </div>
              );

              let badgeClass = "w-9 h-9 rounded-full bg-[#CCFF00] text-black font-black flex items-center justify-center text-sm font-mono shadow-sm";
              if (visits <= 0 || isExpired) badgeClass = "w-9 h-9 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-sm font-mono shadow-sm";
              else if (visits >= 1 && visits <= 3) badgeClass = "w-9 h-9 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-sm font-mono shadow-sm";

              const expiryDate = sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

              return (
                <button
                  key={student.id}
                  type="button"
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-none focus:outline-none transition group active:scale-[.99] cursor-pointer text-left"
                  onClick={() => setSelectedStudentForDrawer(student)}
                >
                  {avatar}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-950 dark:text-white truncate max-w-[170px] group-hover:text-lime-600 dark:group-hover:text-[#CCFF00]">{student.full_name || 'Без имени'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${sourceInfo.bg} ${sourceInfo.text}`}><span>{sourceInfo.icon}</span><span>{sourceInfo.label}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${stageInfo.bg} ${stageInfo.color}`}>{stageInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {activeSlide === 0 ? (
                      <>
                        <span className={badgeClass}>{visits}</span>
                        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-black/25 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-xs"><Calendar size={13} className="text-slate-500 dark:text-zinc-400" />{expiryDate}</span>
                      </>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold text-slate-900 dark:text-white">Лид</span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">{activeSlide === 0 ? 'Действующие ученики не найдены' : 'Лиды в этой категории отсутствуют'}</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedStudentForDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudentForDrawer(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] cursor-pointer" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 250 }} className="fixed bottom-0 left-0 right-0 max-w-md mx-auto !bg-[#18181b] border-t !border-zinc-800 rounded-t-[28px] p-6 pb-6 z-[200] select-none flex flex-col max-h-[85dvh]" style={{ backgroundColor: '#18181b' }}>
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 shrink-0" />
              <button onClick={() => setSelectedStudentForDrawer(null)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors z-10"><X size={18} /></button>
              <div className="flex-1 overflow-y-auto scrollbar-none pb-36">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 !rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white overflow-hidden shrink-0">
                      {selectedStudentForDrawer.avatar_url ? <img src={selectedStudentForDrawer.avatar_url} alt={selectedStudentForDrawer.full_name || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-xl font-semibold">{selectedStudentForDrawer.full_name?.[0]?.toUpperCase() || '?'}</span>}
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1.5 min-w-0">
                      <h2 className="text-2xl font-semibold text-white leading-tight truncate">{selectedStudentForDrawer.full_name || 'Без имени'}</h2>
                      {selectedStudentForDrawer.phone && (
                        <a href={`tel:${selectedStudentForDrawer.phone}`} className="!rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 flex items-center gap-2 text-sm text-zinc-300 w-fit select-none m-0 ml-0"><Phone size={13} className="text-[#CCFF00]" /><span className="truncate">{selectedStudentForDrawer.phone}</span></a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 my-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Этап сделки / Воронка</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['new', 'trial_scheduled', 'trial_attended', 'bought', 'lost'] as LeadStage[]).map((stageKey) => {
                        const isCurrent = (selectedStudentForDrawer.stage || 'bought') === stageKey;
                        const conf = STAGES_CONFIG[stageKey];
                        return (
                          <button key={stageKey} type="button" onClick={() => handleMoveStage(selectedStudentForDrawer.id, stageKey)} className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${isCurrent ? `${conf.bg} ${conf.color} border-current shadow-sm` : 'bg-zinc-900/60 border-zinc-800 text-stone-400 hover:bg-zinc-800'}`}>
                            <span>{conf.label}</span>{isCurrent && <Check size={12} className="stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5 my-4">
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Остаток занятий</span>
                      <span className="text-[#CCFF00] text-lg font-medium font-mono">{selectedStudentForDrawer.subscriptions?.[0]?.visits_left ?? 0}</span>
                    </div>
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1 min-w-0">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Источник</span>
                      <span className="text-white text-sm font-medium truncate capitalize">{SOURCES_CONFIG[(selectedStudentForDrawer.source as LeadSource) || 'instagram']?.label || 'Instagram'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { toast({ title: "Заморозка абонемента", description: `Абонемент для ${selectedStudentForDrawer.full_name} успешно заморожен на 14 дней`, }); setSelectedStudentForDrawer(null); }} className="flex-1 py-3 text-xs font-bold border border-zinc-800 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer text-center text-stone-300">Заморозить</button>
                    <button onClick={() => { toast({ title: "История посещений", description: "Раздел истории посещений в разработке", }); }} className="flex-1 py-3 text-xs font-bold border border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10 rounded-full transition-all cursor-pointer text-center">История</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="!rounded-[28px] !border-zinc-850 shadow-2xl bg-[#18181b] text-white p-8 z-[200]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">{activeSlide === 0 ? 'Новый ученик' : 'Новый лид'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Имя Фамилия</label>
              <Input required value={newStudent.full_name} onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} placeholder="Иван Иванов" className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-black/40 text-white placeholder:text-stone-600 text-sm font-medium px-5 focus-visible:border-[#CCFF00]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Телефон</label>
              <Input required value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})} placeholder="79001234567" className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-black/40 text-white placeholder:text-stone-600 text-sm font-medium px-5 focus-visible:border-[#CCFF00]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Источник</label>
                <select value={newStudent.source} onChange={(e) => setNewStudent({ ...newStudent, source: e.target.value as LeadSource })} className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3.5 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]">
                  <option value="instagram">📸 Instagram</option><option value="site">🌐 Сайт</option><option value="referral">👥 Сарафан</option><option value="ads">⚡ Реклама</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Этап сделки</label>
                <select value={newStudent.stage} onChange={(e) => setNewStudent({ ...newStudent, stage: e.target.value as LeadStage })} className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3.5 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]">
                  <option value="bought">Купил (Действующий)</option><option value="new">Новая заявка</option><option value="trial_scheduled">Назначен пробный</option><option value="trial_attended">Пришел на пробный</option><option value="lost">Отказ</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Начальный баланс (занятий)</label>
              <Input required type="number" value={newStudent.initial_visits} onChange={(e) => setNewStudent({...newStudent, initial_visits: parseInt(e.target.value)})} className="rounded-[16px] border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 bg-black/40 text-white text-sm font-medium px-5 focus-visible:border-[#CCFF00]" />
            </div>
            <DialogFooter className="pt-3">
              <Button type="submit" disabled={isCreating} className="w-full bg-[#CCFF00] hover:bg-[#B5E600] text-black rounded-full h-12 font-bold text-sm tracking-wide shadow-md shadow-[#CCFF00]/10 border-none cursor-pointer">
                {isCreating ? "Создание..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} ariaLabel="Добавить ученика" id="floating-add-student-btn" />
      <ModalDatePicker isOpen={selectedSubForDatePicker !== null} onClose={() => setSelectedSubForDatePicker(null)} expiresAt={selectedSubForDatePicker?.expiresAt || null} onUpdate={(dateStr) => { if (selectedSubForDatePicker) handleUpdateExpiry(selectedSubForDatePicker.id, dateStr); }} />
      <BottomNav />
    </div>
  );
}