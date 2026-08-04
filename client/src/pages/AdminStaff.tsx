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
import EmployeesView from '../components/EmployeesView';
import PaySalaryModal, { PaymentMethod } from '../components/PaySalaryModal';
import { StaffMember } from '../components/EmployeeCard';

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

  const renderAvatar = (member: StaffMember, sizeClass = "w-12 h-12 text-sm") => {
    if (member.avatar && member.avatar.length > 4) {
      return (
        <div className={`${sizeClass} !rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 shadow-inner shadow-black/20`}>
          <img src={member.avatar} className="object-cover w-full h-full" alt={member.name} referrerPolicy="no-referrer" />
        </div>
      );
    }
    
    const initials = getInitials(member.name);
    return (
      <div className={`${sizeClass}!rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center font-bold tracking-wider text-zinc-300 shrink-0 select-none shadow-inner shadow-black/20`}>
        {initials || <span className="text-zinc-500">?</span>}
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
      <div className={`h-[100dvh] flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#DDE2E5] text-slate-900' : 'bg-black text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col p-6 pb-28 font-sans relative transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#DDE2E5] text-slate-900' : 'bg-black text-white'
    }`}>
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation('/Admin')}
            className="p-2.5 text-zinc-400 hover:text-[#CCFF00] transition-colors rounded-full hover:bg-neutral-800 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Сотрудники</h1>
            <p className="text-xs text-zinc-400">Управление командой студии</p>
          </div>
        </div>
      </header>

      {/* Карточки со статистикой */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
            <Users size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Штат студии</span>
            <span className="text-sm font-medium text-white">{totalCoaches} тр. | {totalAdmins} адм.</span>
          </div>
        </div>

        <div className="!bg-[#18181b] border !border-zinc-800 p-4 !rounded-[24px] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Долг по ЗП</span>
            <span className="text-sm font-medium text-[#CCFF00]">{totalUnpaidSalary.toLocaleString()} ₽</span>
          </div>
        </div>
      </div>

      {/* Плавающая круглая кнопка с плюсом */}
      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
        ariaLabel="Добавить сотрудника"
      />

      {/* Выделенный компонент с фильтрацией и карточками сотрудников */}
      <EmployeesView
        staff={staff}
        onUpdateStaff={updateStaffList}
        onSelectStaffProfile={(member) => {
          setSelectedStaff(member);
          setIsEditing(false);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

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
              className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 max-w-md w-full max-h-[85vh] flex flex-col text-white shadow-2xl relative"
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

                <form onSubmit={handleAddStaff} id="add-staff-form" className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Имя и фамилия</label>
                    <input 
                      type="text"
                      required
                      placeholder="Например: Анастасия Леонова"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Телефон</label>
                    <input 
                      type="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {addRole === 'coach' && (
                      <motion.div
                        key="coach-fields"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Направления (через запятую)</label>
                        <input 
                          type="text"
                          placeholder="High Heels, Strip, Растяжка"
                          value={addDirections}
                          onChange={(e) => setAddDirections(e.target.value)}
                          className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1"
                        />
                      </motion.div>
                    )}

                    {addRole === 'admin' && (
                      <motion.div
                        key="admin-fields"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Количество смен</label>
                        <input 
                          type="number"
                          placeholder="0"
                          value={addShifts}
                          onChange={(e) => setAddShifts(e.target.value)}
                          className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                        />
                      </motion.div>
                    )}

                    {addRole === 'other' && (
                      <motion.div
                        key="other-fields"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 pt-1"
                      >
                        {/* 1. НАЗВАНИЕ ДОЛЖНОСТИ */}
                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 pl-2 block">
                            НАЗВАНИЕ ДОЛЖНОСТИ
                          </label>
                          <input 
                            type="text"
                            value={customPosition}
                            onChange={(e) => setCustomPosition(e.target.value)}
                            placeholder="Например: СММ-специалист / Клининг / Завхоз"
                            className="w-full bg-black/60 border border-white/5 rounded-[16px] px-5 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors mt-1"
                          />
                        </div>

                        {/* 2. БЛОК РАЗМЕРА ЗАРПЛАТЫ / СТАВКИ */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 pl-2 block">
                            УСЛОВИЯ ОПЛАТЫ
                          </label>

                          {/* Мини-пилюля типов оплаты */}
                          <div className="flex gap-1 p-1 bg-black/40 rounded-full border border-white/5">
                            <button
                              type="button"
                              onClick={() => setPayType('salary')}
                              style={payType === 'salary' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                              className={
                                payType === 'salary'
? "flex-1 bg-[#CCFF00] text-black font-bold text-xs rounded-full py-1.5 transition-all shadow-sm border-none outline-none cursor-pointer text-center tracking-wide"
: "flex-1 text-zinc-400 hover:text-white font-bold text-xs py-1.5 cursor-pointer border-none outline-none bg-transparent text-center tracking-wide"
                              }
                            >
                              Оклад
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayType('shift')}
                              style={payType === 'shift' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                              className={
                                payType === 'shift'
? "flex-1 bg-[#CCFF00] text-black font-bold text-xs rounded-full py-1.5 transition-all shadow-sm border-none outline-none cursor-pointer text-center tracking-wide"
: "flex-1 text-zinc-400 hover:text-white font-bold text-xs py-1.5 cursor-pointer border-none outline-none bg-transparent text-center tracking-wide"
                              }
                            >
                              За смену / час
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayType('percent')}
                              style={payType === 'percent' ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                              className={
                                payType === 'percent'
? "flex-1 bg-[#CCFF00] text-black font-bold text-xs rounded-full py-1.5 transition-all shadow-sm border-none outline-none cursor-pointer text-center tracking-wide"
: "flex-1 text-zinc-400 hover:text-white font-bold text-xs py-1.5 cursor-pointer border-none outline-none bg-transparent text-center tracking-wide"
                              }
                            >
                              Процент
                            </button>
                          </div>

                          {/* Поле суммы / ставки */}
                          <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 pl-2 block mt-2">
                              {payType === 'salary' ? 'ОКЛАД (₽)' : payType === 'shift' ? 'РАЗМЕР СТАВКИ (₽)' : 'ПРОЦЕНТ ВЫПЛАТЫ (%)'}
                            </label>
                            <div className="relative">
                              <input 
                                type="number"
                                value={customRate}
                                onChange={(e) => setCustomRate(e.target.value)}
                                placeholder="0"
                                className="w-full bg-black/60 border border-white/5 rounded-[16px] px-5 py-3 text-white text-sm font-medium font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                              />
                              <span className="absolute right-5 top-3.5 text-zinc-400 font-medium text-xs pointer-events-none">
                                {payType === 'percent' ? '%' : '₽'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {addRole !== 'other' && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Начальный баланс ЗП (₽)</label>
                      <input 
                        type="number"
                        placeholder="0"
                        value={addBalance}
                        onChange={(e) => setAddBalance(e.target.value)}
                        className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] transition-colors mt-1 font-mono"
                      />
                    </div>
                  )}
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
              className="!bg-[#18181b] border !border-zinc-800 !rounded-[24px] p-6 pb-10 max-w-md w-full max-h-[85vh] flex flex-col text-white shadow-2xl relative"
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
                  /* Форма редактирования */
                  <form onSubmit={handleSaveEdit} id="edit-staff-form" className="space-y-4 text-left">
                    {/* Выбор должности (Верхняя строка) */}
                    <div>
                      <div className="!rounded-full bg-zinc-950/60 border border-zinc-850 p-1 flex w-full mb-6">
                        <button
                          type="button"
                          onClick={() => setEditRole('coach')}
                          className={`flex-1 py-2 text-xs transition-all cursor-pointer ${
                            editRole === 'coach'
? 'bg-[#CCFF00] text-zinc-950 !rounded-full font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          Тренер
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditRole('admin')}
                          className={`flex-1 py-2 text-xs transition-all cursor-pointer ${
                            editRole === 'admin'
? 'bg-[#CCFF00] text-zinc-950 !rounded-full font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          Администратор
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
                                setEditAvatar(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {editAvatar && editAvatar.length > 4 ? (
                          <img src={editAvatar} className="object-cover w-full h-full" alt="Preview" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Camera size={20} className="mb-1 text-zinc-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">+ фото</span>
                          </>
                        )}
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Имя и фамилия</label>
                      <input 
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Телефон</label>
                      <input 
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] mt-1 font-mono"
                      />
                    </div>

                    {editRole === 'coach' ? (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Направления</label>
                        <input 
                          type="text"
                          value={editDirections}
                          onChange={(e) => setEditDirections(e.target.value)}
                          className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] mt-1"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Отработано смен</label>
                        <input 
                          type="number"
                          value={editShifts}
                          onChange={(e) => setEditShifts(e.target.value)}
                          className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] mt-1 font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-2">Баланс ЗП (₽)</label>
                      <input 
                        type="number"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="w-full !rounded-[16px] bg-zinc-950 border border-zinc-800 px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-[#CCFF00] mt-1 font-mono"
                      />
                    </div>
                  </form>
                ) : (
                  /* Просмотр профиля */
                  <div className="space-y-5 text-center">
                    {renderAvatar(selectedStaff, "w-16 h-16 text-xl mx-auto")}

                    <div>
                      <p className="text-xl font-semibold text-white">{selectedStaff.name}</p>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
                        {selectedStaff.role === 'coach' ? 'Преподаватель студии' : 'Администратор студии'}
                      </p>
                    </div>

                    <div className="h-px bg-zinc-800/60" />

                    <div className="space-y-3.5 text-left bg-zinc-950/40 p-4 !rounded-[24px] border border-zinc-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-zinc-500" /> Телефон:
                        </span>
                        <span className="text-xs font-medium text-white font-mono">{selectedStaff.phone}</span>
                      </div>

                      {selectedStaff.role === 'coach' ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                            <GraduationCap size={12} className="text-purple-400" /> Направления:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedStaff.directions?.map((dir, idx) => (
                              <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-bold text-zinc-300 tracking-wide">
                                {dir}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                            <Shield size={12} className="text-blue-400" /> Смены:
                          </span>
                          <span className="text-xs font-medium text-white">{selectedStaff.shifts || 0} смен</span>
                        </div>
                      )}

                      <div className="h-px bg-zinc-800/40" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                          <DollarSign size={12} className="text-[#CCFF00]" /> Баланс выплат:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium${selectedStaff.balance > 0 ? 'text-[#CCFF00]' : 'text-zinc-500'}`}>
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