import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface SwitcherOption<T extends string> {
  id: T;
  label: string;
}

interface PeriodHeaderBannerProps<T extends string> {
  title: string;
  icon?: LucideIcon;
  options: SwitcherOption<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  layoutId: string;
  className?: string;
  extraRightAction?: React.ReactNode;
}

export function PeriodHeaderBanner<T extends string>({
  title,
  icon: Icon = CalendarDays,
  options,
  activeId,
  onSelect,
  layoutId,
  className = "",
  extraRightAction,
}: PeriodHeaderBannerProps<T>) {
  const { accentColor, activeTextColor } = useTheme();

  return (
    <div className={`flex justify-between items-center bg-[#CDD2D7] p-1.5 rounded-full shadow-sm min-h-[48px] ${className}`}>
      {/* Left Section: Icon + Title aligned items-center */}
      <div className="flex items-center gap-2 min-w-0 flex-1 pl-2.5 pr-2">
        <Icon className="w-4 h-4 shrink-0 text-[#121214]" />
        <span className="text-xs font-bold text-[#121214] uppercase tracking-wider truncate">
          {title}
        </span>
      </div>

      {/* Right Section: Period Pill Switcher (Stretches 100% height with equal p-1.5 padding) */}
      <div className="flex items-stretch shrink-0 gap-1 select-none self-stretch">
        {options.map((option) => {
          const isActive = activeId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`relative h-full flex items-center justify-center px-3.5 md:px-4 rounded-full text-xs md:text-xs font-bold uppercase tracking-wider leading-none transition-colors duration-200 border-none outline-none cursor-pointer z-10${
                isActive
                  ? 'text-slate-900'
                  : 'text-slate-800 hover:text-black bg-transparent'
              }`}
              style={isActive ? { color: activeTextColor === '#000000' ? '#000000' : activeTextColor } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{ backgroundColor: accentColor || '#CCFF00' }}
                  className="absolute inset-0 rounded-full shadow-sm -z-10"
                />
              )}
              {option.label}
            </button>
          );
        })}
        {extraRightAction}
      </div>
    </div>
  );
}
