import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Check, Banknote, CreditCard, Zap, Building2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentData: any) => void;
}

const INCOME_CATEGORIES = [
  'Абонементы',
  'Разовое занятие',
  'Аренда зала',
  'Продажа воды/мерча',
  'Индивидуальный урок',
  'Прочее'
];

export default function AddPaymentModal({ isOpen, onClose, onSuccess }: AddPaymentModalProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [amount, setAmount] = useState('3000');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'terminal' | 'transfer' | 'sbp'>('cash');
  const [payerName, setPayerName] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Некорректная сумма",
        description: "Введите сумму больше 0 ₽",
      });
      return;
    }

    const paymentRecord = {
      id: Date.now(),
      amount: numAmount,
      category,
      paymentMethod,
      payerName: payerName.trim() || 'Ученик',
      note: note.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      createdAt: new Date().toISOString(),
    };

    // Save to local storage for Finance synchronization
    try {
      const existingRaw = localStorage.getItem('studio_finance_incomes');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('studio_finance_incomes', JSON.stringify([paymentRecord, ...existing]));
    } catch (e) {
      console.error('Error saving income payment:', e);
    }

    toast({
      title: "Оплата принята! 💰",
      description: `Внесено ${numAmount.toLocaleString()} ₽ (${category})`,
    });

    if (onSuccess) onSuccess(paymentRecord);

    setAmount('3000');
    setPayerName('');
    setNote('');
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
          className="relative z-10 w-full max-w-md p-6 rounded-[28px] border border-zinc-800 bg-[#18181b] text-white shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl font-semibold uppercase text-white flex items-center gap-2">
                <Wallet className="text-[#CCFF00]" size={22} />
                Принять оплату
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Внесение платежа в финансовый учет
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
            {/* Сумма */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                СУММА ОПЛАТЫ (₽) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-[16px] px-4 py-3 text-white text-base font-medium font-mono focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-3.5 text-xs font-medium text-zinc-500">₽</span>
              </div>
            </div>

            {/* Категория */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                КАТЕГОРИЯ ДОХОДА
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-[16px] px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                {INCOME_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Способ оплаты */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                СПОСОБ ОПЛАТЫ (ОБЯЗАТЕЛЬНО)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: '💵 Наличные' },
                  { id: 'terminal', label: '💳 Карта / Терминал' },
                  { id: 'sbp', label: '⚡ СБП' },
                  { id: 'transfer', label: '🏦 Расчетный счет' },
                ].map((item) => {
                  const isActive = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as any)}
                      style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={`p-2.5 rounded-[16px] border text-xs font-medium transition-all cursor-pointer text-center${
                        isActive
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Плательщик / Комментарий */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ПЛАТЕЛЬЩИК (НЕОБЯЗАТЕЛЬНО)
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="ФИО ученика или плательщика"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-[16px] px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ПРИМЕЧАНИЕ
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Заметка или номер чека..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-[16px] px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Кнопка действия */}
            <div className="pt-2">
              <button
                type="submit"
                style={{ backgroundColor: accentColor, color: activeTextColor }}
                className="w-full h-12 font-bold text-sm uppercase rounded-btn flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                <Check size={18} />
                <span>Принять {numAmount > 0 ? `${numAmount.toLocaleString()} ₽` : ''}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
