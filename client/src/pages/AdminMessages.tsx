import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  MessageSquare, 
  Send, 
  Search, 
  SlidersHorizontal, 
  User, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  Phone, 
  Filter, 
  Bot,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Input } from "@/components/ui/input";

// Моковые диалоги с этапами воронки (stage)
const MOCK_MESSAGES = [
  {
    id: '1',
    name: 'Алина Соколова',
    avatar: 'А',
    channel: 'tg',
    type: 'lead',
    stage: 'Новый лид',
    lastMessage: 'Здравствуйте! Подскажите, есть ли места на High Heels в четверг?',
    time: '13:45',
    unread: true,
    phone: '+7 (911) 234-56-78'
  },
  {
    id: '2',
    name: 'Екатерина Иванова',
    avatar: 'Е',
    channel: 'wa',
    type: 'client',
    stage: 'Оплата',
    lastMessage: 'Перевела оплату за абонемент на 8 занятий. Проверьте, пожалуйста!',
    time: '12:20',
    unread: true,
    phone: '+7 (921) 987-65-43'
  },
  {
    id: '3',
    name: 'Максим Громов',
    avatar: 'М',
    channel: 'tg',
    type: 'lead',
    stage: 'Думает',
    lastMessage: 'Хочу записать ребенка (6 лет) на пробное по брейкдансу.',
    time: 'Вчера',
    unread: false,
    phone: '+7 (905) 555-44-33'
  },
  {
    id: '4',
    name: 'Анна Кузнецова',
    avatar: 'А',
    channel: 'wa',
    type: 'client',
    stage: 'Ученик',
    lastMessage: 'Спасибо за занятие, было супер!',
    time: '16 авг',
    unread: false,
    phone: '+7 (912) 111-22-33'
  }
];

export default function AdminMessages() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const { toast } = useToast();

  // 0 - Все, 1 - Лиды, 2 - Действующие ученики
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const displayedChats = MOCK_MESSAGES.filter((msg) => {
    if (activeSlide === 1 && msg.type !== 'lead') return false;
    if (activeSlide === 2 && msg.type !== 'client') return false;
    if (search.trim()) {
      const matchName = msg.name.toLowerCase().includes(search.toLowerCase());
      const matchText = msg.lastMessage.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchText) return false;
    }
    return true;
  });

  const unreadCount = MOCK_MESSAGES.filter(m => m.unread).length;
  const leadsCount = MOCK_MESSAGES.filter(m => m.type === 'lead').length;
  const clientsCount = MOCK_MESSAGES.filter(m => m.type === 'client').length;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast({
      title: "Ответ отправлен",
      description: `Сообщение отправлено для ${selectedChat.name} в ${selectedChat.channel === 'tg' ? 'Telegram' : 'WhatsApp'}.`
    });
    setReplyText('');
    setSelectedChat(null);
  };

  const handleGenerateAiResponse = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      if (selectedChat?.type === 'lead') {
        setReplyText(
          `Здравствуйте, ${selectedChat.name}! Да, места в вечернюю группу открыты 👠 Пробное занятие стоит 500 ₽. Удобно записаться на этот четверг в 19:00?`
        );
      } else {
        setReplyText(
          `Спасибо, ${selectedChat.name}! Платеж зафиксирован, абонемент активен в вашем личном кабинете ✨ До встречи на тренировке!`
        );
      }
      toast({
        title: "AI подготовил ответ ✨",
        description: "Текст вставлен в поле ответа. Можно отредактировать перед отправкой."
      });
    }, 450);
  };

  const searchInputStyle: React.CSSProperties = {
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(24, 24, 28, 0.85)',
    borderRadius: '9999px'
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: СТАТИЧНЫЙ БАННЕР В ЦВЕТАХ AESTHETIC ─── */}
        <div 
          style={{ backgroundColor: '#262B2B', color: '#E6CCB2' }}
          className="relative min-h-[184px] h-[184px] w-full select-none z-30 p-5 rounded-[42px] shadow-md flex flex-col justify-between border-none overflow-visible"
        >
          {/* Анимируемая область: Все ↔ Лиды ↔ Ученики */}
          <div className="relative flex-1 flex flex-col justify-between pr-[68px] pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              {activeSlide === 0 ? (
                /* СЛАЙД 0: ВСЕ СООБЩЕНИЯ */
                <motion.div
                  key="content-all-chats"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#E6CCB2]/70">
                      ВСЕ СООБЩЕНИЯ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#E6CCB2] mt-0.5 truncate">
                      Диалоги
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#E6CCB2] font-mono tracking-tight leading-none">
                      {unreadCount}
                    </span>
                    <span className="text-[10px] font-bold text-[#E6CCB2]/80 uppercase tracking-wide leading-tight">
                      новых<br/>входящих
                    </span>
                  </div>
                </motion.div>
              ) : activeSlide === 1 ? (
                /* СЛАЙД 1: ЛИДЫ И ЗАЯВКИ */
                <motion.div
                  key="content-leads"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#E6CCB2]/70">
                      ВОРОНКА ПРОДАЖ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#E6CCB2] mt-0.5 truncate">
                      Лиды и заявки
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#E6CCB2] font-mono tracking-tight leading-none">
                      {leadsCount}
                    </span>
                    <span className="text-[10px] font-bold text-[#E6CCB2]/80 uppercase tracking-wide leading-tight">
                      диалога<br/>с новыми
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 2: УЧЕНИКИ */
                <motion.div
                  key="content-clients"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#E6CCB2]/70">
                      ДЕЙСТВУЮЩАЯ БАЗА
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#E6CCB2] mt-0.5 truncate">
                      Ученики
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#E6CCB2] font-mono tracking-tight leading-none">
                      {clientsCount}
                    </span>
                    <span className="text-[10px] font-bold text-[#E6CCB2]/80 uppercase tracking-wide leading-tight">
                      диалога<br/>по картам
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Левый нижний бейдж и кнопка поиска */}
          <div className="relative flex items-center justify-between z-[100] pr-[68px]">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#E6CCB2]/20 text-[#E6CCB2] backdrop-blur-sm">
              {activeSlide === 0 ? 'Все каналы связи' : activeSlide === 1 ? 'Потенциальные клиенты' : 'Действующая база'}
            </span>

            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsSearchVisible(prev => !prev); 
              }} 
              style={isSearchVisible ? { backgroundColor: '#E6CCB2', color: '#262B2B' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                isSearchVisible 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-[#E6CCB2]/80 hover:text-[#E6CCB2] opacity-80 hover:opacity-100'
              }`}
              title="Поиск"
            >
              <Search size={20} className="stroke-[2.5]" />
            </button>
          </div>

          {/* 
            ПРАВАЯ КОЛОНКА ПАРЯЩИХ КНОПОК:
            - top-5, bottom-5, right-5
            - активная кнопка подсвечивается контрастным кружком #E6CCB2 / #262B2B
          */}
          <div className="absolute right-5 top-5 bottom-5 flex flex-col justify-between items-center z-[200] pointer-events-auto">
            {/* 1. Верх: Все диалоги */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(0)}
              style={activeSlide === 0 ? { backgroundColor: '#E6CCB2', color: '#262B2B' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Все сообщения"
            >
              <MessageSquare size={20} className="stroke-[2.5]" />
            </button>
            
            {/* 2. Середина: Заявки */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(1)}
              style={activeSlide === 1 ? { backgroundColor: '#E6CCB2', color: '#262B2B' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Заявки"
            >
              <Sparkles size={19} className="stroke-[2.5]" />
            </button>

            {/* 3. Низ: Ученики */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(2)}
              style={activeSlide === 2 ? { backgroundColor: '#E6CCB2', color: '#262B2B' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 2 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-white/70 hover:text-white opacity-80 hover:opacity-100'
              }`}
              title="Ученики"
            >
              <User size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩАЯ СТРОКА ПОИСКА ─── */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="z-20 relative overflow-visible"
            >
              <div 
                style={searchInputStyle} 
                className="w-full h-14 flex items-center gap-3 px-5 shadow-md border border-white/10"
              >
                <Search size={20} className="text-slate-500 dark:text-zinc-400 stroke-[2.5] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по имени или тексту сообщения..."
                  className="flex-1 h-full bg-transparent text-sm font-bold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none border-none p-0 m-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── СПИСОК ДИАЛОГОВ ─── */}
        <div className="flex flex-col gap-2.5">
          {displayedChats.length > 0 ? (
            displayedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md transition cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 group text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-[70px] h-[70px] rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white select-none shadow-xs">
                    {chat.avatar}
                  </div>
                  <span className={`absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-white dark:border-[#161618] ${
                    chat.channel === 'tg' ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}>
                    {chat.channel === 'tg' ? 'TG' : 'WA'}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-[#262B2B] dark:group-hover:text-[#E6CCB2]">
                        {chat.name}
                      </h4>
                      <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300 uppercase tracking-wider shrink-0">
                        {chat.stage}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 ml-1 shrink-0 font-mono">
                      {chat.time}
                    </span>
                  </div>
                  
                  <p className={`text-xs truncate ${chat.unread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 font-medium'}`}>
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unread && (
                  <div 
                    style={{ backgroundColor: '#262B2B' }}
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs dark:!bg-[#E6CCB2]" 
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">
              Диалогов не найдено
            </div>
          )}
        </div>

      </div>

      {/* ─── ШТОРКА: ДИАЛОГ И БЫСТРЫЙ AI-ОТВЕТ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedChat && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChat(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t border-x border-zinc-800 rounded-t-[42px] p-6 pt-7 pb-8 shadow-2xl flex flex-col text-white max-h-[88dvh]"
            >
              <button
                onClick={() => setSelectedChat(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 pr-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-white">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{selectedChat.name}</h3>
                      <span 
                        style={{ backgroundColor: 'rgba(230, 204, 178, 0.2)', color: '#E6CCB2' }}
                        className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                      >
                        {selectedChat.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{selectedChat.phone}</p>
                  </div>
                </div>

                <a
                  href={`tel:${selectedChat.phone}`}
                  style={{ backgroundColor: 'rgba(230, 204, 178, 0.2)', color: '#E6CCB2' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors shadow-xs"
                >
                  <Phone size={18} />
                </a>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-3 pb-4 space-y-3">
                <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-zinc-800 text-xs text-zinc-200 leading-relaxed">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block mb-1">
                    Входящее ({selectedChat.channel.toUpperCase()}):
                  </span>
                  {selectedChat.lastMessage}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiResponse}
                  disabled={isAiGenerating}
                  className="w-full h-11 rounded-full bg-white/10 hover:bg-white/15 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10 text-white disabled:opacity-50"
                >
                  <Sparkles size={15} className={isAiGenerating ? 'animate-spin text-[#E6CCB2]' : 'text-[#E6CCB2]'} />
                  {isAiGenerating ? 'AI думает...' : 'Сгенерировать AI-ответ'}
                </button>

                <form onSubmit={handleSendReply} className="space-y-3 pt-1">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Напишите ответ или используйте AI-подсказку..."
                    className="w-full rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#E6CCB2] bg-black/40 border border-zinc-800 text-white resize-none"
                  />

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedChat(null)}
                      className="flex-1 h-14 rounded-full border border-zinc-800 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Закрыть
                    </button>

                    <button
                      type="submit"
                      style={{ backgroundColor: '#262B2B', color: '#E6CCB2' }}
                      className="flex-1 h-14 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all cursor-pointer border border-[#E6CCB2]/30"
                    >
                      <Send size={16} />
                      Отправить
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}