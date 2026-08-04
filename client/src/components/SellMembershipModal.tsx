import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Check, CreditCard, Banknote, Building2, Zap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface SellMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (saleData: any) => void;
}

const MEMBERSHIP_TARIFFS = [
  { id: '4_classes', title: '4 занятия (1 месяц)', price: 2800, visits: 4 },
  { id: '8_classes', title: '8 занятий (1 месяц)', price: 4800, visits: 8 },
  { id: '12_classes', title: '12 занятий (1 месяц)', price: 6500, visits: 12 },
  { id: 'unlimited_1m', title: 'Безлимит (1 месяц)', price: 8900, visits: 99 },
  { id: 'single', title: 'Разовое посещение', price: 800, visits: 1 },
];

export default function SellMembershipModal({ isOpen, onClose, onSuccess }: SellMembershipModalProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [selectedTariffId, setSelectedTariffId] = useState(MEMBERSHIP_TARIFFS[1].id);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'terminal' | 'sbp'>('cash');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const selectedTariff = MEMBERSHIP_TARIFFS.find(t => t.id === selectedTariffId) || MEMBERSHIP_TARIFFS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Заполните данные",
        description: "Укажите имя и телефон покупателя",
      });
      return;
    }

    const saleRecord = {
      id: Date.now(),
      studentName: studentName.trim(),
      studentPhone: studentPhone.trim(),
      tariffTitle: selectedTariff.title,
      price: selectedTariff.price,
      visits: selectedTariff.visits,
      paymentMethod,
      note: note.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    // Save to local storage for Finance synchronization
    try {
      const existingRaw = localStorage.getItem('studio_membership_sales');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('studio_membership_sales', JSON.stringify([saleRecord, ...existing]));
    } catch (e) {
      console.error('Error saving membership sale:', e);
    }

    toast({
      title: "Абонемент продан! 🎟️",
      description: `${selectedTariff.title} за ${selectedTariff.price.toLocaleString()} ₽ оформлен для ${studentName}`,
    });

    if (onSuccess) onSuccess(saleRecord);

    setStudentName('');
    setStudentPhone('');
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
          className="relative z-10 w-full max-w-md p-6 rounded-card border border-zinc-800 bg-[#18181b] text-white shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl font-semibold uppercase text-white flex items-center gap-2">
                <Ticket className="text-[#CCFF00]" size={22} />
                Продажа абонемента
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Оформление абонемента ученику
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
            {/* Покупатель */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ФИО УЧЕНИКА *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Екатерина Смирнова"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                  ТЕЛЕФОН *
                </label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] rounded-btn px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Тариф */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                ВЫБОР ТАРИФА
              </label>
              <div className="space-y-2">
                {MEMBERSHIP_TARIFFS.map((tariff) => {
                  const isSelected = selectedTariffId === tariff.id;
                  return (
                    <div
                      key={tariff.id}
                      onClick={() => setSelectedTariffId(tariff.id)}
                      className={`p-3 rounded-card-inner border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00] shadow-md'
                          : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#CCFF00] bg-[#CCFF00]' : 'border-zinc-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <span className="text-xs font-medium text-white">{tariff.title}</span>
                      </div>
                      <span className="text-xs font-medium font-mono text-[#CCFF00]">
                        {tariff.price.toLocaleString()} ₽
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Способ оплаты */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block mb-1">
                СПОСОБ ОПЛАТЫ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: '💵 Наличные' },
                  { id: 'terminal', label: '💳 Карта' },
                  { id: 'sbp', label: '⚡ СБП' },
                ].map((item) => {
                  const isActive = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as any)}
                      style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={`py-2 px-2 text-xs font-bold rounded-btn border transition-all cursor-pointer text-center${
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

            {/* Кнопка действия */}
            <div className="pt-2">
              <button
                type="submit"
                style={{ backgroundColor: accentColor, color: activeTextColor }}
                className="w-full h-12 font-bold text-sm uppercase rounded-btn flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                <Check size={18} />
                <span>Продать за {selectedTariff.price.toLocaleString()} ₽</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
