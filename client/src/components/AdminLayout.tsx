import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`min-h-screen min-h-[100dvh] flex flex-col font-sans relative transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-[#F0EEE9] text-slate-900' 
          : 'bg-black text-white'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default AdminLayout;
