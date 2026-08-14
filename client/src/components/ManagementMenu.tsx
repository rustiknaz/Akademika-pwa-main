import React from 'react';
import { RussianRuble, Users, Settings, ChevronRight, Layers, Bell, Ticket } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

interface ManagementMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagementMenu: React.FC<ManagementMenuProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useLocation();
  const { accentColor, accentConfig } = useTheme();
  const { currentRole, isAllowed } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';

  const rawMenuItems = [
    {
      id: 'directions',
      title: currentRole === 'trainer' ? 'Мои группы' : 'Группы',
      description: currentRole === 'trainer' ? 'Просмотр состава и отметка присутствия' : 'Справочник групп, дисциплин, возрастов и уровней',
      icon: Layers,
      path: '/admin/directions'
    },
    {
      id: 'finance',
      title: 'Финансы и Касса',
      description: currentRole === 'admin' ? 'Прием оплаты от учеников' : 'Зарплаты, аренда, доходы студии',
      icon: RussianRuble,
      path: '/admin/finance'
    },
    {
      id: 'services',
      title: 'Абонементы и Услуги',
      description: 'Прайс-лист, абонементы, аренда',
      icon: Ticket,
      path: '/admin/services'
    },
    {
      id: 'staff',
      title: 'Сотрудники',
      description: 'Преподаватели, администраторы',
      icon: Users,
      path: '/admin/staff'
    },
    {
      id: 'notifications',
      title: 'Рассылки и Маркетинг',
      description: 'Telegram, WhatsApp, авто-напоминания',
      icon: Bell,
      path: '/admin/notifications'
    },
    {
      id: 'profile',
      title: 'Настройки профиля',
      description: 'Личные данные и настройки профиля',
      icon: Settings,
      path: '/profile'
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Цены, тарифы, контакты',
      icon: Settings,
      path: '/admin/settings'
    },
  ];

  const menuItems = rawMenuItems.filter(item => isAllowed(item.path));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Полупрозрачная подложка Urban Glass с эффектом размытия */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[70] pointer-events-auto"
          />

          {/* Панель с кнопками управления */}
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+5.25rem)] w-[260px] flex flex-col gap-2 z-[80] pointer-events-none"
            style={{ 
              left: '50%', 
              x: '-50%'
            }}
          >
            {menuItems.map((item) => {
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
                  className={`w-full flex items-center justify-between p-2.5 rounded-full transition-all duration-200 pointer-events-auto text-left group cursor-pointer bg-zinc-900/80 backdrop-blur-xl border ${
                    isActive ? 'border-white/30' : 'border-white/10 hover:bg-zinc-800/80'
                  } text-white shadow-2xl`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Круглая подложка под иконку */}
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

                    {/* Текстовый блок */}
                    <div className="flex flex-col min-w-0">
                      <span
                        style={isActive ? { color: accentColor } : {}}
                        className={`font-bold text-[14px] tracking-wide transition-colors truncate${
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

                  {/* Шеврон справа */}
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
        </>
      )}
    </AnimatePresence>
  );
};

export default ManagementMenu;
