import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  ariaLabel = "Добавить",
  className = '',
  onClick,
  ...props
}) => {
  const { accentColor, accentTextHex, accentConfig } = useTheme();

  const textColor = accentTextHex || (accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        backgroundColor: accentColor || 'var(--accent-color, #CCFF00)',
        color: textColor,
        boxShadow: 'none',
      }}
      className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none outline-none select-none ${className}`}
      {...props}
    >
      {icon || <Plus size={28} className="stroke-[2.5px]" />}
    </button>
  );
};

export default FloatingActionButton;