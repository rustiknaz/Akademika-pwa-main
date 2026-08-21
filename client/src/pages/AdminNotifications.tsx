import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Send, 
  Bot, 
  MessageSquare, 
  Save, 
  QrCode, 
  Smartphone, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap,
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function AdminNotifications() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  // 0 - Каналы, 1 - Рассылка, 2 - Триггеры
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // --- БЛОК 1: Каналы ---
  const [tgToken, setTgToken] = useState('7812938491:AAH_x98kL2mP01n9vXzR_qW8kL9s2t1uV4w');
  const [isTgConnected, setIsTgConnected] = useState(true);
  const [showTgToken, setShowTgToken] = useState(false);
  const [isTgTesting, setIsTgTesting] = useState(false);

  const [waApiKey, setWaApiKey] = useState('wa_live_9928340192830192');
  const [isWaConnected, setIsWaConnected] = useState(true);
  const [isWaTesting, setIsWaTesting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // --- БЛОК 2: Ручная рассылка ---
  const [audience, setAudience] = useState<'all' | 'group' | 'debtors'>('all');
  const [selectedGroup, setSelectedGroup] = useState('High Heels (Beginners)');
  const [broadcastChannel, setBroadcastChannel] = useState<'all' | 'tg' | 'wa'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // --- БЛОК 3: Авто-триггеры ---
  const [t1Enabled, setT1Enabled] = useState(true);
  const [t1Timing, setT1Timing] = useState<'24h' | '2h' | '1h'>('24h');
  const [t1Template, setT1Template] = useState(
    'Здравствуйте! Напоминаем, что завтра в {время} состоится занятие по {направление}. Зал: {зал}.'
  );

  const [t2Enabled, setT2Enabled] = useState(true);
  const [t2Condition, setT2Condition] = useState<'1lesson' | '3days'>('1lesson');
  const [t2Template, setT2Template] = useState(
    'Добрый день! У {имя_ребенка} закончился абонемент ({группа}). Ссылка на продление: {ссылка_оплаты}.'
  );

  const [t3Enabled, setT3Enabled] = useState(true);
  const [t3Template, setT3Template] = useState(
    'Внимание! Занятие по {направление} ({время}) перенесено/отменено. Детали в личном кабинете.'
  );

  const [isSavingTriggers, setIsSavingTriggers] = useState(false);

  const groupsList = [
    'High Heels (Beginners)',
    'High Heels (Pro)',
    'Twerk & Female Dancehall',
    'K-Pop Cover Dance',
    'Jazz Funk Pro',
    'Stretching & Body Make'
  ];

  const handleTestTg = () => {
    setIsTgTesting(true);
    setTimeout(() => {
      setIsTgTesting(false);
      toast({
        title: "Тест Telegram успешен! 🚀",
        description: "Тестовое сообщение отправлено в бот @urbanglass_dance_bot."
      });
    }, 800);
  };

  const handleTestWa = () => {
    setIsWaTesting(true);
    setTimeout(() => {
      setIsWaTesting(false);
      toast({
        title: "Тест WhatsApp успешен! 💬",
        description: "Шлюз WhatsApp Business API работает стабильно."
      });
    }, 800);
  };

  const handleSaveTriggers = () => {
    setIsSavingTriggers(true);
    setTimeout(() => {
      setIsSavingTriggers(false);
      toast({
        title: "Триггеры сохранены!",
        description: "Все шаблоны и условия автоматических рассылок обновлены."
      });
    }, 600);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      toast({
        title: "Введите текст сообщения",
        description: "Поле текста рассылки не может быть пустым.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingBroadcast(true);

    setTimeout(() => {
      setIsSendingBroadcast(false);
      const recipientCount = audience === 'all' ? 184 : audience === 'debtors' ? 12 : 24;
      toast({
        title: "Рассылка отправлена! 🎉",
        description: `Сообщение доставлено ${recipientCount} адресатам (${broadcastChannel === 'tg' ? 'Telegram' : broadcastChannel === 'wa' ? 'WhatsApp' : 'TG + WA'}).`
      });
      setBroadcastMessage('');
    }, 1200);
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Матовый слайдер, уходящий наверх + Пилюля ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом (уходит за верхний край экрана) */}
          <div className="flex-1 relative h-[calc(100%+12px)] -mt-3">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* СЛАЙД 1: КАНАЛЫ */
                <motion.div
                  key="channels-slide"
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Каналы связи
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      {(isTgConnected ? 1 : 0) + (isWaConnected ? 1 : 0)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      активных<br/>канала
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300 backdrop-blur-sm">
                      Telegram • WhatsApp
                    </span>
                  </div>
                </motion.div>
              ) : activeSlide === 1 ? (
                /* СЛАЙД 2: РАССЫЛКА */
                <motion.div
                  key="broadcast-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 40) setActiveSlide(0);
                    else if (info.offset.x < -40) setActiveSlide(2);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Рассылка
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      184
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      получателя<br/>в базе
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                      Мгновенная отправка
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 3: ТРИГГЕРЫ */
                <motion.div
                  key="triggers-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 40) setActiveSlide(1);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Авто-триггеры
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      {(t1Enabled ? 1 : 0) + (t2Enabled ? 1 : 0) + (t3Enabled ? 1 : 0)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      активных<br/>правила
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                      Сервисные уведомления
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-[#161618]/90 border border-black/5 dark:border-white/10 rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-sm shrink-0 backdrop-blur-md">
            <button 
              onClick={() => setActiveSlide(0)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Каналы"
            >
              <Bot size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => setActiveSlide(1)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Рассылка"
            >
              <Send size={19} className="stroke-[2.5]" />
            </button>

            <button 
              onClick={() => setActiveSlide(2)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 2 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Триггеры"
            >
              <Zap size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ТЕЛО СТРАНИЦЫ С ЕДИНЫМ GAP-2.5 ─── */}
        {activeSlide === 0 ? (
          /* ════════════════════════════════════════════════════
              СЕКЦИЯ 1: ПОДКЛЮЧЕНИЕ КАНАЛОВ
             ════════════════════════════════════════════════════ */
          <div className="flex flex-col gap-2.5">
            {/* TELEGRAM BOT */}
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm shrink-0">
                    TG
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-950 dark:text-white leading-tight">Telegram Bot</h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">@urbanglass_dance_bot</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTgConnected(!isTgConnected)}
                  className={`text-[11px] font-bold uppercase px-3.5 py-1.5 rounded-full border cursor-pointer transition-all tracking-wider ${
                    isTgConnected
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isTgConnected ? '● Подключен' : '○ Отключен'}
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Bot API Token
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showTgToken ? "text" : "password"}
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="Введите API Token ботa"
                    className="w-full h-12 rounded-2xl pl-4 pr-12 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                  <button
                    onClick={() => setShowTgToken(!showTgToken)}
                    className="absolute right-3 p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={showTgToken ? "Скрыть" : "Показать"}
                  >
                    {showTgToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleTestTg}
                    disabled={isTgTesting}
                    className="h-10 px-4 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isTgTesting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                    Проверить связь
                  </button>
                </div>
              </div>
            </div>

            {/* WHATSAPP BUSINESS */}
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                    WA
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-black dark:text-white leading-tight">WhatsApp API</h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">+7 (999) 000-11-22</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWaConnected(!isWaConnected)}
                  className={`text-[11px] font-bold uppercase px-3.5 py-1.5 rounded-full border cursor-pointer transition-all tracking-wider ${
                    isWaConnected
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isWaConnected ? '● Подключен' : '○ Отключен'}
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  placeholder="Ключ шлюза WhatsApp"
                  className="w-full h-12 rounded-2xl px-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="h-10 px-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <QrCode size={14} className="text-[#CCFF00]" />
                    QR-связка
                  </button>

                  <button
                    onClick={handleTestWa}
                    disabled={isWaTesting}
                    className="h-10 px-4 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isWaTesting ? <RefreshCw size={13} className="animate-spin" /> : <MessageSquare size={13} />}
                    Проверить связь
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeSlide === 1 ? (
          /* ════════════════════════════════════════════════════
              СЕКЦИЯ 2: РУЧНАЯ РАССЫЛКА
             ════════════════════════════════════════════════════ */
          <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
            {/* АУДИТОРИЯ */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                1. Адресаты рассылки
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Вся студия', count: '184 чел.' },
                  { id: 'group', label: 'Группа', count: 'по списку' },
                  { id: 'debtors', label: 'Должники', count: '12 чел.' }
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setAudience(aud.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      audience === aud.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-sm font-bold'
                        : 'bg-black/5 dark:bg-zinc-900 border-transparent text-slate-800 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{aud.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${audience === aud.id ? 'text-black/80 font-bold' : 'text-zinc-400'}`}>
                      {aud.count}
                    </span>
                  </button>
                ))}
              </div>

              {audience === 'group' && (
                <div className="mt-3">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full h-11 rounded-2xl px-3.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                  >
                    {groupsList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* КАНАЛ ОТПРАВКИ */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                2. Канал отправки
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Все каналы' },
                  { id: 'tg', label: 'Telegram' },
                  { id: 'wa', label: 'WhatsApp' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setBroadcastChannel(ch.id as any)}
                    className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      broadcastChannel === ch.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                        : 'bg-black/5 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-transparent'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ТЕКСТ СООБЩЕНИЯ */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                3. Текст рассылки
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Введите новость, анонс мастер-класса или важное объявление..."
                className="w-full rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400"
              />
            </div>

            {/* КНОПКА ОТПРАВКИ */}
            <button
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast}
              style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
              className="w-full h-14 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer border-none disabled:opacity-50"
            >
              {isSendingBroadcast ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Отправить сообщение
                </>
              )}
            </button>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════
              СЕКЦИЯ 3: АВТО-ТРИГГЕРЫ
             ════════════════════════════════════════════════════ */
          <div className="flex flex-col gap-2.5">
            {/* Кнопка быстрого сохранения */}
            <div className="flex justify-end pb-1">
              <button
                onClick={handleSaveTriggers}
                disabled={isSavingTriggers}
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="h-10 px-5 font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-all border-none"
              >
                {isSavingTriggers ? <RefreshCw size={13} className="animate-spin" /> : <Save size={14} />}
                Сохранить правила
              </button>
            </div>

            {/* TRIGGER 1 */}
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#CCFF00]/15 text-slate-950 dark:text-[#CCFF00] flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <span className="text-sm font-bold text-black dark:text-white">Напоминание о занятии</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={t1Enabled}
                    onChange={(e) => setT1Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t1Enabled && (
                <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex gap-2">
                    {[
                      { id: '24h', label: 'За 24 часа' },
                      { id: '2h', label: 'За 2 часа' },
                      { id: '1h', label: 'За 1 час' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setT1Timing(t.id as any)}
                        className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                          t1Timing === t.id
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                            : 'bg-black/5 dark:bg-zinc-900 text-zinc-400 border-transparent'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={t1Template}
                    onChange={(e) => setT1Template(e.target.value)}
                    className="w-full rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* TRIGGER 2 */}
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <span className="text-sm font-bold text-black dark:text-white">Окончание абонемента</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={t2Enabled}
                    onChange={(e) => setT2Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t2Enabled && (
                <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex gap-2">
                    {[
                      { id: '1lesson', label: 'Осталось 1 занятие' },
                      { id: '3days', label: 'За 3 дня до конца' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setT2Condition(c.id as any)}
                        className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                          t2Condition === c.id
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                            : 'bg-black/5 dark:bg-zinc-900 text-zinc-400 border-transparent'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={t2Template}
                    onChange={(e) => setT2Template(e.target.value)}
                    className="w-full rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* TRIGGER 3 */}
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-sm font-bold text-black dark:text-white">Отмена / Перенос урока</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={t3Enabled}
                    onChange={(e) => setT3Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t3Enabled && (
                <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <textarea
                    rows={2}
                    value={t3Template}
                    onChange={(e) => setT3Template(e.target.value)}
                    className="w-full rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ─── QR CODE MODAL ─── */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm p-6 rounded-[28px] border shadow-2xl backdrop-blur-xl bg-[#18181b] border-zinc-800 text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold uppercase flex items-center gap-2">
                  <Smartphone size={18} className="text-emerald-400" />
                  WhatsApp QR-Связка
                </h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-400 mb-4 text-center">
                Откройте WhatsApp на телефоне ➔ Связанные устройства ➔ Привязать устройство
              </p>

              <div className="p-4 bg-white rounded-[20px] flex items-center justify-center border border-zinc-300 mx-auto w-48 h-48 shadow-inner mb-4">
                <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between items-center bg-white relative">
                  <div className="flex justify-between w-full">
                    <div className="w-10 h-10 bg-black border-2 border-white" />
                    <div className="w-10 h-10 bg-black border-2 border-white" />
                  </div>
                  <div className="my-auto font-mono text-xs font-bold text-black text-center tracking-widest">
                    UG-DANCE-WA
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-10 h-10 bg-black border-2 border-white" />
                    <div className="w-4 h-4 bg-black" />
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-emerald-400 text-center mb-5 flex items-center justify-center gap-1.5 tracking-wide">
                <ShieldCheck size={14} />
                Шлюз активен: +7 (999) 000-11-22
              </p>

              <button
                onClick={() => {
                  setShowQrModal(false);
                  toast({
                    title: "Сессия обновлена!",
                    description: "WhatsApp шлюз успешно привязан."
                  });
                }}
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full h-11 font-black uppercase text-xs rounded-full shadow-md hover:opacity-90 transition-all cursor-pointer border-none"
              >
                Готово
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}