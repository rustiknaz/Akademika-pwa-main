import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomFilterDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function CustomFilterDropdown({
  value,
  options,
  onChange,
}: CustomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне дропдауна
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Кнопка-триггер дропдауна */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-200/70 dark:bg-zinc-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border-none outline-none"
      >
        <span className="truncate">{value}</span>
        <ChevronDown 
          size={14} 
          className={`text-slate-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Выпадающий список с галочками */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl shadow-xl z-50 py-1.5 max-h-48 overflow-y-auto scrollbar-none">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer border-none ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-zinc-800/80 text-black dark:text-[#CCFF00] font-bold'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && (
                  <Check size={14} className="text-black dark:text-[#CCFF00] stroke-[2.5] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}