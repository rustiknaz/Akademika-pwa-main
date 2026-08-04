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

  const glowRgb = accentConfig?.glowRgb || "204, 255, 0";
  const textColor = accentTextHex || (accentConfig?.textColor === 'text-black' ? '#000000' : '#ffffff');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        backgroundColor: accentColor || 'var(--accent-color, #CCFF00)',
        color: textColor,
        boxShadow: `0 8px 25px rgba(${glowRgb}, 0.45)`,
      }}
      className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none outline-none select-none bg-[var(--accent-color)] text-[var(--accent-text-color)] ${className}`}
      {...props}
    >
      {icon || <Plus size={28} className="stroke-[2.5px]" />}
    </button>
  );
};

export default FloatingActionButton;
