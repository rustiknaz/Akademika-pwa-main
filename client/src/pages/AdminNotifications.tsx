import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Send, 
  Bell, 
  Bot, 
  MessageSquare, 
  CheckCircle2, 
  Save, 
  QrCode, 
  Smartphone, 
  Sparkles, 
  Users, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  Zap
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

  // --- BLOCK A STATES: Channels ---
  const [tgToken, setTgToken] = useState('7812938491:AAH_x98kL2mP01n9vXzR_qW8kL9s2t1uV4w');
  const [isTgConnected, setIsTgConnected] = useState(true);
  const [showTgToken, setShowTgToken] = useState(false);
  const [isTgTesting, setIsTgTesting] = useState(false);

  const [waApiKey, setWaApiKey] = useState('wa_live_9928340192830192');
  const [isWaConnected, setIsWaConnected] = useState(true);
  const [isWaTesting, setIsWaTesting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // --- BLOCK B STATES: Auto-Triggers ---
  // Trigger 1: Lesson Reminder
  const [t1Enabled, setT1Enabled] = useState(true);
  const [t1Timing, setT1Timing] = useState<'24h' | '2h' | '1h'>('24h');
  const [t1Template, setT1Template] = useState(
    'Здравствуйте! Напоминаем, что завтра в {время} состоится занятие по {направление}. Зал: {зал}.'
  );

  // Trigger 2: Pass Expiration
  const [t2Enabled, setT2Enabled] = useState(true);
  const [t2Condition, setT2Condition] = useState<'1lesson' | '3days'>('1lesson');
  const [t2Template, setT2Template] = useState(
    'Добрый день! У {имя_ребенка} закончился абонемент ({группа}). Ссылка на продление: {ссылка_оплаты}.'
  );

  // Trigger 3: Cancellation / Reschedule
  const [t3Enabled, setT3Enabled] = useState(true);
  const [t3Template, setT3Template] = useState(
    'Внимание! Занятие по {направление} ({время}) перенесено/отменено. Детали в личном кабинете.'
  );

  const [isSavingTriggers, setIsSavingTriggers] = useState(false);

  // --- BLOCK C STATES: Manual Broadcast ---
  const [audience, setAudience] = useState<'all' | 'group' | 'debtors'>('all');
  const [selectedGroup, setSelectedGroup] = useState('High Heels (Beginners)');
  const [broadcastChannel, setBroadcastChannel] = useState<'all' | 'tg' | 'wa'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const groupsList = [
    'High Heels (Beginners)',
    'High Heels (Pro)',
    'Twerk & Female Dancehall',
    'K-Pop Cover Dance',
    'Jazz Funk Pro',
    'Stretching & Body Make'
  ];

  // Action Handlers
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
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col px-4 sm:px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      
      {/* ─── TOP HEADER ─── */}
      <header className="py-3 flex items-center justify-between shrink-0 z-10 border-b border-white/10 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/admin')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-black/5 hover:bg-black/10 text-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold uppercase">Уведомления</h1>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2 Канала
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">Telegram, WhatsApp, авто-триггеры</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: accentColor, color: activeTextColor }}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-md shrink-0"
          >
            <Bell size={18} />
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 pb-28 space-y-5 pr-0.5">

        {/* ════════════════════════════════════════════════════
            BLOCK A: CHANNEL INTEGRATIONS
           ════════════════════════════════════════════════════ */}
        <section className={`
          p-6 rounded-[32px] border backdrop-blur-md transition-colors
          ${theme === 'light'
            ? 'bg-black/5 border-black/10 text-black'
            : 'bg-white/5 border-zinc-800/80 text-white'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">1. Подключение каналов</h2>
                <p className="text-xs text-zinc-400 font-bold tracking-wide">Интеграция с ботами и мессенджерами</p>
              </div>
            </div>

            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 tracking-wide">
              API Active
            </span>
          </div>

          <div className="space-y-4">
            {/* --- TELEGRAM BOT CARD --- */}
            <div className={`
              p-4 rounded-[20px] border transition-colors
              ${theme === 'light'
                ? 'bg-black/5 border-black/10'
                : 'bg-white/5 border-zinc-800/80'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                    TG
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">Telegram Bot</span>
                    <span className="text-[10px] text-zinc-400">@urbanglass_dance_bot</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsTgConnected(!isTgConnected)}
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full border cursor-pointer transition-all tracking-wide${
                    isTgConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isTgConnected ? '● Подключен' : '○ Отключен'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Bot API Token
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showTgToken ? "text" : "password"}
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="Введите API Token ботa"
                    className={`w-full h-11 rounded-[16px] pl-3.5 pr-20 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors ${
                      theme === 'light'
                        ? 'bg-white border border-black/10 text-black'
                        : 'bg-zinc-900 border border-zinc-700 text-white'
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      onClick={() => setShowTgToken(!showTgToken)}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={showTgToken ? "Скрыть" : "Показать"}
                    >
                      {showTgToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleTestTg}
                    disabled={isTgTesting}
                    className="h-9 px-4 rounded-[16px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isTgTesting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    Проверить связь
                  </button>
                </div>
              </div>
            </div>

            {/* --- WHATSAPP BUSINESS CARD --- */}
            <div className={`
              p-4 rounded-[20px] border transition-colors
              ${theme === 'light'
                ? 'bg-black/5 border-black/10'
                : 'bg-white/5 border-zinc-800/80'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">WhatsApp Business API</span>
                    <span className="text-[10px] text-zinc-400">Шлюз +7 (999) 000-11-22</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsWaConnected(!isWaConnected)}
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full border cursor-pointer transition-all tracking-wide${
                    isWaConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isWaConnected ? '● Подключен' : '○ Отключен'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  placeholder="Ключ шлюза WhatsApp"
                  className={`w-full h-11 rounded-[16px] px-3.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors ${
                    theme === 'light'
                      ? 'bg-white border border-black/10 text-black'
                      : 'bg-zinc-900 border border-zinc-700 text-white'
                  }`}
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="h-9 px-3.5 rounded-[16px] bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode size={13} className="text-[#CCFF00]" />
                    QR-код связки
                  </button>

                  <button
                    onClick={handleTestWa}
                    disabled={isWaTesting}
                    className="h-9 px-4 rounded-[16px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isWaTesting ? <RefreshCw size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                    Проверить связь
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            BLOCK B: AUTOMATIC TRIGGERS (AUTO-RULES)
           ════════════════════════════════════════════════════ */}
        <section className={`
          p-6 rounded-[32px] border backdrop-blur-md transition-colors
          ${theme === 'light'
            ? 'bg-black/5 border-black/10 text-black'
            : 'bg-white/5 border-zinc-800/80 text-white'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 flex items-center justify-center shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">2. Автоматические триггеры</h2>
                <p className="text-xs text-zinc-400 font-bold tracking-wide">Сервисные авто-уведомления по событиям</p>
              </div>
            </div>

            <button
              onClick={handleSaveTriggers}
              disabled={isSavingTriggers}
              style={{ backgroundColor: accentColor, color: activeTextColor }}
              className="h-9 px-3.5 font-bold text-xs uppercase rounded-[16px] flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              {isSavingTriggers ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              Сохранить
            </button>
          </div>

          <div className="space-y-4">
            {/* TRIGGER 1: LESSON REMINDER */}
            <div className={`
              p-4 rounded-[20px] border transition-colors
              ${theme === 'light'
                ? 'bg-black/5 border-black/10'
                : 'bg-white/5 border-zinc-800/80'
              }
            `}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#CCFF00]" />
                  <span className="text-xs font-bold uppercase tracking-wide">Напоминание о занятии</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold uppercase text-zinc-400 tracking-wide">
                    {t1Enabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </span>
                  <input
                    type="checkbox"
                    checked={t1Enabled}
                    onChange={(e) => setT1Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t1Enabled && (
                <div className="space-y-3 mt-3 pt-3 border-t border-white/5">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Время отправки
                    </label>
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
                          className={`text-xs font-medium px-3 py-1.5 rounded-[12px] border transition-all cursor-pointer${
                            t1Timing === t.id
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Шаблон сообщения
                    </label>
                    <textarea
                      rows={2}
                      value={t1Template}
                      onChange={(e) => setT1Template(e.target.value)}
                      className={`w-full rounded-[16px] p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none${
                        theme === 'light'
                          ? 'bg-white border border-black/10 text-black'
                          : 'bg-zinc-900 border border-zinc-700 text-white'
                      }`}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      Переменные: {'{время}'}, {'{направление}'}, {'{зал}'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* TRIGGER 2: PASS EXPIRATION */}
            <div className={`
              p-4 rounded-[20px] border transition-colors
              ${theme === 'light'
                ? 'bg-black/5 border-black/10'
                : 'bg-white/5 border-zinc-800/80'
              }
            `}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wide">Окончание абонемента</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold uppercase text-zinc-400 tracking-wide">
                    {t2Enabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </span>
                  <input
                    type="checkbox"
                    checked={t2Enabled}
                    onChange={(e) => setT2Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t2Enabled && (
                <div className="space-y-3 mt-3 pt-3 border-t border-white/5">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Условие срабатывания
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: '1lesson', label: 'Осталось 1 занятие' },
                        { id: '3days', label: 'За 3 дня до конца' }
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setT2Condition(c.id as any)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-[12px] border transition-all cursor-pointer${
                            t2Condition === c.id
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Шаблон сообщения
                    </label>
                    <textarea
                      rows={2}
                      value={t2Template}
                      onChange={(e) => setT2Template(e.target.value)}
                      className={`w-full rounded-[16px] p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none${
                        theme === 'light'
                          ? 'bg-white border border-black/10 text-black'
                          : 'bg-zinc-900 border border-zinc-700 text-white'
                      }`}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      Переменные: {'{имя_ребенка}'}, {'{группа}'}, {'{ссылка_оплаты}'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* TRIGGER 3: CANCELLATION / RESCHEDULE */}
            <div className={`
              p-4 rounded-[20px] border transition-colors
              ${theme === 'light'
                ? 'bg-black/5 border-black/10'
                : 'bg-white/5 border-zinc-800/80'
              }
            `}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wide">Отмена / Перенос урока</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold uppercase text-zinc-400 tracking-wide">
                    {t3Enabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </span>
                  <input
                    type="checkbox"
                    checked={t3Enabled}
                    onChange={(e) => setT3Enabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                </label>
              </div>

              {t3Enabled && (
                <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Шаблон сообщения (при клике «Отменить» в расписании)
                  </label>
                  <textarea
                    rows={2}
                    value={t3Template}
                    onChange={(e) => setT3Template(e.target.value)}
                    className={`w-full rounded-[16px] p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none${
                      theme === 'light'
                        ? 'bg-white border border-black/10 text-black'
                        : 'bg-zinc-900 border border-zinc-700 text-white'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Переменные: {'{направление}'}, {'{время}'}, {'{причина}'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            BLOCK C: MANUAL BROADCAST
           ════════════════════════════════════════════════════ */}
        <section className={`
          p-6 rounded-[32px] border backdrop-blur-md transition-colors
          ${theme === 'light'
            ? 'bg-black/5 border-black/10 text-black'
            : 'bg-white/5 border-zinc-800/80 text-white'
          }
        `}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">3. Ручная разовая рассылка</h2>
              <p className="text-xs text-zinc-400 font-bold tracking-wide">Мгновенная отправка объявлений ученикам</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* AUDIENCE SELECTOR */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                1. Выберите адресатов
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
                    className={`p-2.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                      audience === aud.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-medium shadow-md'
                        : 'bg-zinc-800/60 text-zinc-200 border-zinc-700/60 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-medium block">{aud.label}</span>
                    <span className={`text-xs block opacity-80 ${audience === aud.id ? 'text-black font-bold' : 'text-zinc-400'}`}> tracking-wide
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
                    className={`w-full h-11 rounded-[16px] px-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors cursor-pointer${
                      theme === 'light'
                        ? 'bg-white border border-black/10 text-black'
                        : 'bg-zinc-900 border border-zinc-700 text-white'
                    }`}
                  >
                    {groupsList.map((g) => (
                      <option key={g} value={g} className="bg-zinc-900 text-white">{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* CHANNEL SELECTOR */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                2. Канал отправки
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Все каналы (TG + WA)' },
                  { id: 'tg', label: 'Telegram' },
                  { id: 'wa', label: 'WhatsApp' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setBroadcastChannel(ch.id as any)}
                    className={`text-xs font-medium px-3 py-2 rounded-[12px] border transition-all cursor-pointer${
                      broadcastChannel === ch.id
                        ? 'bg-white text-black border-white shadow-sm'
                        : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MESSAGE TEXTAREA */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                3. Текст рассылки
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Введите важную новость, анонс мастер-класса или напоминание..."
                className={`w-full rounded-[16px] p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors resize-none${
                  theme === 'light'
                    ? 'bg-white border border-black/10 text-black placeholder:text-zinc-400'
                    : 'bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500'
                }`}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast}
              style={{ backgroundColor: accentColor, color: activeTextColor }}
              className="w-full h-14 font-bold text-sm uppercase rounded-[16px] flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
            >
              {isSendingBroadcast ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Отправка рассылки...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Отправить рассылку
                </>
              )}
            </button>
          </div>
        </section>

      </main>

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
              className={`relative z-10 w-full max-w-sm p-6 rounded-[32px] border shadow-2xl backdrop-blur-xl transition-colors ${
                theme === 'light'
                  ? 'bg-white/95 border-black/10 text-black'
                  : 'bg-zinc-900/95 border-zinc-800 text-white'
              }`}
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
                {/* Simulated QR Pattern */}
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
                style={{ backgroundColor: accentColor, color: activeTextColor }}
                className="w-full h-11 font-bold uppercase text-xs rounded-[16px] shadow-md hover:brightness-105 transition-all cursor-pointer border-none"
              >
                Готово
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM NAVIGATION ─── */}
      <BottomNav />
    </div>
  );
}
