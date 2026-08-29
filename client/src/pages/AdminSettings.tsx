import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings, 
  Building2, 
  Palette, 
  ShieldCheck, 
  SlidersHorizontal, 
  Save, 
  Check, 
  MapPin, 
  Clock, 
  Sparkles,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // 0 - Общие / Студия, 1 - Безопасность / Доступы
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'security'>('general');

  // Данные настроек студии
  const [studioConfig, setStudioConfig] = useState({
    name: 'AKADEMIKA DANCE CENTER',
    phone: '+7 (911) 234-56-78',
    address: 'Санкт-Петербург, Невский пр-т, 100',
    workHours: '09:00 - 22:00',
    tgBotToken: '••••••••••••••••••••••••',
    smsApiKey: '••••••••••••••••',
    autoReminders: true,
    ofdFiscalization: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Настройки сохранены ✨",
      description: "Все параметры студии успешно обновлены в системе."
    });
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: С баннером и боковой пилюлей ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер-слайдер с симметричным скруглением [42px] */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* СЛАЙД 1: Студия и филиалы */
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
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing select-none border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                      КОНФИГУРАЦИЯ СТУДИИ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white mt-0.5">
                      Настройки
                    </h2>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-black text-white truncate max-w-[240px]">
                      {studioConfig.name}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                      2 филиала • 3 зала активны
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Основной профиль
                    </span>
                    <span className="text-[10px] font-bold text-white/70 uppercase">
                      Смахните для доступов →
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 2: Безопасность и роли */
                <motion.div
                  key="security-slide"
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
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing select-none border-none"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                      БЕЗОПАСНОСТЬ & ПРАВА
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white mt-0.5">
                      Доступы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      3
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                      уровня прав<br/>(Владелец / Админ / Тренер)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Шифрование активно
                    </span>
                    <span className="text-[10px] font-bold text-white/70 uppercase">
                      ← Смахните назад
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => { setActiveSlide(0); setActiveTab('general'); }}
              style={activeSlide === 0 ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Параметры студии"
            >
              <Building2 size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setActiveSlide(1); setActiveTab('security'); }}
              style={activeSlide === 1 ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Безопасность"
            >
              <ShieldCheck size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВНУТРЕННИЕ ТАБЫ (ПИЛЮЛЯ) ─── */}
        <div className="bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-full h-12 p-1 flex items-center justify-between w-full shadow-md shrink-0 select-none">
          {[
            { id: 'general', label: 'СТУДИЯ' },
            { id: 'integrations', label: 'СВЯЗЬ & ОФД' },
            { id: 'security', label: 'ТЕМА & ДОСТУП' }
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
                    ? 'shadow-sm'
                    : 'bg-transparent text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── КОНТЕНТ НАСТРОЕК (ФОРМА В СТЕКЛЯННЫХ КАРТОЧКАХ) ─── */}
        <form onSubmit={handleSave} className="flex flex-col gap-2.5">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2.5"
              >
                <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 shadow-md flex flex-col gap-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                      Название танцевального центра
                    </label>
                    <Input
                      value={studioConfig.name}
                      onChange={(e) => setStudioConfig({ ...studioConfig, name: e.target.value })}
                      className="rounded-2xl border-zinc-800/20 dark:border-zinc-800 h-12 bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white text-sm font-bold px-4 focus-visible:border-[#A86C78]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                        Телефон студии
                      </label>
                      <Input
                        value={studioConfig.phone}
                        onChange={(e) => setStudioConfig({ ...studioConfig, phone: e.target.value })}
                        className="rounded-2xl border-zinc-800/20 dark:border-zinc-800 h-12 bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white text-xs font-bold px-4 focus-visible:border-[#A86C78]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                        Часы работы
                      </label>
                      <Input
                        value={studioConfig.workHours}
                        onChange={(e) => setStudioConfig({ ...studioConfig, workHours: e.target.value })}
                        className="rounded-2xl border-zinc-800/20 dark:border-zinc-800 h-12 bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white text-xs font-bold px-4 focus-visible:border-[#A86C78]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                      Юридический адрес
                    </label>
                    <Input
                      value={studioConfig.address}
                      onChange={(e) => setStudioConfig({ ...studioConfig, address: e.target.value })}
                      className="rounded-2xl border-zinc-800/20 dark:border-zinc-800 h-12 bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white text-xs font-medium px-4 focus-visible:border-[#A86C78]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                key="integrations-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2.5"
              >
                <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 shadow-md flex flex-col gap-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                      Telegram Bot Token
                    </label>
                    <Input
                      value={studioConfig.tgBotToken}
                      onChange={(e) => setStudioConfig({ ...studioConfig, tgBotToken: e.target.value })}
                      className="rounded-2xl border-zinc-800/20 dark:border-zinc-800 h-12 bg-white/60 dark:bg-black/40 text-slate-950 dark:text-white text-xs font-mono px-4 focus-visible:border-[#A86C78]"
                    />
                  </div>

                  <div 
                    onClick={() => setStudioConfig({ ...studioConfig, autoReminders: !studioConfig.autoReminders })}
                    className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-950 dark:text-white">Авто-напоминания об уроках</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">Отправка за 2 часа до начала занятия</span>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${studioConfig.autoReminders ? 'bg-[#A86C78]' : 'bg-zinc-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${studioConfig.autoReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div 
                    onClick={() => setStudioConfig({ ...studioConfig, ofdFiscalization: !studioConfig.ofdFiscalization })}
                    className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-950 dark:text-white">Фискализация в ОФД (ФЗ-54)</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">Автоматическая печать чеков при оплате</span>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${studioConfig.ofdFiscalization ? 'bg-[#A86C78]' : 'bg-zinc-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${studioConfig.ofdFiscalization ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2.5"
              >
                <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 shadow-md flex flex-col gap-3 text-left">
                  <span className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-1">
                    Тема оформления интерфейса
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      style={theme === 'light' ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer ${
                        theme === 'light'
                          ? 'border-transparent shadow-sm'
                          : 'bg-white/60 dark:bg-black/30 border-black/5 dark:border-white/10 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <Sparkles size={16} /> Светлая тема
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      style={theme === 'dark' ? { backgroundColor: '#A86C78', color: '#FFFFFF' } : {}}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer ${
                        theme === 'dark'
                          ? 'border-transparent shadow-sm'
                          : 'bg-white/60 dark:bg-black/30 border-black/5 dark:border-white/10 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <Lock size={16} /> Темная тема
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            style={{ backgroundColor: '#A86C78', color: '#FFFFFF' }}
            className="w-full h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer mt-1"
          >
            <Save size={16} className="mr-1.5" />
            Сохранить настройки
          </Button>
        </form>

      </div>

      <BottomNav />
    </div>
  );
}