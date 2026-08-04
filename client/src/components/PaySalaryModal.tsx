import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Building2, Zap, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export type PaymentMethod = 'cash' | 'terminal' | 'transfer' | 'sbp';

export interface PaySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: {
    id: number;
    name: string;
    role: 'coach' | 'admin' | 'other';
    balance: number;
    avatar?: string;
  } | null;
  onConfirmPayout: (payoutData: {
    staffId: number;
    staffName: string;
    role: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note?: string;
    date: string;
  }) => void;
}

const paymentOptions: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Наличные', icon: '💵' },
  { id: 'terminal', label: 'Карта / Перевод', icon: '💳' },
  { id: 'transfer', label: 'Расчетный счет', icon: '🏦' },
  { id: 'sbp', label: 'СБП', icon: '⚡' },
];

export default function PaySalaryModal({
  isOpen,
  onClose,
  staffMember,
  onConfirmPayout,
}: PaySalaryModalProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';

  const [payoutType, setPayoutType] = useState<'full' | 'partial'>('full');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (staffMember) {
      setPayoutType('full');
      setCustomAmount(String(staffMember.balance));
      setPaymentMethod('cash');
      setNote('');
      setErrorMsg('');
    }
  }, [staffMember, isOpen]);

  if (!isOpen || !staffMember) return null;

  const currentBalance = staffMember.balance || 0;
  const payoutAmount = payoutType === 'full' ? currentBalance : (Number(customAmount) || 0);

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const num = Number(val);
    if (num > currentBalance) {
      setErrorMsg(`Сумма выплаты не может превышать текущий баланс (${currentBalance.toLocaleString()} ₽)`);
    } else if (num <= 0) {
      setErrorMsg('Введите корректную сумму больше 0 ₽');
    } else {
      setErrorMsg('');
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      setErrorMsg('Сумма выплаты должна быть больше 0 ₽');
      return;
    }
    if (payoutAmount > currentBalance) {
      setErrorMsg(`Сумма превышает баланс сотрудника (${currentBalance.toLocaleString()} ₽)`);
      return;
    }

    const roleLabel = 
      staffMember.role === 'coach' ? 'Тренер' :
      staffMember.role === 'admin' ? 'Администратор' : 'Персонал';

    const todayStr = new Date().toISOString().split('T')[0];

    onConfirmPayout({
      staffId: staffMember.id,
      staffName: staffMember.name,
      role: roleLabel,
      amount: payoutAmount,
      paymentMethod,
      note: note.trim() || undefined,
      date: todayStr,
    });

    onClose();
  };

  const roleTitle = 
    staffMember.role === 'coach' ? 'Тренер' :
    staffMember.role === 'admin' ? 'Администратор' : 'Персонал';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-md p-6 rounded-outer border border-zinc-800 bg-[#18181b] text-white shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl font-semibold uppercase text-white flex items-center gap-2">
                💳 Выплата зарплаты
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Сотрудник: <span className="font-medium text-white">{staffMember.name}</span> ({roleTitle})
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleConfirm} className="space-y-5">
            {/* Блок 1: Выбор типа выплаты */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block">
                СУММА ВЫПЛАТЫ
              </label>

              <div className="bg-zinc-950/80 border border-zinc-800 p-1 rounded-control flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPayoutType('full');
                    setErrorMsg('');
                  }}
                  style={payoutType === 'full' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-control transition-all cursor-pointer text-center border-none${
                    payoutType === 'full'
                      ? 'bg-[#CCFF00] text-black shadow-md'
: 'text-zinc-400 hover:text-white bg-transparent font-medium'
                  }`}
                >
                  Вся сумма ({currentBalance.toLocaleString()} ₽)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayoutType('partial');
                    setCustomAmount(String(currentBalance));
                    setErrorMsg('');
                  }}
                  style={payoutType === 'partial' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-control transition-all cursor-pointer text-center border-none${
                    payoutType === 'partial'
                      ? 'bg-[#CCFF00] text-black shadow-md'
: 'text-zinc-400 hover:text-white bg-transparent font-medium'
                  }`}
                >
                  Частичная выплата
                </button>
              </div>

              {payoutType === 'partial' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-1 space-y-1"
                >
                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Введите сумму..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-control px-4 py-2.5 text-white text-sm font-medium font-mono focus:outline-none transition-colors"
                    />
                    <span className="absolute right-4 top-3 text-xs font-medium text-zinc-500">₽</span>
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium pl-1 pt-1">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Блок 2: Способ оплаты */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block">
                СПОСОБ ОПЛАТЫ (ОБЯЗАТЕЛЬНО)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((option) => {
                  const isActive = paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={`p-3 rounded-control border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer${
                        isActive
                          ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-lg scale-[1.02]'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Блок 3: Комментарий / Заметка */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block">
                КОММЕНТАРИЙ / ЗАМЕТКА (НЕОБЯЗАТЕЛЬНО)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Например: Аванс за июль или выплата за 1 половину"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-control px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Кнопка действия */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={payoutAmount <= 0 || payoutAmount > currentBalance}
                style={{
                  backgroundColor: (payoutAmount > 0 && payoutAmount <= currentBalance) ? accentColor : '#3f3f46',
                  color: (payoutAmount > 0 && payoutAmount <= currentBalance) ? (accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff') : '#9ca3af'
                }}
                className="w-full h-14 font-bold text-sm uppercase rounded-control flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Подтвердить выплату: {payoutAmount > 0 ? payoutAmount.toLocaleString() : 0} ₽</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
