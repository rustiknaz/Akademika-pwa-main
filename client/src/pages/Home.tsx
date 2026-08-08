import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Sparkles, MessageCircle, Heart, Trophy, Music, Bell, MapPin, Globe, ChevronLeft, Star, X, Check, ArrowUpRight, ChevronDown, AlertTriangle, User } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import BottomNav from '@/components/BottomNav';
import NewsBanner from '@/components/NewsBanner';
import Banner from '@/components/Banner';
// HeroCarousel removed; replaced by unified top carousel
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { getReviews, saveReviews } from '../lib/reviews';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { accentColor, accentConfig, bgImage } = useTheme();
  const activeBtnTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextBooking, setNextBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isNextLessonOpen, setIsNextLessonOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [expiringSubsCount, setExpiringSubsCount] = useState<number>(3);
  const [debtorsCount, setDebtorsCount] = useState<number>(1);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState<boolean>(false);
  
  // Feedback System states
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: "Запись подтверждена. Ждем вас сегодня на High Heels в 19:30. Зал 1.", 
      time: "15 мин назад", 
      isNew: true,
      detailed: "Преподаватель направления High Heels перенес сегодняшнее занятие в Зал 2 из-за съемок спецкурса. Приносим извинения за неудобства, форма одежды прежняя!"
    },
    { 
      id: 2, 
      text: "Твой Ритм горит! Ты тренируешься 5 недель подряд, так держать!", 
      time: "2 часа назад", 
      emoji: "🔥", 
      isNew: false,
      detailed: "Поздравляем! Твой Ритм горит — ты тренируешься уже 5 недель подряд без пропусков. Мы начислили тебе 100 бонусных XP. Продолжай в том же духе и забирай новые награды в профиле!"
    }
  ]);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
      } else {
        setUser(session.user);
        await Promise.all([
          fetchProfile(session.user.id),
          fetchNextBooking(session.user.id),
          fetchSubscription(session.user.id)
        ]);
        setLoading(false);
      }
    }
    checkUser();
  }, [setLocation]);

  useEffect(() => {
    if (!loading && user) {
      const hasRatedSession = sessionStorage.getItem('has_rated_session');
      if (!hasRatedSession) {
        const timer = setTimeout(() => {
          setShowFeedbackPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user]);

  // Autoscroll carousel between two slides every 4s (pauses on interaction)
  useEffect(() => {
    if (isCarouselPaused) return;
    const id = setInterval(() => {
      setActiveSlide(prev => {
        const next = (prev + 1) % 2;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ left: carouselRef.current.clientWidth * next, behavior: 'smooth' });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [isCarouselPaused]);

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: carouselRef.current.clientWidth * index, behavior: 'smooth' });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const targetTime = nextBooking 
      ? new Date(nextBooking.start_time).getTime()
      : new Date().getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000; // 2 hours 15 mins fallback

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft("Занятие началось");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`До старта: ${hours} ч ${minutes} мин`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [nextBooking]);

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

  async function fetchNextBooking(userId: string) {
    try {
      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select('class_id')
        .eq('user_id', userId)
        .eq('status', 'booked');

      if (bError) throw bError;
      if (!bookingsData || bookingsData.length === 0) return;

      const classIds = bookingsData.map((b: any) => b.class_id);

      const { data: classesData, error: cError } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1);

      if (cError) throw cError;

      if (classesData && classesData.length > 0) {
        setNextBooking(classesData[0]);
      }
    } catch (err) {
      console.error('Error fetching next booking:', err);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/Login');
  };

  const displayPhone = (email: string) => {
    return email?.replace('@dance.local', '') || '';
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return { first: "Доброе", second: "утро," };
    if (hr >= 12 && hr < 18) return { first: "Добрый", second: "день," };
    if (hr >= 18 && hr < 23) return { first: "Добрый", second: "вечер," };
    return { first: "Доброй", second: "ночи," };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-secondary-custom font-medium">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-primary-custom pb-32 relative overflow-hidden bg-transparent" style={{ backgroundColor: 'transparent' }}>
      <header className="px-6 pt-12 pb-2">
        <div className="flex items-center justify-between mb-8 pt-3 px-1 gap-4 relative">
          {/* Левая часть: Блок динамического приветствия по времени суток (Трёхстрочная типографика) */}
          <div className="flex flex-col gap-0.5 min-w-0 pb-1">
            <span className="text-4xl sm:text-5xl font-light text-secondary-custom opacity-85 leading-tight">
              {getGreeting().first}
            </span>
            <span className="text-4xl sm:text-5xl font-light text-secondary-custom opacity-85 leading-tight">
              {getGreeting().second}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-custom mt-0.5 leading-tight pb-1 overflow-visible" data-testid="text-greeting-name">
              {profile?.full_name?.trim() || displayPhone(user?.email)}
            </h1>
          </div>

          {/* Правая часть: Чистая кликабельная аватарка со встроенным бейджем колокольчика */}
          <div className="relative flex-shrink-0 mr-6 sm:mr-8">
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setSelectedNotification(null);
              }}
              className="relative cursor-pointer select-none group"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Аватар"
                  className="w-20 h-20 rounded-full object-cover border-2 border-custom shadow-md group-hover:border-accent-primary transition-colors"
                  data-testid="img-header-avatar"
                />
              ) : (
                <div className="w-20 h-20 bg-card-custom rounded-full flex items-center justify-center text-accent-primary font-semibold text-2xl border-2 border-custom shadow-md group-hover:border-accent-primary transition-colors">
                  {profile?.full_name?.[0] || displayPhone(user?.email)?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Интегрированная кнопка-колокольчик */}
              <div className="absolute -bottom-1 -right-1 bg-card-custom border border-custom rounded-full p-1.5 text-accent-primary flex items-center justify-center shadow-md">
                <Bell size={14} className={notifications.some(n => n.isNew) ? "fill-accent-primary animate-pulse text-accent-primary" : "text-accent-primary"} />
                {notifications.some(n => n.isNew) && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />
                )}
                {notifications.some(n => n.isNew) && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent-primary rounded-full" />
                )}
              </div>
            </motion.div>
          </div>

          {/* Notifications Dropdown Overlay */}
          {isNotificationsOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity cursor-pointer" 
                onClick={() => {
                  setIsNotificationsOpen(false);
                  setSelectedNotification(null);
                }} 
              />
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="w-full bg-zinc-950/45 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[32px] p-5 text-white z-50 absolute top-full left-0 right-0 my-2 flex flex-col gap-3"
              >
              <AnimatePresence mode="wait">
                {selectedNotification === null ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">УВЕДОМЛЕНИЯ</span>
                      {notifications.length > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications([]);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          ОЧИСТИТЬ
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <motion.div 
                            key={n.id} 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const updated = notifications.map(item => item.id === n.id ? { ...item, isNew: false } : item);
                              setNotifications(updated);
                              setSelectedNotification(n);
                            }}
                            className={`flex justify-between items-start gap-3 pb-2.5 cursor-pointer ${i < notifications.length - 1 ? 'border-b border-white/10' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#F5F5F0] leading-snug">
                                {n.text}
                              </p>
                              <span className="text-xs font-medium text-zinc-400 mt-1 block">{n.time}</span>
                            </div>
                            {n.isNew ? (
                              <span className="bg-[#CCFF00] w-2 h-2 rounded-full shrink-0 mt-1.5" />
                            ) : n.emoji ? (
                              <span className="text-xs shrink-0 mt-1">{n.emoji}</span>
                            ) : null}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-zinc-400 text-xs font-medium">
                          Нет новых уведомлений
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className="text-zinc-400 hover:text-white transition-colors p-1 -ml-1 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"
                        title="Назад"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">СООБЩЕНИЕ</span>
                    </div>

                    <div className="space-y-2 mt-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-[#F5F5F0] leading-snug">
                          {selectedNotification.text.split('.')[0] + '.'}
                        </h4>
                        {selectedNotification.emoji && (
                          <span className="text-sm shrink-0">{selectedNotification.emoji}</span>
                        )}
                      </div>
                      
                      <span className="text-xs font-medium text-zinc-400 block">{selectedNotification.time}</span>
                      
                      <p className="text-sm font-medium text-zinc-200 leading-relaxed bg-white/5 border border-white/10 p-3.5 rounded-[20px] mt-2">
                        {selectedNotification.detailed || selectedNotification.text}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-2.5 border-t border-white/10">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          setSelectedNotification(null);
                        }}
                        style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                        className="hover:brightness-105 active:scale-95 font-bold text-xs px-4 py-2.5 rounded-[16px] transition-all shadow-md uppercase tracking-wider cursor-pointer border-none"
                      >
                        Прочитано
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
        
        {/* Главный Единый Верхний Слайдер: объединённый Financial + Operations carousel */}
        <div className="w-full">
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onTouchStart={() => setIsCarouselPaused(true)}
            onTouchEnd={() => setIsCarouselPaused(false)}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 p-4 -mx-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {/* Slide 1: Financial Summary */}
            <div className="min-w-full snap-center flex-shrink-0">
              <div
                className="p-4 rounded-[28px] bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/10 shadow-lg h-40 flex flex-col justify-between"
                onClick={() => setSelectedCard({ id: 'financial', title: 'Финансовая сводка' })}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/75">ФИНАНСОВАЯ СВОДКА</span>
                  <h3 className="text-lg font-semibold text-white mt-1">Доходы за месяц</h3>
                  <p className="text-sm text-white/70 mt-1">Баланс: <span className="font-bold text-white">₽{subscription?.visits_left ? (subscription.visits_left * 500).toString() : '0'}</span></p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Операции: <span className="font-medium text-white">12</span></div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowUpRight size={16} className="text-white/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2: Operational Tasks (real block from Admin.tsx) */}
            <div className="min-w-full snap-center flex-shrink-0">
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

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[0,1].map(i => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`${activeSlide === i ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/40'} rounded-full transition-all`}
                aria-label={`Перейти к слайду ${i+1}`}
              />
            ))}
          </div>
        </div>
      </header>
 
      <motion.main 
        layout 
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="px-6 space-y-6"
      >
        {/* ДВУХКОЛОНОЧНЫЙ БЛОК БАННЕРОВ */}
        <div className="grid grid-cols-2 gap-3 w-full my-3">
          {/* СРОЧНОЕ УВЕДОМЛЕНИЕ (ЛЕВАЯ КОЛОНКА) */}
          <motion.div
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCard({
              id: 'alert',
              color: 'orange',
              badge: 'СРОЧНОЕ УВЕДОМЛЕНИЕ',
              title: 'Лимит абонемента',
              subtitle: `Осталось ${subscription?.visits_left ?? 1} занятие`,
              desc: 'Внимание! Лимит абонемента почти исчерпан. Зарезервируй место на следующие занятия без пауз.',
              actionText: 'Продлить абонемент',
              details: [
                { label: 'Абонемент', value: subscription?.title || 'Индивидуальный Pro' },
                { label: 'Остаток лимита', value: `${subscription?.visits_left ?? 1} занятие` },
                { label: 'Срок действия', value: subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('ru-RU') : 'До конца месяца' }
              ]
            })}
            className="bg-[#FF4500] text-white p-4 rounded-[32px] flex flex-col justify-between shadow-lg overflow-hidden h-36 cursor-pointer select-none transition-all"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80">
                <Sparkles size={12} className="text-white shrink-0" />
                <span>Срочно</span>
              </div>
              <h3 className="text-sm font-medium text-white leading-tight line-clamp-2 mt-1">
                Лимит абонемента
              </h3>
              <p className="text-xs font-bold text-white/90 mt-0.5 tracking-wide">
                Осталось {subscription?.visits_left ?? 1} зан.
              </p>
            </div>
            <div className="self-end w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform shrink-0">
              <ArrowUpRight size={16} />
            </div>
          </motion.div>

          {/* ЗАГЛУШКА ПОД БУДУЩИЙ БАННЕР (ПРАВАЯ КОЛОНКА) */}
          <div className="h-36 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/10 text-white p-4 rounded-[32px] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/75">
                <Sparkles size={12} className="text-white/75 shrink-0" />
                <span>Анонс</span>
              </div>
              <h3 className="text-sm font-medium text-white leading-tight line-clamp-2 mt-1">
                Скоро новые классы
              </h3>
              <p className="text-xs font-medium text-white/70 mt-0.5">
                Следи за событиями
              </p>
            </div>
            <div className="self-end w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>

        {/* ВИДЖЕТ "СЛЕДУЮЩЕЕ ЗАНЯТИЕ" (ЛАЙМОВЫЙ БЛОК - COLOR BLOCKING) */}
        <Banner
          onClick={() => setSelectedCard({
            id: 'booking',
            color: 'lime',
            badge: 'СЛЕДУЮЩЕЕ ЗАНЯТИЕ',
            title: nextBooking?.title || "High Heels Pro",
            subtitle: nextBooking?.teacher_name || "Яна Смирнова",
            desc: 'Ждем тебя на тренировке! Возьми с собой удобную форму и чистую сменную обувь.',
            actionText: 'Маршрут до зала',
            details: [
              { label: 'Дата и время', value: nextBooking ? `${new Date(nextBooking.start_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} в ${new Date(nextBooking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : 'Сегодня в 19:30' },
              { label: 'Хореограф', value: nextBooking?.teacher_name || 'Яна Смирнова' },
              { label: 'Зал', value: 'Зал 2, Тверская 12' }
            ]
          })}
          className="w-full h-[160px] bg-accent-primary text-accent-text rounded-[32px] p-4.5 flex flex-col justify-between shrink-0 group relative overflow-hidden select-none"
        >
          {/* Upper row: Kicker Header + Badge & Indicator */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-accent-text/75 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} className="text-accent-text" />
              СЛЕДУЮЩЕЕ ЗАНЯТИЕ
            </span>
            <div className="flex items-center gap-2">
              <span className="text-accent-primary font-bold text-xs bg-accent-text px-2 py-0.5 rounded-full tracking-wide">
                {timeLeft || "До старта: 2 ч 15 мин"}
              </span>
              <ArrowUpRight size={14} className="text-accent-text/60 group-hover:text-accent-text transition-colors" />
            </div>
          </div>

          {/* Middle row: Style + Choreographer */}
          <div className="my-auto flex items-center justify-between min-w-0">
            <div className="min-w-0 text-left">
              <h3 className="text-accent-text font-medium text-base leading-tight group-hover:underline transition-all truncate">
                {nextBooking?.title || "High Heels Pro"}
              </h3>
              <p className="text-accent-text/75 text-xs font-bold truncate mt-0.5 tracking-wide">
                {nextBooking?.teacher_name || "Яна Смирнова"} • {nextBooking ? `${new Date(nextBooking.start_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} в ${new Date(nextBooking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : "Сегодня в 19:30"}
              </p>
            </div>
          </div>

          {/* Lower row: details & link */}
          <div className="border-t border-white/20 pt-2 flex justify-between items-center text-xs font-medium">
            <span className="text-accent-text/60 flex items-center gap-1">
              <MapPin size={11} className="text-accent-text/60" />
              Зал 2 • Тверская 12
            </span>
            <span className="text-accent-text/75 group-hover:text-accent-text transition-colors flex items-center gap-0.5">
              Подробнее <ArrowUpRight size={10} />
            </span>
          </div>
        </Banner>

        {/* ВИДЖЕТ "ОЦЕНКА ПРОШЕДШЕГО УРОКА" */}
        <Banner
          onClick={() => {
            setIsSubmitted(false);
            setRating(0);
            setComment("");
            setShowFeedbackPrompt(true);
          }}
          className="w-full h-[160px] bg-white/10 dark:bg-black/20 rounded-[32px] p-4 flex flex-col justify-between shrink-0 group relative text-left select-none overflow-hidden border border-white/10 text-white"
        >
          {/* Верхняя строка: Kicker Header + Status */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white/75 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-white/75" />
              ОЦЕНКА ПРОШЕДШЕГО УРОКА
            </span>
            <span className="text-xs font-bold text-white/75 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
              Завершено 15 мин назад
            </span>
          </div>

          {/* Средняя строка: Направление */}
          <div className="my-auto min-w-0">
            <h3 className="text-base font-medium text-white leading-tight truncate">High Heels Pro с Кристиной</h3>
            <p className="text-xs text-white/70 font-medium line-clamp-1 mt-0.5">
              Как тебе сегодняшняя тренировка? Твое мнение важно для нас!
            </p>
          </div>

          {/* Нижнее действие: Неоновая кнопка */}
          <div
            style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
            className="w-full h-10 hover:brightness-105 text-xs uppercase font-bold tracking-wider rounded-[16px] transition-all text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Star size={12} className="fill-current" />
            <span>Оценить тренировку</span>
          </div>
        </Banner>
        {/* Блок быстрых действий (Quick Actions) */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="grid grid-cols-4 gap-3 w-full shrink-0 mt-6 mb-0"
        >
          {/* 1. Чат */}
          <motion.a
            href="https://t.me/academika_dance"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center shadow-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all">
              <MessageCircle className="w-5 h-5 text-white/80 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 mt-1.5 text-center">Чат</span>
          </motion.a>

          {/* 2. Маршрут */}
          <motion.a
            href="https://yandex.ru/maps"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center shadow-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all">
              <MapPin className="w-5 h-5 text-white/80 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 mt-1.5 text-center">Маршрут</span>
          </motion.a>

          {/* 3. Музыка */}
          <motion.a
            href="https://music.yandex.ru"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center shadow-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all">
              <Music className="w-5 h-5 text-white/80 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 mt-1.5 text-center">Музыка</span>
          </motion.a>

          {/* 4. Сайт */}
          <motion.a
            href="https://academika-dance.ru"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center shadow-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all">
              <Globe className="w-5 h-5 text-white/80 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 mt-1.5 text-center">Сайт</span>
          </motion.a>
        </motion.div>
      </motion.main>

      {/* FEEDBACK MODAL (Framer Motion) */}
      <AnimatePresence>
        {showFeedbackPrompt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedbackPrompt(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 transition-opacity cursor-pointer"
            />

            {/* Wrapper Container for exact centering above BottomNav */}
            <div className="fixed inset-0 z-40 flex items-end justify-center pb-[calc(max(1.5rem,env(safe-area-inset-bottom))+64px+1.5rem)] px-4 pointer-events-none">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="pointer-events-auto w-full max-w-[340px] mx-auto bg-zinc-950/45 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-[32px] p-6 flex flex-col overflow-hidden text-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5 pr-2 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] block">
                      Обратная связь
                    </span>
                    <h3 className="text-2xl font-semibold text-[#F5F5F0] leading-tight">
                      Оценка урока
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFeedbackPrompt(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors shrink-0 flex items-center justify-center cursor-pointer -mt-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-base text-zinc-100 font-medium leading-normal mb-3">
                  High Heels Pro с Кристиной
                </p>

                {/* Form Content / Success state */}
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3"
                    >
                      {/* Stars */}
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 1.3 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none p-1 cursor-pointer"
                          >
                            <Star
                              size={34}
                              className="transition-colors duration-200"
                              fill={(hoverRating || rating) >= star ? "#CCFF00" : "transparent"}
                              color={(hoverRating || rating) >= star ? "#CCFF00" : "rgba(255, 255, 255, 0.3)"}
                            />
                          </motion.button>
                        ))}
                      </div>

                      {/* Comment input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                          Комментарий
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Что понравилось больше всего?"
                          className="bg-white/10 border border-white/15 text-white placeholder:text-zinc-400 rounded-[16px] p-3 focus:border-[#CCFF00] focus:outline-none w-full h-18 resize-none text-sm transition-colors"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        disabled={rating === 0}
                        onClick={() => {
                          // Save review to localStorage
                          const reviews = getReviews();
                          const newRev = {
                            id: `rev-${Date.now()}`,
                            studentId: user?.id || 'mock-admin-id-12345',
                            studentName: profile?.full_name || displayPhone(user?.email) || 'Рустам',
                            studentPhone: profile?.phone || '89112223344',
                            classId: 3, // High Heels Style or high heels
                            className: "High Heels Pro",
                            teacherName: "Кристина",
                            rating: rating,
                            comment: comment.trim(),
                            date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          };
                          reviews.unshift(newRev);
                          saveReviews(reviews);

                          // Store in sessionStorage to not auto-trigger again this session
                          sessionStorage.setItem('has_rated_session', 'true');

                          setIsSubmitted(true);
                          setTimeout(() => {
                            setShowFeedbackPrompt(false);
                          }, 1800);
                        }}
                        style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                        className="w-full h-14 font-medium text-base rounded-[16px] flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform shadow-md disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer mt-1 border-none"
                      >
                        Отправить отзыв
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-4 gap-3 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 bg-[#CCFF00]/15 border-2 border-[#CCFF00] rounded-full flex items-center justify-center text-[#CCFF00]"
                      >
                        <Check size={32} className="stroke-[3px]" />
                      </motion.div>
                      <h4 className="text-xl font-semibold text-[#F5F5F0]">Спасибо за отзыв!</h4>
                      <p className="text-sm text-zinc-200 max-w-[260px]">Твое мнение помогает нам делать занятия AkademikA еще лучше. 🔥</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* NEXT LESSON BOTTOM SHEET DRAWER */}
      <AnimatePresence>
        {isNextLessonOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNextLessonOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card-custom border-t border-custom rounded-t-[32px] z-50 flex flex-col max-h-[85dvh] shadow-2xl overflow-hidden select-none"
            >
              {/* Drag Indicator-Handle */}
              <div className="w-12 h-1.5 bg-neutral-700/40 rounded-full mx-auto mt-3.5 mb-1 shrink-0" />

              {/* Fixed Header */}
              <div className="px-6 pb-4 pt-2 border-b border-custom/40 flex justify-between items-start shrink-0">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-accent-primary uppercase tracking-widest bg-accent-primary/10 px-2.5 py-0.5 rounded border border-accent-primary/10 flex items-center gap-1 w-max">
                    <Calendar size={10} /> СЛЕДУЮЩЕЕ ЗАНЯТИЕ
                  </span>
                  <h3 className="text-xl font-semibold text-primary-custom mt-1.5 leading-tight animate-fade-in">
                    {nextBooking?.title || "High Heels Pro"}
                  </h3>
                  <p className="text-secondary-custom text-xs font-medium">
                    Хореограф: <span className="text-accent-primary">{nextBooking?.teacher_name || "Яна Смирнова"}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsNextLessonOpen(false)}
                  className="p-1.5 text-secondary-custom hover:text-primary-custom rounded-full hover:bg-main transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-36 flex-1 space-y-6">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/10 p-4 rounded-[20px]">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-secondary-custom opacity-80 uppercase tracking-wider block">Дата и время</span>
                    <p className="text-xs font-medium text-primary-custom">
                      {nextBooking 
                        ? `${new Date(nextBooking.start_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} в ${new Date(nextBooking.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                        : "Сегодня в 19:30"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-secondary-custom opacity-80 uppercase tracking-wider block">Зал и локация</span>
                    <p className="text-xs font-medium text-primary-custom">Зал 2, Тверская 12</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-secondary-custom opacity-80 uppercase tracking-wider block">Уровень группы</span>
                    <p className="text-xs font-medium text-accent-primary">Для всех уровней (Pro)</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-secondary-custom opacity-80 uppercase tracking-wider block">Статус</span>
                    <p className="text-xs font-medium text-emerald-400">Запись подтверждена</p>
                  </div>
                </div>

                {/* What to bring */}
                <div className="space-y-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/10 p-4 rounded-[20px]">
                  <span className="text-xs font-bold text-secondary-custom opacity-80 uppercase tracking-wider block">Что взять с собой:</span>
                  <p className="text-xs text-secondary-custom font-medium leading-relaxed">
                    Рекомендуется надеть удобную тренировочную форму (топ, спортивные брюки или наколенники для партера) и чистую сменную обувь на каблуке. Возьмите с собой бутылку воды и отличное настроение!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <motion.a
                    href="https://yandex.ru/maps/?text=Тверская+улица+12+Москва+AkademikA"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-accent-primary hover:bg-accent-primary/90 text-accent-text font-medium text-xs py-3.5 rounded-[16px] transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-accent-primary/5 cursor-pointer"
                  >
                    <MapPin size={14} className="fill-current" />
                    Построить маршрут до зала
                  </motion.a>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsNextLessonOpen(false);
                        toast({
                          title: "Запрос отправлен",
                          description: "Наш администратор свяжется с вами для переноса записи.",
                        });
                      }}
                      className="bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 border border-white/10 dark:border-white/10 text-secondary-custom hover:text-primary-custom font-medium text-xs py-3 rounded-[16px] transition-all text-center flex items-center justify-center cursor-pointer"
                    >
                      Перенести
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsNextLessonOpen(false);
                        toast({
                          variant: "destructive",
                          title: "Запись отменена",
                          description: "Вы успешно отменили запись на занятие.",
                        });
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-medium text-xs py-3 rounded-[16px] transition-all text-center flex items-center justify-center cursor-pointer"
                    >
                      Отменить запись
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FROSTED BOTTOM SHEET DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedCard && (
          <>
            {/* Clickable Backdrop outside the sheet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 transition-opacity cursor-pointer"
            />

            {/* Wrapper Container for exact centering above BottomNav */}
            <div className="fixed inset-0 z-40 flex items-end justify-center pb-[calc(max(1.5rem,env(safe-area-inset-bottom))+64px+1.5rem)] px-4 pointer-events-none">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="pointer-events-auto w-full max-w-[340px] mx-auto bg-zinc-950/45 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-[32px] p-6 flex flex-col overflow-hidden text-white"
              >
                {/* Top Accent Theme Badge & Close Button */}
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5 pr-2 min-w-0">
                    <span className={`text-xs font-bold uppercase tracking-wider block${
                      selectedCard.color === 'orange' ? 'text-brandOrange' :
                      selectedCard.color === 'violet' ? 'text-brandViolet' :
                      'text-[#CCFF00]'
                    }`}>
                      {selectedCard.badge}
                    </span>
                    <h3 className="text-2xl font-semibold text-[#F5F5F0] leading-tight">
                      {selectedCard.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors shrink-0 flex items-center justify-center cursor-pointer -mt-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content / Description */}
                <p className="text-base text-zinc-100 font-medium leading-normal mb-4">
                  {selectedCard.desc}
                </p>

                {/* Optional Key-Value Details */}
                {selectedCard.details && selectedCard.details.length > 0 && (
                  <div className="w-full bg-white/10 border border-white/15 backdrop-blur-md rounded-[20px] p-3.5 mb-4 flex flex-col gap-2">
                    {selectedCard.details.map((detail: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-2 w-full overflow-hidden text-xs">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider text-xs shrink-0">{detail.label}</span>
                        <span className="font-mono font-medium text-white text-right truncate min-w-0 max-w-[55%]">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (selectedCard.id === 'challenge') {
                      toast({
                        title: "Участие подтверждено",
                        description: "Ты в игре! Продолжай посещать тренировки и собирать баллы Ритма.",
                      });
                    } else if (selectedCard.id === 'alert') {
                      toast({
                        title: "Переход в профиль",
                        description: "Загрузка вариантов продления абонемента...",
                      });
                      setLocation('/profile');
                    } else if (selectedCard.id === 'booking') {
                      window.open("https://yandex.ru/maps/?text=Тверская+улица+12+Москва+AkademikA", "_blank");
                    } else if (selectedCard.id === 'special-offer') {
                      toast({
                        title: "Предложение активировано",
                        description: "Скидка 15% зафиксирована! Наш менеджер свяжется с тобой в Telegram.",
                      });
                    }
                    setSelectedCard(null);
                  }}
                  style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                  className="w-full h-14 font-medium text-base rounded-[16px] flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-transform shadow-md cursor-pointer border-none"
                >
                  {selectedCard.id === 'booking' && <MapPin size={18} className="fill-current" />}
                  {selectedCard.actionText}
                  <ArrowUpRight size={18} />
                </motion.button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
