import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Building, 
  MapPin, 
  Sliders,
  Palette,
  Sun,
  Moon,
  Check,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import DevRoleSwitcher from "../components/DevRoleSwitcher";
import { useTheme, PRESET_BG_IMAGES } from '@/context/ThemeContext';

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const bgFileInputRef = React.useRef<HTMLInputElement>(null);

  // Theme Context
  const { theme, setTheme, accent, setAccent, accentColor, accentConfig, bgImage, setBgImage, removeBgImage } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';

  // Studio Settings State
  const [studioName, setStudioName] = useState('AkademikA Dance Studio');
  const [studioPhone, setStudioPhone] = useState('+7 (495) 123-45-67');
  const [studioAddress, setStudioAddress] = useState('г. Москва, ул. Арбат, д. 12');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
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

      setLoading(false);
    }
    checkAdmin();
  }, [setLocation]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Настройки сохранены!",
      description: "Все параметры студии успешно обновлены в системе.",
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      
      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНЯЯ ШАПКА ─── */}
        <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none flex items-center gap-4 select-none">
          <button
            type="button"
            onClick={() => setLocation('/Admin')}
            className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all cursor-pointer border-none flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight text-slate-950 dark:text-white">
              Настройки
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
              Управление параметрами студии AkademikA
            </p>
          </div>
        </div>

        {/* ─── ФОРМА НАСТРОЕК С ЕДИНЫМ GAP-2.5 ─── */}
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-2.5">
          
          {/* БЛОК 1: ОФОРМЛЕНИЕ И ТЕМА */}
          <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                ОФОРМЛЕНИЕ И ТЕМА
              </h3>
            </div>

            {/* ТЕМА ИНТЕРФЕЙСА */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">
                Тема оформления
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={theme === 'light' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`h-12 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-none cursor-pointer ${
                    theme === 'light' ? 'shadow-sm' : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  <Sun size={16} />
                  <span>Светлая</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  style={theme === 'dark' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`h-12 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-none cursor-pointer ${
                    theme === 'dark' ? 'shadow-sm' : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  <Moon size={16} />
                  <span>Темная</span>
                </button>
              </div>
            </div>

            {/* ВЫБОР ЦВЕТА (PANTONE) */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">
                Цвет оформления (Pantone)
              </label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'yellow', alias: 'lime', hex: '#CCFF00', checkColor: '#000000' },
                  { id: 'orange', alias: 'orange', hex: '#FF4500', checkColor: '#FFFFFF' },
                  { id: 'purple', alias: 'violet', hex: '#6B52E1', checkColor: '#FFFFFF' },
                ].map((item) => {
                  const isActive = accent === item.id || accent === item.alias;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAccent(item.id as any)}
                      style={{ backgroundColor: item.hex }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${
                        isActive 
                          ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-105 shadow-md' 
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {isActive && <Check color={item.checkColor} size={20} strokeWidth={3}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ФОН ПРИЛОЖЕНИЯ (BACKGROUND) */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">
                ФОН ПРИЛОЖЕНИЯ (BACKGROUND)
              </label>
              <div className="flex items-center gap-3">
                {/* Без фона */}
                <button
                  type="button"
                  onClick={() => {
                    removeBgImage();
                    toast({
                      title: "Стандартный фон",
                      description: "Установлен сплошной цвет темы по умолчанию.",
                    });
                  }}
                  className={`w-11 h-11 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center font-bold text-xs uppercase tracking-wide ${
                    !bgImage 
                      ? 'border-[#CCFF00] ring-2 ring-offset-2 ring-black/40 dark:ring-white/40 scale-105 shadow-sm bg-black/10 dark:bg-white/20 text-black dark:text-white'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:border-black/30'
                  }`}
                  title="Сплошной цвет темы"
                >
                  НЕТ
                </button>

                {/* Пресеты */}
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
                      className={`w-11 h-11 rounded-full border-2 bg-cover bg-center cursor-pointer transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-[#CCFF00] ring-2 ring-offset-2 ring-black/40 dark:ring-white/40 scale-105 shadow-sm'
                          : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      title={preset.name}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check size={16} className="text-white stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Загрузка своего фона */}
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
                    className={`w-11 h-11 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center ${
                      bgImage && !PRESET_BG_IMAGES.some(p => p.url === bgImage)
                        ? 'border-[#CCFF00] ring-2 ring-offset-2 ring-black/40 dark:ring-white/40 bg-zinc-800 text-white scale-105 shadow-sm'
                        : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 text-slate-800 dark:text-zinc-200 hover:bg-black/10'
                    }`}
                    title="Загрузить свое изображение"
                  >
                    <Plus size={18} className="stroke-[2.5px]" />
                  </button>
                </div>
              </div>

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
                  className="text-xs text-rose-500 hover:underline mt-2 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 font-bold"
                >
                  Сбросить фон
                </button>
              )}
            </div>
          </div>

          {/* БЛОК 2: ОСНОВНЫЕ ДАННЫЕ */}
          <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building size={16} style={{ color: accentColor }} /> Основные данные
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider pl-2 text-slate-500 dark:text-zinc-400">
                Название студии
              </label>
              <input 
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full h-13 px-5 text-sm font-bold rounded-2xl focus:outline-none transition-colors bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider pl-2 text-slate-500 dark:text-zinc-400">
                Телефон студии
              </label>
              <input 
                type="tel"
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className="w-full h-13 px-5 text-sm font-bold font-mono rounded-2xl focus:outline-none transition-colors bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider pl-2 text-slate-500 dark:text-zinc-400">
                Адрес студии
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  className="w-full h-13 pl-5 pr-12 text-sm font-bold rounded-2xl focus:outline-none transition-colors bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-950 dark:text-white"
                />
                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              </div>
            </div>
          </div>

          {/* БЛОК 3: СИСТЕМНЫЕ ПАРАМЕТРЫ */}
          <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={16} style={{ color: accentColor }} /> Системные параметры
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-slate-950 dark:text-white">Push-уведомления</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                  Оповещения о новых бронированиях
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={notificationsEnabled ? { backgroundColor: accentColor } : {}}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer border-none ${
                  notificationsEnabled ? '' : 'bg-black/10 dark:bg-zinc-800'
                }`}
              >
                <div 
                  style={notificationsEnabled ? { backgroundColor: activeTextColor } : {}}
                  className={`w-4 h-4 rounded-full transition-all transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-0 bg-zinc-400'
                  }`} 
                />
              </button>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/5" />

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-slate-950 dark:text-white">Установка PWA баннера</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                  Показывать плашку на главном экране
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPwaInstallPrompt(!pwaInstallPrompt)}
                style={pwaInstallPrompt ? { backgroundColor: accentColor } : {}}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer border-none ${
                  pwaInstallPrompt ? '' : 'bg-black/10 dark:bg-zinc-800'
                }`}
              >
                <div 
                  style={pwaInstallPrompt ? { backgroundColor: activeTextColor } : {}}
                  className={`w-4 h-4 rounded-full transition-all transform ${
                    pwaInstallPrompt ? 'translate-x-6' : 'translate-x-0 bg-zinc-400'
                  }`} 
                />
              </button>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <button
            type="submit"
            style={{ backgroundColor: accentColor || '#CCFF00', color: activeTextColor }}
            className="w-full h-14 font-black text-xs uppercase tracking-wider rounded-full transition-all text-center cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.98] border-none hover:opacity-90 mt-1"
          >
            <Save size={16} />
            <span>Сохранить конфигурацию</span>
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}