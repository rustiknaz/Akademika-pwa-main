import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Shield, 
  Loader2, 
  MapPin, 
  Sun, 
  Moon, 
  Check, 
  Sparkles, 
  Upload, 
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';

interface CustomWallpaper {
  id: string;
  name: string;
  dataUrl: string;
}

const DEFAULT_WALLPAPERS = [
  {
    id: 'default',
    name: 'Стандарт (Mesh)',
    dataUrl: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    isDefault: true
  }
];

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme, setBgImage, removeBgImage } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'studio' | 'integrations' | 'theme'>('theme');

  // Список загруженных обоев (до 6 шт)
  const [wallpapers, setWallpapers] = useState<CustomWallpaper[]>(() => {
    try {
      const saved = localStorage.getItem('app_user_wallpapers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedBgId, setSelectedBgId] = useState<string>(() => {
    return localStorage.getItem('app_bg_id') || 'default';
  });

  const [studioName, setStudioName] = useState('AKADEMIKA DANCE CENTER');
  const [branches] = useState([
    { id: '1', name: 'Филиал: Невский', address: 'Невский пр., 100', halls: ['Зал 1 (Main Glass)', 'Зал 2 (Light Studio)'] },
    { id: '2', name: 'Филиал: Центральный', address: 'ул. Рубинштейна, 12', halls: ['Зал 3 (VIP Room)'] }
  ]);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }
      setLoading(false);
    }
    checkAdmin();
  }, [setLocation]);

  const handleSelectDefault = () => {
    setSelectedBgId('default');
    localStorage.setItem('app_bg_id', 'default');
    removeBgImage();
    toast({
      title: "Фон сброшен",
      description: "Установлен стандартный градиент."
    });
  };

  const handleSelectWallpaper = (wp: CustomWallpaper) => {
    setSelectedBgId(wp.id);
    localStorage.setItem('app_bg_id', wp.id);
    setBgImage(wp.dataUrl);
    toast({
      title: "Обои применены ✨",
      description: `Установлен: ${wp.name}`
    });
  };

  const handleUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (wallpapers.length >= 6) {
      toast({
        variant: "destructive",
        title: "Лимит галереи",
        description: "Можно сохранить максимум 6 вариантов обоев. Удалите один из существующих."
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Файл слишком большой",
        description: "Максимальный размер фото — 8 МБ."
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newWallpaper: CustomWallpaper = {
        id: `wp_${Date.now()}`,
        name: `Обои #${wallpapers.length + 1}`,
        dataUrl: base64
      };

      const updated = [...wallpapers, newWallpaper];
      setWallpapers(updated);
      localStorage.setItem('app_user_wallpapers', JSON.stringify(updated));

      // Сразу активируем загруженное
      setSelectedBgId(newWallpaper.id);
      localStorage.setItem('app_bg_id', newWallpaper.id);
      setBgImage(base64);

      toast({
        title: "Обои добавлены в галерею! ✨",
        description: `Слот ${updated.length} из 6 занят.`
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteWallpaper = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = wallpapers.filter(w => w.id !== id);
    setWallpapers(updated);
    localStorage.setItem('app_user_wallpapers', JSON.stringify(updated));

    if (selectedBgId === id) {
      handleSelectDefault();
    }

    toast({
      title: "Удалено",
      description: "Обои удалены из вашей галереи."
    });
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Настройки сохранены ✨",
        description: "Все параметры успешно обновлены."
      });
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen page-root flex items-center justify-center bg-transparent text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#A86C78]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ВЕРХНИЙ БАННЕР */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                <motion.div
                  key="studio-slide"
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
                  style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                      КОНФИГУРАЦИЯ СТУДИИ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white truncate mt-0.5">
                      {studioName}
                    </h2>
                  </div>

                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white/80">
                      {branches.length} ФИЛИАЛА • 3 ЗАЛА АКТИВНЫ
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Основной профиль
                    </span>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      Смахните для доступов →
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="roles-slide"
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
                  style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                      БЕЗОПАСНОСТЬ & ПРАВА
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white mt-0.5">
                      Роли и доступы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono leading-none">
                      Owner & Admin
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white">
                      Максимальный уровень
                    </span>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      ← Назад к студии
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => setActiveSlide(0)}
              style={activeSlide === 0 ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Студия"
            >
              <Building2 size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => setActiveSlide(1)}
              style={activeSlide === 1 ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Безопасность"
            >
              <Shield size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ТАБЫ */}
        <div className="bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-full h-12 p-1 flex items-center justify-between w-full shadow-md shrink-0">
          {[
            { id: 'studio', label: 'СТУДИЯ' },
            { id: 'integrations', label: 'СВЯЗЬ & ОФД' },
            { id: 'theme', label: 'ТЕМА & ОБОИ' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={isActive ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
                className={`font-bold text-xs uppercase tracking-wider rounded-full px-3 transition-all border-none outline-none cursor-pointer flex-1 text-center h-full flex items-center justify-center ${
                  isActive
                    ? 'shadow-sm font-black'
                    : 'bg-transparent text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ТЕМА И КАСТОМНАЯ ГАЛЕРЕЯ */}
        <AnimatePresence mode="wait">
          {activeTab === 'theme' && (
            <motion.div
              key="theme-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              {/* ПЕРЕКЛЮЧАТЕЛЬ СВЕТЛАЯ / ТЕМНАЯ */}
              <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-md space-y-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                  ТЕМА ОФОРМЛЕНИЯ ИНТЕРФЕЙСА
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    style={theme === 'light' ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
                    className={`h-14 rounded-[22px] border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-transparent shadow-sm'
                        : 'bg-black/5 dark:bg-zinc-900/60 border-transparent text-slate-700 dark:text-zinc-400'
                    }`}
                  >
                    <Sparkles size={16} />
                    Светлая тема
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    style={theme === 'dark' ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
                    className={`h-14 rounded-[22px] border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-transparent shadow-sm'
                        : 'bg-black/5 dark:bg-zinc-900/60 border-transparent text-slate-700 dark:text-zinc-400'
                    }`}
                  >
                    <Moon size={16} />
                    Темная тема
                  </button>
                </div>
              </div>

              {/* МОЯ ГАЛЕРЕЯ ОБОЕВ (4-6 СЛОТОВ) */}
              <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                      МОЯ КОЛЛЕКЦИЯ ОБОЕВ ({wallpapers.length}/6)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Загружайте до 6 любимых артов и меняйте в 1 клик
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectDefault}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A86C78] hover:opacity-80 transition-opacity bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full cursor-pointer border-none"
                  >
                    <RefreshCw size={12} />
                    Сброс
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Стандартный слот */}
                  <button
                    type="button"
                    onClick={handleSelectDefault}
                    className={`group relative h-28 rounded-[24px] overflow-hidden border-2 transition-all text-left flex flex-col justify-end p-3 cursor-pointer shadow-xs ${
                      selectedBgId === 'default' ? 'border-[#A86C78] scale-[1.02] shadow-md' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 transition-transform group-hover:scale-105 duration-300"
                      style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[100px]">
                        Стандарт (Mesh)
                      </span>
                      {selectedBgId === 'default' && (
                        <div className="w-5 h-5 rounded-full bg-[#A86C78] text-white flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Пользовательские загруженные обои */}
                  {wallpapers.map((wp) => {
                    const isSelected = selectedBgId === wp.id;

                    return (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => handleSelectWallpaper(wp)}
                        className={`group relative h-28 rounded-[24px] overflow-hidden border-2 transition-all text-left flex flex-col justify-end p-3 cursor-pointer shadow-xs ${
                          isSelected ? 'border-[#A86C78] scale-[1.02] shadow-md' : 'border-transparent hover:border-white/20'
                        }`}
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-300"
                          style={{ backgroundImage: `url(${wp.dataUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Кнопка удаления слота */}
                        <div
                          onClick={(e) => handleDeleteWallpaper(e, wp.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors z-20"
                          title="Удалить из галереи"
                        >
                          <Trash2 size={12} />
                        </div>

                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[90px]">
                            {wp.name}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#A86C78] text-white flex items-center justify-center shrink-0">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Слот добавления нового фото (если меньше 6) */}
                  {wallpapers.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-28 rounded-[24px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      <Plus size={22} className="text-[#A86C78]" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Добавить арт
                      </span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleUploadWallpaper}
                  className="hidden"
                />
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
                className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
              >
                {isSaving ? "Сохранение..." : "Сохранить настройки"}
              </Button>
            </motion.div>
          )}

          {activeTab === 'studio' && (
            <motion.div
              key="studio-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                    Название студии
                  </label>
                  <Input
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-sm font-bold px-4"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                    Филиалы и залы
                  </label>
                  
                  <div className="space-y-2">
                    {branches.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-black/30 border border-zinc-800 flex flex-col gap-1.5">
                        <span className="font-bold text-sm text-white">{b.name}</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin size={12} className="text-[#A86C78]" /> {b.address}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {b.halls.map((h) => (
                            <span key={h} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
                className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
              >
                Сохранить филиалы
              </Button>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div
              key="integrations-content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-md space-y-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                  Кассовый шлюз и ОФД (ФЗ-54)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Провайдер</label>
                    <select
                      value="atol"
                      onChange={() => {}}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white"
                    >
                      <option value="atol">Атол Онлайн</option>
                      <option value="orange">Orange Data</option>
                      <option value="cloud">CloudKassir</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">ИНН студии</label>
                    <Input
                      value="7812938491"
                      onChange={() => {}}
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-xs font-bold px-4"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
                className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
              >
                Сохранить интеграции
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <BottomNav />
    </div>
  );
}