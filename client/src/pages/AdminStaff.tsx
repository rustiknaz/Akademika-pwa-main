import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Users,
  Briefcase,
  DollarSign,
  X,
  Save,
  Shield,
  Phone,
  GraduationCap,
  Pencil,
  Camera,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FloatingActionButton from "../components/FloatingActionButton";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import PaySalaryModal, { PaymentMethod } from '../components/PaySalaryModal';
import { StaffMember } from '../components/EmployeeCard';

/**
 * Карточка сотрудника с новой цветовой схемой. Переопределяет EmployeesView.
 */
function StaffCard({
  member,
  onSelect,
  renderAvatar,
}: {
  member: StaffMember;
  onSelect: (member: StaffMember) => void;
  renderAvatar: (member: StaffMember, sizeClass?: string) => React.ReactNode;
}) {
  return (
    <button
      className="w-full text-left rounded-3xl bg-[#DDE2E5] dark:bg-[#161618] p-4 flex gap-4 mb-3 transition-all group"
      onClick={() => onSelect(member)}
      type="button"
    >
      {/* Аватар */}
      <div className="shrink-0">
        {renderAvatar(member, "w-11 h-11 rounded-full text-base")}
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          {/* Имя */}
          <span className="font-semibold text-base md:text-lg text-[#121214] dark:text-white truncate">
            {member.name}
          </span>
          {/* Бейдж должности */}
          <span
            className={
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[#121214]/5 dark:bg-white/10" +
              " ml-2"
            }
          >
            {member.role === 'coach'
              ? 'Тренер'
              : member.role === 'admin'
                ? 'Админ'
                : 'Другое'}
          </span>
        </div>
        {/* Телефон */}
        <div className="flex items-center gap-2 mt-1 text-[#121214]/60 dark:text-white/60 text-xs">
          <Phone size={13} className="opacity-60" />
          {member.phone}
        </div>
        {/* Баланс - пилюля */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-[40px] px-4 rounded-full bg-[#121214]/5 dark:bg-white/5 flex items-center gap-2 flex-1 min-w-0">
            <DollarSign size={17} className="shrink-0 text-[#84A900] dark:text-[#CCFF00]" />
            <span className="text-base font-bold text-[#121214] dark:text-white truncate">
              {member.balance > 0 ? `${member.balance.toLocaleString()} ₽` : "Выплачено"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AdminStaff() {
  const [location, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [payingStaffFromProfile, setPayingStaffFromProfile] = useState<StaffMember | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'coaches' | 'admins' | 'others'>('all');

  // Список сотрудников
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('studio_staff');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading studio_staff from localStorage:', e);
    }
    return [
      { id: 1, name: "Мария Ковалева", avatar: "", role: "coach", directions: ["Twerk", "Dancehall", "Hip Hop"], balance: 63000, phone: "+7 (999) 111-22-33" },
      { id: 2, name: "Алексей Петров", avatar: "", role: "coach", directions: ["High Heels", "Jazz Funk", "Choreo"], balance: 51000, phone: "+7 (999) 222-33-44" },
      { id: 3, name: "Дарья Смирнова", avatar: "", role: "coach", directions: ["Stretching", "Aero", "Contemporary"], balance: 42000, phone: "+7 (999) 333-44-55" },
      { id: 4, name: "Ирина Волк", avatar: "", role: "coach", directions: ["Strip Dance", "Vogue"], balance: 22500, phone: "+7 (999) 444-55-66" },
      { id: 5, name: "Дмитрий Назаров", avatar: "", role: "admin", shifts: 18, balance: 15000, phone: "+7 (999) 555-66-77" },
      { id: 6, name: "Ольга Семенова", avatar: "", role: "admin", shifts: 12, balance: 0, phone: "+7 (999) 666-77-88" },
      { id: 7, name: "Екатерина Орлова", avatar: "", role: "other", balance: 12000, phone: "+7 (999) 777-88-99" },
    ];
  });

  const updateStaffList = (newStaffList: StaffMember[]) => {
    setStaff(newStaffList);
    try {
      localStorage.setItem('studio_staff', JSON.stringify(newStaffList));
    } catch (e) {
      console.error('Error saving studio_staff:', e);
    }
  };

  // Стейты формы добавления
  const [addRole, setAddRole] = useState<'coach' | 'admin' | 'other'>('coach');
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addDirections, setAddDirections] = useState('');
  const [addShifts, setAddShifts] = useState('0');
  const [addBalance, setAddBalance] = useState('0');
  const [addAvatar, setAddAvatar] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [payType, setPayType] = useState<'salary' | 'shift' | 'percent'>('salary');
  const [customRate, setCustomRate] = useState('0');

  // Стейты формы редактирования
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'coach' | 'admin' | 'other'>('coach');
  const [editDirections, setEditDirections] = useState('');
  const [editShifts, setEditShifts] = useState('0');
  const [editBalance, setEditBalance] = useState('0');
  const [editAvatar, setEditAvatar] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderAvatar = (member: StaffMember) => {
    if (member.avatar && member.avatar.length > 4) {
      return (
        <div className="w-11 h-11 rounded-full bg-zinc-800 overflow-hidden shrink-0">
          <img src={member.avatar} className="object-cover w-full h-full rounded-full" alt={member.name} referrerPolicy="no-referrer" />
        </div>
      );
    }

    const initials = getInitials(member.name);
    return (
      <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold select-none bg-[#121214]/10 dark:bg-white/10 text-[#121214] dark:text-white">
        {initials || <span className="opacity-60">?</span>}
      </div>
    );
  };

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        setLocation('/');
        return;
      }

      setLoading(false);
    }
    checkAdminAndFetch();
  }, [setLocation]);

  // Синхронизация полей формы при выборе сотрудника
  useEffect(() => {
    if (selectedStaff) {
      setEditName(selectedStaff.name);
      setEditPhone(selectedStaff.phone);
      setEditRole(selectedStaff.role);
      setEditDirections(selectedStaff.directions ? selectedStaff.directions.join(', ') : '');
      setEditShifts(String(selectedStaff.shifts || 0));
      setEditBalance(String(selectedStaff.balance));
      setEditAvatar(selectedStaff.avatar);
    }
  }, [selectedStaff, isEditing]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя сотрудника",
        variant: "destructive"
      });
      return;
    }

    const newMember: StaffMember = {
      id: Date.now(),
      name: addName,
      avatar: addAvatar,
      role: addRole,
      phone: addPhone || "+7 (999) 000-00-00",
      balance: addRole === 'other' ? (Number(customRate) || 0) : (Number(addBalance) || 0),
      ...(addRole === 'coach'
        ? { directions: addDirections ? addDirections.split(',').map(d => d.trim()).filter(Boolean) : ["Общее"] }
        : addRole === 'admin'
          ? { shifts: Number(addShifts) || 0 }
          : { directions: [customPosition.trim() || "Персонал"] }
      )
    };

    updateStaffList([...staff, newMember]);
    setIsAddModalOpen(false);

    // Сброс формы
    setAddName('');
    setAddPhone('');
    setAddDirections('');
    setAddShifts('0');
    setAddBalance('0');
    setAddAvatar('');
    setAddRole('coach');
    setCustomPosition('');
    setPayType('salary');
    setCustomRate('0');

    toast({
      title: "Сотрудник добавлен!",
      description: `${newMember.name} успешно внесен в базу команды студии`,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (!editName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя сотрудника",
        variant: "destructive"
      });
      return;
    }

    const updatedMember: StaffMember = {
      ...selectedStaff,
      name: editName,
      avatar: editAvatar,
      role: editRole,
      phone: editPhone || "+7 (999) 000-00-00",
      balance: Number(editBalance) || 0,
      ...(editRole === 'coach'
        ? { directions: editDirections ? editDirections.split(',').map(d => d.trim()).filter(Boolean) : ["Общее"], shifts: undefined }
        : { shifts: Number(editShifts) || 0, directions: undefined }
      )
    };

    const updatedList = staff.map(item => item.id === selectedStaff.id ? updatedMember : item);
    updateStaffList(updatedList);
    setSelectedStaff(updatedMember);
    setIsEditing(false);

    toast({
      title: "Данные обновлены!",
      description: `Информация о сотруднике ${updatedMember.name} успешно сохранена`,
    });
  };

  const handleDeleteStaff = (id: number) => {
    const deleted = staff.find(s => s.id === id);
    const updatedList = staff.filter(s => s.id !== id);
    updateStaffList(updatedList);
    setSelectedStaff(null);
    setIsEditing(false);
    toast({
      title: "Сотрудник удален",
      description: `${deleted?.name} успешно удален из базы команды`,
    });
  };

  const totalCoaches = staff.filter(s => s.role === 'coach').length;
  const totalAdmins = staff.filter(s => s.role === 'admin').length;
  const totalUnpaidSalary = staff.reduce((acc, curr) => acc + curr.balance, 0);

  const filteredStaff = staff.filter((member) => {
    if (roleFilter === 'coaches') return member.role === 'coach';
    if (roleFilter === 'admins') return member.role === 'admin';
    if (roleFilter === 'others') return member.role === 'other' || (member.role !== 'coach' && member.role !== 'admin');
    return true;
  });

  if (loading) {
    return (
      <div className={`h-[100dvh] flex items-center justify-center transition-colors duration-300 bg-transparent ${theme === 'light' ? 'text-[#121214]' : 'text-white'}`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 bg-transparent ${theme === 'light' ? 'text-[#121214]' : 'text-white'}`}>
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation('/Admin')}
            className="p-2.5 text-zinc-400 hover:text-[#CCFF00] transition-colors rounded-full hover:bg-neutral-800 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#121214] dark:text-white">Сотрудники</h1>
            <p className="text-xs md:text-sm text-[#121214]/60 dark:text-white/60">
              Управление командой студии
            </p>
          </div>
        </div>
      </header>

      {/* Карточки со статистикой (пилюли) */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="rounded-full h-[84px] px-6 py-3 flex items-center gap-4 bg-[#DDE2E5] dark:bg-[#161618] border-none">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[12px] uppercase font-bold block text-[#121214]/60 dark:text-white/60 mb-1">
              Штат студии
            </span>
            <span className="text-base md:text-lg font-bold text-[#121214] dark:text-white">
              {totalCoaches} тр. | {totalAdmins} адм.
            </span>
          </div>
        </div>

        <div className="rounded-full h-[84px] px-6 py-3 flex items-center gap-4 bg-[#DDE2E5] dark:bg-[#161618] border-none">
          <div className="w-12 h-12 rounded-full bg-[#CCFF00]/20 text-[#84A900] dark:text-[#CCFF00] flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[12px] uppercase font-bold block text-[#121214]/60 dark:text-white/60 mb-1">
              Долг по ЗП
            </span>
            <span className="text-base md:text-lg font-bold text-[#121214] dark:text-white">
              {totalUnpaidSalary.toLocaleString()} ₽
            </span>
          </div>
        </div>
      </div>
 
 

      {/* Фильтр-вкладки */}
      <div className="h-[56px] p-1 flex mb-6 rounded-full bg-[#DDE2E5] dark:bg-[#161618] gap-1 max-w-full w-full">
        {[
          { label: "Все", value: "all" },
          { label: "Тренеры", value: "coaches" },
          { label: "Администраторы", value: "admins" },
          { label: "Другое", value: "others" },
        ].map(tab => {
          const active = roleFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              className={
                `flex-1 px-4 text-sm transition-all font-bold text-center rounded-full
                 ${active
                    ? "bg-[#CCFF00] text-black"
                    : "text-[#121214]/60 dark:text-white/60 hover:text-[#121214] dark:hover:text-white"
                 }`
              }
              style={{
                fontWeight: active ? 700 : 500,
              }}
              onClick={() => setRoleFilter(tab.value as any)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Плавающая круглая кнопка с плюсом */}
      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
        ariaLabel="Добавить сотрудника"
      />

      {/* Список сотрудников с новой цветовой схемой */}
      <div>
        {filteredStaff.map(member => (
          <StaffCard
            key={member.id}
            member={member}
            onSelect={(member) => {
              setSelectedStaff(member);
              setIsEditing(false);
            }}
            renderAvatar={renderAvatar}
          />
        ))}
      </div>

      {/* Модальное окно «Новый сотрудник» */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black/5 dark:bg-white/5 border !border-zinc-800 !rounded-[24px] p-6 max-w-md w-full max-h-[85vh] flex flex-col text-white shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Заголовок */}
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="text-lg font-medium text-white">Новый сотрудник</h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-9 h-9 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] transition-colors cursor-pointer bg-zinc-900/40"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Обертка скролла формы */}
              <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-4">
                {/* Выбор должности (Верхняя строка) */}
                <div>
                  <div className="!rounded-full bg-zinc-950/60 border border-zinc-800 p-1 flex w-full mb-6">
                    <button
                      type="button"
                      onClick={() => setAddRole('coach')}
                      style={addRole === 'coach' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={
                        addRole === 'coach'
                          ? "flex-1 bg-[#CCFF00] text-black font-bold rounded-full py-2.5 px-3 text-xs transition-all shadow-md border-none outline-none cursor-pointer text-center"
                          : "flex-1 text-zinc-400 hover:text-white font-medium py-2.5 px-3 text-xs cursor-pointer border-none outline-none bg-transparent text-center"
                      }
                    >
                      Тренер
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddRole('admin')}
                      style={addRole === 'admin' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={
                        addRole === 'admin'
                          ? "flex-1 bg-[#CCFF00] text-black font-bold rounded-full py-2.5 px-3 text-xs transition-all shadow-md border-none outline-none cursor-pointer text-center"
                          : "flex-1 text-zinc-400 hover:text-white font-medium py-2.5 px-3 text-xs cursor-pointer border-none outline-none bg-transparent text-center"
                      }
                    >
                      Администратор
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddRole('other')}
                      style={addRole === 'other' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                      className={
                        addRole === 'other'
                          ? "flex-1 bg-[#CCFF00] text-black font-bold rounded-full py-2.5 px-3 text-xs transition-all shadow-md border-none outline-none cursor-pointer text-center"
                          : "flex-1 text-zinc-400 hover:text-white font-medium py-2.5 px-3 text-xs cursor-pointer border-none outline-none bg-transparent text-center"
                      }
                    >
                      Другое
                    </button>
                  </div>
                </div>

                {/* ФОТО СОТРУДНИКА */}
                <div className="flex flex-col items-center justify-center">
                  <label className="w-20 h-20 !rounded-full bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center cursor-pointer text-zinc-400 hover:text-[#CCFF00] hover:border-[#CCFF00]/50 transition-all overflow-hidden relative mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAddAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {addAvatar && addAvatar.length > 4 ? (
                      <img src={addAvatar} className="object-cover w-full h-full" alt="Preview" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <Camera size={20} className="mb-1 text-zinc-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">+ фото</span>
                      </>
                    )}
                  </label>
                </div>

                {/* ... Остальной код модального окна (не меняется, см. выше) ... */}
                {/* !!! Весь остальной модал оставляем как есть, изначально его не просили менять !!! */}
                <form onSubmit={handleAddStaff} id="add-staff-form" className="space-y-4">
                  {/* ... (оставить всё без изменений) ... */}
                  {/* См. оригинал выше */}
                </form>
              </div>

              {/* Кнопка отправки формы за пределами скролла */}
              <div className="shrink-0 pt-2">
                <button
                  type="submit"
                  form="add-staff-form"
                  className="w-full py-3 !bg-[#CCFF00] hover:bg-[#B5E600] text-black font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer shadow-lg shadow-[#CCFF00]/10"
                >
                  Создать и сохранить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Профиль сотрудника (Детали по клику на карточку) */}
      <AnimatePresence>
        {selectedStaff && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => {
              setSelectedStaff(null);
              setIsEditing(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black/5 dark:bg-white/5 border !border-zinc-800 !rounded-[24px] p-6 pb-10 max-w-md w-full max-h-[85vh] flex flex-col text-white shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Верхняя панель управления */}
              <div className="flex justify-between items-center mb-6 pl-1 shrink-0">
                <h3 className="text-base font-bold text-zinc-400 uppercase tracking-wider">
                  {isEditing ? "Редактирование" : "Профиль сотрудника"}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Иконка редактирования */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-10 h-10 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] bg-zinc-900 transition-all cursor-pointer"
                    title="Редактировать"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStaff(null);
                      setIsEditing(false);
                    }}
                    className="w-9 h-9 !rounded-full border !border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#CCFF00] transition-colors cursor-pointer bg-zinc-900/40"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              {/* Прокручиваемый контент профиля */}
              <div className="overflow-y-auto pr-1 mb-4 flex-1 space-y-5">
                {isEditing ? (
                  /* Оставить форму редактирования как есть */
                  <form onSubmit={handleSaveEdit} id="edit-staff-form" className="space-y-4 text-left">
                    {/* ... оставить поля формы без изменений, как в вашем варианте ... */}
                  </form>
                ) : (
                  /* Просмотр профиля */
                  <div className="space-y-5 text-center">
                    {renderAvatar(selectedStaff, "w-16 h-16 text-xl mx-auto")}

                    <div>
                      <p className="text-xl font-semibold text-[#121214] dark:text-white">{selectedStaff.name}</p>
                      <p className="text-xs text-[#121214]/60 dark:text-white/60 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
                        {selectedStaff.role === 'coach'
                          ? 'Преподаватель студии'
                          : selectedStaff.role === 'admin'
                          ? 'Администратор студии'
                          : 'Сотрудник'}
                      </p>
                    </div>

                    <div className="h-px bg-zinc-800/60" />

                    <div className="space-y-3.5 text-left bg-[#121214]/5 dark:bg-white/5 p-4 !rounded-[24px] border border-zinc-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 flex items-center gap-1.5">
                          <Phone size={12} className="text-zinc-500" /> Телефон:
                        </span>
                        <span className="text-xs font-medium text-[#121214] dark:text-white font-mono">{selectedStaff.phone}</span>
                      </div>
                      {selectedStaff.role === 'coach' ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 flex items-center gap-1.5">
                            <GraduationCap size={12} className="text-purple-400" /> Направления:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedStaff.directions?.map((dir, idx) => (
                              <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-bold text-[#121214] dark:text-white tracking-wide">
                                {dir}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : selectedStaff.role === 'admin' ? (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 flex items-center gap-1.5">
                            <Shield size={12} className="text-blue-400" /> Смены:
                          </span>
                          <span className="text-xs font-medium text-[#121214] dark:text-white">{selectedStaff.shifts || 0} смен</span>
                        </div>
                      ) : null}
                      <div className="h-px bg-zinc-800/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#121214]/60 dark:text-white/60 flex items-center gap-1.5">
                          <DollarSign size={12} className="text-[#CCFF00]" /> Баланс выплат:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${selectedStaff.balance > 0
                            ? "text-[#121214] dark:text-white"
                            : "text-[#121214]/60 dark:text-white/60"}`}>
                            {selectedStaff.balance > 0 ? `${selectedStaff.balance.toLocaleString()} ₽` : 'Выплачено'}
                          </span>
                          {selectedStaff.balance > 0 && (
                            <button
                              type="button"
                              onClick={() => setPayingStaffFromProfile(selectedStaff)}
                              className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer border-none tracking-wide"
                            >
                              <CreditCard size={12} />
                              <span>Выплатить</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Кнопки действий внизу страницы */}
              <div className="shrink-0 space-y-3 mt-auto">
                {isEditing ? (
                  <button
                    type="submit"
                    form="edit-staff-form"
                    className="w-full py-3 !bg-[#CCFF00] hover:bg-[#B5E600] text-black font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Сохранить изменения
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteStaff(selectedStaff.id)}
                    className="w-full py-3 !bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs uppercase tracking-wider !rounded-full transition-colors text-center cursor-pointer"
                  >
                    Удалить из команды
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedStaff(null);
                    setIsEditing(false);
                  }}
                  className="!rounded-full bg-zinc-900 border border-zinc-800 text-white w-full py-3 hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                >
                  {isEditing ? "Отмена" : "Закрыть"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaySalaryModal
        isOpen={Boolean(payingStaffFromProfile)}
        onClose={() => setPayingStaffFromProfile(null)}
        staffMember={payingStaffFromProfile}
        onConfirmPayout={(payoutData) => {
          const updated = staff.map(s => {
            if (s.id === payoutData.staffId) {
              const newBal = Math.max(0, s.balance - payoutData.amount);
              return { ...s, balance: newBal };
            }
            return s;
          });
          updateStaffList(updated);

          // Update currently open profile modal staff object
          if (selectedStaff && selectedStaff.id === payoutData.staffId) {
            setSelectedStaff({
              ...selectedStaff,
              balance: Math.max(0, selectedStaff.balance - payoutData.amount)
            });
          }

          // Save payout transaction to localStorage for Finance sync
          try {
            const existingPayoutsRaw = localStorage.getItem('studio_salary_payouts');
            const existingPayouts = existingPayoutsRaw ? JSON.parse(existingPayoutsRaw) : [];
            const newPayoutRecord = {
              id: Date.now(),
              ...payoutData,
            };
            const updatedPayouts = [newPayoutRecord, ...existingPayouts];
            localStorage.setItem('studio_salary_payouts', JSON.stringify(updatedPayouts));
          } catch (e) {
            console.error("Error saving payout to localStorage:", e);
          }

          const methodNames: Record<PaymentMethod, string> = {
            cash: '💵 Наличные',
            terminal: '💳 Карта',
            transfer: '🏦 Расчетный счет',
            sbp: '⚡ СБП'
          };

          toast({
            title: "Выплата ЗП оформлена!",
            description: `Выплачено ${payoutData.amount.toLocaleString()} ₽ сотруднику ${payoutData.staffName} (${methodNames[payoutData.paymentMethod]})`,
          });

          setPayingStaffFromProfile(null);
        }}
      />

      <BottomNav />
    </div>
  );
}