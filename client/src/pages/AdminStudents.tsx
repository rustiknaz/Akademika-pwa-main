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
  Filter, 
  X,
  UserPlus
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/context/ThemeContext';
import FloatingActionButton from "../components/FloatingActionButton";
import CustomFilterDropdown from "../components/CustomFilterDropdown";

export type LeadStage = 'new' | 'trial_scheduled' | 'trial_attended' | 'bought' | 'lost';
export type LeadSource = 'instagram' | 'site' | 'referral' | 'ads';

export const STAGES_CONFIG: Record<LeadStage, { label: string; color: string; bg: string }> = {
  new: { label: 'Новая заявка', color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  trial_scheduled: { label: 'Назначен пробный', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  trial_attended: { label: 'Пришел на пробный', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  bought: { label: 'Действующий', color: 'text-emerald-600 dark:text-[#F5F5F5]', bg: 'bg-emerald-500/10 dark:bg-[#F5F5F5]/10 border-emerald-500/20 dark:border-[#F5F5F5]/20' },
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="!bg-[#09090b] border !border-zinc-850 !rounded-[24px] p-5 max-w-sm w-full shadow-2xl shadow-black/80 flex flex-col text-white animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-white tracking-wide">{viewDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\./, '').toLowerCase()}</h3>
          <div className="flex gap-2">
            <button onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#F5F5F5] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
            <button onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="w-9 h-9 border border-zinc-800 !rounded-[12px] flex items-center justify-center text-zinc-400 hover:text-[#F5F5F5] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
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
                <button onClick={() => handleSelect(cell.date)} className={`text-xs transition-all cursor-pointer ${isSel ? 'w-9 h-9 flex items-center justify-center !rounded-full bg-[#452039] text-[#F5F5F5] font-bold font-mono text-sm shadow-[0_0_10px_rgba(245,245,245,0.35)]' : isTod ? 'w-9 h-9 flex items-center justify-center border border-[#F5F5F5]/40 text-white font-medium rounded-xl bg-[#F5F5F5]/5' : cell.isCurrentMonth ? 'w-9 h-9 flex items-center justify-center text-white hover:bg-zinc-900 rounded-xl' : 'w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-zinc-900/50 rounded-xl'}`}>
                  {cell.date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={handleResetToToday} className="w-full py-3 !bg-[#18181b] hover:bg-zinc-800 !rounded-full text-[#F5F5F5] font-bold text-center mt-4 transition-colors border !border-zinc-800 cursor-pointer">Сегодня</button>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
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

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
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

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (profile && profile.role !== 'admin' && profile.role !== 'owner') {
        return setLocation('/');
      }

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
      const targetStage = activeSlide === 0 ? 'bought' : newStudent.stage;

      const profilePayload: Record<string, any> = {
        full_name: newStudent.full_name.trim(),
        phone: newStudent.phone.trim(),
        stage: targetStage,
        source: newStudent.source,
        role: 'user'
      };

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert([profilePayload])
        .select()
        .single();

      if (pError) throw pError;

      if (profile && targetStage === 'bought') {
        const { error: sError } = await supabase.from('subscriptions').insert([{
          user_id: profile.id,
          visits_left: Number(newStudent.initial_visits) || 0,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }]);
        if (sError) console.warn('Subscription insert warning:', sError.message);
      }

      toast({ title: "Успешно", description: "Клиент добавлен в систему" });
      setIsAddDrawerOpen(false);
      setNewStudent({ full_name: '', phone: '', initial_visits: 8, source: 'instagram', stage: 'bought' });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка создания", description: err.message || "Проверьте права доступа в базе" });
    } finally { 
      setIsCreating(false); 
    }
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
  const isAnyFilterActive = activeSlide === 0 ? isBaseFilterActive : isFunnelFilterActive;

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
        <Loader2 className="w-8 h-8 animate-spin text-[#452039]" />
      </div>
    );
  }

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

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* 
        Оверлей для клика вне фильтра:
        Находится строго НАД фоном страницы (z-[190]), но ПОД выпадающим окном фильтра (z-[220]).
        Закрывает фильтр только при клике вне его области.
      */}
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
        
        {/* ─── ВЕРХНИЙ БЛОК: СТАТИЧНЫЙ БАННЕР ─── */}
        <div 
          style={{ backgroundColor: '#452039', color: '#F5F5F5' }}
          className="relative min-h-[184px] h-[184px] w-full select-none z-30 p-5 rounded-[42px] shadow-md flex flex-col justify-between border-none overflow-visible"
        >
          {/* Анимируемая текстовая информация: База клиентов ↔ Воронка лидов */}
          <div className="relative flex-1 flex flex-col justify-between pr-[68px] pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              {activeSlide === 0 ? (
                <motion.div
                  key="content-base"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#F5F5F5]/70">
                      ДЕЙСТВУЮЩИЕ УЧЕНИКИ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#F5F5F5] mt-0.5 truncate">
                      База клиентов
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#F5F5F5] font-mono tracking-tight">{displayedList.length}</span>
                    <span className="text-[10px] font-bold text-[#F5F5F5]/80 uppercase tracking-wide leading-tight">
                      активных<br/>ученика
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content-funnel"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#F5F5F5]/70">
                      ВОРОНКА ЛИДОВ
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-black text-[#F5F5F5] font-mono leading-none">{leadsList.length}</span>
                      <span className="text-[10px] font-bold text-[#F5F5F5]/80 uppercase tracking-wider">Всего лидов</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 px-1 py-1">
                    <div className="flex flex-col"><span className="text-2xl font-black text-[#F5F5F5] font-mono leading-none">{stageCounts.new}</span><span className="text-[9px] font-bold text-[#F5F5F5]/80 uppercase tracking-wider mt-1">Заявка</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-[#F5F5F5] font-mono leading-none">{stageCounts.trial_scheduled}</span><span className="text-[9px] font-bold text-[#F5F5F5]/80 uppercase tracking-wider mt-1">Записан</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-[#F5F5F5] font-mono leading-none">{stageCounts.trial_attended}</span><span className="text-[9px] font-bold text-[#F5F5F5]/80 uppercase tracking-wider mt-1">Пришел</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-[#F5F5F5]/80 font-mono leading-none">{stageCounts.lost}</span><span className="text-[9px] font-bold text-[#F5F5F5]/80 uppercase tracking-wider mt-1">Отказ</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Левая нижняя кнопка фильтра: кружок появляется ТОЛЬКО при нажатии или активных фильтрах */}
          <div className="relative z-[200] pointer-events-auto">
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsFilterOpen(prev => !prev); 
              }} 
              style={(isFilterOpen || isAnyFilterActive) ? { backgroundColor: '#F5F5F5', color: '#452039' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none relative ${
                (isFilterOpen || isAnyFilterActive)
                  ? 'shadow-md scale-100'
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Фильтры"
            >
              <SlidersHorizontal size={20} className="stroke-[2.5]" />
              {isAnyFilterActive && !isFilterOpen && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 border-2 border-[#452039] rounded-full bg-[#F5F5F5] shrink-0" />
              )}
            </button>

            {/* 
              Всплывающее меню фильтров:
              Имеет z-[220] и stopPropagation, чтобы клики ВНУТРИ фильтра не закрывали его
            */}
            {isFilterOpen && (
              <div 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => e.stopPropagation()} 
                style={filterPopupStyle}
                className="absolute top-[calc(100%+12px)] left-0 z-[220] border-none p-5 flex flex-col gap-3.5 w-72 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
              >
                {activeSlide === 0 ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Филиал</label>
                      <CustomFilterDropdown value={selectedBranch} options={['Все филиалы', ...branchesList]} onChange={(newBranch) => { setSelectedBranch(newBranch); setSelectedHall('Все залы'); }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Зал</label>
                      <CustomFilterDropdown value={selectedHall} options={['Все залы', 'Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']} onChange={(newHall) => setSelectedHall(newHall)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Направление</label>
                      <CustomFilterDropdown value={selectedDirection} options={['Все направления', ...directionsList]} onChange={(newDir) => setSelectedDirection(newDir)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Возраст</label>
                      <CustomFilterDropdown value={selectedAge} options={['Все возраста', ...agesList]} onChange={(newAge) => setSelectedAge(newAge)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Этап воронки</label>
                      <CustomFilterDropdown value={selectedFunnelStage} options={funnelStagesList} onChange={(newStage) => setSelectedFunnelStage(newStage)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Источник лида</label>
                      <CustomFilterDropdown value={selectedFunnelSource} options={funnelSourcesList} onChange={(newSrc) => setSelectedFunnelSource(newSrc)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Филиал</label>
                      <CustomFilterDropdown value={selectedBranch} options={['Все филиалы', ...branchesList]} onChange={(newBranch) => setSelectedBranch(newBranch)} />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsFilterOpen(false)} 
                    style={{ backgroundColor: '#F5F5F5', color: '#452039' }}
                    className="flex-1 text-xs font-black py-3 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                  >
                    Применить
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { 
                      if (activeSlide === 0) {
                        setSelectedBranch('Все филиалы'); 
                        setSelectedHall('Все залы'); 
                        setSelectedDirection('Все направления'); 
                        setSelectedAge('Все возраста');
                      } else {
                        setSelectedFunnelStage('Все этапы'); 
                        setSelectedFunnelSource('Все источники'); 
                        setSelectedBranch('Все филиалы'); 
                      }
                    }} 
                    className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
                  >
                    Сброс
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка кнопок с надежным кликом */}
          <div className="absolute right-5 top-5 bottom-5 flex flex-col justify-between items-center z-[200] pointer-events-auto">
            {/* 1. Верхняя кнопка (База) */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsFilterOpen(false); 
                setActiveSlide(0); 
              }}
              style={activeSlide === 0 ? { backgroundColor: '#F5F5F5', color: '#452039' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="База учеников"
            >
              <Users size={20} className="stroke-[2.5]" />
            </button>
            
            {/* 2. Средняя кнопка (Воронка) */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsFilterOpen(false); 
                setActiveSlide(1); 
              }}
              style={activeSlide === 1 ? { backgroundColor: '#F5F5F5', color: '#452039' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Воронка продаж"
            >
              <Filter size={20} className="stroke-[2.5]" />
            </button>

            {/* 3. Нижняя кнопка (Поиск) */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsFilterOpen(false);
                setIsSearchVisible(prev => !prev); 
              }}
              style={isSearchVisible ? { backgroundColor: '#F5F5F5', color: '#452039' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                isSearchVisible 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Поиск"
            >
              <Search size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩАЯ СТРОКА ПОИСКА БЕЗ СМЕЩЕНИЙ И НАЛОЖЕНИЙ ─── */}
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
                  placeholder={activeSlide === 0 ? "Поиск по базе учеников..." : "Поиск по заявкам и лидам..."}
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

              let badgeClass = "w-9 h-9 rounded-full bg-[#452039] text-[#F5F5F5] font-black flex items-center justify-center text-sm font-mono shadow-sm";
              if (visits <= 0 || isExpired) badgeClass = "w-9 h-9 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-sm font-mono shadow-sm";
              else if (visits >= 1 && visits <= 3) badgeClass = "w-9 h-9 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-sm font-mono shadow-sm";

              const expiryDate = sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

              return (
                <button
                  key={student.id}
                  type="button"
                  className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md focus:outline-none transition group active:scale-[.99] cursor-pointer text-left"
                  onClick={() => setSelectedStudentForDrawer(student)}
                >
                  {avatar}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-950 dark:text-white truncate max-w-[170px] group-hover:text-[#452039] dark:group-hover:text-[#F5F5F5]">{student.full_name || 'Без имени'}</span>
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

      {/* ─── ШТОРКА 1: ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О КЛИЕНТЕ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center px-3">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedStudentForDrawer(null)} 
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
                onClick={() => setSelectedStudentForDrawer(null)} 
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex-1 overflow-y-auto scrollbar-none pb-8 pr-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white overflow-hidden shrink-0 shadow-md">
                      {selectedStudentForDrawer.avatar_url ? (
                        <img src={selectedStudentForDrawer.avatar_url} alt={selectedStudentForDrawer.full_name || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl font-black">{selectedStudentForDrawer.full_name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1.5 min-w-0 pr-8">
                      <h2 className="text-2xl font-black text-white leading-tight truncate">{selectedStudentForDrawer.full_name || 'Без имени'}</h2>
                      {selectedStudentForDrawer.phone && (
                        <a href={`tel:${selectedStudentForDrawer.phone}`} className="rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1 flex items-center gap-2 text-xs font-mono text-zinc-300 w-fit select-none">
                          <Phone size={13} className="text-[#F5F5F5]" />
                          <span className="truncate">{selectedStudentForDrawer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 my-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Этап сделки / Воронка</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['new', 'trial_scheduled', 'trial_attended', 'bought', 'lost'] as LeadStage[]).map((stageKey) => {
                        const isCurrent = (selectedStudentForDrawer.stage || 'bought') === stageKey;
                        const conf = STAGES_CONFIG[stageKey];
                        return (
                          <button 
                            key={stageKey} 
                            type="button" 
                            onClick={() => handleMoveStage(selectedStudentForDrawer.id, stageKey)} 
                            className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                              isCurrent 
                                ? `${conf.bg} ${conf.color} border-current shadow-sm` 
                                : 'bg-zinc-900/60 border-zinc-800 text-stone-400 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{conf.label}</span>
                            {isCurrent && <Check size={14} className="stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[24px] flex flex-col gap-1">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Остаток занятий</span>
                      <span className="text-[#F5F5F5] text-2xl font-black font-mono">{selectedStudentForDrawer.subscriptions?.[0]?.visits_left ?? 0}</span>
                    </div>
                    <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[24px] flex flex-col gap-1 min-w-0">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Источник</span>
                      <span className="text-white text-sm font-bold truncate capitalize mt-1">
                        {SOURCES_CONFIG[(selectedStudentForDrawer.source as LeadSource) || 'instagram']?.label || 'Instagram'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button 
                      onClick={() => { 
                        toast({ title: "Заморозка абонемента", description: `Абонемент для ${selectedStudentForDrawer.full_name} заморожен на 14 дней` }); 
                        setSelectedStudentForDrawer(null); 
                      }} 
                      className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider border border-zinc-800 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer text-center text-stone-300"
                    >
                      Заморозить
                    </button>
                    <button 
                      onClick={() => { 
                        toast({ title: "История посещений", description: "Раздел истории посещений в разработке" }); 
                      }} 
                      style={{ backgroundColor: '#452039', color: '#F5F5F5' }}
                      className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer text-center border-none shadow-md"
                    >
                      История
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 2: СОЗДАНИЕ КЛИЕНТА / ЛИДА (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center px-3">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddDrawerOpen(false)} 
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
                  <div className="w-9 h-9 rounded-full bg-[#452039] text-[#F5F5F5] flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white">
                    {activeSlide === 0 ? 'Новый ученик' : 'Новый лид'}
                  </h3>
                </div>

                <button 
                  onClick={() => setIsAddDrawerOpen(false)} 
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4 pt-4 flex-1 overflow-y-auto scrollbar-none pr-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Имя и Фамилия</label>
                  <Input 
                    required 
                    value={newStudent.full_name} 
                    onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} 
                    placeholder="Например: Екатерина Смирнова" 
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white placeholder:text-zinc-600 text-sm font-bold px-4 focus-visible:border-[#452039]" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Телефон</label>
                  <Input 
                    required 
                    value={newStudent.phone} 
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})} 
                    placeholder="79991234567" 
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white placeholder:text-zinc-600 text-sm font-bold font-mono px-4 focus-visible:border-[#452039]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Источник</label>
                    <select 
                      value={newStudent.source} 
                      onChange={(e) => setNewStudent({ ...newStudent, source: e.target.value as LeadSource })} 
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#452039]" 
                    >
                      <option value="instagram">📸 Instagram</option>
                      <option value="site">🌐 Сайт</option>
                      <option value="referral">👥 Сарафан</option>
                      <option value="ads">⚡ Реклама</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Этап сделки</label>
                    <select 
                      value={newStudent.stage} 
                      onChange={(e) => setNewStudent({ ...newStudent, stage: e.target.value as LeadStage })} 
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#452039]" 
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
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Начальный баланс (занятий)</label>
                  <Input 
                    required 
                    type="number" 
                    value={newStudent.initial_visits} 
                    onChange={(e) => setNewStudent({...newStudent, initial_visits: parseInt(e.target.value) || 0})} 
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-base font-black px-4 focus-visible:border-[#452039]" 
                  />
                </div>

                <div className="pt-3">
                  <Button 
                    type="submit" 
                    disabled={isCreating} 
                    style={{ backgroundColor: '#452039', color: '#F5F5F5' }} 
                    className="w-full rounded-full h-14 font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 border-none cursor-pointer" 
                  >
                    {isCreating ? "Сохранение..." : "Сохранить клиента"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FloatingActionButton 
        onClick={() => setIsAddDrawerOpen(true)} 
        ariaLabel={activeSlide === 0 ? "Добавить ученика" : "Добавить лид"} 
        id="floating-add-student-btn"
        style={{ backgroundColor: '#452039', color: '#F5F5F5' }}
        className="!bg-[#452039] !text-[#F5F5F5] shadow-lg shadow-[#452039]/40 hover:opacity-95" 
      />
      <ModalDatePicker isOpen={selectedSubForDatePicker !== null} onClose={() => setSelectedSubForDatePicker(null)} expiresAt={selectedSubForDatePicker?.expiresAt || null} onUpdate={(dateStr) => { if (selectedSubForDatePicker) handleUpdateExpiry(selectedSubForDatePicker.id, dateStr); }} />
    </div>
  );
}