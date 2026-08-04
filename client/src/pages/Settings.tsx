import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Loader2, Save, User, Phone, Settings, Check, 
  X, LogOut, Bell, Shield, Smartphone, ChevronRight, Moon, Sun, Plus
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import DevRoleSwitcher from '@/components/DevRoleSwitcher';
import { motion } from 'framer-motion';
import { useTheme, PRESET_BG_IMAGES } from '@/context/ThemeContext';

export default function ClientSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    theme: currentTheme, 
    setTheme, 
    accent: currentAccent, 
    setAccent, 
    accentColor, 
    accentTextColor,
    bgImage,
    setBgImage,
    removeBgImage
  } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('settings_push_enabled') !== 'false';
  });
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('settings_reminders_enabled') !== 'false';
  });

  // Load user profile on mount
  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          avatar_url: profileData.avatar_url || ''
        });
      }

      setLoading(false);
    }
    fetchData();
  }, [setLocation]);

  // Save notification toggles to local storage
  const handleTogglePush = () => {
    const newValue = !pushEnabled;
    setPushEnabled(newValue);
    localStorage.setItem('settings_push_enabled', String(newValue));
    toast({
      title: newValue ? "Уведомления включены" : "Уведомления выключены",
      description: newValue ? "Вы будете получать push-сообщения об акциях" : "Рекламные push-сообщения отключены",
    });
  };

  const handleToggleReminders = () => {
    const newValue = !remindersEnabled;
    setRemindersEnabled(newValue);
    localStorage.setItem('settings_reminders_enabled', String(newValue));
    toast({
      title: newValue ? "Напоминания активны" : "Напоминания отключены",
      description: newValue ? "Мы напомним вам о тренировке за 2 часа!" : "Напоминания о записях отключены",
    });
  };

  // Theme Updates
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast({
      title: newTheme === 'dark' ? "Темная тема включена" : "Светлая тема включена",
      description: "Оформление интерфейса успешно обновлено.",
    });
  };

  // Accent Updates
  const handleAccentChange = (newAccent: 'lime' | 'orange' | 'violet') => {
    setAccent(newAccent);
    toast({
      title: `Акцент изменен на ${newAccent === 'lime' ? 'Лайм' : newAccent === 'orange' ? 'Оранжевый' : 'Фиолетовый'}`,
      description: "Цветовые акценты приложения успешно обновлены.",
    });
  };

  // Save Account Changes
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
        description: "Ваш профиль обновлен",
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

  // Handle Avatar Image File Selection & Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Logout action
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/Login');
    toast({
      title: "Выход выполнен",
      description: "До встречи на тренировках! 👋",
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen h-screen h-[100dvh] flex items-center justify-center transition-colors duration-300 ${
        currentTheme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  const phoneDisplay = profile.phone || user?.email?.replace('@dance.local', '') || '';

  return (
    <div className={`min-h-screen h-screen h-[100dvh] flex flex-col overflow-hidden px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] font-sans relative transition-colors duration-300 ${
      bgImage ? 'bg-transparent text-black dark:text-white' : currentTheme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
    }`}>
      {/* Soft dynamic background glows (only in dark mode) */}
      {currentTheme === 'dark' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#CCFF00]/3 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* HEADER */}
      <header className="pt-4 pb-4 flex-shrink-0 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation('/profile')}
          className={`rounded-full transition-colors border-none ${
            currentTheme === 'light' 
              ? 'bg-black/5 text-black hover:bg-black/10' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <ArrowLeft className={`w-6 h-6 ${currentTheme === 'light' ? 'text-black' : 'text-white'}`} />
        </Button>
        <h1 className={`text-3xl font-bold${
          currentTheme === 'light' ? 'text-black' : 'text-white'
        }`}>Настройки</h1>
      </header>

      {/* SCROLLABLE SETTINGS WRAPPER */}
      <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-width-none -ms-overflow-style-none space-y-6 pb-28">
        
        <div className={`w-full rounded-[24px] p-6 flex flex-col gap-5 shadow-sm transition-colors ${
          currentTheme === 'light' ? 'bg-[#CDD2D7] text-black' : 'bg-[#18181B] border border-white/10 text-white'
        }`}>
          <h3 className={`text-xl font-semibold uppercase${currentTheme === 'light' ? 'text-black' : 'text-white'}`}>
            Личные данные
          </h3>
          
          {/* Avatar block */}
          <div className="flex flex-col items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Аватар"
                className="w-20 h-20 rounded-full border-2 border-black/10 object-cover mx-auto"
              />
            ) : (
              <div 
                style={{ backgroundColor: accentColor, color: accentColor === '#CCFF00' ? '#000000' : '#ffffff' }}
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-black/10 mx-auto shadow-sm"
              >
                {(profile.full_name?.[0] || user?.email?.[0] || 'У').toUpperCase()}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={uploading}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all mx-auto border-none cursor-pointer${
                currentTheme === 'light' 
                  ? 'bg-black/10 text-black hover:bg-black/20' 
                  : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              {uploading ? "Загрузка..." : "Сменить фото"}
            </button>
          </div>

          {/* Profile fields Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5${currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                <User size={14} className={currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'} /> Имя Фамилия
              </label>
              <input 
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Введите имя"
                className={`w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/40 text-sm${
                  currentTheme === 'light' 
                    ? 'bg-white/90 border border-black/10 text-black placeholder:text-zinc-400' 
                    : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5${currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                <Phone size={14} className={currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'} /> Телефон
              </label>
              <input 
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="Введите телефон"
                className={`w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/40 text-sm${
                  currentTheme === 'light' 
                    ? 'bg-white/90 border border-black/10 text-black placeholder:text-zinc-400' 
                    : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500'
                }`}
              />
            </div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full pt-1"
            >
              <button 
                type="submit" 
                disabled={saving}
                style={{ backgroundColor: accentColor, color: accentColor === '#CCFF00' ? '#000000' : '#ffffff' }}
                className="w-full h-14 font-bold text-base uppercase rounded-full shadow-lg hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                {saving ? "Сохранение..." : <><Save className="w-5 h-5" /> Сохранить</>}
              </button>
            </motion.div>
          </form>
        </div>

        {/* SECTION 2: NOTIFICATIONS (PUSH & CLASS REMINDERS) */}
        <div className={`rounded-[24px] p-6 shadow-xl space-y-5 transition-colors ${
          currentTheme === 'light' ? 'bg-[#CDD2D7] text-black' : 'bg-[#18181B] border border-white/10 text-white'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2${
            currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
          }`}>
            <Bell size={14} style={{ color: accentColor }} /> Уведомления PUSH
          </h3>

          {/* Toggle 1: Push Promo */}
          <div className={`flex items-center justify-between py-2 border-b ${
            currentTheme === 'light' ? 'border-black/10' : 'border-white/5'
          }`}>
            <div className="space-y-0.5 pr-4">
              <div className={`text-sm font-medium${currentTheme === 'light' ? 'text-black' : 'text-white'}`}>Новости и Акции</div>
              <p className={`text-xs font-bold tracking-wide${currentTheme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Получать оповещения о новых акциях, новостях и мастер-классах
              </p>
            </div>
            {/* Custom interactive iOS-style toggle */}
            <div 
              onClick={handleTogglePush}
              style={pushEnabled ? { backgroundColor: accentColor } : {}}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-300 relative flex-shrink-0 ${
                pushEnabled ? '' : currentTheme === 'light' ? 'bg-black/10 border border-black/10' : 'bg-zinc-800 border border-white/10'
              }`}
            >
              <motion.div 
                layout 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full shadow-md ${pushEnabled ? 'bg-black' : currentTheme === 'light' ? 'bg-black/40' : 'bg-white'}`}
                animate={{ x: pushEnabled ? 20 : 0 }}
              />
            </div>
          </div>

          {/* Toggle 2: Class Reminders */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5 pr-4">
              <div className={`text-sm font-medium${currentTheme === 'light' ? 'text-black' : 'text-white'}`}>Напоминания о тренировках</div>
              <p className={`text-xs font-bold tracking-wide${currentTheme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Напоминать о предстоящей записи в Telegram/Push за 2 часа
              </p>
            </div>
            <div 
              onClick={handleToggleReminders}
              style={remindersEnabled ? { backgroundColor: accentColor } : {}}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-300 relative flex-shrink-0 ${
                remindersEnabled ? '' : currentTheme === 'light' ? 'bg-black/10 border border-black/10' : 'bg-zinc-800 border border-white/10'
              }`}
            >
              <motion.div 
                layout 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full shadow-md ${remindersEnabled ? 'bg-black' : currentTheme === 'light' ? 'bg-black/40' : 'bg-white'}`}
                animate={{ x: remindersEnabled ? 20 : 0 }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: APP ACCENT THEME & MODE */}
        <div className={`rounded-[24px] p-6 shadow-xl space-y-6 transition-colors ${
          currentTheme === 'light' ? 'bg-[#CDD2D7] text-black' : 'bg-[#18181B] border border-white/10 text-white'
        }`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3${
              currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
            }`}>
              Тема оформления
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                style={currentTheme === 'light' ? { backgroundColor: accentColor, color: accentColor === '#CCFF00' ? '#000000' : '#ffffff', borderColor: accentColor } : {}}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer${
                  currentTheme === 'light' 
? 'font-normal shadow-sm'
                    : 'border-white/10 bg-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Sun size={15} />
                <span>Светлая</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                style={currentTheme === 'dark' ? { backgroundColor: accentColor, color: accentColor === '#CCFF00' ? '#000000' : '#ffffff', borderColor: accentColor } : {}}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer${
                  currentTheme === 'dark' 
? 'font-normal shadow-sm'
                    : currentTheme === 'light' ? 'border-black/10 bg-white/50 text-zinc-700 hover:text-black' : 'border-white/10 bg-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Moon size={15} />
                <span>Темная</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4${
              currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
            }`}>
              Цвет оформления (Pantone)
            </h3>
            <div className="flex gap-4 items-center">
              {[
                { id: 'lime', name: 'Sun Glare / Canary', color: '#CCFF00', bg: 'bg-[#CCFF00]', checkColor: 'text-black' },
                { id: 'orange', name: 'Exuberant Orange', color: '#FF4500', bg: 'bg-[#FF4500]', checkColor: 'text-white' },
                { id: 'violet', name: 'Blue Violet', color: '#6B52E1', bg: 'bg-[#6B52E1]', checkColor: 'text-white' }
              ].map((accent) => {
                const isSelected = currentAccent === accent.id;
                return (
                  <button
                    key={accent.id}
                    type="button"
                    className={`w-9 h-9 rounded-full cursor-pointer transition-transform active:scale-95 flex items-center justify-center ${accent.bg} ${
                      isSelected 
                        ? `ring-2 ring-offset-2 ${currentTheme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} scale-105 shadow-md` 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => handleAccentChange(accent.id as any)}
                    title={accent.name}
                  >
                    {isSelected && (
                      <Check size={16} className={`${accent.checkColor} stroke-[3px]`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BACKGROUND IMAGE SUBSECTION */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4${
              currentTheme === 'light' ? 'text-zinc-700' : 'text-zinc-400'
            }`}>
              ФОН ПРИЛОЖЕНИЯ (BACKGROUND)
            </h3>
            
            <div className="flex items-center gap-3">
              {/* 1st circle: NO BACKGROUND ("НЕТ") */}
              <button
                type="button"
                onClick={() => {
                  removeBgImage();
                  toast({
                    title: "Стандартный фон",
                    description: "Установлен сплошной цвет темы по умолчанию.",
                  });
                }}
className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center font-bold text-xs uppercase tracking-wide ${
                  !bgImage 
                    ? `border-[#CCFF00] ring-2 ring-offset-2 ${currentTheme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} scale-105 shadow-md ${currentTheme === 'light' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`
                    : currentTheme === 'light' 
                      ? 'border-black/20 bg-white/60 text-zinc-600 hover:border-black/40' 
                      : 'border-white/20 bg-zinc-900/80 text-zinc-400 hover:border-white/40'
                }`}
                title="Сплошной цвет темы"
              >
                НЕТ
              </button>

              {/* 2nd & 3rd circles: PRESET TEXTURES/GRADIENTS */}
              {PRESET_BG_IMAGES.map((preset) => {
                const isSelected = bgImage === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setBgImage(preset.url);
                      toast({
                        title: "Фон обновлен",
                        description: `Установлен пресет "${preset.name}".`,
                      });
                    }}
                    style={{ backgroundImage: `url(${preset.url})` }}
                    className={`w-10 h-10 rounded-full border-2 bg-cover bg-center cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? `ring-2 ring-offset-2 ${currentTheme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} border-[#CCFF00] scale-105 shadow-md`
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    title={preset.name}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check size={14} className="text-white stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* 4th circle: UPLOAD CUSTOM IMAGE (+) */}
              <div className="relative">
                <input
                  type="file"
                  ref={bgFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        variant: "destructive",
                        title: "Ошибка",
                        description: "Файл слишком большой. Выберите изображение до 5 МБ.",
                      });
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setBgImage(base64);
                      toast({
                        title: "Свой фон установлен!",
                        description: "Пользовательское изображение установлено на фон приложения.",
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center ${
                    bgImage && !PRESET_BG_IMAGES.some(p => p.url === bgImage)
                      ? `ring-2 ring-offset-2 ${currentTheme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} border-[#CCFF00] bg-zinc-800 text-white scale-105 shadow-md`
                      : currentTheme === 'light'
                        ? 'border-black/20 bg-white/80 text-black hover:bg-white hover:border-black/40'
                        : 'border-white/20 bg-zinc-800 text-white hover:bg-zinc-700 hover:border-white/40'
                  }`}
                  title="Загрузить свое изображение"
                >
                  <Plus size={18} className="stroke-[2.5px]" />
                </button>
              </div>
            </div>

            {/* Reset background button */}
            {bgImage && (
              <button
                type="button"
                onClick={() => {
                  removeBgImage();
                  toast({
                    title: "Фон сброшен",
                    description: "Возвращен стандартный цвет темы.",
                  });
                }}
                className="text-xs text-red-500 hover:underline mt-2 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 font-medium"
              >
                Сбросить фон
              </button>
            )}
          </div>
        </div>

        {/* SECTION 4: EXIT ACCOUNT BUTTON */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="pt-2"
        >
          <button
            onClick={handleLogout}
            className={
              currentTheme === 'light'
? 'w-full h-12 bg-red-500/10 text-red-600 font-bold border border-red-500/20 rounded-full hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer'
: 'w-full h-12 bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-full hover:bg-red-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer'
            }
          >
            <LogOut size={15} className="stroke-[2.5px]" />
            <span>Выйти из аккаунта</span>
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
