import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Copy, 
  Check, 
  Flame, 
  Target, 
  Video, 
  RefreshCw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function AdminMarketing() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [activeSlide, setActiveSlide] = useState<number>(0);

  const [contentType, setContentType] = useState<'promo' | 'reels' | 'retention'>('promo');
  const [targetDirection, setTargetDirection] = useState('High Heels');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>(
    '🔥 Готова раскрыть свою женственность и уверенность? Открыт набор в группу High Heels (с нуля)!\n\nУже через месяц занятий ты почувствуешь грацию в каждом шаге, прокачаешь баланс и выучишь эффектную связку. Никакого опыта не нужно — учим с базовых шагов.\n\n📍 Где: Невский проспект\n👠 Форма: каблуки или носочки на первый урок\n🎁 Пробное занятие всего 500 ₽ при записи сегодня!'
  );
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (contentType === 'reels') {
        setGeneratedResult(
          `🎬 СЦЕНАРИЙ ДЛЯ REELS / КЛИПА (${targetDirection})\n\n1. Хук (0-3 сек): Крупный план туфель/каблуков, текст на экране: "Думала, что на каблуках танцуют только профи?"\n2. Тело (3-12 сек): Нарезка до/после: первая неуверенная проходка девушки и через 3 недели синхрон с группой.\n3. Призыв к действию (12-15 сек): Тренер улыбается в камеру, текст: "Забирай свой пробный урок в шапке профиля!"`
        );
      } else if (contentType === 'retention') {
        setGeneratedResult(
          `❤️ Мы соскучились! Дарим скидку 15% на продление абонемента по направлению ${targetDirection}.\n\nТвоя группа уже учит новую связку к отчетному видео. Возвращайся в ритм на этой неделе — закрепим за тобой место в зале!`
        );
      } else {
        setGeneratedResult(
          `🔥 Открыт набор в вечернюю группу ${targetDirection}!\n\nИдеальное комбо из пластики, кардио и мощной энергетики. Занятия в просторном зале с панорамными зеркалами и профессиональным светом.\n\nКоличество мест в группе строго до 12 человек. Жми кнопку ниже для брони места!`
        );
      }
      toast({
        title: "Контент сгенерирован! ✨",
        description: "AI подготовил свежий креатив под выбранную цель."
      });
    }, 900);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    setIsCopied(true);
    toast({ title: "Скопировано в буфер обмена" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      <div className="flex gap-2.5 h-[180px] w-full mt-4 mb-3 select-none z-30">
        
        <div className="flex-1 relative h-full">
          <AnimatePresence initial={false} mode="wait">
            {activeSlide === 0 ? (
              <motion.div
                key="creator-slide"
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
                style={{ backgroundColor: accentColor || '#CCFF00' }}
                className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none"
              >
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 leading-tight">
                    AI Маркетолог
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                    PRO
                  </span>
                  <span className="text-[10px] font-bold text-slate-900/70 uppercase tracking-wide leading-tight">
                    автономный<br/>генератор
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/10 text-slate-900 backdrop-blur-sm">
                    Посты • Reels • Прогревы
                  </span>
                </div>
              </motion.div>
            ) : activeSlide === 1 ? (
              <motion.div
                key="strategy-slide"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 40) setActiveSlide(0);
                  else if (info.offset.x < -40) setActiveSlide(2);
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing !overflow-visible select-none"
              >
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                    Трафик & Каналы
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                    4
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                    точки роста<br/>в этом месяце
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                    VK • Карты • Посевы
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="calendar-slide"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 40) setActiveSlide(1);
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 p-5 rounded-outer shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing !overflow-visible select-none"
              >
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                    Контент-план
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                    7 / 7
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                    дней расписано<br/>на неделю
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                    Готово к авто-постингу
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[64px] bg-white/60 dark:bg-[#161618]/90 border border-black/5 dark:border-white/10 rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-sm shrink-0 backdrop-blur-md">
          <button 
            onClick={() => setActiveSlide(0)}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
              activeSlide === 0 
                ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
            }`}
            title="Генератор контента"
          >
            <Sparkles size={20} className="stroke-[2.5]" />
          </button>
          
          <button 
            onClick={() => setActiveSlide(1)}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
              activeSlide === 1 
                ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
            }`}
            title="Стратегия каналов"
          >
            <TrendingUp size={20} className="stroke-[2.5]" />
          </button>

          <button 
            onClick={() => setActiveSlide(2)}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
              activeSlide === 2 
                ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
            }`}
            title="Контент-план"
          >
            <CalendarIcon size={19} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      <main className="flex-1 pb-28 space-y-4 pr-0.5">

        {activeSlide === 0 ? (
          <div className="space-y-3.5">
            <div className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-outer p-5 shadow-sm space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Формат материала
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'promo', label: 'Набор в группу', icon: Flame },
                    { id: 'reels', label: 'Сценарий Reels', icon: Video },
                    { id: 'retention', label: 'Возврат учеников', icon: Target },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setContentType(f.id as any)}
                        className={`p-3 rounded-[18px] border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          contentType === f.id
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md font-bold'
                            : 'bg-black/5 dark:bg-zinc-900 border-black/5 dark:border-zinc-800 text-slate-800 dark:text-zinc-300'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-bold leading-tight">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Направление / Специфика
                </label>
                <select
                  value={targetDirection}
                  onChange={(e) => setTargetDirection(e.target.value)}
                  className="w-full h-12 rounded-[18px] px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors cursor-pointer bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                >
                  <option value="High Heels">High Heels</option>
                  <option value="K-Pop Cover Dance">K-Pop Cover Dance</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Dancehall">Dancehall</option>
                  <option value="Stretching">Stretching & Body Make</option>
                  <option value="Детская хореография">Детская хореография (4-7 лет)</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full h-13 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    AI генерирует текст...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Сгенерировать креатив
                  </>
                )}
              </button>
            </div>

            {generatedResult && (
              <div className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-outer p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Результат генерации
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="h-8 px-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-900 dark:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      {isCopied ? 'Скопировано' : 'Копировать'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-[18px] bg-white/60 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs leading-relaxed whitespace-pre-line font-medium text-slate-900 dark:text-zinc-100">
                  {generatedResult}
                </div>
              </div>
            )}
          </div>
        ) : activeSlide === 1 ? (
          <div className="space-y-3">
            {[
              {
                title: 'Яндекс Карты & 2ГИС',
                tag: 'Приоритет: Высокий',
                desc: 'Обновите прайс и добавьте фото залов с вечерней подсветкой. Локальный поиск дает до 40% лидов без рекламного бюджета.',
                color: 'text-amber-500 bg-amber-500/10'
              },
              {
                title: 'VK Таргетинг (Лид-формы)',
                tag: 'Рекомендация AI',
                desc: 'Запустите промо-пост с видео тренера по High Heels на аудиторию женщин 18-32 в радиусе 3 км от студии.',
                color: 'text-[#CCFF00] bg-[#CCFF00]/10'
              },
              {
                title: 'Посевы в городских Telegram-каналах',
                tag: 'Охватный канал',
                desc: 'Анонсируйте бесплатные открытые уроки в студенческих и районных каналах за 2 дня до старта групп.',
                color: 'text-sky-400 bg-sky-500/10'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-outer p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base text-black dark:text-white truncate">
                    {card.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${card.color}`}>
                    {card.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {[
              { day: 'Понедельник', type: 'Reels / Клип', topic: 'Разбор частой ошибки новичков в High Heels' },
              { day: 'Вторник', type: 'Пост / Карусель', topic: 'Плейлист недели для вечерних тренировок' },
              { day: 'Среда', type: 'Stories / Опрос', topic: 'Интерактив: угадай хореографа по связке' },
              { day: 'Четверг', type: 'Продающий пост', topic: 'Осталось 3 места в группу K-Pop для подростков' },
              { day: 'Пятница', type: 'Backstage видео', topic: 'Атмосфера пятничного джема в студии' },
              { day: 'Суббота', type: 'Отзыв / До-После', topic: 'История ученицы: от страха до сольного выступления' },
              { day: 'Воскресенье', type: 'Расписание', topic: 'Анонс классов и мастер-классов на следующую неделю' },
            ].map((plan, i) => (
              <div
                key={i}
                className="w-full min-h-[76px] bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-outer px-4 py-3 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {plan.day}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                      {plan.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 truncate mt-1 font-medium">
                    {plan.topic}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}