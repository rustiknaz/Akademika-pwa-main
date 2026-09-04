import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Sparkles, 
  TrendingUp, 
  Bot, 
  Database, 
  Flame, 
  Target, 
  Video, 
  RefreshCw, 
  Copy, 
  Check, 
  Save 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function AdminAiHub() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const { toast } = useToast();

  // 0 - Маркетолог, 1 - Сейлз & Автопилот, 2 - База знаний & Промпты
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Состояния Маркетолога
  const [contentType, setContentType] = useState<'promo' | 'reels' | 'retention'>('promo');
  const [targetDirection, setTargetDirection] = useState('High Heels');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>(
    '🔥 Готова раскрыть свою женственность и уверенность? Открыт набор в группу High Heels (с нуля)!\n\nУже через месяц занятий ты почувствуешь грацию в каждом шаге, прокачаешь баланс и выучишь эффектную связку. Никакого опыта не нужно — учим с базовых шагов.\n\n📍 Где: Невский проспект\n👠 Форма: каблуки или носочки на первый урок\n🎁 Пробное занятие всего 500 ₽ при записи сегодня!'
  );
  const [isCopied, setIsCopied] = useState(false);

  // Состояния Автопилота и Сейлза
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(true);
  const [autoLeadReply, setAutoLeadReply] = useState(true);
  const [autoFaqReply, setAutoFaqReply] = useState(true);
  const [toneOfVoice, setToneOfVoice] = useState('friendly');

  // Состояния Базы знаний
  const [knowledgeBase, setKnowledgeBase] = useState(
    "Студия танцев в Санкт-Петербурге.\nАдрес: Невский пр. 100 (м. Маяковская, 3 мин пешком).\nЦены: Пробное — 500 ₽, 4 урока — 3200 ₽, 8 уроков — 5600 ₽, Безлимит — 8900 ₽.\nС собой: сменная обувь, удобная одежда. Есть раздевалка, душ, кулер с водой."
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "Ты — заботливый администратор и профессиональный менеджер танцевальной студии. Твоя цель: доброжелательно отвечать на вопросы, снимать страхи новичков и доводить до записи на пробный урок."
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (contentType === 'reels') {
        setGeneratedResult(
          `🎬 СЦЕНАРИЙ ДЛЯ REELS / КЛИПА (${targetDirection})\n\n1. Хук (0-3 сек): "Думаешь, что танцевать в 25+ уже поздно?"\n2. Тело (3-12 сек): Кадры первого занятия и улыбки девушек, которые пришли с полного нуля.\n3. Призыв к действию (12-15 сек): "Забирай скидку 50% на пробный урок по ссылке в профиле!"`
        );
      } else if (contentType === 'retention') {
        setGeneratedResult(
          `❤️ Мы соскучились! Дарим скидку 15% на продление абонемента по направлению ${targetDirection}. Возвращайся в зал на этой неделе — мы забронируем за тобой место!`
        );
      } else {
        setGeneratedResult(
          `🔥 Открыт набор в группу ${targetDirection}!\n\nУютные залы, профессиональный свет и топовые хореографы. Старт уже во вторник! Мест в группе: строго до 12 человек.`
        );
      }
      toast({ title: "Контент готов! ✨" });
    }, 800);
  };

  const handleSaveKnowledge = () => {
    toast({
      title: "База знаний обновлена",
      description: "AI-ассистент сохранил изменения."
    });
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: СТАТИЧНЫЙ БАННЕР С ПАРЯЩИМИ КНОПКАМИ СПРАВА ─── */}
        <div 
          style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
          className="relative min-h-[184px] h-[184px] w-full select-none z-30 p-5 rounded-[42px] shadow-md flex flex-col justify-between border-none overflow-visible"
        >
          {/* Анимируемая текстовая информация внутри баннера */}
          <div className="relative flex-1 flex flex-col justify-between pr-[68px] pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              {activeSlide === 0 ? (
                <motion.div
                  key="content-marketing"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/70">
                      ГЕНЕРАТОР КОНТЕНТА
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-black truncate mt-0.5">
                      AI Маркетолог
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black font-mono tracking-tight leading-none">
                      PRO
                    </span>
                    <span className="text-[10px] font-bold text-black/70 uppercase tracking-wide leading-tight">
                      генератор постов<br/>и сценариев reels
                    </span>
                  </div>
                </motion.div>
              ) : activeSlide === 1 ? (
                <motion.div
                  key="content-sales"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/70">
                      АВТОМАТИЗАЦИЯ ПРОДАЖ
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-black mt-0.5 truncate">
                      AI Автопилот
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black font-mono tracking-tight leading-none">
                      {isAutopilotEnabled ? 'ON' : 'OFF'}
                    </span>
                    <span className="text-[10px] font-bold text-black/70 uppercase tracking-wide leading-tight">
                      обработка лидов<br/>в Telegram & WA
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content-kb"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between pointer-events-auto"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/70">
                      БАЗА ЗНАНИЙ АГЕНТА
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-wider text-black mt-0.5 truncate">
                      База Знаний
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-black font-mono tracking-tight leading-none">
                      SYNC
                    </span>
                    <span className="text-[10px] font-bold text-black/70 uppercase tracking-wide leading-tight">
                      правила, цены<br/>и характер агента
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-[100] pr-[68px]">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-black/15 text-black backdrop-blur-sm">
              {activeSlide === 0 ? 'Офферы • Воронки • Трафик' : activeSlide === 1 ? 'Сейлз активен 24/7' : 'Промпты & Скрипты'}
            </span>
          </div>

          {/* 
            ПРАВАЯ КОЛОНКА ПАРЯЩИХ КНОПОК:
            - top-5, bottom-5, right-5 (выровнены по стандарту)
            - активная кнопка подсвечивается кружком #000000 / #CCFF00
          */}
          <div className="absolute right-5 top-5 bottom-5 flex flex-col justify-between items-center z-[200] pointer-events-auto">
            {/* 1. Верх: Маркетолог */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(0)}
              style={activeSlide === 0 ? { backgroundColor: '#000000', color: accentColor || '#CCFF00' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-black/70 hover:text-black opacity-80 hover:opacity-100'
              }`}
              title="Маркетолог"
            >
              <TrendingUp size={20} className="stroke-[2.5]" />
            </button>
            
            {/* 2. Середина: Автопилот */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(1)}
              style={activeSlide === 1 ? { backgroundColor: '#000000', color: accentColor || '#CCFF00' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-black/70 hover:text-black opacity-80 hover:opacity-100'
              }`}
              title="Сейлз и Автопилот"
            >
              <Bot size={20} className="stroke-[2.5]" />
            </button>

            {/* 3. Низ: База знаний */}
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSlide(2)}
              style={activeSlide === 2 ? { backgroundColor: '#000000', color: accentColor || '#CCFF00' } : {}}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 2 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-black/70 hover:text-black opacity-80 hover:opacity-100'
              }`}
              title="База знаний"
            >
              <Database size={19} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ОСНОВНОЙ КОНТЕНТ С ЕДИНЫМ GAP-2.5 ─── */}

        {/* 1. Маркетолог */}
        {activeSlide === 0 && (
          <div className="flex flex-col gap-2.5">
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Формат задачи
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'promo', label: 'Набор в группу', icon: Flame },
                    { id: 'reels', label: 'Сценарий Reels', icon: Video },
                    { id: 'retention', label: 'Возврат учениц', icon: Target },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setContentType(f.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          contentType === f.id
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-sm font-bold'
                            : 'bg-black/5 dark:bg-zinc-900 border-transparent text-slate-800 dark:text-zinc-300'
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
                  Направление
                </label>
                <select
                  value={targetDirection}
                  onChange={(e) => setTargetDirection(e.target.value)}
                  className="w-full h-12 rounded-2xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#CCFF00] bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-black dark:text-white"
                >
                  <option value="High Heels">High Heels</option>
                  <option value="K-Pop Cover Dance">K-Pop Cover Dance</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Dancehall">Dancehall</option>
                  <option value="Stretching">Stretching</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full h-14 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'AI генерирует текст...' : 'Сгенерировать креатив'}
              </button>
            </div>

            {generatedResult && (
              <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Результат
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedResult);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="h-8 px-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-900 dark:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                  >
                    {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    {isCopied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs leading-relaxed whitespace-pre-line font-medium">
                  {generatedResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Сейлз & Автопилот */}
        {activeSlide === 1 && (
          <div className="flex flex-col gap-2.5">
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-950 dark:text-white">Главный автопилот</h4>
                  <p className="text-[11px] text-zinc-400">AI отвечает клиентам самостоятельно</p>
                </div>
                <button
                  onClick={() => setIsAutopilotEnabled(!isAutopilotEnabled)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer border-none flex items-center ${
                    isAutopilotEnabled ? 'bg-[#CCFF00] justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <motion.div layout className="w-6 h-6 rounded-full bg-black shadow-md" />
                </button>
              </div>

              <div className="h-px bg-black/5 dark:bg-white/5" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Дожим новых лидов до пробного</span>
                  <input 
                    type="checkbox" 
                    checked={autoLeadReply} 
                    onChange={(e) => setAutoLeadReply(e.target.checked)}
                    className="w-4 h-4 accent-[#CCFF00] cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Ответы на частые вопросы (FAQ)</span>
                  <input 
                    type="checkbox" 
                    checked={autoFaqReply} 
                    onChange={(e) => setAutoFaqReply(e.target.checked)}
                    className="w-4 h-4 accent-[#CCFF00] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Тон общения (Tone of Voice)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'friendly', label: 'Дружелюбный' },
                    { id: 'expert', label: 'Экспертный' },
                    { id: 'energy', label: 'Энергичный' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setToneOfVoice(t.id)}
                      className={`h-10 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        toneOfVoice === t.id 
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00]' 
                          : 'bg-black/5 dark:bg-zinc-900 border-transparent text-zinc-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. База знаний */}
        {activeSlide === 2 && (
          <div className="flex flex-col gap-2.5">
            <div className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[42px] p-6 shadow-none space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Факты о студии (Цены, локация, правила)
                </label>
                <textarea
                  rows={4}
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  className="w-full rounded-2xl p-3.5 text-xs font-medium bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 resize-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Системный Промпт (Инструкция для AI)
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full rounded-2xl p-3.5 text-xs font-medium bg-white/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 resize-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00] text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleSaveKnowledge}
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full h-14 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer border-none"
              >
                <Save size={16} />
                Сохранить настройки
              </button>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}