import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import {
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  CheckCircle,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FloatingActionButton from "../components/FloatingActionButton";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import FinanceCalendarModal from '@/components/FinanceCalendarModal';

export type PaymentMethod = 'cash' | 'terminal' | 'sbp' | 'transfer';

export const paymentMethodConfig: Record<PaymentMethod, { label: string; shortLabel: string; icon: string; style: string }> = {
  cash: {
    label: '💵 Наличные',
    shortLabel: 'Наличные',
    icon: '💵',
    style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  },
  terminal: {
    label: '💳 Карта',
    shortLabel: 'Карта',
    icon: '💳',
    style: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  },
  sbp: {
    label: '⚡ СБП',
    shortLabel: 'СБП',
    icon: '⚡',
    style: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  },
  transfer: {
    label: '🏦 Перевод',
    shortLabel: 'Перевод',
    icon: '🏦',
    style: 'bg-sky-500/15 text-sky-400 border-sky-500/30'
  }
};

export function PaymentMethodBadge({ method }: { method?: PaymentMethod }) {
  if (!method) return null;
  const config = paymentMethodConfig[method] || paymentMethodConfig.cash;
  return (
    <span style={{ borderRadius: '12px' }} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-xl border backdrop-blur-sm shrink-0 tracking-wide${config.style}`}>
      {config.label}
    </span>
  );
}

const paymentOptions: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Наличные', icon: '💵' },
  { id: 'terminal', label: 'Карта', icon: '💳' },
  { id: 'sbp', label: 'СБП', icon: '⚡' },
  { id: 'transfer', label: 'Перевод', icon: '🏦' },
];

// PaymentMethodSelector updated only for compatibility, not touched for design in this request.

export function PaymentMethodSelector({
  selectedMethod,
  onChange
}: {
  selectedMethod: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1 block">
        СПОСОБ ОПЛАТЫ / РАСЧЕТА
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-zinc-950 p-1 rounded-[18px] border border-zinc-800">
        {paymentOptions.map((opt) => {
          const isActive = selectedMethod === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`py-2 px-2 text-xs font-medium rounded-[14px] flex items-center justify-center gap-1 transition-all cursor-pointer border-none${isActive ? ' bg-[#CCFF00] text-black shadow-md font-medium' : ' text-zinc-400 hover:text-white bg-transparent'
                }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface IncomeTransaction {
  id: number;
  student: string;
  type: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
}

interface CoachSalary {
  id: number;
  name: string;
  classes: number;
  rate: number;
  accrued: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

type DetailItem =
  | { type: 'income'; data: IncomeTransaction }
  | { type: 'salary'; data: CoachSalary }
  | { type: 'expense'; data: Expense };

export default function AdminFinance() {
  const [location, setLocation] = useLocation();
  const { theme, accentColor, accentConfig, bgImage } = useTheme();
  const { currentRole } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'income' | 'salaries' | 'expenses'>('income');

  useEffect(() => {
    if (currentRole === 'admin' && activeTab !== 'income') {
      setActiveTab('income');
    }
  }, [currentRole, activeTab]);

  // Period Switcher State ('day' | 'week' | 'month' | 'custom')
  type PeriodType = 'day' | 'week' | 'month' | 'custom';
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStartDate, setCustomStartDate] = useState("2026-07-10");
  const [customEndDate, setCustomEndDate] = useState("2026-07-25");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);

  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([
    { id: 1, student: "Екатерина Иванова", type: "Абонемент 8 занятий", amount: 6400, date: "2026-07-25", paymentMethod: 'cash' },
    { id: 2, student: "Дмитрий Сидоров", type: "Разовое занятие", amount: 1000, date: "2026-07-25", paymentMethod: 'terminal' },
    { id: 3, student: "Анна Кузнецова", type: "Абонемент 16 занятий", amount: 11200, date: "2026-07-22", paymentMethod: 'sbp' },
    { id: 4, student: "Мария Петрова", type: "Индивидуальный урок", amount: 3500, date: "2026-07-20", paymentMethod: 'transfer' },
    { id: 5, student: "София Морозова", type: "Абонемент 8 занятий", amount: 6400, date: "2026-07-15", paymentMethod: 'cash' },
    { id: 6, student: "Ольга Сергеева", type: "Абонемент 8 занятий", amount: 6400, date: "2026-07-10", paymentMethod: 'terminal' },
    { id: 7, student: "Артем Васильев", type: "Разовое занятие", amount: 1000, date: "2026-07-05", paymentMethod: 'sbp' },
  ]);

  const [coachesSalaries, setCoachesSalaries] = useState<CoachSalary[]>([
    { id: 1, name: "Алексей Петров", classes: 34, rate: 1500, accrued: 51000, paid: false },
    { id: 2, name: "Дарья Смирнова", classes: 28, rate: 1500, accrued: 42000, paid: false },
    { id: 3, name: "Мария Ковалева", classes: 42, rate: 1500, accrued: 63000, paid: false },
    { id: 4, name: "Ирина Волк", classes: 15, rate: 1500, accrued: 22500, paid: false },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, category: "Хозрасходы", amount: 1200, date: "2026-07-25", note: "Вода и стаканчики", paymentMethod: 'cash' },
    { id: 2, category: "Оборудование", amount: 8400, date: "2026-07-21", note: "Коврики для фитнеса (6 шт)", paymentMethod: 'terminal' },
    { id: 3, category: "Коммунальные", amount: 5600, date: "2026-07-12", note: "Электричество и вода за Июнь", paymentMethod: 'transfer' },
    { id: 4, category: "Маркетинг", amount: 15000, date: "2026-07-05", note: "Таргетированная реклама VK", paymentMethod: 'transfer' },
    { id: 5, category: "Аренда залов", amount: 65000, date: "2026-07-01", note: "Аренда основного зала за Июль", paymentMethod: 'transfer' },
  ]);

  const [incomeStudent, setIncomeStudent] = useState('');
  const [incomeType, setIncomeType] = useState('Абонемент 8 занятий');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incomePaymentMethod, setIncomePaymentMethod] = useState<PaymentMethod>('cash');
  const [expenseCategory, setExpenseCategory] = useState('Аренда залов');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseNote, setExpenseNote] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('terminal');
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState<PaymentMethod>('transfer');

  useEffect(() => {
    try {
      const savedStaffRaw = localStorage.getItem('studio_staff');
      const savedPayoutsRaw = localStorage.getItem('studio_salary_payouts');
      if (savedStaffRaw) {
        const staffList: any[] = JSON.parse(savedStaffRaw);
        const payouts: any[] = savedPayoutsRaw ? JSON.parse(savedPayoutsRaw) : [];
        const mappedSalaries: CoachSalary[] = staffList.map((m) => {
          const lastPayout = payouts.find((p: any) => p.staffId === m.id);
          return {
            id: m.id,
            name: m.name,
            classes: m.role === 'admin' ? (m.shifts || 0) : 30,
            rate: 1500,
            accrued: m.balance,
            paid: m.balance === 0,
            paymentMethod: lastPayout?.paymentMethod || 'cash'
          };
        });
        if (mappedSalaries.length > 0) {
          setCoachesSalaries(mappedSalaries);
        }
      }
    } catch (e) {
      console.error("Error syncing staff/salaries in AdminFinance:", e);
    }
  }, []);

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        setLocation('/');
        return;
      }

      setLoading(false);
    }
    checkAdminAndFetch();
  }, [setLocation]);

  // Handle Pay Out Salary
  const handlePaySalary = (coachId: number) => {
    const coach = coachesSalaries.find(c => c.id === coachId);
    if (!coach) return;

    const payoutAmount = coach.accrued;

    setCoachesSalaries(prev =>
      prev.map(c => c.id === coachId ? { ...c, paid: true, accrued: 0, paymentMethod: salaryPaymentMethod } : c)
    );

    try {
      const savedStaffRaw = localStorage.getItem('studio_staff');
      if (savedStaffRaw) {
        const staffList: any[] = JSON.parse(savedStaffRaw);
        const updated = staffList.map(s => s.id === coachId ? { ...s, balance: 0 } : s);
        localStorage.setItem('studio_staff', JSON.stringify(updated));
      }

      const existingPayoutsRaw = localStorage.getItem('studio_salary_payouts');
      const existingPayouts = existingPayoutsRaw ? JSON.parse(existingPayoutsRaw) : [];
      const newPayoutRecord = {
        id: Date.now(),
        staffId: coachId,
        staffName: coach.name,
        role: 'Зарплата',
        amount: payoutAmount,
        paymentMethod: salaryPaymentMethod,
        date: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('studio_salary_payouts', JSON.stringify([newPayoutRecord, ...existingPayouts]));
    } catch (e) {
      console.error("Error updating localStorage on handlePaySalary:", e);
    }

    if (selectedDetail && selectedDetail.type === 'salary' && selectedDetail.data.id === coachId) {
      setSelectedDetail({
        type: 'salary',
        data: { ...selectedDetail.data, paid: true, accrued: 0, paymentMethod: salaryPaymentMethod }
      });
    }

    toast({
      title: "Выплата произведена!",
      description: `Выплачено ${payoutAmount.toLocaleString()} ₽ тренеру ${coach.name} (${paymentMethodConfig[salaryPaymentMethod].label})`,
    });
  };

  // Handle Add New Income
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeStudent.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя ученика",
        variant: "destructive"
      });
      return;
    }
    if (!incomeAmount || isNaN(Number(incomeAmount)) || Number(incomeAmount) <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive"
      });
      return;
    }

    const newTx: IncomeTransaction = {
      id: Date.now(),
      student: incomeStudent,
      type: incomeType,
      amount: Number(incomeAmount),
      date: incomeDate,
      paymentMethod: incomePaymentMethod
    };

    setIncomeTransactions(prev => [newTx, ...prev]);
    setIsAddIncomeOpen(false);
    setIncomeStudent('');
    setIncomeAmount('');

    toast({
      title: "Доход зафиксирован!",
      description: `Приход на сумму ${newTx.amount.toLocaleString()} ₽ (${paymentMethodConfig[incomePaymentMethod].label}) от ${newTx.student} успешно добавлен`,
    });
  };

  // Handle Add New Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(Number(expenseAmount)) || Number(expenseAmount) <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму расхода",
        variant: "destructive"
      });
      return;
    }

    const newExp: Expense = {
      id: Date.now(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      note: expenseNote,
      paymentMethod: expensePaymentMethod
    };

    setExpenses(prev => [newExp, ...prev]);
    setIsAddExpenseOpen(false);
    setExpenseAmount('');
    setExpenseNote('');

    toast({
      title: "Расход добавлен!",
      description: `${newExp.category} на сумму ${newExp.amount.toLocaleString()} ₽ (${paymentMethodConfig[expensePaymentMethod].label}) добавлен в систему`,
    });
  };

  // Handle Delete Expense
  const handleDeleteExpense = (id: number) => {
    const deleted = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    setSelectedDetail(null);
    toast({
      title: "Расход удален",
      description: `Запись "${deleted?.category}" на сумму ${deleted?.amount.toLocaleString()} ₽ успешно удалена`,
    });
  };

  // Calculations and Date Filtering
  const getDateRange = (): { start: string; end: string; label: string } => {
    const today = "2026-07-25";
    if (periodType === 'day') {
      return { start: today, end: today, label: "за день" };
    }
    if (periodType === 'week') {
      return { start: "2026-07-19", end: today, label: "за неделю" };
    }
    if (periodType === 'month') {
      return { start: "2026-07-01", end: "2026-07-31", label: "за месяц" };
    }
    const formatRu = (dStr: string) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length < 3) return dStr;
      const months = ["июн", "июл", "авг", "сен", "окт", "ноя", "дек", "янв", "фев", "мар", "апр", "май"];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parseInt(parts[2], 10)} ${months[mIdx] || parts[1]}`;
    };
    const startRu = formatRu(customStartDate);
    const endRu = formatRu(customEndDate);
    const label = startRu === endRu ? startRu : `${startRu} - ${endRu}`;
    return { start: customStartDate, end: customEndDate, label };
  };

  const range = getDateRange();

  const filteredIncome = incomeTransactions.filter(
    tx => tx.date >= range.start && tx.date <= range.end
  );
  const filteredExpenses = expenses.filter(
    exp => exp.date >= range.start && exp.date <= range.end
  );
  const totalIncome = filteredIncome.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAccruedSalaries = coachesSalaries.reduce((acc, curr) => acc + curr.accrued, 0);

  const cashIncome = filteredIncome.filter(tx => tx.paymentMethod === 'cash').reduce((acc, curr) => acc + curr.amount, 0);
  const terminalIncome = filteredIncome.filter(tx => tx.paymentMethod === 'terminal').reduce((acc, curr) => acc + curr.amount, 0);
  const sbpIncome = filteredIncome.filter(tx => tx.paymentMethod === 'sbp').reduce((acc, curr) => acc + curr.amount, 0);
  const transferIncome = filteredIncome.filter(tx => tx.paymentMethod === 'transfer').reduce((acc, curr) => acc + curr.amount, 0);

  const cashExpenses = filteredExpenses.filter(exp => exp.paymentMethod === 'cash').reduce((acc, curr) => acc + curr.amount, 0);
  const terminalExpenses = filteredExpenses.filter(exp => exp.paymentMethod === 'terminal').reduce((acc, curr) => acc + curr.amount, 0);
  const sbpExpenses = filteredExpenses.filter(exp => exp.paymentMethod === 'sbp').reduce((acc, curr) => acc + curr.amount, 0);
  const transferExpenses = filteredExpenses.filter(exp => exp.paymentMethod === 'transfer').reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <div className={`h-[100dvh] flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-[#09090b] text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-slate-900' : 'text-white'
    }`}>
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Финансы</h1>
      </header>

      {/* Category Tab Switcher */}
      {currentRole === 'owner' && (
        <div className="h-[56px] bg-[#DDE2E5] dark:bg-[#161618] rounded-full p-1 flex items-center gap-1 mb-4 max-w-md w-full shrink-0 relative select-none">
          {(['income', 'salaries', 'expenses'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels: Record<typeof tab, string> = { income: 'Доходы', salaries: 'Зарплаты', expenses: 'Расходы' };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={isActive
                  ? "h-full bg-[#CCFF00] text-black font-medium text-sm px-6 rounded-full flex items-center justify-center"
                  : "h-full text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white font-medium text-sm px-6 rounded-full flex items-center justify-center gap-2"
                }
                style={{ transition: 'all .12s cubic-bezier(.4,0,.2,1)' }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      )}

      {/* Analytics Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="w-full bg-[#DDE2E5] dark:bg-[#161618] rounded-full p-2 pr-5 flex items-center gap-3.5 mb-4 shrink-0"
        >
          {activeTab === 'income' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                <Coins size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#121214] dark:text-white uppercase tracking-wider">ДОХОДЫ</span>
                  <ArrowUpRight size={18} className="text-emerald-600" />
                </div>
                <div className="font-semibold text-xl text-[#121214] dark:text-white mt-0.5">
                  {totalIncome > 0 ? totalIncome.toLocaleString() : '35 900'} ₽
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-emerald-700/90 dark:text-emerald-400 font-medium flex items-center gap-1">
                    ↗ +12.4% за выбранный период
                  </span>
                  <span className="text-[#121214]/60 dark:text-white/60 font-medium">
                    Абонементы: {Math.round(totalIncome > 0 ? totalIncome * 0.82 : 29500).toLocaleString()} ₽ | Разовые: {Math.round(totalIncome > 0 ? totalIncome * 0.18 : 6400).toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'salaries' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                <Banknote size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#121214]/70 dark:text-white/60 uppercase tracking-wider">ФОТ И ВЫПЛАТЫ</span>
                  <span className="flex items-center"><ArrowDownRight size={18} className="text-blue-400" /></span>
                </div>
                <div className="font-semibold text-xl text-[#121214] dark:text-white mt-0.5">
                  {totalAccruedSalaries > 0 ? totalAccruedSalaries.toLocaleString() : '178 500'} ₽
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-blue-400 font-medium flex items-center gap-1">
                    ↙ Выплачено 80% от плана
                  </span>
                  <span className="text-[#121214]/60 dark:text-white/60 font-medium">
                    Оклады: {Math.round(totalAccruedSalaries > 0 ? totalAccruedSalaries * 0.67 : 120000).toLocaleString()} ₽ | % от групп: {Math.round(totalAccruedSalaries > 0 ? totalAccruedSalaries * 0.33 : 58500).toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'expenses' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                <Wallet size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#121214]/70 dark:text-white/60 uppercase tracking-wider">ВСЕГО РАСХОДОВ</span>
                  <span className="flex items-center"><ArrowDownRight size={18} className="text-rose-400" /></span>
                </div>
                <div className="font-semibold text-xl text-[#121214] dark:text-white mt-0.5">
                  {(totalExpenses + (periodType === 'month' ? totalAccruedSalaries : 0)) > 0
                    ? (totalExpenses + (periodType === 'month' ? totalAccruedSalaries : 0)).toLocaleString()
                    : '273 700'} ₽
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    ↘ Детализация расходов
                  </span>
                  <span className="text-[#121214]/60 dark:text-white/60 font-medium">
                    Аренда: {totalExpenses > 0 ? totalExpenses.toLocaleString() : '95 200'} ₽ | ЗП: {totalAccruedSalaries > 0 ? totalAccruedSalaries.toLocaleString() : '178 500'} ₽ | Прочее: 0 ₽
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* PERIOD SWITCHER */}
      {activeTab !== 'salaries' && (
        <div className="h-[56px] bg-[#DDE2E5] dark:bg-[#161618] rounded-full p-1 flex items-center gap-1 mb-6 max-w-md w-full shrink-0 min-h-[48px] relative select-none">
          {(['day', 'week', 'month'] as const).map((mode) => {
            const isActive = periodType === mode;
            const labels = { day: 'День', week: 'Неделя', month: 'Месяц' };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setPeriodType(mode)}
                className={
                  isActive
                    ? "h-full bg-[#CCFF00] text-black font-medium text-sm px-6 rounded-full flex items-center justify-center"
                    : "h-full text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white font-medium text-sm px-6 rounded-full flex items-center justify-center gap-2"
                }
                style={{ transition: 'all .12s cubic-bezier(.4,0,.2,1)' }}
              >
                {labels[mode]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className={
              periodType === 'custom'
                ? "h-full bg-[#CCFF00] text-black font-medium text-sm px-6 rounded-full flex items-center justify-center"
                : "h-full text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white font-medium text-sm px-6 rounded-full flex items-center justify-center gap-2"
            }
            style={{ transition: 'all .12s cubic-bezier(.4,0,.2,1)' }}
            title="Выбрать свой период"
          >
            <Calendar size={18} />
          </button>
        </div>
      )}

      {/* FAB */}
      {activeTab !== 'salaries' && (
        <FloatingActionButton
          onClick={() => {
            if (activeTab === 'income') setIsAddIncomeOpen(true);
            else if (activeTab === 'expenses') setIsAddExpenseOpen(true);
          }}
          ariaLabel="Добавить операцию"
        />
      )}

      {/* Main content */}
      <div className="flex-1 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === 'income' && (
            <motion.div
              key="income-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 style={{ color: accentColor }} className="text-sm font-bold uppercase tracking-wider">
                  Доходы {periodType !== 'month' && `(${range.label})`}
                </h3>
                <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 bg-black/5 dark:bg-white/5 border border-black/10 px-3 py-1 rounded-full shadow-xs">
                  Всего: {filteredIncome.length} транзакций
                </span>
              </div>
              {filteredIncome.length === 0 ? (
                <div style={{ borderRadius: '16px' }} className="p-8 text-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-zinc-800/60 border-dashed rounded-xl shadow-xs">
                  <p className="text-sm font-medium text-[#121214]/50 dark:text-white/60">Нет доходов за выбранный период</p>
                  <button
                    onClick={() => setPeriodType('month')}
                    className="mt-3 text-xs font-medium text-[#CCFF00] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Показать за месяц
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredIncome.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedDetail({ type: 'income', data: tx })}
                      style={{ borderRadius: '20px' }}
                      className="w-full text-left p-4 bg-black/5 dark:bg-white/5 hover:bg-[#DEE2E5] dark:hover:bg-[#23232B] flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                          <Coins size={22} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#121214] dark:text-white truncate">{tx.student}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#121214]/60 dark:text-white/50 font-medium truncate">{tx.type}</span>
                            <PaymentMethodBadge method={tx.paymentMethod} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-medium text-[#CCFF00] leading-none">+{tx.amount.toLocaleString()} ₽</p>
                        <p className="text-[10px] text-[#121214]/50 dark:text-white/50 font-mono mt-1">
                          {new Date(tx.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'salaries' && (
            <motion.div
              key="salaries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#121214]/70 dark:text-white/60">Расчет выплат</h3>
                <span className="text-xs font-mono text-[#121214]/60 dark:text-white/50">Тариф: 1 500 ₽ / урок</span>
              </div>
              <div className="space-y-2.5">
                {coachesSalaries.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => setSelectedDetail({ type: 'salary', data: coach })}
                    style={{ borderRadius: '20px' }}
                    className="w-full text-left p-4 bg-black/5 dark:bg-white/5 hover:bg-[#DEE2E5] dark:hover:bg-[#23232B] flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0 text-lg font-semibold">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#121214] dark:text-white">{coach.name}</p>
                        <p className="text-xs text-[#121214]/60 dark:text-white/50 mt-0.5 font-medium">Отработано: {coach.classes} занятий</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {coach.paid ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                          <CheckCircle size={14} /> Выплачено
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-base font-medium text-[#CCFF00] leading-none">{coach.accrued.toLocaleString()} ₽</p>
                          <p className="text-[10px] text-[#121214]/50 dark:text-white/50 mt-1">К выплате</p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#121214]/70 dark:text-white/60 pl-1">
                  Расходы {periodType !== 'month' && `(${range.label})`}
                </h3>
                <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 bg-black/5 dark:bg-white/5 border border-black/10 px-3 py-1 rounded-full shadow-xs">
                  Всего: {filteredExpenses.length} расходов
                </span>
              </div>
              {filteredExpenses.length === 0 ? (
                <div style={{ borderRadius: '16px' }} className="p-8 text-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-zinc-800/60 border-dashed rounded-xl shadow-xs">
                  <p className="text-sm font-medium text-[#121214]/50 dark:text-white/60">Нет расходов за выбранный период</p>
                  <button
                    onClick={() => setPeriodType('month')}
                    className="mt-3 text-xs font-medium text-[#CCFF00] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Показать за месяц
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredExpenses.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => setSelectedDetail({ type: 'expense', data: exp })}
                      style={{ borderRadius: '20px' }}
                      className="w-full text-left p-4 bg-black/5 dark:bg-white/5 hover:bg-[#DEE2E5] dark:hover:bg-[#23232B] flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                          <Wallet size={22} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#121214] dark:text-white truncate">{exp.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {exp.note && <span className="text-xs text-[#121214]/60 dark:text-white/50 font-bold truncate tracking-wide">{exp.note}</span>}
                            <PaymentMethodBadge method={exp.paymentMethod} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-rose-400 leading-none">-{exp.amount.toLocaleString()} ₽</p>
                          <p className="text-[10px] text-[#121214]/50 dark:text-white/50 font-mono mt-1">
                            {new Date(exp.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal: Add Income */}
      <AnimatePresence>
        {isAddIncomeOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsAddIncomeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 max-w-md w-full text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Coins className="text-[#CCFF00]" size={20} />
                  Добавить приход
                </h3>
                <button
                  onClick={() => setIsAddIncomeOpen(false)}
                  className="w-9 h-9 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] transition-colors cursor-pointer bg-zinc-900/40"
                >
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleAddIncome} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Ученик</label>
                  <input
                    type="text"
                    required
                    placeholder="Имя и фамилия ученика"
                    value={incomeStudent}
                    onChange={(e) => setIncomeStudent(e.target.value)}
                    className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Назначение платежа</label>
                  <select
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className="w-full h-11 px-4 !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 appearance-none cursor-pointer"
                  >
                    <option value="Абонемент 8 занятий">Абонемент 8 занятий (6 400 ₽)</option>
                    <option value="Абонемент 16 занятий">Абонемент 16 занятий (11 200 ₽)</option>
                    <option value="Разовое занятие">Разовое занятие (1 000 ₽)</option>
                    <option value="Индивидуальный урок">Индивидуальный урок (3 500 ₽)</option>
                    <option value="Аренда зала">Аренда зала учеником</option>
                    <option value="Другое">Другое поступление</option>
                  </select>
                </div>
                <div>
                  <PaymentMethodSelector
                    selectedMethod={incomePaymentMethod}
                    onChange={setIncomePaymentMethod}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Сумма (₽)</label>
                    <input
                      type="number"
                      required
                      placeholder="6400"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Дата</label>
                    <input
                      type="date"
                      required
                      value={incomeDate}
                      onChange={(e) => setIncomeDate(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 mt-2 !bg-[#CCFF00] hover:bg-[#B5E600] text-black font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer shadow-lg shadow-[#CCFF00]/10"
                >
                  Внести платеж
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Expense */}
      <AnimatePresence>
        {isAddExpenseOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsAddExpenseOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 max-w-md w-full text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Wallet className="text-rose-400" size={20} />
                  Добавить расход
                </h3>
                <button
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="w-9 h-9 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] transition-colors cursor-pointer bg-zinc-900/40"
                >
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Категория</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full h-11 px-4 !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 appearance-none cursor-pointer"
                  >
                    <option value="Аренда залов">Аренда залов</option>
                    <option value="Маркетинг">Маркетинг / Реклама</option>
                    <option value="Оборудование">Оборудование</option>
                    <option value="Коммунальные">Коммунальные услуги</option>
                    <option value="Хозрасходы">Хозрасходы</option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>
                <div>
                  <PaymentMethodSelector
                    selectedMethod={expensePaymentMethod}
                    onChange={setExpensePaymentMethod}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Сумма (₽)</label>
                    <input
                      type="number"
                      required
                      placeholder="5000"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Дата</label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Комментарий</label>
                  <input
                    type="text"
                    placeholder="Например: аренда малого зала"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 text-white px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 mt-2 !bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer shadow-lg shadow-rose-500/10"
                >
                  Внести расход
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Detailed Item Information */}
      <AnimatePresence>
        {selectedDetail && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 pb-10 max-w-sm w-full text-white shadow-2xl relative max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pl-1 shrink-0">
                <h3 className="text-base font-bold text-white uppercase tracking-wider text-zinc-400"> Детали транзакции </h3>
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="w-9 h-9 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] transition-colors cursor-pointer bg-zinc-900/40"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-5 text-center">
                {selectedDetail.type === 'income' && (
                  <div className="space-y-5">
                    <div className="w-16 h-16 !rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto">
                      <Coins size={30} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-[#CCFF00]">+{selectedDetail.data.amount.toLocaleString()} ₽</p>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Успешное пополнение</p>
                    </div>
                    <div className="h-px bg-zinc-800/60" />
                    <div className="space-y-3.5 text-left bg-zinc-950/40 p-4 !rounded-[16px] border border-zinc-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-zinc-400">Способ оплаты:</span>
                        <PaymentMethodBadge method={selectedDetail.data.paymentMethod} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Ученик:</span>
                        <span className="text-xs font-medium text-white">{selectedDetail.data.student}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Назначение:</span>
                        <span className="text-xs font-medium text-white">{selectedDetail.data.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Дата внесения:</span>
                        <span className="text-xs font-medium text-[#CCFF00] font-mono">
                          {new Date(selectedDetail.data.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetail.type === 'expense' && (
                  <div className="space-y-5">
                    <div className="w-16 h-16 !rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto">
                      <Wallet size={30} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-rose-400">-{selectedDetail.data.amount.toLocaleString()} ₽</p>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Категория расхода</p>
                    </div>
                    <div className="h-px bg-zinc-800/60" />
                    <div className="space-y-3.5 text-left bg-zinc-950/40 p-4 !rounded-[16px] border border-zinc-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-zinc-400">Способ списания:</span>
                        <PaymentMethodBadge method={selectedDetail.data.paymentMethod} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Название:</span>
                        <span className="text-xs font-medium text-white">{selectedDetail.data.category}</span>
                      </div>
                      {selectedDetail.data.note && (
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-zinc-400">Комментарий:</span>
                          <span className="text-xs font-medium text-white max-w-[180px] text-right truncate" title={selectedDetail.data.note}>
                            {selectedDetail.data.note}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Дата списания:</span>
                        <span className="text-xs font-medium text-rose-400 font-mono">
                          {new Date(selectedDetail.data.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetail.type === 'salary' && (
                  <div className="space-y-5">
                    <div className="w-16 h-16 !rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto text-xl font-semibold">
                      {selectedDetail.data.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      {selectedDetail.data.paid ? (
                        <>
                          <p className="text-3xl font-bold text-emerald-400">Выплачено</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Долгов нет</p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-[#CCFF00]">{selectedDetail.data.accrued.toLocaleString()} ₽</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Ожидает выплаты</p>
                        </>
                      )}
                    </div>

                    <div className="h-px bg-zinc-800/60" />

                    <div className="space-y-3.5 text-left bg-zinc-950/40 p-4 !rounded-[16px] border border-zinc-800/30">
                      {selectedDetail.data.paid && selectedDetail.data.paymentMethod && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-zinc-400">Способ выплаты:</span>
                          <PaymentMethodBadge method={selectedDetail.data.paymentMethod} />
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Преподаватель:</span>
                        <span className="text-xs font-medium text-white">{selectedDetail.data.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Отработано уроков:</span>
                        <span className="text-xs font-medium text-white">{selectedDetail.data.classes} занятий</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-zinc-400">Ставка за урок:</span>
                        <span className="text-xs font-medium text-zinc-400 font-mono">1 500 ₽</span>
                      </div>
                    </div>

                    {!selectedDetail.data.paid && (
                      <div className="text-left mt-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2 block mb-1">
                          Выберите способ выплаты:
                        </label>
                        <PaymentMethodSelector
                          selectedMethod={salaryPaymentMethod}
                          onChange={setSalaryPaymentMethod}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="shrink-0 space-y-3 mt-auto">
                {selectedDetail.type === 'expense' && (
                  <button
                    onClick={() => handleDeleteExpense(selectedDetail.data.id)}
                    className="w-full py-3 !bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer"
                  >
                    Удалить запись
                  </button>
                )}
                {selectedDetail.type === 'salary' && (
                  <>
                    {!selectedDetail.data.paid ? (
                      <button
                        onClick={() => handlePaySalary(selectedDetail.data.id)}
                        className="w-full py-3 !bg-[#CCFF00] hover:bg-[#B5E600] text-black font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer shadow-lg shadow-[#CCFF00]/10"
                      >
                        Выплатить ЗП
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider !rounded-full text-center flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} /> Выплата произведена
                      </div>
                    )}
                  </>
                )}
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="w-full py-3 !bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Date Range Modal */}
      <FinanceCalendarModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        startDate={customStartDate}
        endDate={customEndDate}
        accentColor={accentColor}
        activeTextColor={activeTextColor}
        onSelectRange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
          setPeriodType('custom');
          toast({
            title: "Период выбран",
            description: start === end ? `Дата: ${start}` : `Период: с ${start} по ${end}`,
          });
        }}
        onSelectToday={() => {
          const today = "2026-07-25";
          setCustomStartDate(today);
          setCustomEndDate(today);
          setPeriodType('day');
          toast({
            title: "Период сброшен",
            description: "Выбран текущий день",
          });
        }}
      />

      <BottomNav />
    </div>
  );
}
