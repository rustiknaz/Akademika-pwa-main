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
  Bot 
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
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(18, 18, 20, 0.75)',
    borderRadius: '9999px'
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: С баннером и боковой пилюлей ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Баннер-слайдер с симметричным скруглением [42px] */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                <motion.div
                  key="all-chats-slide"
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
                  style={{ backgroundColor: '#64384B', color: '#FFFFFF' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                      Уведомления
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      {unreadCount}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                      новых<br/>входящих
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      Все каналы связи
                    </span>
                    <button 
                      onClick={() => setIsSearchVisible(!isSearchVisible)}
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              ) : activeSlide === 1 ? (
                <motion.div
                  key="leads-slide"
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
                  style={{ backgroundColor: '#64384B', color: '#FFFFFF' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                      Лиды и заявки
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      {MOCK_MESSAGES.filter(m => m.type === 'lead').length}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                      диалога<br/>с новыми
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white">
                      Потенциальные клиенты
                    </span>
                    <button 
                      onClick={() => setIsSearchVisible(!isSearchVisible)}
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="clients-slide"
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
                  style={{ backgroundColor: '#64384B', color: '#FFFFFF' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-white leading-tight">
                      Ученики
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                      {MOCK_MESSAGES.filter(m => m.type === 'client').length}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                      диалога<br/>по абонементам
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 text-white">
                      Действующая база
                    </span>
                    <button 
                      onClick={() => setIsSearchVisible(!isSearchVisible)}
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-none"
                    >
                      <Search size={20} className="stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => setActiveSlide(0)}
              style={activeSlide === 0 ? { backgroundColor: '#64384B', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Все сообщения"
            >
              <MessageSquare size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => setActiveSlide(1)}
              style={activeSlide === 1 ? { backgroundColor: '#64384B', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Заявки"
            >
              <Sparkles size={19} className="stroke-[2.5]" />
            </button>

            <button 
              onClick={() => setActiveSlide(2)}
              style={activeSlide === 2 ? { backgroundColor: '#64384B', color: '#FFFFFF' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 2 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Ученики"
            >
              <User size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВЫЕЗЖАЮЩАЯ СТРОКА ПОИСКА (КАПСУЛА-ПИЛЮЛЯ) ─── */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="z-10 relative overflow-visible"
            >
              <div style={searchInputStyle} className="relative w-full h-14 flex items-center shadow-none border-none overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-500 dark:text-zinc-400 stroke-[2.5]" />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по имени или тексту сообщения..."
                  className="w-full h-full pl-13 pr-6 bg-transparent text-sm font-bold text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 focus:outline-none border-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── СПИСОК ДИАЛОГОВ (SHADOW-MD, GAP-2.5) ─── */}
        <div className="flex flex-col gap-2.5">
          {displayedChats.length > 0 ? (
            displayedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full min-h-[86px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-2 pl-2.5 pr-5 flex items-center gap-3.5 shadow-md transition cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 group text-left"
              >
                {/* Аватар с каналом связи (размер 70px) */}
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

                {/* Имя + Бейдж стадии + Текст */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-[#64384B] dark:group-hover:text-rose-300">
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
                    style={{ backgroundColor: '#64384B' }}
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
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

      {/* ─── МОДАЛКА БЫСТРОГО ОТВЕТА ─── */}
      <AnimatePresence>
        {selectedChat && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChat(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t sm:border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl flex flex-col gap-4 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{selectedChat.name}</h3>
                      <span 
                        style={{ backgroundColor: 'rgba(100, 56, 75, 0.25)', color: '#D89EBA' }}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                      >
                        {selectedChat.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono">{selectedChat.phone}</p>
                  </div>
                </div>

                <a
                  href={`tel:${selectedChat.phone}`}
                  style={{ backgroundColor: 'rgba(100, 56, 75, 0.25)', color: '#D89EBA' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                >
                  <Phone size={18} />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-200 leading-relaxed">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Сообщение ({selectedChat.channel.toUpperCase()}):
                </span>
                {selectedChat.lastMessage}
              </div>

              <button
                type="button"
                onClick={handleGenerateAiResponse}
                disabled={isAiGenerating}
                className="w-full h-10 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10 text-white disabled:opacity-50"
              >
                <Sparkles size={15} className={isAiGenerating ? 'animate-spin text-[#D89EBA]' : 'text-[#D89EBA]'} />
                {isAiGenerating ? 'AI думает...' : 'Сгенерировать AI-ответ'}
              </button>

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите ответ или используйте подсказку AI выше..."
                  className="w-full rounded-[18px] p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#64384B] bg-black/40 border border-zinc-800 text-white resize-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChat(null)}
                    className="flex-1 h-12 rounded-full border border-zinc-800 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Закрыть
                  </button>

                  <button
                    type="submit"
                    style={{ backgroundColor: '#64384B', color: '#FFFFFF' }}
                    className="flex-1 h-12 rounded-full font-black text-xs uppercase flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer border-none"
                  >
                    <Send size={15} />
                    Отправить
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}