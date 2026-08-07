import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Users, Home, LayoutGrid, Settings } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ManagementMenu from './ManagementMenu';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAllowed, currentRole } = useRole();

  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Общий класс для иконок (для правильного размера)
  const iconClass = "w-7 h-7 stroke-[2]";

  // Пресет для кнопки: размер, радиус, поведение
  const navBtnClass =
    "relative w-[68px] h-[68px] rounded-full flex items-center justify-center cursor-pointer group focus:outline-none shrink-0 transition-colors duration-300";

  // Универсальный класс для НЕактивной кнопки (icon-holder)
  const baseInactive =
    "w-[68px] h-[68px] flex items-center justify-center bg-transparent text-slate-600 dark:text-zinc-400";

  // Универсальный класс для АКТИВНОЙ кнопки (icon-holder)
  const baseActive =
    "w-[68px] h-[68px] rounded-full flex items-center justify-center bg-[#CCFF00] text-black shadow-md";
    
  // ---------------------------
  // ADMIN MAIN TABS AND LOGIC
  // ---------------------------
  // Главные вкладки для админа (маршруты и их иконки)
  const adminMainRoutes = [
    '/Admin',
    '/admin/schedule',
    '/admin/students'
  ];

  // ---------------------------
  // CLIENT MAIN TABS AND LOGIC
  // ---------------------------
  // Главные вкладки для клиента (маршруты и их иконки)
  const clientMainRoutes = [
    '/',
    '/schedule',
    '/profile'
  ];

  // ---------------------------
  // Доп. меню маршруты (more-menu)
  // ---------------------------
  const moreRoutes = [
    '/settings',
    '/admin-settings',
    '/finance',
    '/analytics',
    '/services',
    '/staff',
    '/admin/finance',
    '/admin/settings',
    '/admin/staff'
  ];

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
    // Главная, расписание, ученики
    const isHomeTabActive = !isMenuOpen && (location === '/Admin' || location === '/Admin/');
    const isScheduleTabActive = !isMenuOpen && (location === '/admin/schedule' || location === '/admin/schedule/');
    const isStudentsTabActive = !isMenuOpen && (location === '/admin/students' || location === '/admin/students/');

    // Универсальное определение основных вкладок:
    const mainRoutes = ['/Admin', '/admin/schedule'];
    if (currentRole !== 'trainer') mainRoutes.push('/admin/students');

    // Проверка активной основной вкладки:
    const isMainPage = mainRoutes.some(route => location === route || location === route + '/');
    const isMoreActive = isMenuOpen || !isMainPage;

    // Для тренера: профиль/настройки
    const isProfileSettingsTabActive = !isMenuOpen && (location === '/profile' || location === '/profile/' || location === '/settings' || location === '/settings/');

    return (
      <>
        {/* z-index: 94! Menu overlay below the nav */}
        <ManagementMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          menuZindex={94}
        />
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[95] flex flex-col items-center pointer-events-none">
          <nav
            id="urban-glass-admin-nav"
            className="relative z-[95] p-3 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 shadow-lg flex gap-3 items-center rounded-full w-max pointer-events-auto transition-colors duration-300"
          >
            {/* Главная */}
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
              <span className={isHomeTabActive ? baseActive : baseInactive}>
                <Home size={28} className={iconClass} />
              </span>
            </Link>

            {/* Расписание */}
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
              <span className={isScheduleTabActive ? baseActive : baseInactive}>
                <Calendar size={28} className={iconClass} />
              </span>
            </Link>

            {/* Ученики (не для тренера) */}
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
                <span className={isStudentsTabActive ? baseActive : baseInactive}>
                  <Users size={28} className={iconClass} />
                </span>
              </Link>
            )}

            {/* Тренер: профиль / Админ: "..." меню */}
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
                <span className={isProfileSettingsTabActive ? baseActive : baseInactive}>
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
                <span className={isMoreActive ? baseActive : baseInactive}>
                  <LayoutGrid size={28} className={iconClass} />
                </span>
              </button>
            )}
          </nav>
        </div>
      </>
    );
  }

  // NAVIGATION: CLIENT

  // Основные маршруты клиента (без settings)
  const mainClientRoutes = ['/', '/schedule', '/profile'];

  // Активности для первых трех иконок (подсвечиваются при точном совпадении)
  const isHomeTabActive = !isMenuOpen && (location === '/' || location === '//');
  const isScheduleTabActive = !isMenuOpen && (location === '/schedule' || location === '/schedule/');
  const isProfileTabActive = !isMenuOpen && (location === '/profile' || location === '/profile/');

  // 4-я иконка считается "more": settings
  const isMainPageClient = mainClientRoutes.some(route => location === route || location === route + '/');
  const isMoreActiveClient = !isMainPageClient;

  return (
    <nav
      id="urban-glass-client-nav"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 p-3 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 shadow-lg flex gap-3 items-center z-[95] rounded-full w-max pointer-events-auto transition-colors duration-300"
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
        <span className={isHomeTabActive ? baseActive : baseInactive}>
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
        <span className={isScheduleTabActive ? baseActive : baseInactive}>
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
        <span className={isProfileTabActive ? baseActive : baseInactive}>
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
        <span className={isMoreActiveClient ? baseActive : baseInactive}>
          <Settings size={28} className={iconClass} />
        </span>
      </Link>
    </nav>
  );
}