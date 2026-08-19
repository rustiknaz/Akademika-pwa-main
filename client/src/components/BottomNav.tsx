import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Users, Home, LayoutGrid, Settings, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ManagementMenu from './ManagementMenu';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAllowed, currentRole } = useRole();
  const { accentColor } = useTheme();

  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Общий класс для иконок
  const iconClass = "w-7 h-7 stroke-[2]";

  // Пресет для кнопки: оригинальный размер 68px
  const navBtnClass =
    "relative w-[68px] h-[68px] rounded-full flex items-center justify-center cursor-pointer group focus:outline-none shrink-0 transition-colors duration-300";

  // Универсальный класс для НЕактивной кнопки
  const baseInactive =
    "w-[68px] h-[68px] flex items-center justify-center bg-transparent text-slate-600 dark:text-zinc-400";

  // Универсальный класс для АКТИВНОЙ кнопки
  const baseActive =
    "w-[68px] h-[68px] rounded-full flex items-center justify-center text-black shadow-md";

  // Постоянный градиентный стиль для кнопки AI Ассистента
  const aiButtonGradient =
    "w-[68px] h-[68px] rounded-full flex items-center justify-center bg-gradient-to-tr from-[#CCFF00] via-[#00F0FF] to-[#BD00FF] text-black shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95";

  // -----------
  // Определения режима и флагов страниц
  // -----------
  const isAdminMode =
    currentRole === 'trainer' ||
    location === '/Admin' ||
    location.startsWith('/admin') ||
    location === '/add-class' ||
    location.startsWith('/edit-class') ||
    location === '/profile' ||
    location === '/settings';

  // NAVIGATION: ADMIN MODE
  if (isAdminMode) {
    const isHomeTabActive = !isMenuOpen && (location === '/Admin' || location === '/Admin/' || location === '/admin');
    const isScheduleTabActive = !isMenuOpen && (location === '/admin/schedule' || location === '/admin/schedule/');
    const isStudentsTabActive = !isMenuOpen && (location === '/admin/students' || location === '/admin/students/');

    // Проверка активности меню шторки
    const mainRoutes = ['/Admin', '/admin', '/admin/schedule', '/admin/ai', '/admin/marketing'];
    if (currentRole !== 'trainer') mainRoutes.push('/admin/students');

    const isMainPage = mainRoutes.some(route => location === route || location === route + '/');
    const isMoreActive = isMenuOpen || (!isMainPage && !location.startsWith('/admin/ai'));

    // Для тренера: профиль/настройки
    const isProfileSettingsTabActive = !isMenuOpen && (location === '/profile' || location === '/profile/' || location === '/settings' || location === '/settings/');

    return (
      <>
        <ManagementMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          menuZindex={94}
        />
        
        {/* ─── ОБЩИЙ КОНТЕЙНЕР (СВЯЗКА ПИЛЮЛИ И КНОПКИ AI ЧЕРЕЗ GAP-2.5) ─── */}
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[95] flex items-center justify-center gap-2.5 pointer-events-none select-none max-w-full">
          
          {/* 1. ОСНОВНАЯ ПИЛЮЛЯ НАВИГАЦИИ (ПЛОТНЫЙ GAP-1.5 МЕЖДУ ЗНАЧКАМИ) */}
          <nav
            id="urban-glass-admin-nav"
            className="p-3 bg-white/30 dark:bg-black/25 backdrop-blur-md shadow-lg flex gap-1.5 items-center rounded-full w-max pointer-events-auto transition-colors duration-300 border-none"
          >
            {/* 1. Главная */}
            <Link
              href="/Admin"
              className={navBtnClass}
              title="Главная"
              onClick={e => {
                e.preventDefault();
                if (!isHomeTabActive) { setLocation('/Admin'); }
                setIsMenuOpen(false);
              }}
            >
              <span 
                style={isHomeTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                className={isHomeTabActive ? baseActive : baseInactive}
              >
                <Home size={28} className={iconClass} />
              </span>
            </Link>

            {/* 2. Расписание */}
            <Link
              href="/admin/schedule"
              className={navBtnClass}
              title="Расписание"
              onClick={e => {
                e.preventDefault();
                if (!isScheduleTabActive) { setLocation('/admin/schedule'); }
                setIsMenuOpen(false);
              }}
            >
              <span 
                style={isScheduleTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                className={isScheduleTabActive ? baseActive : baseInactive}
              >
                <Calendar size={28} className={iconClass} />
              </span>
            </Link>

            {/* 3. Ученики (не для тренера) */}
            {currentRole !== 'trainer' && isAllowed('/admin/students') && (
              <Link
                href="/admin/students"
                className={navBtnClass}
                title="Ученики"
                onClick={e => {
                  e.preventDefault();
                  if (!isStudentsTabActive) { setLocation('/admin/students'); }
                  setIsMenuOpen(false);
                }}
              >
                <span 
                  style={isStudentsTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                  className={isStudentsTabActive ? baseActive : baseInactive}
                >
                  <Users size={28} className={iconClass} />
                </span>
              </Link>
            )}

            {/* 4. Меню шторки (для тренера — профиль, для админа — LayoutGrid) */}
            {currentRole === 'trainer' ? (
              <Link
                href="/profile"
                className={navBtnClass}
                title="Профиль/Настройки"
                onClick={e => {
                  e.preventDefault();
                  if (!isProfileSettingsTabActive) { setLocation('/profile'); }
                  setIsMenuOpen(false);
                }}
              >
                <span 
                  style={isProfileSettingsTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                  className={isProfileSettingsTabActive ? baseActive : baseInactive}
                >
                  <Settings size={28} className={iconClass} />
                </span>
              </Link>
            ) : (
              <button
                ref={menuBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className={navBtnClass}
                title="Меню"
                type="button"
              >
                <span 
                  style={isMoreActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
                  className={isMoreActive ? baseActive : baseInactive}
                >
                  <LayoutGrid size={28} className={iconClass} />
                </span>
              </button>
            )}
          </nav>

          {/* 2. ОТДЕЛЬНАЯ КРУГЛАЯ КНОПКА AI В ОДНОТИПНОЙ ПОДЛОЖКЕ */}
          <div className="p-3 bg-white/30 dark:bg-black/25 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center pointer-events-auto transition-colors duration-300 border-none shrink-0">
            <Link
              href="/admin/ai"
              className={navBtnClass}
              title="AI Ассистент"
              onClick={e => {
                e.preventDefault();
                setLocation('/admin/ai');
                setIsMenuOpen(false);
              }}
            >
              <span className={aiButtonGradient}>
                <Sparkles size={28} className="w-7 h-7 stroke-[2.5] text-black drop-shadow-sm" />
              </span>
            </Link>
          </div>

        </div>
      </>
    );
  }

  // NAVIGATION: CLIENT
  const isHomeTabActive = !isMenuOpen && (location === '/' || location === '//');
  const isScheduleTabActive = !isMenuOpen && (location === '/schedule' || location === '/schedule/');
  const isProfileTabActive = !isMenuOpen && (location === '/profile' || location === '/profile/');

  const mainClientRoutes = ['/', '/schedule', '/profile'];
  const isMainPageClient = mainClientRoutes.some(route => location === route || location === route + '/');
  const isMoreActiveClient = !isMainPageClient;

  return (
    <nav
      id="urban-glass-client-nav"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 p-3 bg-white/30 dark:bg-black/25 backdrop-blur-md shadow-lg flex gap-1.5 items-center z-[95] rounded-full w-max pointer-events-auto transition-colors duration-300 border-none"
    >
      <Link
        href="/"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          if (!isHomeTabActive) { setLocation('/'); }
          setIsMenuOpen(false);
        }}
      >
        <span 
          style={isHomeTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
          className={isHomeTabActive ? baseActive : baseInactive}
        >
          <Home size={28} className={iconClass} />
        </span>
      </Link>
      <Link
        href="/schedule"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          if (!isScheduleTabActive) { setLocation('/schedule'); }
          setIsMenuOpen(false);
        }}
      >
        <span 
          style={isScheduleTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
          className={isScheduleTabActive ? baseActive : baseInactive}
        >
          <Calendar size={28} className={iconClass} />
        </span>
      </Link>
      <Link
        href="/profile"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          if (!isProfileTabActive) { setLocation('/profile'); }
          setIsMenuOpen(false);
        }}
      >
        <span 
          style={isProfileTabActive ? { backgroundColor: accentColor || '#CCFF00' } : {}}
          className={isProfileTabActive ? baseActive : baseInactive}
        >
          <User size={28} className={iconClass} />
        </span>
      </Link>
      <Link
        href="/settings"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          if (!isMoreActiveClient) { setLocation('/settings'); }
          setIsMenuOpen(false);
        }}
      >
        <span 
          style={isMoreActiveClient ? { backgroundColor: accentColor || '#CCFF00' } : {}}
          className={isMoreActiveClient ? baseActive : baseInactive}
        >
          <Settings size={28} className={iconClass} />
        </span>
      </Link>
    </nav>
  );
}