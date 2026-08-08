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
  Ticket,
  Wallet,
  UserPlus
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { PeriodHeaderBanner } from '../components/PeriodHeaderBanner';
import { apiRequest } from '@/lib/queryClient';
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
import AdminHeader from "../components/AdminHeader";

const TEACHERS = [
  "Мария Ковалева",
  "Алексей Петров",
  "Дарья Смирнова",
  "Ирина Волк",
  "Кристина Романова",
  "Артем Соколов",
  "Евгения Морозова"
];

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const { currentRole } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
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
  const [view, setView] = useState<'home' | 'active' | 'history' | 'classes'>(() => {
    if (location === '/admin/schedule') return 'classes';
    return 'home';
  });

  useEffect(() => {
    if (location === '/admin/schedule') {
      setView(prev => (prev === 'classes' || prev === 'history' || prev === 'active') ? prev : 'classes');
    } else if (location === '/Admin') {
      setView('home');
    }
  }, [location]);
  const [cancelingIds, setCancelingIds] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerCurrentDate, setPickerCurrentDate] = useState<Date>(new Date());

  // Location & Hall filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('Все филиалы');
  const [selectedHall, setSelectedHall] = useState<string>('Все залы');

  const branchesList = ['Филиал: Невский', 'Филиал: Центральный'];
  const branchHallsMap: Record<string, string[]> = {
    'Филиал: Невский': ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)'],
    'Филиал: Центральный': ['Зал 3 (VIP Room)'],
  };

  const availableHalls = selectedBranch === 'Все филиалы'
    ? ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)', 'Зал 3 (VIP Room)']
    : (branchHallsMap[selectedBranch] || ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)']);

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
    return true;
  };

  const getDaysOfMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const handleSelectDatePickerDate = (date: Date) => {
    setSelectedDate(date);
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    setIsDatePickerOpen(false);
  };

  const handleResetToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    setIsDatePickerOpen(false);
  };

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

  const getHeaderTitle = (d: Date, hallFilter: string = 'Все залы') => {
    let baseTitle = "";
    if (isDateToday(d)) {
      baseTitle = "Уроки на сегодня";
    } else {
      const weekdays = ["воскресенье", "понедельник", "вторник", "среду", "четверг", "пятницу", "субботу"];
      const dayName = weekdays[d.getDay()];
      const formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      baseTitle = `Уроки на ${dayName} (${formattedDate})`;
    }

    if (hallFilter && hallFilter !== 'Все залы') {
      const shortHall = hallFilter.split('(')[0].trim().toUpperCase();
      return `${baseTitle} • ${shortHall}`;
    }

    return baseTitle;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
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
        avatar_url: profile?.avatar_url || ''
      });

      if (profile && profile.role !== 'admin' && profile.role !== 'owner') {
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
          max_students
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
      
      // Self-healing mock entries initializer for today's classes
      if (filtered.length === 0) {
        const isMockActive = localStorage.getItem('supabase_mock_mode') === 'true';
        if (isMockActive) {
          const classesRes = await supabase.from('classes').select('*');
          const classesList = classesRes.data || [];
          
          const todayClasses = classesList.filter((cls: any) => {
            const d = new Date(cls.start_time);
            const today = new Date();
            return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
          });

          if (todayClasses.length > 0) {
            const firstClass = todayClasses[0];
            const secondClass = todayClasses[1] || todayClasses[0];

            const mockProfiles = [
              { id: 'usr-1', full_name: 'Анна Кузнецова', phone: '89112223344', role: 'student' },
              { id: 'usr-2', full_name: 'Дмитрий Морозов', phone: '89223334455', role: 'student' },
              { id: 'usr-3', full_name: 'София Лебедева', phone: '89556667788', role: 'student' },
              { id: 'usr-4', full_name: 'Кирилл Волков', phone: '89334445566', role: 'student' },
              { id: 'usr-5', full_name: 'Елена Орлова', phone: '89889990011', role: 'student' },
            ];

            for (const prof of mockProfiles) {
              await supabase.from('profiles').insert(prof);
              await supabase.from('subscriptions').insert({
                user_id: prof.id,
                plan_name: "Pro Dance 8 занятий",
                visits_left: 6,
                expires_at: "2027-12-31T23:59:59.000Z"
              });
            }

            const mockBookings = [
              { user_id: 'usr-1', class_id: firstClass.id, status: 'booked' },
              { user_id: 'usr-2', class_id: firstClass.id, status: 'booked' },
              { user_id: 'usr-3', class_id: firstClass.id, status: 'waiting' },
              { user_id: 'usr-4', class_id: secondClass.id, status: 'booked' },
              { user_id: 'usr-5', class_id: secondClass.id, status: 'waiting' },
            ];

            for (const b of mockBookings) {
              await supabase.from('bookings').insert(b);
            }

            const refetched = await supabase.from('bookings').select(`
              id,
              status,
              user_id,
              class_id,
              classes (
                id,
                title,
                start_time,
                teacher_name,
                max_students
              ),
              profiles (
                id,
                full_name,
                phone
              )
            `);
            setBookings(refetched.data || []);
            return;
          }
        }
      }

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

  // Attendance check (Присутствовал)
  const handleCheckIn = async (bookingId: number, userId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Decrement student's visits left from subscriptions
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

  // No-Show (Пропуск - занятие сгорает)
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

  // Move from Waiting List to Main list (Перевести в основу)
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

  // Undo attendance marking
  const handleUndoStatus = async (bookingId: number, currentStatus: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (error) throw error;

      // If they were marked completed, return the lesson back to subscription
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

  // Update Choreographer (Хореограф)
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

      setSelectedClassForSheet(prev => prev ? { ...prev, teacher_name: newTeacher } : null);
      await fetchClassesData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: err.message,
      });
    }
  };

  // Cancel Class for today (Отменить занятие на сегодня)
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

  const handleCancel = async (booking: any) => {
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
        await fetchBookingsData();
        return;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      const { data: subscription, error: subFetchError } = await supabase
        .from('subscriptions')
        .select('id, visits_left')
        .eq('user_id', booking.user_id)
        .maybeSingle();

      if (subFetchError) throw subFetchError;

      if (subscription) {
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({ visits_left: subscription.visits_left + 1 })
          .eq('id', subscription.id);

        if (subUpdateError) throw subUpdateError;
      }

      toast({
        title: "Запись отменена",
        description: "Занятие и место возвращены на баланс",
      });

      try {
        await apiRequest('POST', '/api/notifications/telegram', {
          text: `⚠️ <b>Отмена записи!</b>\n👤 Ученик: ${booking.profiles.full_name || booking.profiles.phone}\n🕺 Урок: ${booking.classes.title}`
        });
      } catch (err) {
        console.error('Failed to send telegram notification:', err);
      }

      await fetchBookingsData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка отмены",
        description: err.message,
      });
    } finally {
      setCancelingIds(prev => {
        const next = new Set(Array.from(prev));
        next.delete(booking.id);
        return next;
      });
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm("Вы уверены, что хотите удалить это занятие и все записи на него?")) {
      return;
    }

    try {
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('class_id', classId);

      if (bookingsError) throw bookingsError;

      const { error: classError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (classError) throw classError;

      toast({
        title: "Успешно",
        description: "Занятие удалено",
      });

      await Promise.all([
        fetchBookingsData(),
        fetchClassesData()
      ]);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
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

  const now = new Date();

  // "Активные" tab today's bookings: main list + waiting list
  const todayBookings = bookings.filter(b => isToday(b.classes.start_time));
  const todayMainBookings = todayBookings.filter(b => b.status !== 'waiting');
  const todayWaitingBookings = todayBookings.filter(b => b.status === 'waiting');

  // "Занятия" tab today's classes
  const todayClasses = classes.filter(cls => isToday(cls.start_time));

  const isSelectedDay = (dateString: string) => {
    const d = new Date(dateString);
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear();
  };

  const selectedDateClasses = classes
    .filter(cls => isSelectedDay(cls.start_time))
    .filter(isClassMatchingFilter);

  // "История" tab bookings (older or finished bookings)
  const historyBookings = bookings.filter(b => {
    const startTime = new Date(b.classes.start_time);
    return !isToday(b.classes.start_time) || b.status === 'completed' || b.status === 'cancelled' || b.status === 'missed';
  });

  const renderClassCard = (cls: any) => {
    const isCancelled = cls.status === 'cancelled';
    
    // Count main bookings for this class
    const classBookings = bookings.filter(b => b.class_id === cls.id && b.status !== 'waiting' && b.status !== 'cancelled');
    const bookedCount = classBookings.length;
    const fillPercentage = Math.min(100, (bookedCount / (cls.max_students || 15)) * 100);

    // Formatted time
    const startTime = new Date(cls.start_time).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Dynamic hall allocation (Zal 1 / Zal 2 / Zal 3)
    const roomName = cls.hall || cls.room || (cls.id % 2 === 0 ? "Зал 2 (Light Studio)" : "Зал 1 (Main Glass)");

    const classReviews = reviews.filter(r => r.classId === cls.id || r.className?.toLowerCase() === cls.title?.toLowerCase());
    const sum = classReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = classReviews.length > 0 ? (sum / classReviews.length).toFixed(1) : "0.0";
    const reviewCount = classReviews.length;

    // Accent color assigned to group or theme default accent
    const cardAccent = cls.color || cls.badge_color || accentColor || '#CCFF00';

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
        className={`bg-[#161618] ${
          isCancelled ? 'opacity-75' : ''
        } rounded-[24px] p-5 shadow-lg cursor-pointer relative overflow-hidden transition-all group`}
      >
        {/* ArrowUpRight icon */}
        <div className="absolute top-5 right-5 text-zinc-500 group-hover:text-white transition-colors pointer-events-none">
          <ArrowUpRight size={16} />
        </div>

        {/* Top Info line */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span 
              style={{ color: cardAccent, backgroundColor: `${cardAccent}1F` }}
              className="text-xs font-bold px-3 py-1 rounded-full font-mono"
            >
              {startTime}
            </span>
            <span className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
              {roomName}
            </span>
          </div>
          
          {isCancelled ? (
            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider mr-6">
              ОТМЕНЕНО
            </span>
          ) : (
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mr-6 font-mono">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              {bookedCount}/{cls.max_students || 15}
            </span>
          )}
        </div>

        {/* Middle heading */}
        <div className="space-y-1 my-3">
          <h3 className={`text-base font-medium text-white${isCancelled ? 'line-through text-zinc-500' : ''}`}>
            {cls.title}
          </h3>
          <p className="text-xs font-medium text-zinc-400 flex items-center gap-2 flex-wrap">
            <span>Хореограф: <span className="text-white font-medium">{cls.teacher_name}</span></span>
            {reviewCount > 0 && (
              <span 
                style={{ color: cardAccent, backgroundColor: `${cardAccent}1F` }}
                className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 tracking-wide"
              >
                ⭐ {avgRating} ({reviewCount})
              </span>
            )}
          </p>
        </div>

        {/* Bottom progress bar */}
        {!isCancelled && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider uppercase text-zinc-500">
              <span>Заполненность группы</span>
              <span style={{ color: cardAccent }} className="font-mono">{bookedCount} из {cls.max_students || 15} мест</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${fillPercentage}%`, backgroundColor: cardAccent }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Доброе утро";
    if (hour >= 12 && hour < 18) return "Добрый день";
    if (hour >= 18 && hour < 23) return "Добрый вечер";
    return "Доброй ночи";
  };

  if (loading) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-zinc-100'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col relative font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'
    }`}>
      {/* Urban Glass Header */}
      <AdminHeader
        user={currentUserProfile || { full_name: 'Мария', role: 'admin' }}
        view={view}
        onNavigateProfile={() => setLocation('/Profile')}
        onLogout={async () => {
          await supabase.auth.signOut();
          setLocation('/Login');
        }}
      />

      {/* Tabs Switcher */}
      {view !== 'home' && (
        <div className="px-3 pb-4 shrink-0">
          <div className="flex p-1.5 !rounded-[32px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-zinc-800 transition-colors">
            <button
              onClick={() => setView('active')}
              className={`flex-1 !rounded-[32px] text-xs font-bold py-3.5 uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                view === 'active'
                  ? 'shadow-md bg-[#CCFF00] text-black'
                  : theme === 'light'
                    ? 'text-[#121214] hover:text-black font-medium'
                    : 'text-stone-300 hover:text-white font-medium'
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setView('classes')}
              className={`flex-1 !rounded-[32px] text-xs font-bold py-3.5 uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                view === 'classes'
                  ? 'shadow-md bg-[#CCFF00] text-black'
                  : theme === 'light'
                    ? 'text-[#121214] hover:text-black font-medium'
                    : 'text-stone-300 hover:text-white font-medium'
              }`}
            >
              Расписание
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex-1 !rounded-[32px] text-xs font-bold py-3.5 uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                view === 'history'
                  ? 'shadow-md bg-[#CCFF00] text-black'
                  : theme === 'light'
                    ? 'text-[#121214] hover:text-black font-medium'
                    : 'text-stone-300 hover:text-white font-medium'
              }`}
            >
              История
            </button>
          </div>
     
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-3 pb-32">
        <AnimatePresence mode="wait">
          
          {/* TAB: Главная (Dashboard) */}
          {view === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 pb-20"
            >
              <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4">
                <div className="min-w-full snap-center flex-shrink-0">
                  <div 
                    onClick={() => setLocation('/admin/finance')}
                    style={{
                      backgroundColor: accentColor || '#CCFF00',
                      borderRadius: '42px'
                    }}
                    className="p-5 md:p-6 shadow-none overflow-hidden cursor-pointer transition-all duration-300 hover:brightness-105 active:scale-[0.99]" 
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-slate-900/80 text-xs font-bold uppercase tracking-wider">Финансовая сводка</span>
                        <h3 className="text-slate-900 text-xs font-medium mt-0.5">Показатели за сегодня</h3>
                      </div>
                      <div 
                        className="w-9 h-9 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-900 shadow-xs shrink-0"
                      >
                        <Award size={18} className="text-slate-900" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 my-4 pl-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-black/60 text-xs font-bold uppercase tracking-wider">Выручка</span>
                        <span className="text-black text-2xl md:text-3xl font-bold font-mono">₽14 500</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-black/60 text-xs font-bold uppercase tracking-wider">Продажи</span>
                        <span className="text-black text-2xl md:text-3xl font-bold font-mono">
                          3 <span className="text-sm md:text-base text-black/70 font-medium">абон.</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3.5 text-xs text-slate-900 font-bold flex justify-between px-1 tracking-wide">
                      <span>Средний чек: <strong className="text-slate-900 font-medium">₽4 833</strong></span>
                      <span className="text-slate-900 font-medium">+12% к прошлой пятнице</span>
                    </div>
                  </div>
                </div>
                <div className="min-w-full snap-center flex-shrink-0">
                  {/* Widget 2: Операционные задачи */}
                  <div
                    style={{ borderRadius: '42px' }}
                    className="bg-[#DDE2E5] dark:bg-[#161618] p-5 md:p-6 shadow-none overflow-hidden !rounded-[42px]"
                  >
                    <span className="text-slate-700 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Операционные задачи</span>
                    
                    <div className="flex flex-col gap-3 mt-4">
                      {/* Task 1 Card */}
                      <div className="w-full bg-white/60 dark:bg-zinc-800/60 rounded-full p-2 pl-2.5 pr-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-brand-orange/15 flex items-center justify-center text-brand-orange shrink-0">
                            <AlertTriangle size={16} className="text-brand-orange" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate">Заканчиваются абонементы</h4>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold truncate tracking-wide">Осталось 1 или меньше занятий</p>
                          </div>
                        </div>
                        <span className="text-brand-orange text-xs font-bold font-mono bg-brand-orange/10 px-3 py-1 rounded-full shrink-0">
                          {expiringSubsCount}
                        </span>
                      </div>

                      {/* Task 2 Card */}
                      <div className="w-full bg-white/60 dark:bg-zinc-800/60 rounded-full p-2 pl-2.5 pr-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-brand-orange/15 flex items-center justify-center text-brand-orange shrink-0">
                            <User size={16} className="text-brand-orange" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate">Должники</h4>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold truncate tracking-wide">Нужно продлить абонемент</p>
                          </div>
                        </div>
                        <span className="text-brand-orange text-xs font-bold font-mono bg-brand-orange/10 px-3 py-1 rounded-full shrink-0">
                          {debtorsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1 md:px-0">
                {/* 1. Записать */}
                <button
                  type="button"
                  onClick={() => setIsQuickBookOpen(true)}
                  className="w-full h-[84px] bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 flex items-center gap-4 transition-all cursor-pointer group text-left outline-none select-none border-none"
                >
                  <div
                    style={{ backgroundColor: accentColor || '#CCFF00' }}
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                  >
                    <CalendarPlus size={28} className="text-black stroke-[2.2] w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      Записать
                    </span>
                  </div>
                </button>

                {/* 2. Продать абонемент */}
                <button
                  type="button"
                  onClick={() => setIsSellMembershipOpen(true)}
                  className="w-full h-[84px] bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 flex items-center gap-4 transition-all cursor-pointer group text-left outline-none select-none border-none"
                >
                  <div
                    style={{ backgroundColor: accentColor || '#CCFF00' }}
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                  >
                    <Ticket size={28} className="text-black stroke-[2.2] w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      Продать
                    </span>
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      абонемент
                    </span>
                  </div>
                </button>

                {/* 3. Принять оплату */}
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(true)}
                  className="w-full h-[84px] bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 flex items-center gap-4 transition-all cursor-pointer group text-left outline-none select-none border-none"
                >
                  <div
                    style={{ backgroundColor: accentColor || '#CCFF00' }}
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                  >
                    <Wallet size={28} className="text-black stroke-[2.2] w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      Принять
                    </span>
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      оплату
                    </span>
                  </div>
                </button>

                {/* 4. Создать лид */}
                <button
                  type="button"
                  onClick={() => setIsCreateLeadOpen(true)}
                  className="w-full h-[84px] bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 flex items-center gap-4 transition-all cursor-pointer group text-left outline-none select-none border-none"
                >
                  <div
                    style={{ backgroundColor: accentColor || '#CCFF00' }}
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                  >
                    <UserPlus size={28} className="text-black stroke-[2.2] w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      Создать
                    </span>
                    <span className="text-sm md:text-base font-semibold text-[#121214] dark:text-white block leading-snug break-words">
                      лид
                    </span>
                  </div>
                </button>
              </div>
         


              {/* Widget 3: Активные записи */}
              <div
                style={{ borderRadius: '42px' }}
                className="bg-[#DDE2E5] dark:bg-[#161618] p-5 md:p-6 shadow-none overflow-hidden !rounded-[42px]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-slate-700 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Активные записи</span>
                    <h3 className="text-slate-900 dark:text-white text-xs font-medium mt-0.5">Ближайшие записи на сегодня</h3>
                  </div>
                  <span 
                    className="ui-badge text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono bg-slate-900 text-white dark:bg-white/10 dark:text-white"
                  >
                    {todayMainBookings.length} ЗАПИСЕЙ
                  </span>
                </div>
           

                {/* Sub widget lists */}
                <div className="space-y-3">
                  {todayMainBookings.length > 0 ? (
                    todayMainBookings.map((booking) => {
                      const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div 
                          key={booking.id}
                          className="w-full bg-white/60 dark:bg-zinc-800/60 rounded-full p-2 pl-3.5 pr-4 flex items-center justify-between gap-2"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            booking.status === 'completed' ? 'bg-emerald-500' :
                            booking.status === 'missed' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 tracking-wide">{classTime}</span>
                              <span className="text-slate-400 font-medium">•</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 truncate max-w-[120px] tracking-wide">{booking.classes.title}</span>
                            </div>
                            
                            <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate">
                              {booking.profiles.full_name || 'Танцор AkademikA'}
                            </h4>
                          </div>

                          {/* Interactive Buttons */}
                          <div className="shrink-0">
                            {booking.status === 'booked' ? (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="icon"
                                  onClick={() => handleCheckIn(booking.id, booking.user_id)}
                                  className="w-8 h-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center focus:outline-none"
                                  title="Отметить визит"
                                >
                                  <CheckCircle2 className="w-4.5 h-4.5" />
                                </Button>

                                <Button
                                  size="icon"
                                  onClick={() => handleMissed(booking.id)}
                                  className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all flex items-center justify-center focus:outline-none"
                                  title="Отметить пропуск"
                                >
                                  <XCircle className="w-4.5 h-4.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  booking.status === 'completed' 
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' 
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
                                }`}>
                                  {booking.status === 'completed' ? '✓' : '✖'}
                                </span>

                                <button
                                  onClick={() => handleUndoStatus(booking.id, booking.status, booking.user_id)}
                                  className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-full transition-colors uppercase tracking-wider bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
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
                    <div className="w-full bg-white/60 dark:bg-zinc-800/60 py-3.5 px-6 rounded-full text-center flex items-center justify-center">
                      <span className="text-slate-600 dark:text-zinc-400 font-medium text-xs">Нет активных записей на сегодня</span>
                    </div>
                  )}

                  {/* Waiting list in Widget 3 */}
                  {todayWaitingBookings.length > 0 && (
                    <div className="mt-4 pt-4 space-y-2">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1">Очередь ({todayWaitingBookings.length})</h4>
                      {todayWaitingBookings.map((booking) => {
                        const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div 
                            key={booking.id}
                            className="w-full bg-white/60 dark:bg-zinc-800/60 p-2 pl-4 pr-3 rounded-full flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 tracking-wide">{classTime}</span>
                                <span className="text-slate-400 font-medium">•</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 truncate max-w-[120px] tracking-wide">{booking.classes.title}</span>
                              </div>
                              <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate">{booking.profiles.full_name}</h4>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePromoteFromWaiting(booking.id, booking.class_id)}
                              className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 h-auto rounded-full transition-colors shrink-0"
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

          {/* TAB: Активные (Today's Visits) */}
          {view === 'active' && (
            <motion.div
              key="active-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Today Date Section */}
              <div className="flex justify-between items-stretch bg-[#CDD2D7] dark:bg-[#161618] border border-black/10 dark:border-white/10 p-1.5 pl-4 rounded-[24px] min-h-[44px]">
                <div className="flex items-center gap-2 py-1">
                  <Calendar className="w-4 h-4 text-[#121214] dark:text-[#CCFF00]" />
                  <span className="text-xs font-bold text-[#121214] dark:text-white uppercase tracking-wider">Посещения сегодня</span>
                </div>
                <span 
                  style={{ backgroundColor: accentColor, color: activeTextColor }}
                  className="self-stretch flex items-center justify-center px-3.5 rounded-control text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                </span>
              </div>

              {/* Main List Table/Cards */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Основной список ({todayMainBookings.length})</h2>
                
                {todayMainBookings.length > 0 ? (
                  todayMainBookings.map((booking) => {
                    const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div 
                        key={booking.id}
                        className="bg-[#161618] border border-white/10 rounded-[24px] p-4 flex items-center justify-between shadow-md group relative overflow-hidden transition-all duration-200"
                      >
                        {/* Status bar glow indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                          booking.status === 'completed' ? 'bg-emerald-500' :
                          booking.status === 'missed' ? 'bg-red-500' : 'bg-amber-500/60'
                        }`} />

                        <div className="space-y-1 pl-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-stone-400">{classTime}</span>
                            <span className="text-stone-600">•</span>
                            <span className="text-xs font-medium text-white">{booking.classes.title}</span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-white">
                            {booking.profiles.full_name || 'Танцор AkademikA'}
                          </h4>
                          <p className="text-xs text-stone-500 font-bold font-mono leading-none tracking-wide">
                            {booking.profiles.phone || '89112223344'}
                          </p>
                        </div>

                        {/* Interactive Buttons block */}
                        <div>
                          {booking.status === 'booked' ? (
                            <div className="flex items-center gap-2">
                              {/* Присутствовал (Зеленая галочка) */}
                              <Button
                                size="icon"
                                onClick={() => handleCheckIn(booking.id, booking.user_id)}
                                className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center focus:outline-none"
                                title="Отметить визит"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </Button>

                              {/* Пропуск (Красный крестик) */}
                              <Button
                                size="icon"
                                onClick={() => handleMissed(booking.id)}
                                className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all flex items-center justify-center focus:outline-none"
                                title="Отметить пропуск"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Attendance Status Display */}
                              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border${
                                booking.status === 'completed' 
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-red-950/40 text-red-400 border-red-500/20'
                              }`}>
                                {booking.status === 'completed' ? '✓ ПОСЕТИЛ' : '✖ ПРОПУСК'}
                              </span>

                              {/* Undo button to change status back */}
                              <button
                                onClick={() => handleUndoStatus(booking.id, booking.status, booking.user_id)}
                                className="text-xs font-bold text-stone-500 hover:text-[#CCFF00] hover:bg-zinc-800 px-2.5 py-1.5 rounded-full transition-colors uppercase tracking-wider"
                                title="Изменить решение"
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
                  <div style={{ borderRadius: '16px' }} className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-zinc-800/80 border-dashed rounded-xl py-10 text-center text-slate-400 dark:text-stone-400 font-medium text-xs shadow-xs">
                    Нет активных записей на сегодня
                  </div>
                )}
              </div>

              {/* Waiting List (Список ожидания) */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">СПИСОК ОЖИДАНИЯ ({todayWaitingBookings.length})</h2>
                  {todayWaitingBookings.length > 0 && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {todayWaitingBookings.length} чел
                    </span>
                  )}
                </div>

                {todayWaitingBookings.length > 0 ? (
                  todayWaitingBookings.map((booking) => {
                    const classTime = new Date(booking.classes.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div 
                        key={booking.id}
                        className="bg-zinc-900/80 backdrop-blur-sm border-2 border-amber-500/40 rounded-[24px] p-4 flex items-center justify-between shadow-lg shadow-amber-500/5 relative overflow-hidden group"
                      >
                        <div className="absolute top-4 right-4 text-zinc-500 group-hover:text-[#CCFF00] transition-colors pointer-events-none">
                          <ArrowUpRight size={14} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Очередь</span>
                            <span className="text-xs font-medium text-stone-400">{classTime}</span>
                            <span className="text-xs font-medium text-white">{booking.classes.title}</span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-white mt-1">
                            {booking.profiles.full_name || 'Ученик ожидания'}
                          </h4>
                          <p className="text-[10px] text-stone-500 font-mono leading-none">
                            {booking.profiles.phone || '89112223344'}
                          </p>
                        </div>

                        <div>
                          <Button
                            size="sm"
                            onClick={() => handlePromoteFromWaiting(booking.id, booking.class_id)}
                            className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider px-4 py-2 h-auto rounded-full transition-colors shadow-sm"
                          >
                            В основу
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ borderRadius: '16px' }} className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-zinc-800/80 border-dashed rounded-xl py-8 text-center text-slate-400 dark:text-stone-400 font-medium text-xs shadow-xs">
                    Список ожидания пуст
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: Занятия (Schedule / Controls) */}
          {view === 'classes' && (
            <motion.div
              key="classes-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* Date Selection Header Row with Month Picker Trigger */}
              <div className="flex justify-between items-end px-1">
                <span 
                  style={{ color: accentColor || '#CCFF00' }}
                  className="text-3xl md:text-4xl font-bold tracking-wider uppercase"
                >
                  {selectedDate.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setPickerCurrentDate(new Date(selectedDate));
                    setIsDatePickerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#CDD2D7] dark:bg-[#1A1A1C] hover:bg-[#c3c8cd] dark:hover:bg-[#222225] border border-black/10 dark:border-white/10 shadow-sm transition-all text-[#121214] dark:text-white text-xs font-bold rounded-btn cursor-pointer mb-0.5 select-none"
                >
                  <span className="text-[#121214] dark:text-white font-bold uppercase">
                    {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase()}
                    , {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }).toUpperCase()}
                  </span>
                  <ChevronDown size={14} className="text-[#121214] dark:text-white shrink-0" />
                </button>
              </div>

              {/* Responsive Horizontal Calendar */}
              <HorizontalCalendar 
                selectedDate={selectedDate} 
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setViewMode('day');
                }} 
              />

              {/* Location & Hall Filter Panel (Signature Light-Grey Pills with Custom Dropdowns) */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 my-1">
                {/* Branch Selector */}
                {branchesList.length > 1 && (
                  <CustomFilterDropdown
                    value={selectedBranch}
                    options={['Все филиалы', ...branchesList]}
                    onChange={(newBranch) => {
                      setSelectedBranch(newBranch);
                      setSelectedHall('Все залы');
                    }}
                  />
                )}

                {/* Hall Selector */}
                {availableHalls.length > 1 ? (
                  <CustomFilterDropdown
                    value={selectedHall}
                    options={['Все залы', ...availableHalls]}
                    onChange={(newHall) => setSelectedHall(newHall)}
                  />
                ) : availableHalls.length === 1 ? (
                  <div className="shrink-0 bg-[#CDD2D7] rounded-control text-xs font-medium text-[#121214] px-4 py-2">
                    {availableHalls[0]}
                  </div>
                ) : null}
              </div>

              {/* Top subheader (Signature Light-Grey Banner with Direct Buttons) */}
              <PeriodHeaderBanner<'day' | 'week'>
                title={
                  viewMode === 'day' 
                    ? getHeaderTitle(selectedDate, selectedHall) 
                    : (selectedHall !== 'Все залы' ? `Расписание на неделю • ${selectedHall.split('(')[0].trim().toUpperCase()}` : "Расписание на неделю")
                }
                icon={CalendarDays}
                options={[
                  { id: 'day', label: 'День' },
                  { id: 'week', label: 'Неделя' },
                ]}
                activeId={viewMode}
                onSelect={(mode) => setViewMode(mode)}
                layoutId="adminViewModePill"
              />

              {/* Class Cards with AnimatePresence depending on viewMode */}
              <AnimatePresence mode="wait">
                {viewMode === 'day' ? (
                  <motion.div
                    key={`day-${selectedDate.toDateString()}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {selectedDateClasses.length > 0 ? (
                      selectedDateClasses.map((cls) => renderClassCard(cls))
                    ) : (
                      <div className={`p-6 rounded-[28px] min-h-[110px] flex flex-col items-center justify-center text-center transition-colors ${
                        theme === 'light'
                          ? 'bg-white text-black'
                          : 'bg-[#1A1A1C] text-white'
                      }`}>
                        <span className="font-bold text-xs uppercase tracking-wider text-[#121214] dark:text-stone-300">
                          Занятия на выбранный день отсутствуют
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="week-view"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 pb-32"
                  >
                    {getDaysOfWeek(currentWeekStart).map((day) => {
                      const isTodayDay = isDateToday(day);
                      const weekdayStr = day.toLocaleDateString('ru-RU', { weekday: 'short' });
                      const capitalizedWeekday = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
                      const formattedDate = day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
                      
                      const dayClasses = classes.filter(cls => {
                        const d = new Date(cls.start_time);
                        return d.getDate() === day.getDate() &&
                               d.getMonth() === day.getMonth() &&
                               d.getFullYear() === day.getFullYear();
                      }).filter(isClassMatchingFilter);

                      return (
                        <div key={day.toISOString()} className="space-y-3">
                          <div className="flex items-center gap-2 mt-4 mb-2 pl-1">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                              {capitalizedWeekday}, {formattedDate}
                            </span>
                            {isTodayDay && (
                              <span 
                                style={{
                                  backgroundColor: `${accentColor || '#CCFF00'}1F`,
                                  color: accentColor || '#CCFF00',
                                }}
                                className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              >
                                Сегодня
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {dayClasses.length > 0 ? (
                              dayClasses.map((cls) => renderClassCard(cls))
                            ) : (
                              <div className={`rounded-[28px] py-5 px-6 text-center flex items-center justify-center transition-colors ${
                                theme === 'light'
                                  ? 'bg-white text-zinc-600'
                                  : 'bg-[#1A1A1C] text-stone-400'
                              }`}>
                                <span className="font-bold text-xs uppercase tracking-wider">Занятий нет</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date Picker Dialog */}
              <AnimatePresence>
                {isDatePickerOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsDatePickerOpen(false)}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
                    />

                    {/* Popover Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                      animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                      exit={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      onClick={(e) => e.stopPropagation()}
                      className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm bg-[#161618] rounded-[24px] p-6 shadow-2xl shadow-black/80 z-[101] select-none text-white flex flex-col"
                    >
                      {/* Calendar Header */}
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {pickerCurrentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\./, '').toLowerCase()}
                        </h3>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPickerCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setPickerCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
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
                        {(() => {
                          const year = pickerCurrentDate.getFullYear();
                          const month = pickerCurrentDate.getMonth();
                          
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

                          return cells.map((cell, idx) => {
                            const isSel = isSameDay(cell.date, selectedDate);
                            const isTod = isDateToday(cell.date);
                            
                            return (
                              <div key={idx} className="h-10 flex items-center justify-center">
                                <button
                                  onClick={() => handleSelectDatePickerDate(cell.date)}
                                  className={`text-xs transition-all cursor-pointer ${
                                    isSel
? 'w-9 h-9 flex items-center justify-center !rounded-full bg-[#CCFF00] text-black font-bold font-mono text-sm shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                                      : isTod
? 'w-9 h-9 flex items-center justify-center border border-[#CCFF00]/40 text-white font-bold rounded-full bg-[#CCFF00]/5'
                                        : cell.isCurrentMonth
                                          ? 'w-9 h-9 flex items-center justify-center text-white hover:bg-zinc-900 rounded-full'
                                          : 'w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-zinc-900/50 rounded-full'
                                  }`}
                                >
                                  {cell.date.getDate()}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Today button */}
                      <button
                        onClick={handleResetToToday}
                        className="w-full py-3 bg-[#1A1A1C] hover:bg-zinc-800 rounded-full text-[#CCFF00] font-bold text-center mt-4 transition-colors border border-white/10 cursor-pointer"
                      >
                        Сегодня
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB: История (History / List of all classes) */}
          {view === 'history' && (
            <ScheduleHistoryTab historyBookings={historyBookings} />
          )}

        </AnimatePresence>
      </div>

      {/* Floating Plus button on "Занятия" to create a new class */}
      {view === 'classes' && (
        <FloatingActionButton
          onClick={() => setLocation('/add-class')}
          ariaLabel="Создать урок"
          id="floating-create-class-btn"
        />
      )}

      {/* CLASS OPTIONS BOTTOM SHEET (SHORKA) */}
      <AnimatePresence>
        {isClassSheetOpen && selectedClassForSheet && (
          <>
            {/* Backdrop */}
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

            {/* Sheet body */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-[#161618] border-t border-white/10 rounded-t-[28px] max-h-[85dvh] flex flex-col z-50 shadow-2xl overflow-hidden"
            >
              {/* Drag Handle indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mt-3 mb-2 shrink-0" />

              {/* Sheet Header */}
              <div className="px-6 pb-3 pt-1 border-b border-zinc-800/40 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-base font-medium text-white">{selectedClassForSheet.title}</h3>
                  <p className="text-xs font-bold text-[#CCFF00] tracking-wide uppercase mt-0.5">
                    Управление уроком • Зал {selectedClassForSheet.id % 2 === 0 ? "2" : "1"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc-900/80 hover:bg-zinc-800/60 text-stone-400 hover:text-[#CCFF00] w-9 h-9 border border-zinc-800/40 transition-colors"
                  onClick={() => {
                    setIsClassSheetOpen(false);
                    setIsCancelConfirmOpen(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Sheet Content container */}
              <div className="px-6 py-6 overflow-y-auto scrollbar-none pb-28 space-y-6 flex-1">
                
                {/* 1. Edit Choreographer option */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Изменить хореографа</label>
                  <div className="relative">
                    <select
                      value={selectedClassForSheet.teacher_name}
                      onChange={async (e) => {
                        const newTeacher = e.target.value;
                        await handleUpdateTeacher(selectedClassForSheet.id, newTeacher);
                      }}
                      className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-medium text-white appearance-none focus:outline-none focus:border-[#CCFF00] transition-colors cursor-pointer"
                    >
                      {TEACHERS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 my-2"></div>

                {/* 2. Cancel Class option */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Опасная зона</label>
                  
                  {!isCancelConfirmOpen ? (
                    <Button
                      type="button"
                      disabled={selectedClassForSheet.status === 'cancelled'}
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="w-full bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/20 text-red-400 font-bold h-12 rounded-2xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
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

                {/* 3. Class Reviews List */}
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
                                  <span className="text-xs font-bold text-[#CCFF00] font-mono tracking-wide">★ {rev.rating.toFixed(1)}</span>
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

                {/* Info block */}
                <div className="bg-[#1C1C1E]/40 border border-zinc-800/40 rounded-2xl p-4 text-center leading-relaxed">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Любые изменения отобразятся у учеников в реальном времени ✨
                  </p>
                </div>

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