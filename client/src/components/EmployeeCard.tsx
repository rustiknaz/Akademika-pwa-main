import React from 'react';
import { Briefcase, CreditCard } from 'lucide-react';

export interface StaffMember {
  id: number;
  name: string;
  avatar: string;
  role: 'coach' | 'admin' | 'other';
  directions?: string[];
  shifts?: number;
  phone: string;
  balance: number;
}

interface EmployeeCardProps {
  member: StaffMember;
  onSelectProfile: (member: StaffMember) => void;
  onPaySalary: (member: StaffMember) => void;
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function renderAvatar(member: StaffMember, sizeClass = "w-12 h-12 text-sm") {
  if (member.avatar && member.avatar.length > 4) {
    return (
      <div className={`${sizeClass} !rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 shadow-inner shadow-black/20`}>
        <img src={member.avatar} className="object-cover w-full h-full" alt={member.name} referrerPolicy="no-referrer" />
      </div>
    );
  }
  
  const initials = getInitials(member.name);
  return (
    <div className={`${sizeClass}!rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center font-bold tracking-wider text-zinc-300 shrink-0 select-none shadow-inner shadow-black/20`}>
      {initials || <span className="text-zinc-500">?</span>}
    </div>
  );
}

export default function EmployeeCard({
  member,
  onSelectProfile,
  onPaySalary,
}: EmployeeCardProps) {
  const isBalancePositive = member.balance > 0;

  return (
    <div
      onClick={() => onSelectProfile(member)}
      className="w-full text-left !bg-[#18181b] border !border-zinc-800 rounded-outer p-4 flex flex-col gap-4 relative shadow-lg shadow-black/10 hover:bg-zinc-900/60 transition-all active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3.5">
          {renderAvatar(member, "w-12 h-12")}
          <div>
            <h3 className="text-base font-medium text-white flex items-center gap-1.5">
              {member.name}
              <span className={`text-xs px-2.5 py-0.5 !rounded-full font-bold uppercase tracking-wide${
                member.role === 'coach' 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' 
                  : member.role === 'admin'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
              }`}>
                {member.role === 'coach' ? 'Тренер' : member.role === 'admin' ? 'Админ' : 'Персонал'}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">{member.phone}</p>
          </div>
        </div>
      </div>

      {/* Направления или смены */}
      {member.role === 'coach' && member.directions && (
        <div className="flex flex-wrap gap-1.5">
          {member.directions.map((dir, idx) => (
            <span 
              key={idx} 
              className="ui-tag text-xs bg-zinc-800/80 text-zinc-300 px-3 py-1 !rounded-full border border-zinc-800 font-bold"
            >
              {dir}
            </span>
          ))}
        </div>
      )}

      {member.role === 'admin' && (
        <p className="text-xs text-zinc-400">
          Отработано смен: <span className="font-medium text-white">{member.shifts || 0}</span>
        </p>
      )}

      <div className="h-px bg-zinc-800/60 w-full" />

      {/* Плашка баланса ЗП с кнопкой Выплатить */}
      <div className="ui-strip flex justify-between items-center bg-zinc-950/40 p-3 border border-zinc-800/50 w-full flex-wrap sm:flex-nowrap gap-2">
        <div className="flex items-center gap-2">
          <Briefcase size={13} className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Баланс ЗП:</span>
          <span className={`text-sm font-medium${isBalancePositive ? 'text-[#CCFF00]' : 'text-stone-500'}`}>
            {isBalancePositive ? `${member.balance.toLocaleString()} ₽` : '0 ₽'}
          </span>
        </div>

        <button
          type="button"
          disabled={!isBalancePositive}
          onClick={(e) => {
            e.stopPropagation();
            if (isBalancePositive) {
              onPaySalary(member);
            }
          }}
          className={`font-bold text-xs px-4 py-2 !rounded-full transition-all flex items-center gap-1.5 shadow-md border-none${
            isBalancePositive
              ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black cursor-pointer active:scale-95'
              : 'bg-zinc-800 text-zinc-500 opacity-50 pointer-events-none cursor-not-allowed'
          }`}
        >
          <CreditCard size={13} className="stroke-[2.5]" />
          <span>Выплатить ЗП</span>
        </button>
      </div>
    </div>
  );
}
