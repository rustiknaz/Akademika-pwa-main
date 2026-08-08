import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save, User, Phone, Award, Flame, Check, ChevronUp, History, CreditCard, ChevronRight, X, ArrowUpRight, Briefcase, Bell, LogOut, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import Banner from '@/components/Banner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

function TrainerProfileView({
  profile,
  user,
  accentColor,
  accentConfig,
  theme,
  triggerFileSelect,
  fileInputRef,
  handleFileChange,
  uploading
}: any) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const activeBtnTextColor = accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      setLocation('/Login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-4 pb-28 text-left select-none">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Trainer Info Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#CDD2D7] rounded-[32px] p-5 text-black shadow-md border border-white/20 select-none relative overflow-hidden flex items-center justify-between"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="relative cursor-pointer shrink-0" onClick={triggerFileSelect}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Аватар тренера"
                className="w-16 h-16 rounded-full object-cover border-2 border-black/10 shadow-inner"
              />
            ) : (
              <div className="w-16 h-16 bg-black/10 text-black rounded-full flex items-center justify-center text-2xl font-semibold border border-black/10 shadow-inner">
                {(profile.full_name?.[0] || 'Т').toUpperCase()}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold truncate text-black leading-tight">
                {profile.full_name || "Мария Соколова"}
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider bg-black/10 px-2.5 py-0.5 rounded-full text-black shrink-0">
                Тренер
              </span>
            </div>
            <p className="text-zinc-700 text-xs font-bold tracking-wide mt-1">
              {profile.phone || '+7 (999) 123-45-67'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Блок 1: Рабочая информация */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full bg-[#CDD2D7] rounded-[32px] p-5 text-black shadow-md border border-white/20 select-none space-y-3.5"
      >
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-black/70" />
          <span className="text-xs font-bold text-black/70 uppercase tracking-wider">
            Рабочая информация
          </span>
        </div>

        <div className="space-y-3">
          {/* Специализация/Направления */}
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3.5 border border-white/40 shadow-sm flex flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
              Специализация / Направления
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['High Heels', 'Choreo', 'Stretching'].map((style, idx) => (
                <span
                  key={idx}
                  style={{ backgroundColor: accentColor || '#CCFF00', color: activeBtnTextColor }}
                  className="text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* Текущая ставка за урок */}
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3.5 border border-white/40 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                Текущая ставка за урок
              </span>
              <span className="text-base font-medium text-black">
                1 500 ₽ / урок
              </span>
            </div>
            <div 
              style={{ backgroundColor: accentColor || '#CCFF00', color: activeBtnTextColor }}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
            >
              ₽
            </div>
          </div>

          {/* Контактный телефон */}
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3.5 border border-white/40 shadow-sm flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                Контактный телефон
              </span>
              <span className="text-sm font-medium text-black block truncate">
                {profile.phone || '+7 (999) 123-45-67'}
              </span>
            </div>
            <Phone className="w-4 h-4 text-black/60 shrink-0" />
          </div>
        </div>
      </motion.div>

      {/* Блок 2: Статистика за месяц */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-[#CDD2D7] rounded-[32px] p-5 text-black shadow-md border border-white/20 select-none space-y-3"
      >
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-black/70" />
          <span className="text-xs font-bold text-black/70 uppercase tracking-wider">
            Статистика за месяц
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3 text-center border border-white/40 shadow-sm flex flex-col justify-center items-center min-h-[76px]">
            <span className="text-xl font-semibold text-black leading-none">32</span>
            <span className="text-xs font-bold text-zinc-700 mt-1.5 leading-tight tracking-wide">
              Отработано занятий
            </span>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3 text-center border border-white/40 shadow-sm flex flex-col justify-center items-center min-h-[76px]">
            <span className="text-xl font-semibold text-black leading-none">148</span>
            <span className="text-xs font-bold text-zinc-700 mt-1.5 leading-tight tracking-wide">
              Всего учеников
            </span>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3 text-center border border-white/40 shadow-sm flex flex-col justify-center items-center min-h-[76px]">
            <span className="text-xl font-semibold text-black leading-none">48 ч</span>
            <span className="text-xs font-bold text-zinc-700 mt-1.5 leading-tight tracking-wide">
              Часы практики
            </span>
          </div>
        </div>
      </motion.div>

      {/* Блок 3: Настройки аккаунта */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full bg-[#CDD2D7] rounded-[32px] p-5 text-black shadow-md border border-white/20 select-none space-y-3"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-black/70" />
          <span className="text-xs font-bold text-black/70 uppercase tracking-wider">
            Настройки аккаунта
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Уведомления о новых записях */}
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] p-3.5 border border-white/40 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-black">
                  Уведомления о записях
                </span>
                <span className="text-xs font-bold text-zinc-600 tracking-wide">
                  Уведомлять о новых записавшихся учениках
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const newState = !notificationsEnabled;
                setNotificationsEnabled(newState);
                toast({
                  title: newState ? "Уведомления включены" : "Уведомления выключены",
                  description: newState
                    ? "Вы будете получать push-уведомления о новых записях"
                    : "Push-уведомления временно отключены",
                });
              }}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border-none flex items-center ${
                notificationsEnabled ? 'bg-black' : 'bg-zinc-400'
              }`}
            >
              <div
                style={notificationsEnabled ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Системные настройки */}
          <button
            type="button"
            onClick={() => setLocation('/settings')}
            className="w-full bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-[20px] p-3.5 border border-white/40 shadow-sm flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-black">
                Системные настройки
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-black/60" />
          </button>

          {/* Кнопка "Выйти" */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-[20px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-none mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { accentColor, accentConfig, theme } = useTheme();
  const { currentRole } = useRole();
  const activeBtnTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'profile' | 'settings'>('profile');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });
  const [subscription, setSubscription] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gamification state
  const [isStreakActive, setIsStreakActive] = useState(true);
  const [userXP, setUserXP] = useState(450);
  const [visitCount, setVisitCount] = useState<number>(25); // high activity by default (25 visits)
  const [isAbonementOpen, setIsAbonementOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
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

  const [isJournalExpanded, setIsJournalExpanded] = useState(false);
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const restoreStreak = () => {
    if (userXP < 150) {
      toast({
        variant: "destructive",
        title: "Недостаточно XP!",
        description: "Посещайте тренировки, чтобы заработать очки опыта.",
      });
      return;
    }
    setUserXP(prev => prev - 150);
    setIsStreakActive(true);
    toast({
      title: "Ритм восстановлен!",
      description: "Ваша серия тренировок снова активна! 🔥",
    });
  };

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }
      setUser(session.user);

      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', session.user.id).maybeSingle()
      ]);

      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name || '',
          phone: profileRes.data.phone || '',
          avatar_url: profileRes.data.avatar_url || ''
        });
      }
      setSubscription(subRes.data);
      setLoading(false);
    }
    fetchData();
  }, [setLocation]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Профиль обновлен",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 1.5MB for base64 storage)
    if (file.size > 1.5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Изображение слишком большое. Выберите файл меньше 1.5 МБ.",
      });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64data })
          .eq('id', user.id);

        if (error) throw error;

        setProfile(prev => ({ ...prev, avatar_url: base64data }));
        toast({
          title: "Успешно!",
          description: "Фото профиля обновлено",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: err.message,
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="h-screen h-[100dvh] page-root flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  const phoneDisplay = profile.phone || user?.email?.replace('@dance.local', '') || '';

  return (
    <div className="h-screen h-[100dvh] page-root flex flex-col overflow-hidden bg-transparent px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] selection:bg-accent-primary/15 selection:text-accent-primary font-sans text-primary-custom relative">
      {/* PROFILE MAIN SCREEN */}
      <header className="pt-4 pb-4 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-custom">
          {currentRole === 'trainer' ? 'Профиль тренера' : 'Профиль'}
        </h1>
      </header>

      <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-width-none -ms-overflow-style-none space-y-6 pb-28">
        {currentRole === 'trainer' ? (
          <TrainerProfileView
            profile={profile}
            user={user}
            accentColor={accentColor}
            accentConfig={accentConfig}
            theme={theme}
            triggerFileSelect={triggerFileSelect}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            uploading={uploading}
          />
        ) : (
          <>
            {/* User Card */}
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[80px] bg-[#CDD2D7] rounded-[32px] px-5 py-3 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 shrink-0 select-none relative overflow-hidden flex items-center justify-between"
            >
              <div className="flex items-center justify-between gap-4 w-full relative z-10">
                {/* Left Side: Avatar & Name */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Аватар"
                        className="w-14 h-14 rounded-full object-cover border-2 border-black/10 shadow-inner"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-black/10 text-black rounded-full flex items-center justify-center text-xl font-semibold border border-black/10 shadow-inner">
                        {(profile.full_name?.[0] || user?.email?.[0] || 'У').toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 pl-1">
                    <h2 className="text-lg font-medium truncate leading-tight text-black">
                      {profile.full_name || "Рустам"}
                    </h2>
                    <p className="text-zinc-800 text-xs font-bold tracking-wide mt-0.5">
                      {phoneDisplay}
                    </p>
                  </div>
                </div>

                {/* Right Side: Dynamic Flame Icon (Tap to cycle activity level) */}
                <motion.div 
                  whileTap={{ scale: 0.90 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (visitCount === 25) setVisitCount(3);
                    else if (visitCount === 3) setVisitCount(10);
                    else setVisitCount(25);
                    
                    toast({
                      title: "Активность изменена",
                      description: visitCount === 25 
                        ? "Тест: Низкая активность (тусклый огонек)" 
                        : visitCount === 3 
                          ? "Тест: Средняя активность (оранжевый огонек)" 
                          : "Тест: Высокая активность (яркий лаймовый огонек)"
                    });
                  }}
                  className="cursor-pointer"
                >
                  <Flame 
                    className={`w-7 h-7 transition-all ${
                      visitCount >= 20 
                        ? 'text-[#CCFF00] drop-shadow-[0_0_8px_#CCFF00]' 
                        : visitCount >= 8 
                          ? 'text-orange-600 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]' 
                          : 'text-zinc-600'
                    }`}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Grid Container for Membership and Awards */}
            <div className="w-full shrink-0 mt-3.5 relative select-none">
              <div className="grid grid-cols-2 gap-3.5 w-full select-none">
                {/* Column 1: Membership Banner (Abonement) */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAbonementOpen(true)}
                  className="w-full h-[150px] bg-[#CDD2D7] rounded-[32px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col justify-between relative overflow-hidden select-none"
                >
                  <div className="flex flex-col justify-between h-full w-full text-left">
                    <div className="flex justify-between items-start w-full">
                      <span className="text-black/60 text-xs uppercase tracking-wider font-bold leading-none">Абонемент</span>
                      <ArrowUpRight size={14} className="text-black/60" />
                    </div>
                    <div className="my-1">
                      <span className="text-2xl font-semibold leading-none tracking-tighter text-black">
                        {subscription?.visits_left ?? 8}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black/85 leading-none tracking-wide">
                        занятий осталось
                      </p>
                      <p className="text-zinc-700 text-xs font-bold mt-1 tracking-wider uppercase">
                        до {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('ru-RU') : '31.12.27'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Column 2: My Awards Section (Rewards) */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsRewardsOpen(true)}
                  className="w-full h-[150px] bg-[#CDD2D7] rounded-[32px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col justify-between relative overflow-hidden select-none"
                >
                  <div className="flex flex-col justify-between h-full w-full text-left">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex items-center gap-1">
                        <Award className="text-black w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-bold text-black/60 uppercase tracking-wider leading-none">МОИ НАГРАДЫ</span>
                      </div>
                      <ArrowUpRight size={14} className="text-black/60" />
                    </div>
                    <div className="flex gap-1.5 justify-between items-center w-full mt-2">
                      <div className="w-8 h-8 bg-black/10 border border-black/10 rounded-full flex items-center justify-center text-sm shadow-sm" title="Занимаюсь спортом!">
                        💪
                      </div>
                      <div className="w-8 h-8 bg-black/10 border border-black/10 rounded-full flex items-center justify-center text-sm shadow-sm" title="Активный ученик!">
                        🔥
                      </div>
                      <div className="w-8 h-8 bg-black/10 border border-black/10 rounded-full flex items-center justify-center text-sm shadow-sm" title="Постоянный гость!">
                        🌟
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Achievements Section */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRewardsOpen(true)}
              className="w-full h-[150px] bg-[#CDD2D7] rounded-[32px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col justify-between shrink-0 relative overflow-hidden select-none mt-3.5"
            >
              <div className="absolute top-4 right-4 text-black/60 transition-colors pointer-events-none">
                <ArrowUpRight size={15} />
              </div>
              <div className="flex justify-between items-center mb-2.5 pr-5">
                <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Достижения</span>
                <span className="text-black text-xs font-bold bg-black/10 border border-black/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">LVL 4 (ADVANCED)</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold tracking-wide text-black">
                  <span>Баланс опыта</span>
                  <span className="font-medium text-black">{userXP} / 600 XP</span>
                </div>

                {/* High-tech XP Progress bar */}
                <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#CCFF00] h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: '75%' }}></div>
                </div>

                <div className="flex justify-between text-xs text-zinc-700 font-bold tracking-wider pt-0.5">
                  <span>ПРОГРЕСС СЕЗОНА</span>
                  <span>75% ДО СЛЕДУЮЩЕГО РАНГА</span>
                </div>
              </div>
            </motion.div>

            {/* Visit Journal Banner */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={() => setIsJournalExpanded(!isJournalExpanded)}
              className="bg-[#CDD2D7] rounded-[32px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col gap-3 shrink-0 overflow-hidden text-left select-none relative mt-3.5"
            >
              {/* Header */}
              <div className="flex justify-between items-center cursor-pointer">
                <span className="text-black/60 text-xs font-bold tracking-wider uppercase">ЖУРНАЛ ПОСЕЩЕНИЙ</span>
                <span className="text-black hover:opacity-80 text-xs font-medium transition-all flex items-center gap-1">
                  {isJournalExpanded ? 'Свернуть' : 'Все'}
                  <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isJournalExpanded ? 'rotate-0' : 'rotate-180'}`} />
                </span>
              </div>

              {/* Activity grid (Always visible) */}
              <div className="grid grid-cols-5 gap-2 shrink-0">
                {[
                  { date: "10.07", attended: true, code: "HH" },
                  { date: "08.07", attended: true, code: "CH" },
                  { date: "05.07", attended: false, code: "ST" },
                  { date: "03.07", attended: true, code: "DJ" },
                  { date: "01.07", attended: true, code: "HH" },
                ].map((visit, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-md rounded-[20px] p-2.5 text-center border border-white/40 shadow-sm hover:bg-white/80 transition-all flex flex-col items-center justify-between gap-1 text-black">
                    <span className="text-xs text-zinc-800 font-bold tracking-wide">{visit.date}</span>
                    <div className="my-0.5">
                      <Check className={`w-4 h-4 ${visit.attended ? "text-black stroke-[3]" : "text-black/30 opacity-40"}`} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">{visit.code}</span>
                  </div>
                ))}
              </div>

              {/* Expandable vertical history */}
              {isJournalExpanded && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 border-t border-black/10 pt-3 space-y-2 text-xs text-black font-medium"
                >
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="font-medium">10.07 — High Heels (HH)</span>
                    </div>
                    <span className="text-xs text-zinc-700 font-bold tracking-wide">19:30 • Маша</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="font-medium">08.07 — Choreo (CH)</span>
                    </div>
                    <span className="text-xs text-zinc-700 font-bold tracking-wide">18:00 • Лера</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black/30" />
                      <span className="text-zinc-600 line-through font-medium">05.07 — Stretching (ST)</span>
                    </div>
                    <span className="text-xs text-red-600 font-bold uppercase tracking-wide">Пропуск</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="font-medium">03.07 — Dancehall (DJ)</span>
                    </div>
                    <span className="text-xs text-zinc-700 font-bold tracking-wide">20:00 • Дима</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="font-medium">01.07 — High Heels (HH)</span>
                    </div>
                    <span className="text-xs text-zinc-700 font-bold tracking-wide">19:30 • Маша</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="font-medium">28.06 — Choreo (CH)</span>
                    </div>
                    <span className="text-xs text-zinc-700 font-bold tracking-wide">18:00 • Лера</span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* БЛОК СТАТИСТИКИ ("Танцевальный трекер") */}
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="grid grid-cols-2 gap-3.5 w-full shrink-0 mt-3.5"
            >
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="w-full h-[75px] bg-[#CDD2D7] rounded-[24px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col justify-center relative overflow-hidden select-none"
              >
                <span className="text-xl font-semibold text-black leading-none">48 ч</span>
                <span className="text-xs font-bold text-zinc-700 mt-1 tracking-wide">Время на паркете</span>
              </motion.div>
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="w-full h-[75px] bg-[#CDD2D7] rounded-[24px] p-4 text-black shadow-md border border-white/20 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-[0.98] flex flex-col justify-center relative overflow-hidden select-none"
              >
                <span className="text-xl font-semibold text-black leading-none">3 стиля</span>
                <span className="text-xs font-bold text-zinc-700 mt-1 tracking-wide">Изучено направлений</span>
              </motion.div>
            </motion.div>

            {/* БЛОК "АРХИВ АБОНЕМЕНТОВ" (Wide-Compact Banner 1) */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="w-full min-h-[64px] bg-[#CDD2D7] rounded-[32px] px-5 py-3.5 text-black shadow-md border border-white/20 transition-all duration-200 flex flex-col justify-center shrink-0 overflow-hidden relative select-none mt-3.5"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                className="flex items-center justify-between w-full text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-black">Архив абонементов</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-black/70 transition-transform duration-300 ${isArchiveExpanded ? 'rotate-90' : 'rotate-0'}`} />
              </motion.button>

              <AnimatePresence initial={false}>
                {isArchiveExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3.5 space-y-2 text-xs text-black font-medium border-t border-black/10 mt-3">
                      <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                        <span className="font-medium">Абонемент #442 — Pro Dance</span>
                        <span className="text-red-600 font-bold bg-red-500/10 px-2 py-0.5 rounded text-xs tracking-wide">Истек 12.05.2026</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px]">
                        <span className="font-medium">Абонемент #391 — Light</span>
                        <span className="text-red-600 font-bold bg-red-500/10 px-2 py-0.5 rounded text-xs tracking-wide">Истек 12.03.2026</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* БЛОК "ИСТОРИЯ ОПЛАТ" (Wide-Compact Banner 2) */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="w-full min-h-[64px] bg-[#CDD2D7] rounded-[32px] px-5 py-3.5 text-black shadow-md border border-white/20 transition-all duration-200 flex flex-col justify-center shrink-0 overflow-hidden relative select-none mt-3.5"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center justify-between w-full text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-black">История оплат</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-black/70 transition-transform duration-300 ${isHistoryExpanded ? 'rotate-90' : 'rotate-0'}`} />
              </motion.button>

              <AnimatePresence initial={false}>
                {isHistoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3.5 space-y-2 text-xs text-black font-medium border-t border-black/10 mt-3">
                      <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px] text-black">
                        <span className="font-medium">Покупка: Абонемент Pro Dance</span>
                        <span className="text-black font-medium">5500 ₽</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/40 rounded-[16px] text-zinc-800">
                        <span className="text-xs font-bold tracking-wide">14.06.2026 — Оплата картой</span>
                        <span className="text-xs font-bold tracking-wide">Чек #1042</span>
                      </div>
                      
                      <div className="border-t border-black/10 my-1"></div>

                      <div className="flex justify-between items-center p-2.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-[20px] text-black">
                        <span className="font-medium">Покупка: Абонемент Light</span>
                        <span className="text-black font-medium">3200 ₽</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/40 rounded-[16px] text-zinc-800">
                        <span className="text-xs font-bold tracking-wide">12.03.2026 — Оплата картой</span>
                        <span className="text-xs font-bold tracking-wide">Чек #0894</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* Modals block */}
      <AnimatePresence>
        {isAbonementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* Backdrop click */}
            <div 
              className="absolute inset-0"
              onClick={() => {
                setIsAbonementOpen(false);
                setShowQRCode(false);
              }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-[32px] p-6 text-white shadow-2xl relative flex flex-col gap-4 z-10 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none"
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-5 right-5 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-none"
                onClick={() => {
                  setIsAbonementOpen(false);
                  setShowQRCode(false);
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tag & Title */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: accentColor }}>
                  ТАРИФ: PRO DANCE
                </span>
                <h3 className="text-2xl font-semibold text-white leading-tight mt-1">
                  Детали абонемента
                </h3>
              </div>

              {/* Inner Details Block */}
              <div className="bg-zinc-800/60 border border-white/5 rounded-[20px] p-4 text-xs space-y-3 text-zinc-300">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Занятий осталось</span>
                  <span className="font-medium text-white text-sm">
                    {subscription?.visits_left ?? 8} <span className="text-zinc-400 font-medium text-xs">из 12</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Статус</span>
                  <span 
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    className="font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                  >
                    АКТИВЕН
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Действителен до</span>
                  <span className="font-medium text-white">
                    {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('ru-RU') : '31.12.2027'}
                  </span>
                </div>

                <div className="border-t border-white/5 pt-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-white block">Заморозка</span>
                    <span className="text-[10px] text-zinc-400">Доступно до 14 дней в год</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: "Заморозка активирована",
                        description: "Ваш абонемент успешно заморожен на 7 дней! ❄️",
                      });
                    }}
                    style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                    className="font-bold text-xs px-3.5 py-1.5 rounded-full hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shrink-0"
                  >
                    Заморозить
                  </button>
                </div>
              </div>

              {/* Action / QR Section */}
              {!showQRCode ? (
                <button
                  type="button"
                  onClick={() => setShowQRCode(true)}
                  style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                  className="w-full h-12 font-bold text-sm uppercase rounded-[16px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mt-2 cursor-pointer border-none"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Показать QR-код</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-800/60 border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Ваш электронный пропуск
                  </div>

                  <div className="w-40 h-40 bg-white p-3 rounded-2xl relative shadow-md flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 h-[2px] z-10 animate-[bounce_3s_infinite]" style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
                      <rect x="0" y="0" width="25" height="25" />
                      <rect x="5" y="5" width="15" height="15" fill="white" />
                      <rect x="10" y="10" width="5" height="5" />
                      <rect x="75" y="0" width="25" height="25" />
                      <rect x="80" y="5" width="15" height="15" fill="white" />
                      <rect x="85" y="10" width="5" height="5" />
                      <rect x="0" y="75" width="25" height="25" />
                      <rect x="5" y="80" width="15" height="15" fill="white" />
                      <rect x="10" y="85" width="5" height="5" />
                      <rect x="35" y="15" width="10" height="10" />
                      <rect x="50" y="5" width="15" height="5" />
                      <rect x="55" y="20" width="10" height="20" />
                      <rect x="10" y="35" width="15" height="5" />
                      <rect x="5" y="50" width="10" height="15" />
                      <rect x="35" y="55" width="20" height="10" />
                      <rect x="40" y="75" width="15" height="15" />
                      <rect x="65" y="55" width="10" height="5" />
                      <rect x="75" y="40" width="15" height="25" />
                      <rect x="80" y="75" width="10" height="10" />
                    </svg>
                  </div>

                  <div className="text-xs font-bold text-white mt-3 tracking-wide uppercase">
                    {profile.full_name || 'Танцор AkademikA'}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQRCode(false)}
                    className="text-zinc-400 hover:text-white text-xs font-medium mt-2 border-none cursor-pointer"
                  >
                    Свернуть QR-код
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {isRewardsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* Backdrop click */}
            <div 
              className="absolute inset-0"
              onClick={() => {
                setIsRewardsOpen(false);
                setSelectedAchievement(null);
              }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-[32px] p-6 text-white shadow-2xl relative flex flex-col gap-4 z-10 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none"
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-5 right-5 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-none"
                onClick={() => {
                  setIsRewardsOpen(false);
                  setSelectedAchievement(null);
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tag & Title */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: accentColor }}>
                  РАЗБЛОКИРОВАНО 3 ИЗ 9 НАГРАД
                </span>
                <h3 className="text-2xl font-semibold text-white leading-tight mt-1">
                  Мои награды
                </h3>
              </div>

              {/* Selected Achievement Details */}
              <AnimatePresence mode="wait">
                {selectedAchievement ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="bg-zinc-800/60 border border-white/5 rounded-[20px] p-4 text-xs text-zinc-300 relative"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAchievement(null)}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white border-none cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-3 items-start pr-6">
                      <div className="w-12 h-12 rounded-xl bg-zinc-700/50 flex items-center justify-center text-2xl shrink-0">
                        {selectedAchievement.icon}
                      </div>
                      <div className="space-y-1">
                        <span 
                          style={selectedAchievement.unlocked ? { backgroundColor: accentColor, color: activeBtnTextColor } : {}}
                          className={`inline-flex text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full${
                            selectedAchievement.unlocked ? '' : 'bg-white/10 text-zinc-400'
                          }`}
                        >
                          {selectedAchievement.unlocked ? 'РАЗБЛОКИРОВАНО' : 'ЗАБЛОКИРОВАНО'}
                        </span>
                        <h4 className="text-sm font-medium text-white leading-tight mt-0.5">{selectedAchievement.title}</h4>
                        <p className="text-[11px] text-zinc-300 leading-normal">{selectedAchievement.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-zinc-800/60 border border-white/5 rounded-[20px] p-3 text-center text-xs text-zinc-400 font-medium">
                    Нажмите на награду ниже, чтобы узнать детали ✨
                  </div>
                )}
              </AnimatePresence>

              {/* 3-column awards Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {achievementsList.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAchievement(achievement)}
                    style={selectedAchievement?.id === achievement.id ? { borderColor: accentColor } : {}}
                    className={`p-3 rounded-[18px] flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                      selectedAchievement?.id === achievement.id
                        ? 'bg-zinc-800 border text-white shadow-md scale-[1.02]'
                        : achievement.unlocked
                          ? 'bg-zinc-800/60 border border-white/5 text-white hover:bg-zinc-800'
                          : 'bg-zinc-800/30 border border-white/5 text-zinc-500 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1.5 transition-all ${
                      achievement.unlocked 
                        ? 'bg-white/10 text-white' 
                        : 'bg-white/5 text-zinc-600'
                    }`}>
                      {achievement.icon}
                    </div>
                    
                    <span className="text-xs font-bold text-white leading-tight line-clamp-1 tracking-wide">
                      {achievement.name}
                    </span>

                    {achievement.unlocked && (
                      <div 
                        style={{ backgroundColor: accentColor, color: activeBtnTextColor }}
                        className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-xs font-bold tracking-wide"
                      >
                        ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
