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

  const iconClass = "w-7 h-7 stroke-[2]";
  const navBtnClass = "relative w-[68px] h-[68px] rounded-full flex items-center justify-center cursor-pointer group focus:outline-none shrink-0 border-none outline-none bg-transparent p-0";
  const activeBg = accentColor || '#CCFF00';

  const isAdminMode =
    currentRole === 'trainer' ||
    location === '/Admin' ||
    location.startsWith('/admin') ||
    location === '/add-class' ||
    location.startsWith('/edit-class') ||
    location === '/profile' ||
    location === '/settings';

  // Строго: если меню открыто (isMenuOpen === true), ВСЕ вкладки слева неактивны!
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
        
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[95] flex items-center justify-center gap-1.5 pointer-events-none select-none max-w-full">
          <nav
            id="urban-glass-admin-nav"
            className="p-2 bg-[#e5e9eb]/80 dark:bg-[#1a1a1e]/85 shadow-none flex gap-1.5 items-center rounded-full w-max pointer-events-auto border-none"
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
                  backgroundColor: isHomeActive ? activeBg : 'transparent',
                  color: isHomeActive ? '#000000' : undefined
                }}
                className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                  isHomeActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Home size={28} className={iconClass} />
              </div>
            </Link>

            {/* 2. Расписание */}
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
                  backgroundColor: isScheduleActive ? activeBg : 'transparent',
                  color: isScheduleActive ? '#000000' : undefined
                }}
                className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                  isScheduleActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Calendar size={28} className={iconClass} />
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
                    backgroundColor: isStudentsActive ? activeBg : 'transparent',
                    color: isStudentsActive ? '#000000' : undefined
                  }}
                  className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isStudentsActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Users size={28} className={iconClass} />
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
                    backgroundColor: isProfileActive ? activeBg : 'transparent',
                    color: isProfileActive ? '#000000' : undefined
                  }}
                  className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isProfileActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Settings size={28} className={iconClass} />
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
                    backgroundColor: isMoreActive ? activeBg : 'transparent',
                    color: isMoreActive ? '#000000' : undefined
                  }}
                  className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none transition-colors duration-150 ${
                    isMoreActive ? '' : 'text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid size={28} className={iconClass} />
                </div>
              </button>
            )}
          </nav>

          {/* AI Кнопка */}
          <div className="p-2 bg-[#e5e9eb]/80 dark:bg-[#1a1a1e]/85 shadow-none rounded-full flex items-center justify-center pointer-events-auto border-none shrink-0">
            <Link
              href="/admin/ai"
              className={navBtnClass}
              title="AI Ассистент"
              onClick={e => {
                e.preventDefault();
                setIsMenuOpen(false);
                setLocation('/admin/ai');
              }}
            >
              <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center bg-gradient-to-tr from-[#CCFF00] via-[#00F0FF] to-[#BD00FF] text-black shadow-none transition-all hover:scale-105 active:scale-95 border-none">
                <Sparkles size={28} className="w-7 h-7 stroke-[2.5] text-black" />
              </div>
            </Link>
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
    <nav
      id="urban-glass-client-nav"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 p-2 bg-[#e5e9eb]/80 dark:bg-[#1a1a1e]/85 shadow-none flex gap-1.5 items-center z-[95] rounded-full w-max pointer-events-auto border-none"
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
            backgroundColor: isClientHomeActive ? activeBg : 'transparent',
            color: isClientHomeActive ? '#000000' : undefined
          }}
          className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none ${
            isClientHomeActive ? '' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Home size={28} className={iconClass} />
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
            backgroundColor: isClientScheduleActive ? activeBg : 'transparent',
            color: isClientScheduleActive ? '#000000' : undefined
          }}
          className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none ${
            isClientScheduleActive ? '' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Calendar size={28} className={iconClass} />
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
            backgroundColor: isClientProfileActive ? activeBg : 'transparent',
            color: isClientProfileActive ? '#000000' : undefined
          }}
          className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none ${
            isClientProfileActive ? '' : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <User size={28} className={iconClass} />
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
        <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center border-none shadow-none text-slate-600 dark:text-zinc-400">
          <Settings size={28} className={iconClass} />
        </div>
      </Link>
    </nav>
  );
}