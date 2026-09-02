import React, { useState, useEffect } from 'react';
import { 
  RussianRuble, 
  Users, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Bell, 
  Ticket, 
  Sliders, 
  MessageSquare, 
  ShoppingBag
} from 'lucide-react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '@/context/RoleContext';

interface ManagementMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuZindex?: number;
}

export const ManagementMenu: React.FC<ManagementMenuProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useLocation();
  const { currentRole, isAllowed } = useRole();

  const [menuView, setMenuView] = useState<'main' | 'settings'>('main');

  useEffect(() => {
    if (!isOpen) {
      setMenuView('main');
    }
  }, [isOpen]);

  // Основное меню с персональными цветами страниц
  const mainMenuItems = [
    {
      id: 'finance',
      title: 'Финансы и Касса',
      description: currentRole === 'admin' ? 'Прием оплаты от учеников' : 'Зарплаты, аренда, доходы студии',
      icon: RussianRuble,
      path: '/admin/finance',
      circleBg: '#003566',
      circleColor: '#C6FF33'
    },
    {
      id: 'staff',
      title: 'Сотрудники',
      description: 'Преподаватели, администраторы',
      icon: Users,
      path: '/admin/staff',
      circleBg: '#14213D',
      circleColor: '#FCA311'
    },
    {
      id: 'chat_notifications',
      title: 'Сообщения',
      description: 'Входящие от лидов и клиентов',
      icon: MessageSquare,
      path: '/admin/messages',
      circleBg: '#262B2B',
      circleColor: '#E6CCB2'
    },
    {
      id: 'shop',
      title: 'Магазин',
      description: 'Мерч, вода и другие товары',
      icon: ShoppingBag,
      path: '/admin/shop',
      circleBg: '#101010',
      circleColor: '#FFBE0B'
    },
    {
      id: 'settings_trigger',
      title: 'Настройки',
      description: 'Группы, тарифы, контакты',
      icon: Settings,
      isSubmenuTrigger: true,
      circleBg: '#3E3B39',
      circleColor: '#CAC9CD'
    },
  ].filter(item => item.isSubmenuTrigger || (item.path && (isAllowed ? isAllowed(item.path) : true)));

  // Подменю «Настройки» с персональными цветами страниц
  const settingsSubMenuItems = [
    {
      id: 'directions',
      title: currentRole === 'trainer' ? 'Мои группы' : 'Группы',
      description: currentRole === 'trainer' ? 'Просмотр состава и отметка' : 'Справочник групп, дисциплин',
      icon: Layers,
      path: '/admin/directions',
      circleBg: '#004643',
      circleColor: '#F0EDE5'
    },
    {
      id: 'services',
      title: 'Абонементы',
      description: 'Прайс-лист, абонементы, аренда',
      icon: Ticket,
      path: '/admin/services',
      circleBg: '#101010',
      circleColor: '#FFBE0B'
    },
    {
      id: 'notifications',
      title: 'Рассылки',
      description: 'Telegram, WhatsApp, авто-триггеры',
      icon: Bell,
      path: '/admin/notifications',
      circleBg: '#3E3B39',
      circleColor: '#CAC9CD'
    },
    {
      id: 'main_settings',
      title: 'Основные',
      description: 'Цены, тарифы, контакты',
      icon: Sliders,
      path: '/admin/settings',
      circleBg: '#262B2B',
      circleColor: '#E6CCB2'
    },
  ].filter(item => (isAllowed ? isAllowed(item.path) : true));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[70] pointer-events-auto"
          />

          <div 
            className="fixed bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+6.5rem)] w-[260px] z-[80] pointer-events-none"
            style={{ 
              left: '50%', 
              transform: 'translateX(calc(-50% - 44px))'
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuView === 'main' ? (
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
                        style={isActive ? { borderColor: item.circleBg } : {}}
                        className={`w-full flex items-center justify-between p-2.5 rounded-full transition-all duration-200 text-left group cursor-pointer bg-zinc-900/85 backdrop-blur-xl border ${
                          isActive ? 'border-white/40 ring-1' : 'border-white/10 hover:bg-zinc-800/80'
                        } text-white shadow-2xl`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={{ backgroundColor: item.circleBg, color: item.circleColor }}
                            className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105"
                          >
                            <Icon size={20} className="stroke-[2.5]" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[14px] tracking-wide text-zinc-100 truncate">
                              {item.title}
                            </span>
                            <span className="text-xs font-bold leading-tight text-zinc-400 truncate tracking-wide">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          style={{ color: item.circleBg }}
                          className="ml-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="settings-submenu"
                  initial={{ opacity: 0, x: 16, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex flex-col gap-2 pointer-events-auto"
                >
                  <button
                    onClick={() => setMenuView('main')}
                    className="absolute -right-[76px] top-[154px] -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-10"
                    title="Назад в меню"
                  >
                    <ChevronLeft size={20} className="stroke-[2.5]" />
                  </button>

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
                        style={isActive ? { borderColor: item.circleBg } : {}}
                        className={`w-full flex items-center justify-between p-2.5 rounded-full transition-all duration-200 text-left group cursor-pointer bg-zinc-900/85 backdrop-blur-xl border ${
                          isActive ? 'border-white/40 ring-1' : 'border-white/10 hover:bg-zinc-800/80'
                        } text-white shadow-2xl`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            style={{ backgroundColor: item.circleBg, color: item.circleColor }}
                            className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105"
                          >
                            <Icon size={20} className="stroke-[2.5]" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[14px] tracking-wide text-zinc-100 truncate">
                              {item.title}
                            </span>
                            <span className="text-xs font-bold leading-tight text-zinc-400 truncate tracking-wide">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          style={{ color: item.circleBg }}
                          className="ml-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
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