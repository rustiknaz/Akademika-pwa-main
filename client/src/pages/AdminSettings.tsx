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
      <div className={`h-[100dvh] flex items-center justify-center ${
        theme === 'light' ? 'bg-[#DDE2E5] text-black' : 'bg-black text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 ${
      bgImage ? 'bg-transparent text-black dark:text-white' : theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
    }`}>
      {/* Header */}
      <header className="mb-6 flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={() => setLocation('/Admin')}
          className={`p-2.5 transition-colors rounded-full cursor-pointer border-none flex items-center justify-center ${
            theme === 'light' 
              ? 'bg-black/5 text-black hover:bg-black/10' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Настройки</h1>
          <p className={`text-xs ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Управление параметрами студии AkademikA
          </p>
        </div>
      </header>

      {/* Settings Form */}
      <div className="flex-1 pb-4 pr-0.5 space-y-5">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          
          {/* БЛОК: ОФОРМЛЕНИЕ И ТЕМА */}
          <div className={`p-5 rounded-outer border transition-colors ${
            theme === 'light' ? 'bg-[#CDD2D7] border-black/10 text-black' : 'bg-[#18181B] border-white/10 text-white'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">
                ОФОРМЛЕНИЕ И ТЕМА
              </h3>
            </div>

            {/* ТЕМА ИНТЕРФЕЙСА */}
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">
                Тема оформления
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={theme === 'light' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`h-12 rounded-control font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all border-none cursor-pointer${
                    theme === 'light' ? 'shadow-md' : 'bg-white/80 text-black hover:bg-white'
                  }`}
                >
                  <Sun size={16}/>
                  <span>Светлая</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  style={theme === 'dark' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`h-12 rounded-control font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all border-none cursor-pointer${
                    theme === 'dark' ? 'shadow-md' : 'bg-zinc-800/80 text-white hover:bg-zinc-800'
                  }`}
                >
                  <Moon size={16}/>
                  <span>Темная</span>
                </button>
              </div>
            </div>

            {/* ВЫБОР ЦВЕТА (PANTONE) */}
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">
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
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${
                        isActive 
                          ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-105 shadow-md' 
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {isActive && <Check color={item.checkColor} size={18} strokeWidth={3}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ФОН ПРИЛОЖЕНИЯ (BACKGROUND) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">
                ФОН ПРИЛОЖЕНИЯ (BACKGROUND)
              </label>
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
                      ? `border-[#CCFF00] ring-2 ring-offset-2 ${theme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} scale-105 shadow-md ${theme === 'light' ? 'bg-[#DDE2E5] text-black' : 'bg-zinc-800 text-white'}`
                      : theme === 'light' 
                        ? 'border-black/20 bg-white/60 text-zinc-600 hover:border-black/40' 
                        : 'border-white/20 bg-zinc-900/80 text-zinc-400 hover:border-white/40'
                  }`}
                  title="Сплошной цвет темы"
                >
                  НЕТ
                </button>

                {/* 2nd & 3rd circles: PRESETS */}
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
                          ? `ring-2 ring-offset-2 ${theme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} border-[#CCFF00] scale-105 shadow-md`
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
                        ? `ring-2 ring-offset-2 ${theme === 'light' ? 'ring-offset-[#CDD2D7] ring-black/50' : 'ring-offset-zinc-900 ring-white/50'} border-[#CCFF00] bg-zinc-800 text-white scale-105 shadow-md`
                        : theme === 'light'
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

          {/* БЛОК 2: ОСНОВНЫЕ ДАННЫЕ */}
          <div className={`p-5 rounded-outer border shadow-lg space-y-4 transition-colors ${
            theme === 'light' 
              ? 'bg-[#CDD2D7] border-black/10 text-black' 
              : 'bg-[#18181B] border-zinc-800/80 text-white'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2${
              theme === 'light' ? 'text-black/80' : 'text-zinc-400'
            }`}>
              <Building size={14} style={{ color: accentColor }} /> Основные данные
            </h3>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider pl-2${
                theme === 'light' ? 'text-black/60' : 'text-zinc-400'
              }`}>Название студии</label>
              <input 
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className={`w-full h-[64px] px-5 text-sm font-medium rounded-control focus:outline-none transition-colors mt-1${
                  theme === 'light' 
                    ? 'bg-white/80 border border-black/10 text-black placeholder:text-zinc-400 focus:border-black/30' 
                    : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider pl-2${
                theme === 'light' ? 'text-black/60' : 'text-zinc-400'
              }`}>Телефон студии</label>
              <input 
                type="tel"
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className={`w-full h-[64px] px-5 text-sm font-medium font-mono rounded-control focus:outline-none transition-colors mt-1${
                  theme === 'light' 
                    ? 'bg-white/80 border border-black/10 text-black placeholder:text-zinc-400 focus:border-black/30' 
                    : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider pl-2${
                theme === 'light' ? 'text-black/60' : 'text-zinc-400'
              }`}>Адрес студии</label>
              <div className="relative mt-1">
                <input 
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  className={`w-full h-[64px] pl-5 pr-12 text-sm font-medium rounded-control focus:outline-none transition-colors${
                    theme === 'light' 
                      ? 'bg-white/80 border border-black/10 text-black placeholder:text-zinc-400 focus:border-black/30' 
                      : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
                  }`}
                />
                <MapPin size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                  theme === 'light' ? 'text-black/40' : 'text-zinc-400'
                }`} />
              </div>
            </div>
          </div>

          {/* БЛОК 3: СИСТЕМНЫЕ ПАРАМЕТРЫ */}
          <div className={`p-5 rounded-outer border shadow-lg space-y-4 transition-colors ${
            theme === 'light' 
              ? 'bg-[#CDD2D7] border-black/10 text-black' 
              : 'bg-[#18181B] border-zinc-800/80 text-white'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2${
              theme === 'light' ? 'text-black/80' : 'text-zinc-400'
            }`}>
              <Sliders size={14} style={{ color: accentColor }} /> Системные параметры
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium">Push-уведомления</p>
                <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-black/60' : 'text-zinc-400'}`}>
                  Оповещения о новых бронированиях
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={notificationsEnabled ? { backgroundColor: accentColor } : {}}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer border-none ${
                  notificationsEnabled ? '' : theme === 'light' ? 'bg-black/20' : 'bg-zinc-800'
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

            <div className={`h-px ${theme === 'light' ? 'bg-black/10' : 'bg-zinc-800/50'}`} />

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium">Установка PWA баннера</p>
                <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-black/60' : 'text-zinc-400'}`}>
                  Показывать плашку на главном экране
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPwaInstallPrompt(!pwaInstallPrompt)}
                style={pwaInstallPrompt ? { backgroundColor: accentColor } : {}}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer border-none ${
                  pwaInstallPrompt ? '' : theme === 'light' ? 'bg-black/20' : 'bg-zinc-800'
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

          {/* Save Button */}
          <button
            type="submit"
            style={{ backgroundColor: accentColor, color: activeTextColor }}
            className="w-full h-14 font-bold text-xs uppercase tracking-wider rounded-control transition-all text-center cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] border-none hover:brightness-105"
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
