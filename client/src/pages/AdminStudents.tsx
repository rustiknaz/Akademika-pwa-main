import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, User, Search, Plus, Calendar, Award, Check, LogOut, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { getReviews } from '../lib/reviews';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/context/ThemeContext';
import FloatingActionButton from "../components/FloatingActionButton";

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { X, Pencil } from "lucide-react";

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

  // Sync state with props
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

  // First day of current month
  const firstDayDate = new Date(year, month, 1);
  let startDayOfWeek = firstDayDate.getDay();
  // Adjust for Russian calendar (Monday is 1st day)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  const cells = [];

  // Prev month days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDaysCount - i);
    cells.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, isCurrentMonth: true });
  }

  // Next month days to make 42 cells (6 rows)
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
        {/* Calendar Header */}
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

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(wd => (
            <span key={wd} className="text-xs font-bold text-stone-500 uppercase tracking-widest py-1">
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
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

        {/* Today button */}
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

function RewardsModal({
  isOpen,
  onClose,
  studentName,
  onAward
}: {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onAward: (awardTitle: string) => void;
}) {
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);

  const achievementsList = [
    { id: 1, title: 'Смертоносный 💪', name: 'Спортсмен', desc: 'Посещено более 3 тренировок', icon: '💪', unlocked: true },
    { id: 2, title: 'Серийный убийца 🔥', name: 'В Ритме', desc: 'Серия тренировок активна! Вы в идеальном ритме.', icon: '🔥', unlocked: true },
    { id: 3, title: 'Почетный гость 🌟', name: 'Постоянный гость', desc: 'Посещено 10 тренировок подряд.', icon: '🌟', unlocked: true },
    { id: 4, title: 'Королева Heels 👑', name: 'Королева Heels', desc: 'Посещено 15 занятий по High Heels.', icon: '👑', unlocked: false },
    { id: 5, title: 'Танцор диско ⚡', name: 'Танцор диско', desc: 'Выучена первая полноценная хореография.', icon: '⚡', unlocked: true },
    { id: 6, title: 'Мульти-стиль 🗺️', name: 'Мульти-стиль', desc: 'Пройдено более 3 различных направлений танца.', icon: '🗺️', unlocked: false },
    { id: 7, title: 'Мастер растяжки 🧘', name: 'Мастер растяжки', desc: 'Посещено 5 тренировок по Stretching.', icon: '🧘', unlocked: false },
    { id: 8, title: 'Абсолютный чемпион 🥇', name: 'Абсолютный чемпион', desc: 'Посещено 50 тренировок в студии.', icon: '🥇', unlocked: false },
    { id: 9, title: 'Свет сцены 🌌', name: 'Свет сцены', desc: 'Запись на отчетный годовой концерт.', icon: '🌌', unlocked: false },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 max-w-md w-full shadow-2xl shadow-black/80 flex flex-col text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Награды ученика</h3>
            <p className="text-xs font-bold text-[#CCFF00] tracking-wide uppercase mt-0.5">
              {studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-900/80 hover:bg-zinc-800/60 text-stone-400 hover:text-[#CCFF00] w-8 h-8 border border-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Selected Achievement Details banner */}
        <div className="mb-4 min-h-[84px]">
          {selectedAchievement ? (
            <div
              className="bg-zinc-950 border border-[#CCFF00]/25 p-4 rounded-[24px] relative shadow-lg shadow-[#CCFF00]/5 flex gap-4 items-center animate-in slide-in-from-top-2 duration-200"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-neutral-800 border border-[#CCFF00]/40 text-white shadow-[#CCFF00]/5 shrink-0">
                {selectedAchievement.icon}
              </div>
              <div className="flex-1 min-w-0 pr-16">
                <h4 className="text-sm font-medium text-white leading-tight truncate">{selectedAchievement.title}</h4>
                <p className="text-xs text-stone-400 font-bold leading-relaxed line-clamp-2 mt-0.5 tracking-wide">{selectedAchievement.desc}</p>
              </div>
              <button
                onClick={() => {
                  onAward(selectedAchievement.title);
                  onClose();
                }}
                className="absolute right-3 px-3 py-1.5 bg-[#CCFF00] hover:bg-[#B5E600] text-black text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
              >
                Вручить
              </button>
            </div>
          ) : (
            <div
              className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-[24px] text-center flex items-center justify-center h-[84px]"
            >
              <p className="text-xs font-medium text-stone-400">
                Нажмите на награду ниже, чтобы просмотреть детали и вручить ученику ✨
              </p>
            </div>
          )}
        </div>

        {/* Grid of awards */}
        <div className="grid grid-cols-3 gap-3">
          {achievementsList.map((achievement) => {
            const isSelected = selectedAchievement?.id === achievement.id;
            return (
              <div
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className={`p-3 rounded-[20px] border flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-[#CCFF00] bg-zinc-900/90 shadow-[0_0_12px_rgba(204,255,0,0.15)]'
                    : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1.5 bg-neutral-800 border border-zinc-700/50">
                  {achievement.icon}
                </div>
                
                <span className="text-xs font-bold text-white leading-tight line-clamp-1 tracking-wide">
                  {achievement.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Close Button as full-width pill */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-5 bg-zinc-900 border border-zinc-800 text-[#CCFF00] hover:bg-zinc-850 !rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-center cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    phone: '',
    initial_visits: 8
  });
  const [isCreating, setIsCreating] = useState(false);
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set());
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<any | null>(null);
  
  const [selectedSubForDatePicker, setSelectedSubForDatePicker] = useState<{ id: number; expiresAt: string | null; studentName: string } | null>(null);
  const [selectedStudentForRewards, setSelectedStudentForRewards] = useState<any | null>(null);

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
        subscriptions (
          id,
          visits_left,
          expires_at
        )
      `);

    if (pError) {
      console.error('Error fetching students:', pError);
    } else {
      setStudents(profiles || []);
    }
  }

  const [activeTab, setActiveTab] = useState<'list' | 'attendance'>('list');
  const [activeBookings, setActiveBookings] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchActiveBookings();
    }
  }, [activeTab]);

  async function fetchActiveBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        user_id,
        class_id,
        classes (
          id,
          title,
          start_time,
          max_students
        ),
        profiles (
          id,
          full_name,
          phone,
          subscriptions (
            id,
            visits_left
          )
        )
      `)
      .eq('status', 'booked')
      .order('classes(start_time)', { ascending: true });

    if (error) {
      console.error('Error fetching active bookings:', error);
    } else {
      setActiveBookings(data || []);
    }
  }

  const handleMarkAttendance = async (booking: any) => {
    try {
      const { error: bError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);
      if (bError) throw bError;

      toast({ title: "Успешно", description: "Посещение отмечено" });
      await Promise.all([fetchActiveBookings(), fetchStudentsData()]);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    }
  };

  const handleCancelBooking = async (booking: any) => {
    if (cancelingIds.has(booking.id)) return;

    setCancelingIds(prev => {
      const next = new Set(Array.from(prev));
      next.add(booking.id);
      return next;
    });

    try {
      const { data: freshBooking, error: freshBookingError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', booking.id)
        .maybeSingle();

      if (freshBookingError) throw freshBookingError;
      if (!freshBooking || freshBooking.status !== 'booked') {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Запись уже отменена, завершена или не существует",
        });
        await Promise.all([fetchActiveBookings(), fetchStudentsData()]);
        return;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);
      if (bookingError) throw bookingError;

      const sub = booking.profiles?.subscriptions?.[0];
      if (sub) {
        const { data: freshSub, error: freshSubError } = await supabase
          .from('subscriptions')
          .select('id, visits_left')
          .eq('id', sub.id)
          .maybeSingle();

        if (!freshSubError && freshSub) {
          const { error: sError } = await supabase
            .from('subscriptions')
            .update({ visits_left: freshSub.visits_left + 1 })
            .eq('id', freshSub.id);
          if (sError) throw sError;
        }
      }

      const classId = booking.class_id;
      if (classId) {
        const { data: cls, error: classFetchError } = await supabase
          .from('classes')
          .select('id, max_students')
          .eq('id', classId)
          .maybeSingle();

        if (!classFetchError && cls) {
          const { error: classUpdateError } = await supabase
            .from('classes')
            .update({ max_students: cls.max_students + 1 })
            .eq('id', cls.id);
          if (classUpdateError) throw classUpdateError;
        }
      }

      toast({ title: "Успешно", description: "Запись отменена, занятие и место возвращены на баланс" });
      await Promise.all([fetchActiveBookings(), fetchStudentsData()]);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    } finally {
      setCancelingIds(prev => {
        const next = new Set(Array.from(prev));
        next.delete(booking.id);
        return next;
      });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert([{
          full_name: newStudent.full_name,
          phone: newStudent.phone,
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

      toast({ title: "Успешно", description: "Ученик добавлен" });
      setIsAddModalOpen(false);
      setNewStudent({ full_name: '', phone: '', initial_visits: 8 });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateVisits = async (userId: string, subId: number | null, amount: number) => {
    try {
      if (!subId) {
        const { error } = await supabase
          .from('subscriptions')
          .insert([{ 
            user_id: userId, 
            visits_left: amount, 
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }]);
        if (error) throw error;
      } else {
        const student = students.find(s => s.id === userId);
        const currentVisits = student?.subscriptions?.[0]?.visits_left || 0;
        const { error } = await supabase
          .from('subscriptions')
          .update({ visits_left: currentVisits + amount })
          .eq('id', subId);
        if (error) throw error;
      }

      toast({ title: "Успешно", description: `Добавлено +${amount} занятий` });
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

  const handleUpdateVisitsManually = async (subId: number, newVal: string) => {
    const amount = parseInt(newVal);
    if (isNaN(amount) || !subId) return;
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ visits_left: amount })
        .eq('id', subId);
      if (error) throw error;
      toast({ title: "Обновлено", description: `Остаток изменен на ${amount}` });
      await fetchStudentsData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    }
  };

  const handleAwardStudent = (studentName: string, awardTitle?: string) => {
    toast({
      title: "Награда вручена!",
      description: awardTitle 
        ? `Ученику ${studentName} вручена награда "${awardTitle}" за отличные успехи!`
        : `Ученику ${studentName} вручена награда за отличные успехи!`,
    });
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#DDE2E5] text-slate-900' : 'bg-[#09090b] text-zinc-100'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-white">Ученики</h1>

        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            setLocation('/Login');
          }}
          className="p-2.5 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-[#CCFF00] transition-colors rounded-full hover:bg-black/5 dark:hover:bg-neutral-800 cursor-pointer"
          title="Выйти"
        >
          <LogOut size={22} />
        </button>
      </header>

      {/* Tabs Switcher */}
      <div className="h-[56px] p-1 bg-[#DDE2E5] dark:bg-[#161618] rounded-full inline-flex items-center gap-1 mb-6 max-w-md w-full transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={
            activeTab === 'list'
              ? "h-full bg-[#CCFF00] text-black font-medium text-sm px-6 rounded-full transition-all shadow-sm flex items-center justify-center"
              : "h-full text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white font-medium text-sm px-6 rounded-full transition-all flex items-center justify-center gap-2"
          }
        >
          Список учеников
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={
            activeTab === 'attendance'
              ? "h-full bg-[#CCFF00] text-black font-medium text-sm px-6 rounded-full transition-all shadow-sm flex items-center justify-center"
              : "h-full text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white font-medium text-sm px-6 rounded-full transition-all flex items-center justify-center gap-2"
          }
        >
          <Calendar
            size={15}
            className={
              activeTab === 'attendance'
                ? 'text-black'
                : 'text-[#121214]/60 dark:text-white/60'
            }
          />
          Журнал посещаемости
        </button>
      </div>

      <div className="flex-1 pb-2 pr-0.5">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="student-list-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-full flex flex-col"
            >
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по имени или телефону..."
                  className="ui-input pl-12 pr-5 !rounded-[32px] border border-black/10 dark:border-zinc-800 h-12 focus-visible:ring-1 focus-visible:ring-[#CCFF00]"
                />
              </div>

              <div className="ui-card bg-white dark:bg-[#18181b] shadow-md border border-black/10 dark:border-zinc-800/80 overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-black/10 dark:border-zinc-850 bg-slate-50/80 dark:bg-zinc-900/60">
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Ученик</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Остаток</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Срок действия</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const sub = student.subscriptions?.[0];
                        const visits = sub?.visits_left ?? 0;
                        const isExpired = sub?.expires_at ? new Date(sub.expires_at).getTime() < Date.now() : false;
                        
let statusBadgeClass = "bg-[#CCFF00] text-black font-medium";
                        if (visits <= 0 || isExpired) {
statusBadgeClass = "bg-rose-500 text-white font-medium";
                        } else if (visits >= 1 && visits <= 3) {
statusBadgeClass = "bg-amber-400 text-black font-medium";
                        }

                        return (
                          <TableRow key={student.id} className="border-b border-black/5 dark:border-zinc-800/80 hover:bg-black/5 dark:hover:bg-[#09090b]/40 transition-colors">
                            <TableCell 
                              className="cursor-pointer select-none group" 
                              onClick={() => setSelectedStudentForDrawer(student)}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-[#CCFF00] transition-colors">{student.full_name || 'Без имени'}</span>
                                {student.phone && <span className="text-xs text-slate-500 font-medium">{student.phone}</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-start">
                                <input 
                                  key={sub ? `sub-${sub.id}-${sub.visits_left}` : 'no-sub'}
                                  type="number"
                                  defaultValue={sub?.visits_left ?? 0}
                                  onBlur={(e) => sub && handleUpdateVisitsManually(sub.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && sub) {
                                      handleUpdateVisitsManually(sub.id, (e.target as HTMLInputElement).value);
                                    }
                                  }}
                                  className={`w-9 h-9 flex items-center justify-center !rounded-full font-bold text-center font-mono transition-colors duration-300 border-none p-0 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none${statusBadgeClass}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              {sub ? (
                                <button
                                  onClick={() => setSelectedSubForDatePicker({ id: sub.id, expiresAt: sub.expires_at, studentName: student.full_name || 'Без имени' })}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#09090b] hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm transition-all select-none cursor-pointer group"
                                >
                                  <Calendar 
                                    size={13} 
                                    className="text-slate-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors" 
                                  />
                                  <span className="group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors">
                                    {sub.expires_at 
                                      ? new Date(sub.expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                      : '—'}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1.5 items-center">
                                {[1, 8, 16].map(num => (
                                  <Button 
                                    key={num}
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateVisits(student.id, sub?.id || null, num)}
                                    className="h-8 px-2.5 text-xs border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#09090b] text-slate-900 dark:text-[#CCFF00] rounded-full font-bold hover:bg-[#CCFF00] hover:text-black hover:border-transparent transition-all active:scale-95 shadow-sm"
                                  >
                                    +{num}
                                  </Button>
                                ))}
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedStudentForRewards(student)}
                                  className="h-8 px-3 text-xs bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-900/60 rounded-full font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                                >
                                  <Award size={14} /> Награда
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-medium">
                          Ученики не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="journal-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-full flex flex-col"
            >
              <div className="bg-white dark:bg-[#18181b] rounded-card shadow-md border border-black/10 dark:border-zinc-800/80 overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-black/10 dark:border-zinc-850 bg-slate-100/80 dark:bg-zinc-900/60">
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Ученик</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Занятие</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Баланс</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-stone-400">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBookings.length > 0 ? (
                      activeBookings.map((booking) => {
                        const sub = booking.profiles?.subscriptions?.[0];
                        const hasVisits = sub && sub.visits_left > 0;
                        const isCanceling = cancelingIds.has(booking.id);
                        
                        return (
                          <TableRow key={booking.id} className="border-b border-black/5 dark:border-zinc-800/80 hover:bg-black/5 dark:hover:bg-[#09090b]/40 transition-colors">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900 dark:text-white">{booking.profiles?.full_name}</span>
                                <span className="text-xs text-slate-500 font-medium">{booking.profiles?.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900 dark:text-white">{booking.classes?.title}</span>
                                <span className="text-xs text-slate-600 dark:text-[#E2FF63]/70 font-medium">
                                  {new Date(booking.classes?.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-mono font-medium text-sm${hasVisits ? 'text-slate-900 dark:text-[#CCFF00]' : 'text-slate-400 dark:text-stone-600'}`}>
                                {sub?.visits_left ?? 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  disabled={!hasVisits}
                                  onClick={() => handleMarkAttendance(booking)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 px-3 text-xs font-bold shadow-sm cursor-pointer"
                                >
                                  <Check size={14} className="mr-1" /> Пришел
                                </Button>
                                <Button 
                                  size="sm"
                                  disabled={isCanceling}
                                  onClick={() => handleCancelBooking(booking)}
                                  className="bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-neutral-800 dark:text-stone-300 dark:hover:bg-neutral-700 rounded-full h-9 px-3 text-xs font-bold flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {isCanceling ? "..." : "Отмена"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-medium">
                          Нет активных записей на сегодня
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedStudentForDrawer && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForDrawer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Drawer panel */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto !bg-[#18181b] border-t !border-zinc-800 rounded-t-[24px] p-6 pb-6 z-50 select-none flex flex-col max-h-[80dvh]"
              style={{ backgroundColor: '#18181b' }}
            >
              {/* iOS-like drag handle */}
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 shrink-0" />

              {/* Close button */}
              <button 
                onClick={() => setSelectedStudentForDrawer(null)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors z-10"
              >
                <X size={18} />
              </button>

              {/* Edit button */}
              <button 
                onClick={() => {
                  toast({
                    title: "Редактирование профиля",
                    description: "Режим редактирования профиля будет доступен в следующем обновлении.",
                  });
                }}
                className="absolute top-6 right-14 w-11 h-11 flex items-center justify-center rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 transition-all duration-300 hover:text-[#CCFF00] hover:border-[#CCFF00]/50 hover:bg-zinc-800/80 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] active:scale-95 z-10 cursor-pointer"
                title="Редактировать профиль"
              >
                <Pencil size={20} />
              </button>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto scrollbar-none pb-36">
                {/* Student details */}
                <div className="flex flex-col">
                  {/* Upper section: flex container */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar */}
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

                    {/* Vertical stack: Name & Phone */}
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

                  {/* Expire / Visits detail */}
                  {selectedStudentForDrawer.subscriptions?.[0] && (
                    <div className="mt-2 text-xs font-medium text-zinc-400">
                      Действует до: <span className="text-zinc-200">
                        {new Date(selectedStudentForDrawer.subscriptions[0].expires_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Stat blocks */}
                  <div className="grid grid-cols-2 gap-3.5 my-6">
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Посещено занятий</span>
                      <span className="text-[#CCFF00] text-lg font-medium font-mono">24</span>
                    </div>
                    <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex flex-col gap-1 min-w-0">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Направление</span>
                      <span className="text-white text-sm font-medium truncate">High Heels</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
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

                  {/* История отзывов ученика */}
                  <div className="border-t border-zinc-800/80 my-5 pt-4 space-y-3">
                    <h3 className="text-sm font-medium text-white">История отзывов ученика</h3>
                    {(() => {
                      const studentReviews = getReviews().filter(
                        r => r.studentId === selectedStudentForDrawer.id ||
                        r.studentName?.toLowerCase() === selectedStudentForDrawer.full_name?.toLowerCase() ||
                        r.studentPhone === selectedStudentForDrawer.phone
                      );

                      if (studentReviews.length === 0) {
                        return (
                          <div style={{ borderRadius: '16px' }} className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-zinc-800 border-dashed rounded-xl py-5 text-center text-slate-400 dark:text-stone-400 font-bold text-xs uppercase tracking-wider shadow-xs">
                            Этот ученик еще не оставлял отзывов
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
                          {studentReviews.map((rev: any) => (
                            <div key={rev.id} className="!bg-[#18181b] border !border-zinc-800/80 !rounded-[24px] p-4 flex flex-col gap-1 shadow-sm">
                              <div className="flex justify-between items-center text-xs font-bold text-zinc-500 tracking-wide">
                                <span className="text-white font-medium">{rev.className}</span>
                                <span>{rev.date}</span>
                              </div>
                              <div className="text-xs font-medium text-[#CCFF00]">
                                ⭐ {rev.rating.toFixed(1)}
                              </div>
                              {rev.comment && (
                                <p className="text-xs text-stone-300 font-medium italic mt-0.5 leading-relaxed">
                                  "{rev.comment}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="!rounded-[24px] !border-zinc-850 shadow-2xl bg-[#18181b] text-white p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">Новый ученик</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-5 pt-4">
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
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-[#CCFF00] hover:bg-[#B5E600] text-black rounded-full h-12 font-bold text-sm tracking-wide shadow-md shadow-[#CCFF00]/10 border-none"
              >
                {isCreating ? "Создание..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {activeTab === 'list' && (
        <FloatingActionButton
          onClick={() => setIsAddModalOpen(true)}
          ariaLabel="Добавить ученика"
          id="floating-add-student-btn"
        />
      )}

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

      <RewardsModal 
        isOpen={selectedStudentForRewards !== null}
        onClose={() => setSelectedStudentForRewards(null)}
        studentName={selectedStudentForRewards?.full_name || ''}
        onAward={(awardTitle) => {
          if (selectedStudentForRewards) {
            handleAwardStudent(selectedStudentForRewards.full_name || 'ученику', awardTitle);
          }
        }}
      />

      <BottomNav />
    </div>
  );
}
