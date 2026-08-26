import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Plus, 
  X, 
  History, 
  Trash2, 
  Pencil, 
  LogOut, 
  RefreshCw, 
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Users,
  Check,
  MapPin,
  ChevronDown,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CalendarPlus,
  SlidersHorizontal,
  Ticket,
  Wallet,
  UserPlus
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { getReviews } from '../lib/reviews';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import ScheduleHistoryTab from "../components/ScheduleHistoryTab";
import QuickBookModal from "../components/QuickBookModal";
import SellMembershipModal from "../components/SellMembershipModal";
import AddPaymentModal from "../components/AddPaymentModal";
import CreateLeadModal from "../components/CreateLeadModal";
import HorizontalCalendar from "../components/HorizontalCalendar";
import CustomFilterDropdown from "../components/CustomFilterDropdown";
import FloatingActionButton from "../components/FloatingActionButton";

const TEACHERS = [
  "Мария Ковалева",
  "Алексей Петров",
  "Дарья Смирнова",
  "Ирина Волк",
  "Кристина Романова",
  "Артем Соколов",
  "Евгения Морозова"
];

const PANTONE_COLORS = ['#D9C560', '#B75344', '#E58B58', '#005C5E', '#8E2A2B', '#D76B78', '#4F84C4', '#64384B', '#A86C78'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();
  const { currentRole } = useRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [expiringSubsCount, setExpiringSubsCount] = useState(3);
  const [debtorsCount, setDebtorsCount] = useState(1);

  // Quick Actions modal states
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isSellMembershipOpen, setIsSellMembershipOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  
  // Filter modal states (для расписания)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Все филиалы');
  const [selectedHall, setSelectedHall] = useState('Все залы');
  const [selectedDirection, setSelectedDirection] = useState('Все направления');
  const [selectedAge, setSelectedAge] = useState('Все возраста');
  const [selectedType, setSelectedType] = useState('Все типы');

  // Filter states для активных записей на главной
  const [isHomeBookingsFilterOpen, setIsHomeBookingsFilterOpen] = useState(false);
  const [homeSelectedBranch, setHomeSelectedBranch] = useState('Все филиалы');
  const [homeSelectedHall, setHomeSelectedHall] = useState('Все залы');

  const branchesList = ['Филиал: Невский', 'Филиал: Центральный'];
  const directionsList = ['Hip-Hop', 'K-Pop', 'Dancehall', 'High Heels', 'Breakdance'];
  const agesList = ['Дети (4-7)', 'Подростки (8-14)', 'Взрослые (15+)'];
  const typesList = ['Групповая', 'Индивидуальная', 'Аренда', 'Мастер-класс'];

  const [view, setView] = useState<'home' | 'active' | 'history' | 'classes'>(() => {
    if (location === '/admin/schedule') return 'classes';
    return 'home';
  });

  // Banner slide state (0 - фин сводка, 1 - операционные задачи)
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (location === '/admin/schedule') {
      setView(prev => (prev === 'classes' || prev === 'history' || prev === 'active') ? prev : 'classes');
    } else if (location === '/Admin') {
      setView('home');
    }
  }, [location]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerCurrentDate, setPickerCurrentDate] = useState<Date>(new Date());

  const branchHallsMap: Record<string, string[]> = {
    'Филиал: Невский': ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)'],
    'Филиал: Центральный': ['Зал 3 (VIP Room)'],
  };

  const availableHalls = selectedBranch === 'Все филиалы'
    ? ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']
    : (branchHallsMap[selectedBranch] || ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)']);

  const homeAvailableHalls = homeSelectedBranch === 'Все филиалы'
    ? ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']
    : (branchHallsMap[homeSelectedBranch] || ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)']);

  const isClassMatchingFilter = (cls: any) => {
    if (selectedBranch !== 'Все филиалы') {
      if (cls.branch && cls.branch !== selectedBranch) return false;
    }
    if (selectedHall !== 'Все залы') {
      const classHall = cls.hall || cls.room || (cls.id % 2 === 0 ? "Зал 2 (Light Studio)" : "Зал 1 (Main Glass)");
      const shortSelected = selectedHall.split('(')[0].trim().toLowerCase();
      const shortClass = classHall.split('(')[0].trim().toLowerCase();
      if (!shortClass.includes(shortSelected) && !classHall.toLowerCase().includes(shortSelected)) {
        return false;
      }
    }
    if (selectedDirection !== 'Все направления') {
      if (cls.direction && cls.direction !== selectedDirection) return false;
      if (!cls.title?.toLowerCase().includes(selectedDirection.toLowerCase())) return false;
    }
    if (selectedType !== 'Все типы') {
      const classType = cls.type || (cls.is_recurring === false ? 'Мастер-класс' : cls.max_students === 1 ? 'Индивидуальная' : 'Групповая');
      if (classType.toLowerCase() !== selectedType.toLowerCase()) return false;
    }
    return true;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const getDaysOfWeek = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
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

  // Bottom Sheet state
  const [selectedClassForSheet, setSelectedClassForSheet] = useState<any>(null);
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    setReviews(getReviews());
  }, [isClassSheetOpen, view]);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLocation('/Login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const userRole = profile?.role || 'admin';
      setCurrentUserProfile({
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Мария Ковалева',
        role: userRole,
        branch: profile?.branch || '',
        avatar_url: profile?.avatar_url || ''
      });

      if (userRole === 'owner') {
        setHomeSelectedBranch('Все филиалы');
      } else if (profile?.branch) {
        setHomeSelectedBranch(profile.branch.startsWith('Филиал:') ? profile.branch : `Филиал: ${profile.branch}`);
      }

      if (profile && profile.role !== 'admin' && profile.role !== 'owner' && profile.role !== 'trainer') {
        setLocation('/');
        return;
      }

      await Promise.all([
        fetchBookingsData(),
        fetchClassesData(),
        fetchSubscriptionsData()
      ]);
      setLoading(false);
    }

    checkAdminAndFetch();
  }, [setLocation]);

  async function fetchBookingsData() {
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
          teacher_name,
          max_students,
          branch,
          hall,
          room
        ),
        profiles (
          id,
          full_name,
          phone
        )
      `)
      .order('classes(start_time)', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      const filtered = data?.filter((b: any) => b.classes && b.profiles) || [];
      setBookings(filtered);
    }
  }

  async function fetchClassesData() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
    } else {
      setClasses(data || []);
    }
  }

  async function fetchSubscriptionsData() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*');
      if (error) throw error;
      if (data) {
        const expiring = data.filter((s: any) => s.visits_left > 0 && s.visits_left <= 1).length;
        const debtors = data.filter((s: any) => s.visits_left === 0).length;
        setExpiringSubsCount(expiring || 3);
        setDebtorsCount(debtors || 1);
      }
    } catch (e) {
      console.error('Error fetching subscriptions stats:', e);
    }
  }

  const handleCheckIn = async (bookingId: number, userId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id, visits_left')
        .eq('user_id', userId)
        .maybeSingle();

      if (subError) throw subError;

      if (subscription) {
        const newVisits = Math.max(0, subscription.visits_left - 1);
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({ visits_left: newVisits })
          .eq('id', subscription.id);

        if (subUpdateError) throw subUpdateError;
      }

      toast({
        title: "Посещение подтверждено",
        description: "Статус обновлен на 'Посетил'. Списано 1 занятие из абонемента. ⚡",
      });
      
      await fetchBookingsData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.message,
      });
    }
  };

  const handleMissed = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'missed' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Ученик пропустил занятие",
        description: "Статус обновлен на 'Пропуск'. Занятие списано и не возвращено на баланс. ❄️",
      });

      await fetchBookingsData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.message,
      });
    }
  };

  const handlePromoteFromWaiting = async (bookingId: number, classId: number) => {
    try {
      const classBookings = bookings.filter(b => b.class_id === classId && b.status === 'booked');
      const cls = classes.find(c => c.id === classId);
      
      if (cls && classBookings.length >= cls.max_students) {
        const confirmOver = confirm(`Лимит группы (${cls.max_students}) превышен. Вы уверены, что хотите перевести в основу сверху лимита?`);
        if (!confirmOver) return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Переведен в основу",
        description: "Ученик успешно добавлен в основной список группы! 🎉",
      });

      await fetchBookingsData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.message,
      });
    }
  };

  const handleUndoStatus = async (bookingId: number, currentStatus: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (error) throw error;

      if (currentStatus === 'completed') {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('id, visits_left')
          .eq('user_id', userId)
          .maybeSingle();

        if (subError) throw subError;

        if (subscription) {
          const { error: subUpdateError } = await supabase
            .from('subscriptions')
            .update({ visits_left: subscription.visits_left + 1 })
            .eq('id', subscription.id);

          if (subUpdateError) throw subUpdateError;
        }
      }

      toast({
        title: "Статус сброшен",
        description: "Статус ученика возвращен в 'Ожидается' 🔄",
      });

      await fetchBookingsData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка сброса",
        description: err.message,
      });
    }
  };

  const handleUpdateTeacher = async (classId: number, newTeacher: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ teacher_name: newTeacher })
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Хореограф изменен",
        description: `Преподаватель успешно изменен на ${newTeacher}`,
      });

      setSelectedClassForSheet((prev: any) => prev ? { ...prev, teacher_name: newTeacher } : null);
      await fetchClassesData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: err.message,
      });
    }
  };

  const handleCancelClass = async (classId: number) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ status: 'cancelled' })
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Занятие отменено",
        description: "Статус занятия успешно изменен на 'Отменено' 🛑",
      });

      await fetchClassesData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка отмены занятия",
        description: err.message,
      });
    }
  };

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const filteredTodayBookings = bookings
    .filter(b => isToday(b.classes?.start_time))
    .filter(b => {
      const cls = b.classes;
      if (!cls) return false;
      if (homeSelectedBranch !== 'Все филиалы') {
        if (cls.branch && cls.branch !== homeSelectedBranch) return false;
      }
      if (homeSelectedHall !== 'Все залы') {
        const classHall = cls.hall || cls.room || (cls.id % 2 === 0 ? "Зал 2 (Light Studio)" : "Зал 1 (Main Glass)");
        const shortSelected = homeSelectedHall.split('(')[0].trim().toLowerCase();
        const shortClass = classHall.split('(')[0].trim().toLowerCase();
        if (!shortClass.includes(shortSelected) && !classHall.toLowerCase().includes(shortSelected)) {
          return false;
        }
      }
      return true;
    });

  const todayMainBookings = filteredTodayBookings.filter(b => b.status !== 'waiting');
  const todayWaitingBookings = filteredTodayBookings.filter(b => b.status === 'waiting');

  const isSelectedDay = (dateString: string) => {
    const d = new Date(dateString);
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear();
  };

  const selectedDateClasses = classes
    .filter(cls => isSelectedDay(cls.start_time))
    .filter(isClassMatchingFilter);

  const historyBookings = bookings.filter(b => {
    return !isToday(b.classes.start_time) || b.status === 'completed' || b.status === 'cancelled' || b.status === 'missed';
  });

  const renderClassCard = (cls: any) => {
    const isCancelled = cls.status === 'cancelled';
    const classBookings = bookings.filter(b => b.class_id === cls.id && b.status !== 'waiting' && b.status !== 'cancelled');
    const bookedCount = classBookings.length;
    const fillPercentage = Math.min(100, (bookedCount / (cls.max_students || 15)) * 100);

    const startTime = new Date(cls.start_time).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const roomName = cls.hall || cls.room || (cls.id % 2 === 0 ? "Зал 2 (Light Studio)" : "Зал 1 (Main Glass)");
    const classReviews = reviews.filter(r => r.classId === cls.id || r.className?.toLowerCase() === cls.title?.toLowerCase());
    const sum = classReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = classReviews.length > 0 ? (sum / classReviews.length).toFixed(1) : "0.0";
    const reviewCount = classReviews.length;

    const cardAccent = cls.color || cls.badge_color || '#B75344';

    return (
      <motion.div
        key={cls.id}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedClassForSheet(cls);
          setIsCancelConfirmOpen(false);
          setIsClassSheetOpen(true);
        }}
        style={cls.color ? { borderLeftColor: cls.color, borderLeftWidth: '5px' } : {}}
        className={`bg-white/40 dark:bg-black/35 backdrop-blur-md ${
          isCancelled ? 'opacity-75' : ''
        } rounded-[42px] p-6 shadow-md cursor-pointer relative overflow-hidden transition-all group`}
      >
        <div className="absolute top-5 right-5 text-zinc-500 group-hover:text-white transition-colors pointer-events-none">
          <ArrowUpRight size={16} />
        </div>

        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span 
              style={{ color: '#FFFFFF', backgroundColor: '#B75344' }}
              className="text-xs font-bold px-3 py-1 rounded-full font-mono shadow-xs"
            >
              {startTime}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {roomName}
            </span>
          </div>
          
          {isCancelled ? (
            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider mr-6">
              ОТМЕНЕНО
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 mr-6 font-mono">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              {bookedCount}/{cls.max_students || 15}
            </span>
          )}
        </div>

        <div className="space-y-1 my-3">
          <h3 className={`text-base font-bold text-slate-950 dark:text-white ${isCancelled ? 'line-through opacity-50' : ''}`}>
            {cls.title}
          </h3>
          <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
            <span>Хореограф: <span className="text-slate-950 dark:text-white font-bold">{cls.teacher_name}</span></span>
            {reviewCount > 0 && (
              <span 
                style={{ color: '#B75344', backgroundColor: 'rgba(183, 83, 68, 0.12)' }}
                className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 tracking-wide"
              >
                ⭐ {avgRating} ({reviewCount})
              </span>
            )}
          </p>
        </div>

        {!isCancelled && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              <span>Заполненность группы</span>
              <span style={{ color: '#B75344' }} className="font-mono font-black">{bookedCount} из {cls.max_students || 15} мест</span>
            </div>
            <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${fillPercentage}%`, backgroundColor: '#B75344' }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const filterPopupStyle: React.CSSProperties = {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 18, 20, 0.88)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
    borderRadius: '36px'
  };

  if (loading) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-zinc-100'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#D9C560]" />
      </div>
    );
  }

  const roleLabel = currentUserProfile?.role === 'owner' 
    ? 'Владелец' 
    : currentUserProfile?.role === 'trainer' 
      ? 'Преподаватель' 
      : 'Администратор';

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col relative font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'
    }`}>
      
      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР ДЛЯ ВСЕХ ВКЛАДОК ─── */}
      <div className="flex-1 px-3 pb-32 flex flex-col gap-2.5">
        <AnimatePresence mode="wait">
          
          {/* TAB: Главная (Dashboard) */}
          {view === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              {/* 1. Верхний баннер-шапка */}
              <div 
                className="w-full min-h-[calc(200px+env(safe-area-inset-top))] pt-[calc(1.25rem+env(safe-area-inset-top))] pb-6 px-6 rounded-b-[42px] relative transition-colors duration-300 flex flex-col justify-end bg-white/20 dark:bg-black/20 backdrop-blur-sm border-none shadow-none text-slate-900 dark:text-white select-none"
              >
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-light text-slate-800 dark:text-white/90 leading-tight">
                      Добрый<br />день,
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-950 dark:text-white mt-1">
                      {currentUserProfile?.full_name || 'Администратор'}
                    </h1>
                    <span className="text-sm font-bold text-slate-600 dark:text-zinc-400 mt-1 uppercase tracking-wider">
                      ({roleLabel})
                    </span>
                  </div>

                  <div 
                    onClick={() => setLocation('/Profile')}
                    className="relative shrink-0 cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/30 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white flex items-center justify-center font-black text-2xl shadow-none border-none group-hover:scale-105 transition-transform">
                      {(currentUserProfile?.full_name || 'А').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#161618] shadow-sm" />
                  </div>
                </div>
              </div>

              {/* 2. Баннер Финансовой сводки (#005C5E) / Операционных задач (#8E2A2B) */}
              <div className="relative h-[184px] w-full overflow-hidden rounded-[42px] select-none shadow-lg">
                <AnimatePresence initial={false} mode="wait">
                  {activeSlide === 0 ? (
                    <motion.div
                      key="finance-slide"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -40) setActiveSlide(1);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setLocation('/admin/finance')}
                      style={{ backgroundColor: '#005C5E', color: '#FFFFFF' }}
                      className="absolute inset-0 p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">ФИНАНСОВАЯ СВОДКА</span>
                          <h3 className="text-sm font-bold text-white mt-0.5">Показатели за сегодня</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                          <Award size={20} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/70">ВЫРУЧКА</span>
                          <span className="text-3xl font-black text-white font-mono">₽14 500</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/70">ПРОДАЖИ</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white font-mono">3</span>
                            <span className="text-sm font-bold text-white/70">абон.</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/15 text-[11px] font-bold text-white/80 uppercase tracking-wide">
                        <span>Средний чек: <span className="text-white font-mono">₽4 833</span></span>
                        <span>+12% к прошлой пятнице</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ops-slide"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 40) setActiveSlide(0);
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setLocation('/admin/notifications')}
                      style={{ backgroundColor: '#8E2A2B', color: '#FFFFFF' }}
                      className="absolute inset-0 p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">ОПЕРАЦИОННЫЕ ЗАДАЧИ</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Сегодня</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="bg-white/15 rounded-full p-2 pl-3.5 pr-4 flex items-center justify-between backdrop-blur-sm shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <AlertTriangle size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-white leading-tight">Заканчиваются абонементы</span>
                              <span className="text-[10px] font-medium text-white/80">Осталось 1 или меньше занятий</span>
                            </div>
                          </div>
                          <span className="bg-white text-[#8E2A2B] text-[11px] font-black px-3 py-1 rounded-full">{expiringSubsCount}</span>
                        </div>

                        <div className="bg-white/15 rounded-full p-2 pl-3.5 pr-4 flex items-center justify-between backdrop-blur-sm shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <User size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-white leading-tight">Должники</span>
                              <span className="text-[10px] font-medium text-white/80">Нужно продлить абонемент</span>
                            </div>
                          </div>
                          <span className="bg-white text-[#8E2A2B] text-[11px] font-black px-3 py-1 rounded-full">{debtorsCount}</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] font-bold text-white/70 uppercase tracking-wider text-right">
                        Смахните для просмотра финансов →
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Индикаторы свайпа */}
                <div className="absolute bottom-3 right-6 flex gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveSlide(0); }}
                    className={`h-1.5 rounded-full transition-all duration-300 border-none p-0 cursor-pointer ${
                      activeSlide === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveSlide(1); }}
                    className={`h-1.5 rounded-full transition-all duration-300 border-none p-0 cursor-pointer ${
                      activeSlide === 1 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Баннер быстрых действий (#CCFF00 Lime) */}
              <div 
                style={{ backgroundColor: '#CCFF00', color: '#000000' }}
                className="rounded-[42px] p-5 shadow-md flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/70">
                    Быстрые действия
                  </span>
                </div>

                <div className="flex justify-between items-start gap-1 px-1">
                  <button 
                    onClick={() => toast({ title: "В разработке", description: "Модуль записи в группу" })}
                    className="flex flex-col items-center justify-start gap-2 group w-[72px] cursor-pointer outline-none border-none bg-transparent p-0"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-black/35 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white shadow-xs group-hover:scale-105 transition-all">
                      <CalendarPlus size={24} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-black text-black text-center leading-tight">
                      Записать
                    </span>
                  </button>

                  <button 
                    onClick={() => setLocation('/admin/services')}
                    className="flex flex-col items-center justify-start gap-2 group w-[72px] cursor-pointer outline-none border-none bg-transparent p-0"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-black/35 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white shadow-xs group-hover:scale-105 transition-all">
                      <Ticket size={24} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-black text-black text-center leading-tight">
                      Продать<br/>абонемент
                    </span>
                  </button>

                  <button 
                    onClick={() => setLocation('/admin/finance')}
                    className="flex flex-col items-center justify-start gap-2 group w-[72px] cursor-pointer outline-none border-none bg-transparent p-0"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-black/35 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white shadow-xs group-hover:scale-105 transition-all">
                      <Wallet size={24} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-black text-black text-center leading-tight">
                      Принять<br/>оплату
                    </span>
                  </button>

                  <button 
                    onClick={() => toast({ title: "В разработке", description: "Модуль добавления лида" })}
                    className="flex flex-col items-center justify-start gap-2 group w-[72px] cursor-pointer outline-none border-none bg-transparent p-0"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-black/35 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white shadow-xs group-hover:scale-105 transition-all">
                      <UserPlus size={24} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-black text-black text-center leading-tight">
                      Создать<br/>лид
                    </span>
                  </button>
                </div>
              </div>           
      
              {/* 4. Баннер: Активные записи (#B75344 Burnt Sienna) */}
              <div
                style={{ backgroundColor: '#B75344', color: '#FFFFFF' }}
                className="p-5 md:p-6 shadow-md overflow-visible rounded-[42px] relative"
              >
                <div className="flex justify-between items-center mb-4 relative z-20">
                  <div>
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-wider">Активные записи</span>
                    <h3 className="text-white text-base font-black uppercase tracking-wider mt-0.5">
                      {homeSelectedBranch === 'Все филиалы' ? 'Все филиалы' : homeSelectedBranch.replace('Филиал: ', '')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Фильтр филиалов для Активных записей */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHomeBookingsFilterOpen(!isHomeBookingsFilterOpen);
                        }}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={16} className="stroke-[2.5]" />
                        {(homeSelectedBranch !== 'Все филиалы' || homeSelectedHall !== 'Все залы') && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-2 border-[#B75344] rounded-full bg-white shrink-0" />
                        )}
                      </button>

                      {isHomeBookingsFilterOpen && (
                        <div
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+8px)] right-0 z-[100] border-none p-5 flex flex-col gap-3.5 w-72 origin-top-right pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Филиал</label>
                            <CustomFilterDropdown
                              value={homeSelectedBranch}
                              options={['Все филиалы', ...branchesList]}
                              onChange={(newBranch) => {
                                setHomeSelectedBranch(newBranch);
                                setHomeSelectedHall('Все залы');
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Зал</label>
                            <CustomFilterDropdown
                              value={homeSelectedHall}
                              options={['Все залы', ...homeAvailableHalls]}
                              onChange={(newHall) => setHomeSelectedHall(newHall)}
                            />
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button
                              type="button"
                              onClick={() => setIsHomeBookingsFilterOpen(false)}
                              style={{ backgroundColor: '#B75344', color: '#FFFFFF' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHomeSelectedBranch('Все филиалы');
                                setHomeSelectedHall('Все залы');
                              }}
                              className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider font-mono bg-white text-[#B75344] shadow-xs">
                      {todayMainBookings.length} ЗАПИСЕЙ
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {todayMainBookings.length > 0 ? (
                    todayMainBookings.map((booking) => {
                      const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div 
                          key={booking.id}
                          className="w-full bg-white/15 backdrop-blur-sm rounded-full p-2 pl-3.5 pr-4 flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            booking.status === 'completed' ? 'bg-emerald-300' :
                            booking.status === 'missed' ? 'bg-red-300' : 'bg-amber-300'
                          }`} />

                          <div className="space-y-0.5 min-w-0 flex-1 text-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white font-mono tracking-wide">{classTime}</span>
                              <span className="text-white/60 font-medium">•</span>
                              <span className="text-xs font-bold text-white/90 truncate max-w-[130px] tracking-wide">{booking.classes.title}</span>
                            </div>
                            
                            <h4 className="text-xs font-bold text-white truncate">
                              {booking.profiles.full_name || 'Танцор AkademikA'}
                            </h4>
                          </div>

                          <div className="shrink-0">
                            {booking.status === 'booked' ? (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="icon"
                                  onClick={() => handleCheckIn(booking.id, booking.user_id)}
                                  className="w-8 h-8 rounded-full bg-white text-emerald-700 hover:bg-white/90 transition-all flex items-center justify-center focus:outline-none border-none"
                                  title="Отметить визит"
                                >
                                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                                </Button>

                                <Button
                                  size="icon"
                                  onClick={() => handleMissed(booking.id)}
                                  className="w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all flex items-center justify-center focus:outline-none border-none"
                                  title="Отметить пропуск"
                                >
                                  <XCircle className="w-4.5 h-4.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  booking.status === 'completed' 
                                    ? 'bg-white/25 text-white' 
                                    : 'bg-black/30 text-white'
                                }`}>
                                  {booking.status === 'completed' ? '✓' : '✖'}
                                </span>

                                <button
                                  onClick={() => handleUndoStatus(booking.id, booking.status, booking.user_id)}
                                  className="text-xs font-bold text-white/80 hover:text-white px-2 py-1 rounded-full transition-colors uppercase tracking-wider bg-white/10 hover:bg-white/20"
                                >
                                  Сбросить
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full bg-white/15 py-4 px-6 rounded-full text-center flex items-center justify-center">
                      <span className="text-white/80 font-bold text-xs uppercase tracking-wider">Нет активных записей на сегодня</span>
                    </div>
                  )}

                  {todayWaitingBookings.length > 0 && (
                    <div className="mt-4 pt-4 space-y-2 border-t border-white/15">
                      <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest px-1">Очередь ({todayWaitingBookings.length})</h4>
                      {todayWaitingBookings.map((booking) => {
                        const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div 
                            key={booking.id}
                            className="w-full bg-white/15 p-2 pl-4 pr-3 rounded-full flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1 text-white">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs font-black text-white font-mono tracking-wide">{classTime}</span>
                                <span className="text-white/60 font-medium">•</span>
                                <span className="text-xs font-bold text-white/90 truncate max-w-[130px] tracking-wide">{booking.classes.title}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white truncate">{booking.profiles.full_name}</h4>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePromoteFromWaiting(booking.id, booking.class_id)}
                              className="bg-white hover:bg-white/90 text-[#B75344] text-xs font-bold uppercase tracking-wider px-3 py-1.5 h-auto rounded-full transition-colors shrink-0 border-none"
                            >
                              В основу
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Занятия (Расписание) */}
          {view === 'classes' && (
            <motion.div
              key="classes-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5 pt-3 w-full max-w-full overflow-x-hidden"
            >
              {/* ВЕРХНИЙ БЛОК: Слайдер + Вертикальная навигация */}
              <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
                
               {/* Левая карточка: Главный баннер Расписание */}
               <div className="flex-1 relative h-[calc(100%+12px)] -mt-3">
                  <div 
                    style={{ backgroundColor: '#B75344', color: '#FFFFFF' }}
                    className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none shadow-md flex flex-col justify-between select-none !overflow-visible border-none transition-all"
                  >
                    
                    {/* ВЕРХНЯЯ СТРОКА: Расписание + Месяц */}
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                        Расписание
                      </h2>

                      <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                        {selectedDate.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()}
                      </h2>
                    </div>

                    {/* СРЕДНЯЯ СТРОКА: Полоса дней недели */}
                    <div className="-mx-5 overflow-hidden w-[calc(100%+40px)] select-none">
                      <HorizontalCalendar
                        selectedDate={selectedDate}
                        onSelectDate={(d) => {
                          setSelectedDate(d);
                        }}
                      />
                    </div>

                    {/* НИЖНЯЯ СТРОКА: Фильтр слева, Пилюля с датой справа */}
                    <div className="relative flex items-center justify-between z-[100]">
                      <div className="relative">
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFilterOpen(!isFilterOpen);
                          }}
                          type="button"
                          className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                        >
                          <SlidersHorizontal size={20} className="stroke-[2.5]" />
                          {(selectedBranch !== 'Все филиалы' || selectedHall !== 'Все залы' || selectedDirection !== 'Все направления' || selectedAge !== 'Все возраста' || selectedType !== 'Все типы') && (
                            <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#B75344] rounded-full bg-white shrink-0" />
                          )}
                        </button>

                        {isFilterOpen && (
                          <div 
                            onPointerDown={(e) => e.stopPropagation()} 
                            onClick={(e) => e.stopPropagation()} 
                            style={filterPopupStyle}
                            className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-72 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                          >
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Филиал</label>
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
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Зал</label>
                              <CustomFilterDropdown
                                value={selectedHall}
                                options={['Все залы', ...availableHalls]}
                                onChange={(newHall) => setSelectedHall(newHall)}
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Направление</label>
                              <CustomFilterDropdown
                                value={selectedDirection}
                                options={['Все направления', ...directionsList]}
                                onChange={(newDir) => setSelectedDirection(newDir)}
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Возраст</label>
                              <CustomFilterDropdown
                                value={selectedAge}
                                options={['Все возраста', ...agesList]}
                                onChange={(newAge) => setSelectedAge(newAge)}
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Тип занятия</label>
                              <CustomFilterDropdown
                                value={selectedType}
                                options={['Все типы', ...typesList]}
                                onChange={(newType) => setSelectedType(newType)}
                              />
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                              <button 
                                type="button" 
                                onClick={() => setIsFilterOpen(false)} 
                                style={{ backgroundColor: '#B75344', color: '#FFFFFF' }}
                                className="flex-1 text-xs font-black py-3 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
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
                                  setSelectedType('Все типы');
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
                        type="button"
                        onClick={() => {
                          setPickerCurrentDate(new Date(selectedDate));
                          setIsDatePickerOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer backdrop-blur-sm border-none shadow-none max-w-[200px]"
                      >
                        <span className="text-[11px] uppercase tracking-wider truncate font-mono text-white font-bold">
                          {selectedDate.toLocaleDateString('ru-RU', { weekday: 'short' })}, {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </span>
                        <ChevronDown size={14} className="text-white shrink-0 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Правая вертикальная пилюля */}
                <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
                  <button 
                    onClick={() => setViewMode('day')}
                    style={viewMode === 'day' ? { backgroundColor: '#B75344', color: '#FFFFFF' } : {}}
                    className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                      viewMode === 'day' 
                        ? 'shadow-md scale-100' 
                        : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
                    }`}
                    title="Расписание на день"
                  >
                    <Calendar size={20} className="stroke-[2.5]" />
                  </button>
                  
                  <button 
                    onClick={() => setViewMode('week')}
                    style={viewMode === 'week' ? { backgroundColor: '#B75344', color: '#FFFFFF' } : {}}
                    className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                      viewMode === 'week' 
                        ? 'shadow-md scale-100' 
                        : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
                    }`}
                    title="Расписание на неделю"
                  >
                    <CalendarDays size={20} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Список карточек на день ИЛИ Недельный таймлайн */}
              <AnimatePresence mode="wait">
                {viewMode === 'day' ? (
                  <motion.div
                    key={`day-${selectedDate.toDateString()}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-2.5"
                  >
                    {selectedDateClasses.length > 0 ? (
                      selectedDateClasses.map((cls) => renderClassCard(cls))
                    ) : (
                      <div className="p-8 rounded-[42px] min-h-[140px] flex flex-col items-center justify-center text-center shadow-none transition-colors bg-white/40 dark:bg-black/35 backdrop-blur-md">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          Занятия на выбранный день отсутствуют
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="week-timeline-view"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 pb-32 w-full"
                  >
                    <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 shadow-none flex flex-col gap-4 border-none select-none overflow-hidden">
                      <div className="grid grid-cols-[54px_repeat(7,1fr)] gap-1.5 items-center text-center">
                        <div className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 font-mono">
                          ВРЕМЯ
                        </div>
                        {getDaysOfWeek(currentWeekStart).map((day) => {
                          const isSel = isSameDay(day, selectedDate);
                          const isTod = isDateToday(day);
                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              onClick={() => setSelectedDate(day)}
                              style={isSel ? { backgroundColor: '#B75344', color: '#FFFFFF' } : {}}
                              className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer border-none outline-none ${
                                isSel
                                  ? 'font-bold shadow-sm'
                                  : isTod
                                    ? 'bg-white/20 dark:bg-white/10 text-slate-950 dark:text-white font-medium'
                                    : 'bg-transparent text-slate-600 dark:text-zinc-400 hover:bg-white/10'
                              }`}
                            >
                              <span className="text-[9px] uppercase tracking-wider font-bold leading-none">
                                {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                              </span>
                              <span className="text-xs font-mono font-black mt-0.5 leading-none">
                                {day.getDate()}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto scrollbar-none pr-0.5">
                        {TIME_SLOTS.map((timeStr) => {
                          const hour = parseInt(timeStr.split(':')[0], 10);

                          return (
                            <div key={timeStr} className="grid grid-cols-[54px_repeat(7,1fr)] gap-1.5 min-h-[58px] items-stretch">
                              <div className="flex items-start justify-center pt-1 font-mono text-[11px] font-black text-slate-500 dark:text-zinc-400">
                                {timeStr}
                              </div>

                              {getDaysOfWeek(currentWeekStart).map((day, dIdx) => {
                                const daySlotClasses = classes.filter((cls) => {
                                  const d = new Date(cls.start_time);
                                  const matchesDay = d.getDate() === day.getDate() &&
                                                     d.getMonth() === day.getMonth() &&
                                                     d.getFullYear() === day.getFullYear();
                                  const classHour = d.getHours();
                                  return matchesDay && classHour === hour && isClassMatchingFilter(cls);
                                });

                                return (
                                  <div
                                    key={`${day.toISOString()}-${timeStr}`}
                                    className="bg-black/5 dark:bg-white/5 rounded-[16px] p-1 flex flex-col gap-1 relative overflow-hidden group hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                  >
                                    {daySlotClasses.map((cls, cIdx) => {
                                      const cardColor = cls.color || PANTONE_COLORS[(cls.id || cIdx) % PANTONE_COLORS.length];
                                      const isYellow = cardColor === '#D9C560';

                                      return (
                                        <button
                                          key={cls.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedClassForSheet(cls);
                                            setIsCancelConfirmOpen(false);
                                            setIsClassSheetOpen(true);
                                          }}
                                          style={{ backgroundColor: cardColor }}
                                          className={`w-full p-1.5 rounded-[12px] flex flex-col justify-between text-left cursor-pointer border-none shadow-xs transition-transform active:scale-95 ${
                                            isYellow ? 'text-black' : 'text-white'
                                          }`}
                                          title={`${cls.title} • ${cls.teacher_name}`}
                                        >
                                          <span className="text-[9px] font-black uppercase tracking-wider truncate leading-tight">
                                            {cls.title}
                                          </span>
                                          <div className="flex justify-between items-center mt-1 text-[8px] font-bold opacity-80 leading-none">
                                            <span className="truncate max-w-[50px]">{cls.teacher_name?.split(' ')[0]}</span>
                                            <span className="font-mono">{cls.hall ? cls.hall.slice(0, 3) : 'Зал'}</span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB: История */}
          {view === 'history' && (
            <ScheduleHistoryTab historyBookings={historyBookings} />
          )}

        </AnimatePresence>
      </div>

      {view === 'classes' && (
        <FloatingActionButton
          onClick={() => setLocation('/add-class')}
          ariaLabel="Создать урок"
          id="floating-create-class-btn"
          style={{ backgroundColor: '#B75344', color: '#FFFFFF' }}
          className="!bg-[#B75344] !text-white shadow-lg shadow-[#B75344]/30 hover:opacity-95"
        />
      )}

      {/* CLASS OPTIONS BOTTOM SHEET */}
      <AnimatePresence>
        {isClassSheetOpen && selectedClassForSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsClassSheetOpen(false);
                setIsCancelConfirmOpen(false);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-[#161618] border-t border-white/10 rounded-t-[28px] max-h-[85dvh] flex flex-col z-50 shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mt-3 mb-2 shrink-0" />

              <div className="px-6 pb-3 pt-1 border-b border-zinc-800/40 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-base font-medium text-white">{selectedClassForSheet.title}</h3>
                  <p className="text-xs font-bold text-[#B75344] tracking-wide uppercase mt-0.5">
                    Управление уроком • Зал {selectedClassForSheet.id % 2 === 0 ? "2" : "1"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc-900/80 hover:bg-zinc-800/60 text-stone-400 hover:text-white w-9 h-9 border border-zinc-800/40 transition-colors"
                  onClick={() => {
                    setIsClassSheetOpen(false);
                    setIsCancelConfirmOpen(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="px-6 py-6 overflow-y-auto scrollbar-none pb-28 space-y-6 flex-1">
                <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px] space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      ⚡ Быстрая продажа / Запись
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Свободно: {(selectedClassForSheet.max_students || 15) - (bookings.filter(b => b.class_id === selectedClassForSheet.id && b.status !== 'cancelled').length)} мест
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsClassSheetOpen(false);
                        setIsSellMembershipOpen(true);
                      }}
                      className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🎟️ Продать абонемент</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsClassSheetOpen(false);
                        setIsAddPaymentOpen(true);
                      }}
                      className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>💳 Разовая оплата</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Изменить хореографа</label>
                  <div className="relative">
                    <select
                      value={selectedClassForSheet.teacher_name}
                      onChange={async (e) => {
                        const newTeacher = e.target.value;
                        await handleUpdateTeacher(selectedClassForSheet.id, newTeacher);
                      }}
                      className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-medium text-white appearance-none focus:outline-none focus:border-[#B75344] transition-colors cursor-pointer"
                    >
                      {TEACHERS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 my-2"></div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Опасная зона</label>
                  
                  {!isCancelConfirmOpen ? (
                    <Button
                      type="button"
                      disabled={selectedClassForSheet.status === 'cancelled'}
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 font-bold h-12 rounded-2xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                    >
                      {selectedClassForSheet.status === 'cancelled' ? 'Урок уже отменен' : 'Отменить занятие на сегодня'}
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-950/20 border border-red-500/30 p-4 rounded-2xl space-y-3"
                    >
                      <div className="flex gap-2 text-red-400 items-start">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <h4 className="text-xs font-bold uppercase tracking-wider">Подтверждение отмены</h4>
                          <p className="text-xs font-bold text-red-200/80 mt-1 tracking-wide">
                            Вы действительно хотите отменить занятие на сегодня? Статус изменится на «Отменено».
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await handleCancelClass(selectedClassForSheet.id);
                            setIsCancelConfirmOpen(false);
                            setIsClassSheetOpen(false);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0 shadow-md"
                        >
                          Да, отменить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsCancelConfirmOpen(false)}
                          className="bg-zinc-800 text-stone-300 hover:bg-zinc-700 text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0"
                        >
                          Назад
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-zinc-900/60 my-2"></div>

                {(() => {
                  const sheetClassReviews = reviews.filter(
                    r => r.classId === selectedClassForSheet.id || 
                    r.className?.toLowerCase() === selectedClassForSheet.title?.toLowerCase()
                  );
                  return (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                        Отзывы учеников ({sheetClassReviews.length})
                      </label>
                      
                      {sheetClassReviews.length > 0 ? (
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto scrollbar-none pr-1">
                          {sheetClassReviews.map((rev: any) => (
                            <div key={rev.id} className="bg-[#1C1C1E] border border-zinc-850 p-3.5 rounded-[20px] flex flex-col gap-1.5 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-white">{rev.studentName}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-[#B75344] font-mono tracking-wide">★ {rev.rating.toFixed(1)}</span>
                                  <span className="text-xs text-zinc-500 font-bold tracking-wide">{rev.date}</span>
                                </div>
                              </div>
                              {rev.comment ? (
                                <p className="text-xs text-stone-300 font-medium leading-relaxed italic">
                                  "{rev.comment}"
                                </p>
                              ) : (
                                <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Без текстового комментария</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ borderRadius: '16px' }} className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-zinc-800/60 border-dashed rounded-xl py-6 text-center text-slate-400 dark:text-stone-400 text-xs font-bold uppercase tracking-wider shadow-xs">
                          Отзывов о занятии пока нет
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick Action Modals */}
      <QuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => setIsQuickBookOpen(false)}
        onSuccess={() => {
          fetchBookingsData();
        }}
      />

      <SellMembershipModal
        isOpen={isSellMembershipOpen}
        onClose={() => setIsSellMembershipOpen(false)}
      />

      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
      />

      <CreateLeadModal
        isOpen={isCreateLeadOpen}
        onClose={() => setIsCreateLeadOpen(false)}
      />

      <BottomNav />
    </div>
  );
}