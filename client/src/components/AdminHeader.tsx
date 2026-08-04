import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Bell, Settings, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useRole, ROLES } from '@/context/RoleContext';

export interface AdminUser {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
}

interface AdminHeaderProps {
  user?: AdminUser | null;
  onLogout?: () => void;
  view?: 'home' | 'active' | 'history' | 'classes';
  onNavigateProfile?: () => void;
}

/**
 * Helper to map technical role string to Russian display role label
 */
export function getRoleLabel(role?: string): string {
  if (!role) return 'Администратор';
  const r = role.toLowerCase().trim();
  if (r === 'owner' || r === 'admin_owner' || r === 'founder' || r === 'director') {
    return 'Владелец';
  }
  if (r === 'admin' || r === 'manager' || r === 'administrator') {
    return 'Администратор';
  }
  if (r === 'trainer' || r === 'coach' || r === 'teacher') {
    return 'Тренер';
  }
  return 'Администратор';
}

/**
 * Time-based dynamic greeting generator
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Доброе утро,';
  if (hour >= 12 && hour < 18) return 'Добрый день,';
  if (hour >= 18 && hour < 23) return 'Добрый вечер,';
  return 'Доброй ночи,';
}

export default function AdminHeader({
  user,
  onLogout,
  view = 'home',
  onNavigateProfile,
}: AdminHeaderProps) {
  const { theme, accentColor } = useTheme();
  const { currentRole } = useRole();
  const [showMenu, setShowMenu] = useState(false);

  // Extract name or default
  const rawName = user?.full_name?.trim() || user?.email?.split('@')[0] || '';
  const roleLabel = ROLES[currentRole]?.label || getRoleLabel(user?.role);
  
  // If rawName is missing, fall back to default role label
  const displayName = rawName || roleLabel;
  const initial = displayName.charAt(0).toUpperCase();

  const greeting = getGreeting();

  // If view is not 'home', show contextual tab header
  if (view !== 'home') {
    return (
      <header className="px-3 pt-6 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className={`text-2xl font-semibold tracking-wide${theme === 'light' ? 'text-[#121214]' : 'text-white'}`}>
            {view === 'classes'
              ? 'Расписание'
              : view === 'active'
              ? 'Посещения'
              : 'История посещений'}
          </h1>
          <p className={`text-xs font-medium${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'} mt-0.5`}>
            {view === 'classes' ? 'Занятия и загрузка залов' : 'Управление студией'}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="px-3 pt-6 pb-4 flex items-center justify-between shrink-0 relative z-30">
      {/* Left Block: Two-line Display Greeting */}
      <div className="space-y-1 max-w-[70%]">
        <span className="text-3xl md:text-4xl font-light text-[#121214]/60 dark:text-white/60 tracking-tight block leading-tight">
          {greeting}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-[#121214] dark:text-white leading-none">
          {rawName ? (
            <>
              {rawName}{' '}
              <span className="font-bold text-2xl md:text-3xl lg:text-4xl inline-block ml-1 text-[#121214] dark:text-white opacity-80">
                ({roleLabel})
              </span>
            </>
          ) : (
            <>
              {roleLabel}
            </>
          )}
        </h1>
      </div>

      {/* Right Block: Urban Glass Avatar Card */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full backdrop-blur-md border flex items-center justify-center shadow-2xl relative cursor-pointer group hover:scale-105 transition-all shrink-0 outline-none ${
            theme === 'light'
              ? 'bg-white/80 border-black/10 hover:border-black/20'
              : 'bg-zinc-900/70 border-white/10 hover:border-[#CCFF00]/50'
          }`}
          title="Профиль / Меню"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span 
              style={{ color: theme === 'light' ? '#121214' : accentColor || '#CCFF00' }}
              className="text-2xl md:text-3xl font-bold drop-shadow-sm"
            >
              {initial}
            </span>
          )}

          {/* Glowing Status Indicator Badge */}
          <span 
            style={{ backgroundColor: accentColor || '#CCFF00' }}
            className="absolute bottom-0.5 right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-black shadow-[0_0_12px_#CCFF00] flex items-center justify-center"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          </span>
        </button>

        {/* Urban Glass Popover Menu */}
        <AnimatePresence>
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)} 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`absolute right-0 top-20 z-50 w-64 p-3 rounded-inner shadow-2xl backdrop-blur-xl space-y-1 ${
                  theme === 'light'
                    ? 'bg-white/95 border border-black/10 text-[#121214]'
                    : 'bg-[#161618]/95 border border-white/10 text-white'
                }`}
              >
                <div className={`p-3 rounded-inner border mb-2 ${
                  theme === 'light'
                    ? 'bg-zinc-100 border-black/5'
                    : 'bg-zinc-900/80 border-zinc-800/80'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck style={{ color: theme === 'light' ? '#121214' : accentColor || '#CCFF00' }} size={16} />
                    <span className={`text-xs font-bold uppercase truncate${theme === 'light' ? 'text-[#121214]' : 'text-white'}`}>
                      {displayName}
                    </span>
                  </div>
                  <span className={`text-xs font-bold block mt-0.5 pl-6 tracking-wide${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Роль: {roleLabel}
                  </span>
                </div>

                {onNavigateProfile && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onNavigateProfile();
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer border-none${
                      theme === 'light'
                        ? 'text-zinc-700 hover:text-black hover:bg-black/5'
                        : 'text-zinc-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User size={16} style={{ color: theme === 'light' ? '#121214' : accentColor || '#CCFF00' }} />
                    <span>Личный профиль</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer border-none"
                  >
                    <LogOut size={16} />
                    <span>Выйти из системы</span>
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
