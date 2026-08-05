import React, { useState, useEffect } from 'react';
import { Calendar, User, Users, Home, LayoutGrid, Settings, Layers } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import ManagementMenu from './ManagementMenu';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { accentColor, accentConfig } = useTheme();
  const { isAllowed, currentRole } = useRole();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isAdminMode = currentRole === 'trainer' ||
                      location === '/Admin' || 
                      location.startsWith('/admin') || 
                      location === '/add-class' || 
                      location.startsWith('/edit-class') ||
                      location === '/profile' ||
                      location === '/settings';

  const springTransition = { type: "spring", stiffness: 400, damping: 28 };
  const iconActiveTextColor = accentConfig.textColor === 'text-black' ? 'text-zinc-950' : 'text-white';

  if (isAdminMode) {
    const isHome = (location === '/Admin' || location === '/') && !isMenuOpen;
    const isSchedule = (location === '/admin/schedule' || location === '/schedule') && !isMenuOpen;
    const isStudents = location === '/admin/students' && !isMenuOpen;
    const isProfileSettings = (location === '/profile' || location === '/settings') && !isMenuOpen;
    const isManagement = location === '/admin/finance' || 
                         location === '/admin/staff' || 
                         location === '/admin/settings';
    const isMoreActive = isManagement || isMenuOpen;

    return (
      <>
        {/* Всплывающее меню управления */}
        <ManagementMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Навигационная панель с z-[95] */}
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[95] flex flex-col items-center pointer-events-none">
          <nav 
            id="urban-glass-admin-nav"
            className="relative z-[95] p-3 bg-[#DDE2E5]/70 dark:bg-[#161618]/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex gap-3 items-center rounded-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-max pointer-events-auto transition-colors duration-300"
          >
            {/* 1. Главная */}
            <Link href="/Admin" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none" title="Главная">
              {isHome ? (
                <motion.div 
                  layoutId="activeTabGlowAdmin" 
                  style={{ backgroundColor: accentColor }}
                  className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                  transition={springTransition} 
                />
              ) : (
                <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
              )}
              <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isHome ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                <Home size={28} className="w-7 h-7 stroke-[2]" />
              </span>
            </Link>

            {/* 2. Расписание */}
            <Link href="/admin/schedule" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none" title="Расписание">
              {isSchedule ? (
                <motion.div 
                  layoutId="activeTabGlowAdmin" 
                  style={{ backgroundColor: accentColor }}
                  className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                  transition={springTransition} 
                />
              ) : (
                <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
              )}
              <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isSchedule ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                <Calendar size={28} className="w-7 h-7 stroke-[2]" />
              </span>
            </Link>

            {/* 3. Овнер/Админ: Ученики (Скрыто для роли Тренер) */}
            {currentRole !== 'trainer' && isAllowed('/admin/students') && (
              <Link href="/admin/students" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none" title="Ученики">
                {isStudents ? (
                  <motion.div 
                    layoutId="activeTabGlowAdmin" 
                    style={{ backgroundColor: accentColor }}
                    className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                    transition={springTransition} 
                  />
                ) : (
                  <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-transparent transition-colors duration-300" />
                )}
                <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isStudents ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                  <Users size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </Link>
            )}

            {/* 3 у Тренера / 4 у Админа: Тренер: Настройки профиля; Админ/Овнер: Всплывающее меню управления */}
            {currentRole === 'trainer' ? (
              <Link href="/profile" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none" title="Профиль/Настройки">
                {isProfileSettings ? (
                  <motion.div 
                    layoutId="activeTabGlowAdmin" 
                    style={{ backgroundColor: accentColor }}
                    className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                    transition={springTransition} 
                  />
                ) : (
          
                  <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
                )}
                <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isProfileSettings ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                  <Settings size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </Link>
            ) : (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer focus:outline-none group" title="Меню">
                {isMoreActive ? (
                  <motion.div 
                    layoutId="activeTabGlowAdmin" 
                    style={{ backgroundColor: accentColor }}
                    className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
                    transition={springTransition} 
                  />
                ) : (
                  <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
                )}
                <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isMoreActive ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
                  <LayoutGrid size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </button>
            )}
          </nav>
        </div>
      </>
    );
  }

  const isHome = location === '/';
  const isSchedule = location === '/schedule';
  const isProfile = location === '/profile';
  const isSettings = location === '/settings';

  return (
    <nav id="urban-glass-client-nav" className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 p-3 bg-[#DDE2E5]/70 dark:bg-[#161618]/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex gap-3 items-center z-[95] rounded-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-max pointer-events-auto transition-colors duration-300">
      <Link href="/" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none">
        {isHome ? (
          <motion.div 
            layoutId="activeTabGlowClient" 
            style={{ backgroundColor: accentColor }}
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
            transition={springTransition} 
          />
        ) : (
          <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
        )}
        <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isHome ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
          <Home size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link href="/schedule" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none">
        {isSchedule ? (
          <motion.div 
            layoutId="activeTabGlowClient" 
            style={{ backgroundColor: accentColor }}
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
            transition={springTransition} 
          />
        ) : (
          <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
        )}
        <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isSchedule ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
          <Calendar size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link href="/profile" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none">
        {isProfile ? (
          <motion.div 
            layoutId="activeTabGlowClient" 
            style={{ backgroundColor: accentColor }}
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
            transition={springTransition} 
          />
        ) : (
          <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
        )}
        <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isProfile ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
          <User size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link href="/settings" className="relative w-14 h-14 shrink-0 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer group focus:outline-none">
        {isSettings ? (
          <motion.div 
            layoutId="activeTabGlowClient" 
            style={{ backgroundColor: accentColor }}
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm" 
            transition={springTransition} 
          />
        ) : (
          <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
        )}
        <span className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isSettings ? iconActiveTextColor : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200'}`}>
          <Settings size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
    </nav>
  );
}