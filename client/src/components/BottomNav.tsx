import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Users, Home, LayoutGrid, Settings } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ManagementMenu from './ManagementMenu';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import TetMascotButton from './TetMascotButton';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAllowed, currentRole } = useRole();
  const { accentColor } = useTheme();

  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const iconClass = "w-7 h-7 stroke-[2]";
  const navBtnClass = "relative w-[64px] h-[64px] rounded-full flex items-center justify-center cursor-pointer group focus:outline-none shrink-0 border-none outline-none bg-transparent p-0 touch-manipulation";
  const defaultActiveBg = accentColor || '#CCFF00';

  // Фирменные цвета палитры Расписания (#004643 / #F0EDE5)
  const scheduleActiveBg = '#004643';
  const scheduleActiveColor = '#F0EDE5';

  // Сбалансированный отступ: 14px в браузере и аккуратный зазор над полоской жестов в PWA
  const floatingBottomStyle = {
    bottom: 'max(14px, calc(env(safe-area-inset-bottom, 0px) + 6px))',
  };

  const isAdminMode =
    currentRole === 'trainer' ||
    location === '/Admin' ||
    location.startsWith('/admin') ||
    location === '/add-class' ||
    location.startsWith('/edit-class') ||
    location === '/profile' ||
    location === '/settings';

  const isHomeActive = !isMenuOpen && (location === '/Admin' || location === '/Admin/' || location === '/admin');
  const isScheduleActive = !isMenuOpen && (location === '/admin/schedule' || location === '/admin/schedule/');
  const isStudentsActive = !isMenuOpen && (location === '/admin/students' || location === '/admin/students/');
  const isProfileActive = !isMenuOpen && (location === '/profile' || location === '/profile/' || location === '/settings' || location === '/settings/');
  const isMoreActive = isMenuOpen;

  if (isAdminMode) {
    return (
      <>
        <ManagementMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          menuZindex={94}
        />
        
        <div 
          style={floatingBottomStyle}
          className="fixed left-1/2 -translate-x-1/2 z-[95] flex items-center justify-center gap-2.5 pointer-events-none select-none max-w-[calc(100vw-16px)]"
        >
          <nav
            id="urban-glass-admin-nav"
            className="p-1.5 bg-[#e5e9eb]/85 dark:bg-[#1a1a1e]/85 backdrop-blur-xl shadow-2xl flex gap-1 items-center rounded-full w-max pointer-events-auto border border-white/10"
          >
            {/* 1. Главная */}
            <Link
              href="/Admin"
              className={navBtnClass}
              title="Главная"
              onClick={e => {
                e.preventDefault();
                setIsMenuOpen(false);
                if (location !== '/Admin') setLocation('/Admin');
              }}
            >
              <div
                style={{
                  backgroundColor: isHomeActive ? defaultActiveBg : 'transparent',
                  color: isHomeActive ? '#000000' : undefined
                }}
                className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                  isHomeActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Home size={26} className={iconClass} />
              </div>
            </Link>

            {/* 2. Расписание (Глубокий изумруд #004643 + кремовая иконка #F0EDE5) */}
            <Link
              href="/admin/schedule"
              className={navBtnClass}
              title="Расписание"
              onClick={e => {
                e.preventDefault();
                setIsMenuOpen(false);
                if (location !== '/admin/schedule') setLocation('/admin/schedule');
              }}
            >
              <div
                style={{
                  backgroundColor: isScheduleActive ? scheduleActiveBg : 'transparent',
                  color: isScheduleActive ? scheduleActiveColor : undefined
                }}
                className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                  isScheduleActive ? 'shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Calendar size={26} className={iconClass} />
              </div>
            </Link>

            {/* 3. Ученики */}
            {currentRole !== 'trainer' && isAllowed('/admin/students') && (
              <Link
                href="/admin/students"
                className={navBtnClass}
                title="Ученики"
                onClick={e => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  if (location !== '/admin/students') setLocation('/admin/students');
                }}
              >
                <div
                  style={{
                    backgroundColor: isStudentsActive ? defaultActiveBg : 'transparent',
                    color: isStudentsActive ? '#000000' : undefined
                  }}
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isStudentsActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Users size={26} className={iconClass} />
                </div>
              </Link>
            )}

            {/* 4. Меню */}
            {currentRole === 'trainer' ? (
              <Link
                href="/profile"
                className={navBtnClass}
                title="Профиль/Настройки"
                onClick={e => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  if (location !== '/profile') setLocation('/profile');
                }}
              >
                <div
                  style={{
                    backgroundColor: isProfileActive ? defaultActiveBg : 'transparent',
                    color: isProfileActive ? '#000000' : undefined
                  }}
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isProfileActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Settings size={26} className={iconClass} />
                </div>
              </Link>
            ) : (
              <button
                ref={menuBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  setIsMenuOpen(prev => !prev);
                }}
                className={navBtnClass}
                title="Меню"
                type="button"
              >
                <div
                  style={{
                    backgroundColor: isMoreActive ? defaultActiveBg : 'transparent',
                    color: isMoreActive ? '#000000' : undefined
                  }}
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isMoreActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid size={26} className={iconClass} />
                </div>
              </button>
            )}
          </nav>

          {/* AI Маскот Тет */}
          <div className="flex items-center justify-center pointer-events-auto shrink-0">
            <TetMascotButton
              onClick={() => {
                setIsMenuOpen(false);
                setLocation('/admin/ai');
              }}
            />
          </div>
        </div>
      </>
    );
  }

  // Клиентский режим
  const isClientHomeActive = !isMenuOpen && (location === '/' || location === '//');
  const isClientScheduleActive = !isMenuOpen && (location === '/schedule' || location === '/schedule/');
  const isClientProfileActive = !isMenuOpen && (location === '/profile' || location === '/profile/');

  return (
    <div 
      style={floatingBottomStyle}
      className="fixed left-1/2 -translate-x-1/2 z-[95] flex items-center justify-center gap-2.5 pointer-events-none select-none max-w-[calc(100vw-16px)]"
    >
      <nav
        id="urban-glass-client-nav"
        className="p-1.5 bg-[#e5e9eb]/85 dark:bg-[#1a1a1e]/85 backdrop-blur-xl shadow-2xl flex gap-1 items-center rounded-full w-max pointer-events-auto border border-white/10"
      >
        <Link
          href="/"
          className={navBtnClass}
          onClick={e => {
            e.preventDefault();
            if (location !== '/') setLocation('/');
          }}
        >
          <div
            style={{
              backgroundColor: isClientHomeActive ? defaultActiveBg : 'transparent',
              color: isClientHomeActive ? '#000000' : undefined
            }}
            className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none ${
              isClientHomeActive ? '' : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Home size={26} className={iconClass} />
          </div>
        </Link>
        <Link
          href="/schedule"
          className={navBtnClass}
          onClick={e => {
            e.preventDefault();
            if (location !== '/schedule') setLocation('/schedule');
          }}
        >
          <div
            style={{
              backgroundColor: isClientScheduleActive ? scheduleActiveBg : 'transparent',
              color: isClientScheduleActive ? scheduleActiveColor : undefined
            }}
            className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none ${
              isClientScheduleActive ? 'shadow-sm' : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Calendar size={26} className={iconClass} />
          </div>
        </Link>
        <Link
          href="/profile"
          className={navBtnClass}
          onClick={e => {
            e.preventDefault();
            if (location !== '/profile') setLocation('/profile');
          }}
        >
          <div
            style={{
              backgroundColor: isClientProfileActive ? defaultActiveBg : 'transparent',
              color: isClientProfileActive ? '#000000' : undefined
            }}
            className={`w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none ${
              isClientProfileActive ? '' : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            <User size={26} className={iconClass} />
          </div>
        </Link>
        <Link
          href="/settings"
          className={navBtnClass}
          onClick={e => {
            e.preventDefault();
            if (location !== '/settings') setLocation('/settings');
          }}
        >
          <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center border-none shadow-none text-slate-600 dark:text-zinc-400">
            <Settings size={26} className={iconClass} />
          </div>
        </Link>
      </nav>

      <div className="flex items-center justify-center pointer-events-auto shrink-0">
        <TetMascotButton
          onClick={() => {
            setLocation('/ai');
          }}
        />
      </div>
    </div>
  );
}