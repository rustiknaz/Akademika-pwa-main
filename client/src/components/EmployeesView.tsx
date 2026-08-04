import React, { useState, useEffect } from 'react';
import EmployeeCard, { StaffMember } from './EmployeeCard';
import PaySalaryModal, { PaymentMethod } from './PaySalaryModal';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';

export interface EmployeesViewProps {
  staff: StaffMember[];
  onUpdateStaff: (updatedStaff: StaffMember[]) => void;
  onSelectStaffProfile: (member: StaffMember) => void;
  onOpenAddModal: () => void;
}

export default function EmployeesView({
  staff,
  onUpdateStaff,
  onSelectStaffProfile,
  onOpenAddModal,
}: EmployeesViewProps) {
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();

  const [roleFilter, setRoleFilter] = useState<'all' | 'coaches' | 'admins' | 'others'>('all');
  const [payingStaffMember, setPayingStaffMember] = useState<StaffMember | null>(null);

  const filteredStaff = staff.filter((member) => {
    if (roleFilter === 'coaches') return member.role === 'coach';
    if (roleFilter === 'admins') return member.role === 'admin';
    if (roleFilter === 'others') return member.role === 'other' || (member.role !== 'coach' && member.role !== 'admin');
    return true;
  });

  const handleOpenPaySalary = (member: StaffMember) => {
    setPayingStaffMember(member);
  };

  const handleConfirmPayout = (payoutData: {
    staffId: number;
    staffName: string;
    role: string;
    amount: number;
    paymentMethod: PaymentMethod;
    note?: string;
    date: string;
  }) => {
    // 1. Update balance in staff list
    const updated = staff.map(s => {
      if (s.id === payoutData.staffId) {
        const newBal = Math.max(0, s.balance - payoutData.amount);
        return { ...s, balance: newBal };
      }
      return s;
    });

    onUpdateStaff(updated);
    try {
      localStorage.setItem('studio_staff', JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving studio_staff to localStorage:", e);
    }

    // 2. Save payout transaction to localStorage for Finance sync
    try {
      const existingPayoutsRaw = localStorage.getItem('studio_salary_payouts');
      const existingPayouts = existingPayoutsRaw ? JSON.parse(existingPayoutsRaw) : [];
      const newPayoutRecord = {
        id: Date.now(),
        ...payoutData,
      };
      const updatedPayouts = [newPayoutRecord, ...existingPayouts];
      localStorage.setItem('studio_salary_payouts', JSON.stringify(updatedPayouts));
    } catch (e) {
      console.error("Error saving payout to localStorage:", e);
    }

    // Method badge text
    const methodNames: Record<PaymentMethod, string> = {
      cash: '💵 Наличные',
      terminal: '💳 Карта',
      transfer: '🏦 Расчетный счет',
      sbp: '⚡ СБП'
    };

    toast({
      title: "Выплата ЗП оформлена!",
      description: `Выплачено ${payoutData.amount.toLocaleString()} ₽ сотруднику ${payoutData.staffName} (${methodNames[payoutData.paymentMethod]})`,
    });

    setPayingStaffMember(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Фильтр ролей сотрудников */}
      <div className="bg-[#121214]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center justify-between w-full my-4 shadow-md shrink-0">
        {[
          { id: 'all', label: 'ВСЕ' },
          { id: 'coaches', label: 'ТРЕНЕРЫ' },
          { id: 'admins', label: 'АДМИНЫ' },
          { id: 'others', label: 'ДРУГИЕ' }
        ].map((option) => {
          const isActive = roleFilter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setRoleFilter(option.id as any)}
              style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
              className={
                isActive
? "bg-[#CCFF00] text-black font-bold text-xs uppercase tracking-wider rounded-control px-5 py-2.5 transition-all shadow-md border-none outline-none cursor-pointer"
: "text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer border-none outline-none bg-transparent"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Список карточек сотрудников */}
      <div className="flex-1 pb-4 pr-0.5">
        {filteredStaff.length === 0 ? (
          <div style={{ borderRadius: '16px' }} className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-zinc-800/80 border-dashed rounded-xl py-12 text-center text-slate-400 dark:text-stone-400 font-medium text-xs shadow-xs">
            Сотрудники выбранной категории отсутствуют
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStaff.map((member) => (
              <EmployeeCard
                key={member.id}
                member={member}
                onSelectProfile={onSelectStaffProfile}
                onPaySalary={handleOpenPaySalary}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно выплаты ЗП */}
      <PaySalaryModal
        isOpen={Boolean(payingStaffMember)}
        onClose={() => setPayingStaffMember(null)}
        staffMember={payingStaffMember}
        onConfirmPayout={handleConfirmPayout}
      />
    </div>
  );
}
