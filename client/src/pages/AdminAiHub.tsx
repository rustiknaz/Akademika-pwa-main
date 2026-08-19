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
        
        {/* ─── ВЕРХНИЙ БЛОК: Слайдер + Вертикальная навигация ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {activeSlide === 0 ? (
                /* СЛАЙД 1: МАРКЕТОЛОГ */
                <motion.div
                  key="marketing-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => { if (info.offset.x < -40) setActiveSlide(1); }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: accentColor || '#CCFF00' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none"
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
                      генератор постов<br/>и сценариев reels
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/10 text-slate-900 backdrop-blur-sm">
                      Офферы • Воронки • Трафик
                    </span>
                  </div>
                </motion.div>
              ) : activeSlide === 1 ? (
                /* СЛАЙД 2: АВТОПИЛОТ */
                <motion.div
                  key="sales-slide"
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
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing !overflow-visible select-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                      AI Автопилот
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                      {isAutopilotEnabled ? 'ON' : 'OFF'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      обработка лидов<br/>в Telegram & WA
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      isAutopilotEnabled ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {isAutopilotEnabled ? 'Сейлз активен 24/7' : 'Только подсказки'}
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 3: БАЗА ЗНАНИЙ */
                <motion.div
                  key="kb-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => { if (info.offset.x > 40) setActiveSlide(1); }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing !overflow-visible select-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                      База Знаний
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                      SYNC
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      правила, цены<br/>и характер агента
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-400">
                      Промпты & Скрипты
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] bg-white/40 dark:bg-[#161618]/90 border border-black/5 dark:border-white/10 rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-sm shrink-0 backdrop-blur-md">
            <button 
              onClick={() => setActiveSlide(0)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 0 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Маркетолог"
            >
              <TrendingUp size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => setActiveSlide(1)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 1 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Сейлз и Автопилот"
            >
              <Bot size={20} className="stroke-[2.5]" />
            </button>

            <button 
              onClick={() => setActiveSlide(2)}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                activeSlide === 2 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
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