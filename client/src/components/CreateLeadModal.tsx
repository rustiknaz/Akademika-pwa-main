import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadData: any) => void;
}

const LEAD_DIRECTIONS = [
  'Twerk',
  'High Heels',
  'Dancehall',
  'Hip Hop',
  'Strip Dance',
  'Vogue',
  'Stretching',
  'Aero',
  'Еще не определился'
];

const LEAD_SOURCES = [
  'Instagram',
  'Сайт студии',
  'ВКонтакте',
  'Рекомендация / Друзья',
  'Карты (Яндекс / 2ГИС)',
  'Прочее'
];

export default function CreateLeadModal({ isOpen, onClose, onSuccess }: CreateLeadModalProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState(LEAD_DIRECTIONS[0]);
  const [source, setSource] = useState(LEAD_SOURCES[0]);
  const [status, setStatus] = useState<'new' | 'trial_scheduled' | 'callback'>('new');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({
        variant: "destructive",
        title: "Заполните имя и телефон",
        description: "Для создания лида укажите контактные данные",
      });
      return;
    }

    const leadRecord = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      direction,
      source,
      status,
      comment: comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage for CRM synchronization
    try {
      const existingRaw = localStorage.getItem('studio_crm_leads');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('studio_crm_leads', JSON.stringify([leadRecord, ...existing]));
    } catch (e) {
      console.error('Error saving CRM lead:', e);
    }

    toast({
      title: "Лид создан в CRM! ✨",
      description: `Контакт ${name} (${direction}) добавлен в заявки`,
    });

    if (onSuccess) onSuccess(leadRecord);

    setName('');
    setPhone('');
    setComment('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-md p-6 rounded-card border border-zinc-800 bg-[#18181b] text-white shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl font-semibold uppercase text-white flex items-center gap-2">
                <UserPlus className="text-[#CCFF00]" size={22} />
                Новый лид / Заявка
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Внесение нового потенциального ученика в CRM
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Имя и Телефон */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ИМЯ ЛИДА *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Анастасия"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ТЕЛЕФОН / МЕССЕНДЖЕР *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Желаемое направление */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  НАПРАВЛЕНИЕ
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  {LEAD_DIRECTIONS.map((dir, idx) => (
                    <option key={idx} value={dir} className="bg-zinc-900 text-white">
                      {dir}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ИСТОЧНИК
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  {LEAD_SOURCES.map((src, idx) => (
                    <option key={idx} value={src} className="bg-zinc-900 text-white">
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Начальный статус */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                СТАТУС ЗАЯВКИ
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-btn border border-zinc-800">
                {[
                  { id: 'new', label: 'Новый лид' },
                  { id: 'trial_scheduled', label: 'Записан' },
                  { id: 'callback', label: 'Перезвонить' },
                ].map((item) => {
                  const isActive = status === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatus(item.id as any)}
                      style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={`py-2 text-xs font-bold rounded-btn transition-all cursor-pointer text-center border-none tracking-wide${
                        isActive
                          ? 'bg-[#CCFF00] text-black shadow-md'
: 'text-zinc-400 hover:text-white bg-transparent font-medium'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Комментарий */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                КОММЕНТАРИЙ АДМИНИСТРАТОРА
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Пожелания, уровень подготовки или предпочтения по времени..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Кнопка отправки */}
            <div className="pt-2">
              <button
                type="submit"
                style={{ backgroundColor: accentColor, color: activeTextColor }}
                className="w-full h-12 font-bold text-sm uppercase rounded-btn flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                <Check size={18} />
                <span>Создать лид</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
