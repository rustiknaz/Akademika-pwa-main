import React, { useState, useEffect } from 'react';
import { RussianRuble, Users, Settings, ChevronRight, ChevronLeft, Layers, Bell, Ticket, Sliders, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

interface ManagementMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuZindex?: number;
}

export const ManagementMenu: React.FC<ManagementMenuProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useLocation();
  const { accentColor, accentConfig } = useTheme();
  const { currentRole, isAllowed } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';

  // Состояние текущего экрана меню: 'main' или 'settings'
  const [menuView, setMenuView] = useState<'main' | 'settings'>('main');

  // Сбрасываем вид на главное при закрытии меню
  useEffect(() => {
    if (!isOpen) {
      setMenuView('main');
    }
  }, [isOpen]);

  // Главный список меню (Финансы, Сотрудники, Уведомления, Настройки)
  const mainMenuItems = [
    {
      id: 'finance',
      title: 'Финансы и Касса',
      description: currentRole === 'admin' ? 'Прием оплаты от учеников' : 'Зарплаты, аренда, доходы студии',
      icon: RussianRuble,
      path: '/admin/finance'
    },
    {
      id: 'staff',
      title: 'Сотрудники',
      description: 'Преподаватели, администраторы',
      icon: Users,
      path: '/admin/staff'
    },
    {
      id: 'chat_notifications',
      title: 'Уведомления',
      description: 'Входящие от лидов и клиентов',
      icon: MessageSquare,
      path: '/admin/messages'
    },
    {
      id: 'settings_trigger',
      title: 'Настройки',
      description: 'Группы, тарифы, контакты',
      icon: Settings,
      isSubmenuTrigger: true
    },
  ].filter(item => item.isSubmenuTrigger || (item.path && isAllowed(item.path)));

  // Вложенный список «Настройки» (Группы, Абонементы, Рассылки, Маркетинг, Основные)
  const settingsSubMenuItems = [
    {
      id: 'directions',
      title: currentRole === 'trainer' ? 'Мои группы' : 'Группы',
      description: currentRole === 'trainer' ? 'Просмотр состава и отметка' : 'Справочник групп, дисциплин',
      icon: Layers,
      path: '/admin/directions'
    },
    {
      id: 'services',
      title: 'Абонементы',
      description: 'Прайс-лист, абонементы, аренда',
      icon: Ticket,
      path: '/admin/services'
    },
    {
      id: 'notifications',
      title: 'Рассылки, Маркетинг',
      description: 'Telegram, WhatsApp, авто-напоминания',
      icon: Bell,
      path: '/admin/notifications'
    },
    {
      id: 'main_settings',
      title: 'Основные',
      description: 'Цены, тарифы, контакты',
      icon: Sliders,
      path: '/admin/settings'
    },
  ].filter(item => isAllowed(item.path));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Полупрозрачная подложка Urban Glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[70] pointer-events-auto"
          />

          {/* Панель с кнопками управления */}
          <div 
            className="fixed bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+6.75rem)] w-[260px] z-[80] pointer-events-none"
            style={{ 
              left: '50%', 
              transform: 'translateX(-50%)'
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuView === 'main' ? (
                /* 1. ГЛАВНОЕ МЕНЮ (4 пилюли) */
                <motion.div
                  key="main-menu"
                  initial={{ opacity: 0, x: -16, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -16, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 pointer-events-auto"
                >
                  {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path ? location === item.path : false;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.isSubmenuTrigger) {
                            setMenuView('settings');
                          } else if (item.path) {
                            setLocation(item.path);
                            onClose();
                          }
                        }}
                        style={isActive ? { borderColor: accentColor } : {}}
                        className={`w-full flex items-center justify-between p-2.5 rounded-full transition-all duration-200 text-left group cursor-pointer bg-zinc-900/80 backdrop-blur-xl border ${
                          isActive ? 'border-white/30' : 'border-white/10 hover:bg-zinc-800/80'
                        } text-white shadow-2xl`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                            className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors duration-300 ${
                              isActive
                                ? 'shadow-md'
                                : 'bg-zinc-950/40 border border-zinc-800/40 text-zinc-400 group-hover:bg-zinc-900/50 group-hover:text-zinc-200'
                            }`}
                          >
                            <Icon size={20} />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span
                              style={isActive ? { color: accentColor } : {}}
                              className={`font-bold text-[14px] tracking-wide transition-colors truncate ${
                                isActive ? '' : 'text-zinc-100'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-xs font-bold leading-tight text-zinc-400 truncate tracking-wide">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          style={isActive ? { color: accentColor } : {}}
                          className={`ml-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${
                            isActive ? '' : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                /* 2. ВЛОЖЕННОЕ МЕНЮ: НАСТРОЙКИ */
                <motion.div
                  key="settings-submenu"
                  initial={{ opacity: 0, x: 16, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 pointer-events-auto items-center"
                >
                  {/* Круглая кнопка «Назад» */}
                  <button
                    onClick={() => setMenuView('main')}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 transition-all cursor-pointer shadow-xl backdrop-blur-xl mb-0.5 self-center"
                    title="Назад в меню"
                  >
                    <ChevronLeft size={20} className="stroke-[2.5]" />
                  </button>

                  {/* Пилюли: Группы, Абонементы, Рассылки, Маркетинг, Основные */}
                  {settingsSubMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setLocation(item.path);
                          onClose();
                        }}
                        style={isActive ? { borderColor: accentColor } : {}}
                        className={`w-full flex items-center justify-between p-2.5 rounded-full transition-all duration-200 text-left group cursor-pointer bg-zinc-900/80 backdrop-blur-xl border ${
                          isActive ? 'border-white/30' : 'border-white/10 hover:bg-zinc-800/80'
                        } text-white shadow-2xl`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={isActive ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                            className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors duration-300 ${
                              isActive
                                ? 'shadow-md'
                                : 'bg-zinc-950/40 border border-zinc-800/40 text-zinc-400 group-hover:bg-zinc-900/50 group-hover:text-zinc-200'
                            }`}
                          >
                            <Icon size={20} />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span
                              style={isActive ? { color: accentColor } : {}}
                              className={`font-bold text-[14px] tracking-wide transition-colors truncate ${
                                isActive ? '' : 'text-zinc-100'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-xs font-bold leading-tight text-zinc-400 truncate tracking-wide">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          style={isActive ? { color: accentColor } : {}}
                          className={`ml-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${
                            isActive ? '' : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManagementMenu;