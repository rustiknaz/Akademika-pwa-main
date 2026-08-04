import React, { useState, useEffect } from 'react';
import { Calendar, Clock, LogOut, ShieldCheck, ChevronDown, RefreshCw, CalendarDays, Sparkles, Check, MapPin } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import BottomNav from '@/components/BottomNav';
import Banner from '@/components/Banner';
import { ru } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const getLevel = (title: string) => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('pro') || lowercaseTitle.includes('advanced') || lowercaseTitle.includes('m-classes')) {
    return 'Pro';
  }
  if (lowercaseTitle.includes('int') || lowercaseTitle.includes('intermediate')) {
    return 'Intermediate';
  }
  return 'Beginners';
};

const ClassCard = ({ 
  time, 
  title, 
  teacher, 
  spots, 
  duration, 
  image_url,
  onBook, 
  onCancel,
  isBooked, 
  isBooking,
  isPast,
  is_recurring
}: { 
  time: string, 
  title: string, 
  teacher: string, 
  spots: string, 
  duration: string,
  image_url?: string,
  onBook: () => void,
  onCancel: () => void,
  isBooked: boolean,
  isBooking: boolean,
  isPast?: boolean,
  is_recurring?: boolean
}) => {
  const level = getLevel(title);
  const spotsNum = parseInt(spots) || 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPast) return;
    if (isBooked) {
      onCancel();
    } else {
      if (spotsNum > 0) onBook();
    }
  };

  return (
    <motion.div
      whileTap={isPast ? {} : { scale: 0.98 }}
      onClick={handleClick}
      className="bg-[#CDD2D7] rounded-outer p-5 text-black shadow-lg relative overflow-hidden flex flex-col justify-between mb-4 cursor-pointer select-none transition-all border border-black/10"
    >
      {/* Top Header Row: Time & Duration & Badges */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/60">
          <Clock size={14} className="text-black/70" />
          <span>{time}</span>
          <span>•</span>
          <span>{duration} МИН</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {is_recurring && (
            <span className="bg-black/10 border border-black/15 text-black text-xs font-bold px-2.5 py-0.5 rounded-chip uppercase tracking-wider">
              M-Class
            </span>
          )}
          <span className="bg-black/10 border border-black/15 text-black text-xs font-bold px-2.5 py-0.5 rounded-chip uppercase tracking-wider">
            {level}
          </span>
        </div>
      </div>

      {/* Middle Content Section */}
      <div className="my-3">
        <h3 className="text-lg font-medium text-black leading-tight mt-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-zinc-800 mt-1">
          Хореограф: <span className="font-medium text-black">{teacher}</span>
        </p>
      </div>

      {/* Bottom Row: Spots Warning / Status & Booking Button */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-black/10 mt-1">
        <div>
          {isPast ? (
            <span className="text-xs font-medium text-black/50">Занятие завершено</span>
          ) : spotsNum <= 0 ? (
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Мест нет</span>
          ) : spotsNum <= 4 ? (
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
              Осталось {spotsNum} {spotsNum === 1 ? 'место' : spotsNum < 5 ? 'места' : 'мест'}
            </span>
          ) : (
            <span className="text-xs font-medium text-black/70">Есть места ({spotsNum})</span>
          )}
        </div>

        <div>
          {isPast ? (
            <button 
              disabled 
              className="bg-black/10 text-black/40 border border-black/10 text-xs font-bold uppercase tracking-wider rounded-control px-5 py-2.5 cursor-not-allowed"
            >
              Прошло
            </button>
          ) : isBooked ? (
            <button
              onClick={handleClick}
              className="bg-black/10 border border-black/20 text-black font-bold text-xs uppercase tracking-wider rounded-control px-5 py-2.5 flex items-center gap-1.5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Check size={14} className="stroke-[3]" />
              <span>В списке</span>
            </button>
          ) : (
            <button
              onClick={handleClick}
              disabled={spotsNum <= 0}
              className={`rounded-control px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md${
                spotsNum <= 0
                  ? "bg-black/10 text-black/40 border border-black/10 cursor-not-allowed shadow-none"
                  : "bg-black text-white hover:bg-zinc-800"
              }`}
            >
              {isBooking ? "..." : "Записаться"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Schedule() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const activeTextClass = accentConfig.textColor === 'text-black' ? 'text-black' : 'text-white';

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Set<number>>(new Set());
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'evening' | 'mclasses'>('all');

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
      } else {
        setUser(session.user);
        await Promise.all([
          fetchProfile(session.user.id),
          fetchClasses(),
          fetchBookings(session.user.id),
          fetchSubscription(session.user.id)
        ]);
        setLoading(false);
      }
    }
    checkUser();
  }, [setLocation]);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  async function fetchClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  }

  async function fetchBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('class_id')
        .eq('user_id', userId)
        .eq('status', 'booked');

      if (error) throw error;
      setBookings(new Set(data?.map(b => b.class_id) || []));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }

  async function fetchSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  }

  const handleBook = async (classId: number) => {
    if (!user) return;

    const cls = classes.find(c => c.id === classId);
    if (cls && new Date(cls.start_time) <= new Date()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Это занятие уже началось или прошло",
      });
      return;
    }

    if (!subscription || subscription.visits_left <= 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "У вас закончился абонемент!",
      });
      return;
    }

    setBookingId(classId);
    try {
      const { data: result, error: bookingError } = await supabase
        .rpc('book_class', { p_class_id: classId });

      if (bookingError) throw bookingError;

      if (result) {
        setSubscription((prev: any) => prev ? { ...prev, visits_left: result.visits_left } : prev);
        setClasses(prev => prev.map(c =>
          c.id === classId ? { ...c, max_students: result.spots_left } : c
        ));
      }

      toast({
        title: "Успешно!",
        description: "Вы успешно записаны на занятие",
      });
      
      try {
        const cls = classes.find(c => c.id === classId);
        await apiRequest('POST', '/api/notifications/telegram', {
          text: `⚡️ <b>Новая запись в Akademika!</b>\n👤 Ученик: ${profile?.full_name || displayPhone(user?.email)}\n🕺 Урок: ${cls?.title}\n📅 Время: ${new Date(cls?.start_time).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        });
      } catch (err) {
        console.error('Failed to send telegram notification:', err);
      }

      setBookings(prev => new Set([...Array.from(prev), classId]));
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка записи",
        description: err.message,
      });
    } finally {
      setBookingId(null);
    }
  };

  const handleCancelBooking = async (classId: number) => {
    if (!user) return;

    const cls = classes.find(c => c.id === classId);
    if (cls && new Date(cls.start_time) <= new Date()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Занятие уже началось — отменить запись нельзя",
      });
      return;
    }

    setBookingId(classId);
    try {
      const { data: result, error } = await supabase
        .rpc('cancel_booking', { p_class_id: classId });

      if (error) throw error;

      if (result) {
        if (result.visits_left !== null) {
          setSubscription((prev: any) => prev ? { ...prev, visits_left: result.visits_left } : prev);
        }
        if (result.spots_left !== null) {
          setClasses(prev => prev.map(c =>
            c.id === classId ? { ...c, max_students: result.spots_left } : c
          ));
        }
      }

      setBookings(prev => {
        const next = new Set(Array.from(prev));
        next.delete(classId);
        return next;
      });

      toast({
        title: "Запись отменена",
        description: "Вы отменили запись на занятие",
      });

      try {
        await apiRequest('POST', '/api/notifications/telegram', {
          text: `❌ <b>Отмена записи в Akademika!</b>\n👤 Ученик: ${profile?.full_name || displayPhone(user?.email)}\n🕺 Урок: ${cls?.title}\n📅 Время: ${new Date(cls?.start_time).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        });
      } catch (err) {
        console.error('Failed to send telegram notification:', err);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка отмены",
        description: err.message,
      });
    } finally {
      setBookingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/Login');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return timeString;
    }
  };

  const displayPhone = (email: string) => {
    return email?.replace('@dance.local', '') || '';
  };

  const now = new Date();
  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const isTodaySelected = isSameDay(selectedDate, now);
  const dayClasses = classes.filter(cls => {
    const st = new Date(cls.start_time);
    if (!isSameDay(st, selectedDate)) return false;
    if (isTodaySelected) {
      const endMs = st.getTime() + (cls.duration_min ?? 60) * 60000;
      return endMs > now.getTime();
    }
    return true;
  });

  const filteredClasses = dayClasses.filter(cls => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'my') {
      const isBooked = bookings.has(cls.id);
      if (isBooked) return true;
      const hasAnyBookings = bookings.size > 0;
      if (!hasAnyBookings) {
        const titleLower = cls.title.toLowerCase();
        return titleLower.includes('high heels') || titleLower.includes('choreo') || titleLower.includes('dance');
      }
      return false;
    }
    if (activeFilter === 'evening') {
      const hours = new Date(cls.start_time).getHours();
      return hours >= 18;
    }
    if (activeFilter === 'mclasses') {
      const titleLower = cls.title.toLowerCase();
      return titleLower.includes('pro') || titleLower.includes('master') || titleLower.includes('aesthetics') || !cls.is_recurring;
    }
    return true;
  });

  const endOfSelectedDay = new Date(selectedDate);
  endOfSelectedDay.setHours(23, 59, 59, 999);
  const nextClass = dayClasses.length === 0
    ? classes.find(cls => new Date(cls.start_time) > endOfSelectedDay)
    : undefined;

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const formatHeaderDate = (date: Date) => {
    const dayMonth = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(date, now)) return `Сегодня, ${dayMonth}`;
    if (isSameDay(date, tomorrow)) return `Завтра, ${dayMonth}`;
    const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
  };

  const formatNextClassDate = (timeString: string) => {
    const d = new Date(timeString);
    const weekday = d.toLocaleDateString('ru-RU', { weekday: 'long' });
    const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${date} в ${time}`;
  };

  // Generate dynamic Week Strip: 14 days, centered around selectedDate (starting 4 days before)
  const today = new Date();
  const diffTime = selectedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let centerDate = new Date(selectedDate);
  if (Math.abs(diffDays) <= 3) {
    centerDate = new Date(today);
  }

  const startDate = new Date(centerDate);
  startDate.setDate(centerDate.getDate() - 4);

  const daysStrip = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + idx);
    return d;
  });

  const getWeekdayAbbr = (d: Date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[d.getDay()];
  };

  const formatMonthOnly = (d: Date) => {
    const month = d.toLocaleDateString('ru-RU', { month: 'long' });
    return month.toUpperCase();
  };

  if (!user && loading) return null;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-main font-sans text-primary-custom pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] relative">
      <header className="px-6 pt-4 pb-4 flex-shrink-0 relative z-10">
        {/* Title and Top Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary-custom">Расписание</h1>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {profile?.role === 'admin' && (
              <Link href="/Admin">
                <button 
                  className="p-2.5 text-secondary-custom hover:text-accent-primary transition-colors rounded-full hover:bg-card-custom"
                  title="Админка"
                >
                  <ShieldCheck size={22} className="text-accent-primary" />
                </button>
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="p-2.5 text-secondary-custom hover:text-accent-primary transition-colors rounded-full hover:bg-card-custom"
              title="Выйти"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>

        {/* Backdrop Overlay when calendar is open */}
        {calendarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity cursor-pointer"
            onClick={() => setCalendarOpen(false)}
          />
        )}

        {/* Selected Month Header & Trigger to Open Calendar popover */}
        <div className="flex justify-between items-end mb-4 flex-shrink-0">
          <span className="text-3xl font-bold tracking-wider uppercase flex-shrink-0" style={{ color: accentColor }}>
            {formatMonthOnly(selectedDate)}
          </span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                style={{
                  backgroundColor: `${accentColor}1F`,
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                }}
                className="flex items-center gap-1.5 text-xs font-bold uppercase px-3.5 py-2 rounded-btn transition-all hover:brightness-110 active:scale-95 border cursor-pointer"
                data-testid="button-select-date"
              >
                {formatHeaderDate(selectedDate)}
                <ChevronDown size={12} style={{ color: accentColor }} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-auto p-5 rounded-outer overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] !bg-zinc-950/45 backdrop-blur-3xl text-white z-50"
              style={{ 
                backgroundColor: 'rgba(9, 9, 11, 0.45)', 
                backdropFilter: 'blur(32px)', 
                WebkitBackdropFilter: 'blur(32px)' 
              }}
            >
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                locale={ru}
                initialFocus
                className="bg-transparent text-white p-0"
                classNames={{
caption_label: "text-sm font-bold text-white uppercase tracking-wider",
                  nav_button: "h-8 w-8 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 flex items-center justify-center p-0 opacity-100",
head_cell: "text-zinc-400 font-bold text-xs uppercase w-9 rounded-md",
                  cell: "h-9 w-9 text-center text-sm p-0 relative bg-transparent",
day: "h-9 w-9 p-0 font-medium text-white rounded-chip hover:bg-white/10 hover:text-white flex items-center justify-center aria-selected:opacity-100",
day_selected: "font-normal rounded-chip shadow-md",
day_today: "border border-white/40 text-white font-medium bg-transparent rounded-chip",
                  day_outside: "text-white/20 opacity-30",
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: accentColor,
                    color: activeTextColor,
                  },
                  today: {
                    borderColor: accentColor,
                  }
                }}
              />
              <div className="border-t border-white/10 pt-3 mt-3">
                <button
                  onClick={() => handleSelectDate(new Date())}
                  style={{ backgroundColor: accentColor, color: activeTextColor }}
                  className="w-full py-2.5 rounded-control text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:brightness-105"
                  data-testid="button-today"
                >
                  Сегодня
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Horizontal Week Calendar Strip */}
        <div 
          className="flex overflow-x-auto scrollbar-none gap-2.5 py-3 px-6 -mx-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center"
        >
          {daysStrip.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => setSelectedDate(day)}
                data-selected={isSelected}
                style={isSelected ? {
                  backgroundColor: accentColor,
                  color: activeTextColor,
                  borderColor: `${accentColor}88`,
                } : {}}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all duration-200 cursor-pointer snap-center shrink-0 flex-shrink-0 ${
                  isSelected
? "scale-105 font-normal border"
: "bg-[#CDD2D7] border border-black/10 text-black font-medium"
                }`}
              >
                <span className={`text-xs uppercase tracking-wider font-bold leading-none${
                  isSelected ? (activeTextColor === '#000000' ? "text-black/80" : "text-white/80") : "text-black/70"
                }`}>
                  {getWeekdayAbbr(day)}
                </span>
                <span className={`text-xs font-medium mt-0.5 leading-none${
                  isSelected ? activeTextClass : "text-black"
                }`}>
                  {day.getDate()}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* УМНЫЕ ФИЛЬТРЫ (Чипсы) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none">
          {[
            { id: 'all', label: 'Все' },
            { id: 'my', label: 'Мои направления' },
            { id: 'evening', label: 'Вечер' },
            { id: 'mclasses', label: 'M-Classes' }
          ].map((tag) => {
            const isActive = activeFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id as any)}
                style={isActive ? {
                  backgroundColor: accentColor,
                  color: activeTextColor,
                } : {}}
                className={`shrink-0 px-4 py-2 text-xs uppercase tracking-wider rounded-chip transition-all duration-200 cursor-pointer ${
                  isActive
? "font-normal shadow-md"
: "bg-[#CDD2D7] border border-black/10 text-black font-medium hover:bg-[#CDD2D7]/90"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main timeline listing */}
      <main className="flex-grow overflow-y-auto px-6 pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-1">
          {loading ? (
            <div className="text-center py-10 text-zinc-400 font-medium">Загрузка расписания...</div>
          ) : filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                time={formatTime(cls.start_time)}
                duration={(cls.duration_min ?? 60).toString()}
                title={cls.title}
                teacher={cls.teacher_name || "Студия"}
                spots={(cls.max_students ?? 0).toString()}
                image_url={cls.image_url}
                onBook={() => handleBook(cls.id)}
                onCancel={() => handleCancelBooking(cls.id)}
                isBooked={bookings.has(cls.id)}
                isBooking={bookingId === cls.id}
                isPast={new Date(cls.start_time) <= now}
                is_recurring={cls.is_recurring}
              />
            ))
          ) : (
            <div className="space-y-4">
              <div
                className="bg-[#CDD2D7] border border-black/10 rounded-outer p-8 text-center flex flex-col items-center justify-center my-6 shadow-lg"
                data-testid="text-no-classes-today"
              >
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-3 text-black">
                  <CalendarDays size={24} />
                </div>
                <h3 className="text-lg font-medium text-black">
                  {isTodaySelected 
                    ? activeFilter !== 'all' 
                      ? 'Нет занятий с выбранным фильтром на сегодня' 
                      : 'На сегодня занятий нет'
                    : activeFilter !== 'all'
                      ? 'Нет занятий с выбранным фильтром на этот день'
                      : 'На этот день занятий нет'
                  }
                </h3>
                <p className="text-xs font-medium text-zinc-700 mt-1">
                  Отдохните или выберите другую дату в календаре
                </p>
              </div>

              {nextClass && activeFilter === 'all' && (
                <div data-testid="block-next-class" className="mt-4 pt-1">
                  <div className="flex items-center gap-2 mb-3 px-1 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar size={16} className="text-[#CCFF00]" />
                    <span data-testid="text-next-class-date">
                      Ближайшее занятие: <span className="text-white font-medium">{formatNextClassDate(nextClass.start_time)}</span>
                    </span>
                  </div>
                  <ClassCard
                    key={nextClass.id}
                    time={formatTime(nextClass.start_time)}
                    duration={(nextClass.duration_min ?? 60).toString()}
                    title={nextClass.title}
                    teacher={nextClass.teacher_name || "Студия"}
                    spots={(nextClass.max_students ?? 0).toString()}
                    image_url={nextClass.image_url}
                    onBook={() => handleBook(nextClass.id)}
                    onCancel={() => handleCancelBooking(nextClass.id)}
                    isBooked={bookings.has(nextClass.id)}
                    isBooking={bookingId === nextClass.id}
                    isPast={new Date(nextClass.start_time) <= now}
                    is_recurring={nextClass.is_recurring}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
