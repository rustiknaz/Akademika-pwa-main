import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Users, Home, LayoutGrid, Settings } from 'lucide-react';
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

  // Use refs to track tab click "re-entrance"
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  // ----
  // HANDLE: Открытие/закрытие доп. меню и клик по вкладкам: 
  //   - любой саб-тоггл/вкладка сразу ставит location и закрывает меню;
  //   - по кнопке меню - открывает/закрывает меню.
  //   - если оверлей открыт — не заблокировать сам низ (z-индекс оверлея ниже панели!).
  // ----

  // 1. Оверлей ManagementMenu должен быть под осн. навигацией!
  //   z-[94] для ManagementMenu, z-[95] для nav

  // 2. Закрытие меню при переходе по вкладкам (в том числе на повторный клик).
  //    !!! Вместо useEffect используем явное управление при кликах и смене location.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isAdminMode =
    currentRole === 'trainer' ||
    location === '/Admin' ||
    location.startsWith('/admin') ||
    location === '/add-class' ||
    location.startsWith('/edit-class') ||
    location === '/profile' ||
    location === '/settings';

  const springTransition = { type: "spring", stiffness: 400, damping: 28 };
  const iconActiveTextColor = accentConfig.textColor === 'text-black' ? 'text-zinc-950' : 'text-white';

  const navBtnClass =
    "relative w-[68px] h-[68px] rounded-full flex items-center justify-center cursor-pointer group focus:outline-none shrink-0 flex-shrink-0 transition-colors duration-300";

  function PillBg({ active, accent }: { active: boolean; accent?: boolean }) {
    if (active) {
      return (
        <motion.div
          layoutId="activeTabGlow"
          style={{
            backgroundColor: accent ? accentColor : "#fff",
          }}
          className={`absolute inset-0 rounded-full border border-black/10 dark:border-white/20 shadow-sm`}
          transition={springTransition}
        />
      );
    }
    // НЕ активное
    return (
      <div className="absolute inset-0 rounded-full bg-white/60 dark:bg-[#2A2B2D] group-hover:bg-white/90 dark:group-hover:bg-white/10 transition-colors duration-300" />
    );
  }

  // Специально для подложки "Ученики", иначе — стандарт "w-[68px] h-[68px] rounded-full ..."
  function TransparentPillBg() {
    return (
      <div className="absolute inset-0 rounded-full bg-white/40 dark:bg-white/5 group-hover:bg-white/70 dark:group-hover:bg-white/10 transition-colors duration-300" />
    );
  }

  // Единый обработчик для Link и кнопки, чтобы всегда закрывать меню.
  function handleNavClick(
    href?: string,
    forceCloseMenu = false
  ) {
    if (href && href !== location) {
      setLocation(href);
    }
    // Меню всегда закрываем по клику на любую вкладку
    if (isMenuOpen || forceCloseMenu) setIsMenuOpen(false);
  }

  // Обработчик только для кнопки меню (LayoutGrid)
  function handleMenuBtnClick() {
    setIsMenuOpen((prev) => !prev);
  }

  // --- ADMIN MODE ---
  if (isAdminMode) {
    // ! isMenuOpen не влияет на выделение активной табы (убираем !isMenuOpen проверки)
    const isHome = location === '/Admin' || location === '/';
    const isSchedule = location === '/admin/schedule' || location === '/schedule';
    const isStudents = location === '/admin/students';
    const isProfileSettings = location === '/profile' || location === '/settings';
    const isManagement =
      location === '/admin/finance' ||
      location === '/admin/staff' ||
      location === '/admin/settings';
    const isMoreActive = isManagement || isMenuOpen;

    return (
      <>
        {/* z-index: 94! Оверлей под навигацией */}
        <ManagementMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          menuZindex={94} // new optional prop if you want to control, otherwise set in CSS
        />
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[95] flex flex-col items-center pointer-events-none">
          <nav
            id="urban-glass-admin-nav"
            className="relative z-[95] p-3 bg-[#DDE2E5]/70 dark:bg-[#161618]/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex gap-3 items-center rounded-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-max pointer-events-auto transition-colors duration-300"
          >
            {/* 1. Главная */}
            <Link
              href="/Admin"
              className={navBtnClass}
              title="Главная"
              onClick={e => {
                e.preventDefault();
                handleNavClick('/Admin', true);
              }}
            >
              <PillBg active={isHome} accent />
              <span
                className={
                  `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
                  (isHome
                    ? iconActiveTextColor
                    : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
                }
              >
                <Home size={28} className="w-7 h-7 stroke-[2]" />
              </span>
            </Link>

            {/* 2. Расписание */}
            <Link
              href="/admin/schedule"
              className={navBtnClass}
              title="Расписание"
              onClick={e => {
                e.preventDefault();
                handleNavClick('/admin/schedule', true);
              }}
            >
              <PillBg active={isSchedule} accent />
              <span
                className={
                  `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
                  (isSchedule
                    ? iconActiveTextColor
                    : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
                }
              >
                <Calendar size={28} className="w-7 h-7 stroke-[2]" />
              </span>
            </Link>

            {/* 3. Овнер/Админ: Ученики (Скрыто для роли Тренер) */}
            {currentRole !== 'trainer' && isAllowed('/admin/students') && (
              <Link
                href="/admin/students"
                className={navBtnClass}
                title="Ученики"
                onClick={e => {
                  e.preventDefault();
                  handleNavClick('/admin/students', true);
                }}
              >
                {isStudents
                  ? <PillBg active accent />
                  : <TransparentPillBg />
                }
                <span
                  className={
                    `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
                    (isStudents
                      ? iconActiveTextColor
                      : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
                  }
                >
                  <Users size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </Link>
            )}

            {/* 3 у Тренера / 4 у Админа: Тренер: Настройки профиля; Админ/Овнер: Всплывающее меню управления */}
            {currentRole === 'trainer' ? (
              <Link
                href="/profile"
                className={navBtnClass}
                title="Профиль/Настройки"
                onClick={e => {
                  e.preventDefault();
                  handleNavClick('/profile', true);
                }}
              >
                <PillBg active={isProfileSettings} accent />
                <span
                  className={
                    `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
                    (isProfileSettings
                      ? iconActiveTextColor
                      : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
                  }
                >
                  <Settings size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </Link>
            ) : (
              <button
                ref={menuBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  handleMenuBtnClick();
                }}
                className={navBtnClass}
                title="Меню"
                type="button"
              >
                <PillBg active={isMoreActive} accent />
                <span
                  className={
                    `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
                    (isMoreActive
                      ? iconActiveTextColor
                      : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
                  }
                >
                  <LayoutGrid size={28} className="w-7 h-7 stroke-[2]" />
                </span>
              </button>
            )}
          </nav>
        </div>
      </>
    );
  }

  // --- Клиентская навигация ---
  const isHome = location === '/';
  const isSchedule = location === '/schedule';
  const isProfile = location === '/profile';
  const isSettings = location === '/settings';

  // Все вкладки закрывают любые возможные меню
  function handleClientNavClick(href: string) {
    if (location !== href) setLocation(href);
    setIsMenuOpen(false);
  }

  return (
    <nav
      id="urban-glass-client-nav"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 p-3 bg-[#DDE2E5]/70 dark:bg-[#161618]/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex gap-3 items-center z-[95] rounded-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] w-max pointer-events-auto transition-colors duration-300"
    >
      <Link
        href="/"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          handleClientNavClick('/');
        }}
      >
        <PillBg active={isHome} accent />
        <span
          className={
            `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
            (isHome
              ? iconActiveTextColor
              : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
          }
        >
          <Home size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link
        href="/schedule"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          handleClientNavClick('/schedule');
        }}
      >
        <PillBg active={isSchedule} accent />
        <span
          className={
            `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
            (isSchedule
              ? iconActiveTextColor
              : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
          }
        >
          <Calendar size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link
        href="/profile"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          handleClientNavClick('/profile');
        }}
      >
        <PillBg active={isProfile} accent />
        <span
          className={
            `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
            (isProfile
              ? iconActiveTextColor
              : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
          }
        >
          <User size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
      <Link
        href="/settings"
        className={navBtnClass}
        onClick={e => {
          e.preventDefault();
          handleClientNavClick('/settings');
        }}
      >
        <PillBg active={isSettings} accent />
        <span
          className={
            `relative z-10 flex items-center justify-center transition-colors duration-300 ` +
            (isSettings
              ? iconActiveTextColor
              : 'text-slate-500 dark:text-[#8E8E93] group-hover:text-black dark:group-hover:text-zinc-200')
          }
        >
          <Settings size={28} className="w-7 h-7 stroke-[2]" />
        </span>
      </Link>
    </nav>
  );
}