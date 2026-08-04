import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useTheme } from '../context/ThemeContext';

interface CustomFilterDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export const CustomFilterDropdown: React.FC<CustomFilterDropdownProps> = ({
  value,
  options,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { accentColor, accentTextHex } = useTheme();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`ui-select flex items-center justify-between gap-2 px-4 py-2 bg-[#CDD2D7] hover:bg-[#c3c8cd] shadow-sm transition-all text-[#121214] text-xs font-bold !rounded-full cursor-pointer outline-none select-none shrink-0${className}`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            size={14}
            className={`text-[#121214] shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-[120] min-w-[190px] w-auto max-w-[260px] p-1.5 bg-[#CDD2D7] dark:bg-[#1A1A1C] rounded-inner shadow-2xl outline-none select-none backdrop-blur-md space-y-1"
      >
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              style={
                isSelected
                  ? {
                      backgroundColor: accentColor || '#CCFF00',
                      color: accentTextHex || '#000000',
                    }
                  : {}
              }
              className={`w-full text-left px-3.5 py-2.5 rounded-control text-xs transition-all flex items-center justify-between cursor-pointer border-none outline-none ${
                isSelected
? 'font-normal shadow-xs'
: 'font-medium text-[#121214] dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10 bg-transparent'
              }`}
            >
              <span className="truncate pr-2">{option}</span>
              {isSelected && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default CustomFilterDropdown;
