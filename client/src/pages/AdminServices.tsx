import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Ticket, 
  Sparkles, 
  Clock, 
  Pencil, 
  Trash2, 
  Zap, 
  Building2, 
  Infinity as InfinityIcon, 
  ListOrdered, 
  CalendarDays, 
  UserCircle, 
  Music, 
  MoreHorizontal,
  Snowflake,
  MapPin,
  Users,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

type MainCategory = 'memberships' | 'services';

type SubCategory = 
  | 'all'
  // Абонементы
  | 'unlimited' | 'limited' | 'time_based' | 'single'
  // Услуги
  | 'private' | 'rent' | 'choreography' | 'additional';

interface ServiceItem {
  id: string;
  title: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  price: number;
  visitsCount?: number;
  durationDays?: number;
  freezeDays?: number;
  linkedDirections?: string;
  linkedTrainers?: string;
  description: string;
  popular?: boolean;
  color?: string;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: '1',
    title: 'Стандарт (8 занятий)',
    mainCategory: 'memberships',
    subCategory: 'limited',
    price: 4800,
    visitsCount: 8,
    durationDays: 30,
    freezeDays: 7,
    description: 'Действует на все регулярные классы',
    popular: true,
    color: '#CCFF00'
  },
  {
    id: '2',
    title: 'Безлимит на месяц',
    mainCategory: 'memberships',
    subCategory: 'unlimited',
    price: 9500,
    visitsCount: 999,
    durationDays: 30,
    freezeDays: 14,
    description: 'Полный доступ ко всем групповым занятиям студии',
    color: '#F43F5E'
  },
  {
    id: '3',
    title: 'Пробное занятие',
    mainCategory: 'memberships',
    subCategory: 'single',
    price: 500,
    visitsCount: 1,
    durationDays: 7,
    description: 'Первое знакомство с хореографом и студией',
    color: '#38BDF8'
  },
  {
    id: '4',
    title: 'Индивидуальное занятие',
    mainCategory: 'services',
    subCategory: 'private',
    price: 2500,
    durationDays: 1,
    linkedTrainers: 'Любой свободный',
    description: '1 час работы тет-а-тет с хореографом',
    color: '#A855F7'
  },
  {
    id: '5',
    title: 'Аренда Зал 1 (Main Glass)',
    mainCategory: 'services',
    subCategory: 'rent',
    price: 1200,
    durationDays: 1,
    description: 'Большой зал с панорамными зеркалами (1 час)',
    color: '#FBBF24'
  },
  {
    id: '6',
    title: 'Постановка свадебного танца',
    mainCategory: 'services',
    subCategory: 'choreography',
    price: 15000,
    visitsCount: 5,
    durationDays: 60,
    linkedDirections: 'Свадебный танец',
    description: '5 индивидуальных репетиций + подбор музыки',
    popular: true,
    color: '#CCFF00'
  }
];

export default function AdminServices() {
  const { theme, accentColor } = useTheme();
  const { toast } = useToast();

  const [mainCategory, setMainCategory] = useState<MainCategory>('memberships');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    mainCategory: 'memberships' as MainCategory,
    subCategory: 'limited' as SubCategory,
    price: '',
    visitsCount: '',
    durationDays: '',
    freezeDays: '',
    linkedDirections: '',
    linkedTrainers: '',
    description: '',
    popular: false
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      mainCategory: mainCategory,
      subCategory: mainCategory === 'memberships' ? 'limited' : 'private',
      price: '',
      visitsCount: '',
      durationDays: '',
      freezeDays: '',
      linkedDirections: '',
      linkedTrainers: '',
      description: '',
      popular: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      price: item.price.toString(),
      visitsCount: item.visitsCount?.toString() || '',
      durationDays: item.durationDays?.toString() || '',
      freezeDays: item.freezeDays?.toString() || '',
      linkedDirections: item.linkedDirections || '',
      linkedTrainers: item.linkedTrainers || '',
      description: item.description,
      popular: !!item.popular
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы действительно хотите удалить эту позицию?')) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Удалено', description: 'Позиция удалена из прайса' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Заполните название и стоимость' });
      return;
    }

    const payload = {
      title: formData.title,
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory,
      price: parseFloat(formData.price) || 0,
      visitsCount: parseInt(formData.visitsCount) || undefined,
      durationDays: parseInt(formData.durationDays) || undefined,
      freezeDays: parseInt(formData.freezeDays) || undefined,
      linkedDirections: formData.linkedDirections,
      linkedTrainers: formData.linkedTrainers,
      description: formData.description,
      popular: formData.popular
    };

    if (editingItem) {
      setServices(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...payload } : s));
      toast({ title: 'Сохранено', description: 'Изменения успешно обновлены' });
    } else {
      const newItem: ServiceItem = {
        id: Date.now().toString(),
        color: accentColor || '#CCFF00',
        ...payload
      };
      setServices(prev => [newItem, ...prev]);
      toast({ title: 'Создано', description: 'Новая позиция добавлена в каталог' });
    }

    setIsModalOpen(false);
  };

  const activeFilter = mainCategory === 'memberships' ? membershipFilter : serviceFilter;
  const isFilterActive = activeFilter !== 'all';

  const filteredServices = services.filter(s => {
    if (s.mainCategory !== mainCategory) return false;
    if (mainCategory === 'memberships') {
      if (membershipFilter !== 'all' && s.subCategory !== membershipFilter) return false;
    } else {
      if (serviceFilter !== 'all' && s.subCategory !== serviceFilter) return false;
    }
    return true;
  });

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Слайдер + Вертикальная навигация ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {mainCategory === 'memberships' ? (
                /* СЛАЙД 1: АБОНЕМЕНТЫ */
                <motion.div
                  key="memberships-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) {
                      setIsFilterOpen(false);
                      setMainCategory('services');
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: accentColor || '#CCFF00' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 leading-tight">
                      Абонементы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                      {filteredServices.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-900/70 uppercase tracking-wide leading-tight">
                      активных<br/>тарифов
                    </span>
                  </div>

                  {/* Низ баннера: Круглая кнопка Фильтров */}
                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFilterOpen(!isFilterOpen);
                        }} 
                        className="w-11 h-11 rounded-full bg-black/10 hover:bg-black/15 text-slate-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-64 origin-top-left"
                        >
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Категория тарифов</label>
                            <select
                              value={membershipFilter}
                              onChange={(e) => setMembershipFilter(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="all">Все категории</option>
                              <option value="unlimited">Безлимитные</option>
                              <option value="limited">С ограничением</option>
                              <option value="time_based">Временные</option>
                              <option value="single">Разовые визиты</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setMembershipFilter('all');
                                setIsFilterOpen(false);
                              }} 
                              className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* СЛАЙД 2: УСЛУГИ */
                <motion.div
                  key="services-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 40) {
                      setIsFilterOpen(false);
                      setMainCategory('memberships');
                    }
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between bg-[#DDE2E5] dark:bg-[#161618] border border-slate-300/40 dark:border-white/10 cursor-grab active:cursor-grabbing !overflow-visible select-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                      Каталог услуг
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                      {filteredServices.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide leading-tight">
                      активных<br/>услуг
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between z-[100]">
                    <div className="relative">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFilterOpen(!isFilterOpen);
                        }} 
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 text-slate-900 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 dark:bg-white shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl w-64 origin-top-left"
                        >
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Категория услуг</label>
                            <select
                              value={serviceFilter}
                              onChange={(e) => setServiceFilter(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="all">Все услуги</option>
                              <option value="private">Индивидуальные</option>
                              <option value="rent">Аренда залов</option>
                              <option value="choreography">Постановка</option>
                              <option value="additional">Доп. сервисы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              className="flex-1 bg-[#CCFF00] text-black text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setServiceFilter('all');
                                setIsFilterOpen(false);
                              }} 
                              className="px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                            >
                              Сброс
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] bg-white/40 dark:bg-[#161618]/90 border border-black/5 dark:border-white/10 rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-sm shrink-0 backdrop-blur-md">
            <button 
              onClick={() => { setIsFilterOpen(false); setMainCategory('memberships'); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainCategory === 'memberships' 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Абонементы"
            >
              <Ticket size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setMainCategory('services'); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainCategory === 'services' 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Услуги"
            >
              <Sparkles size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── СПИСОК КАРТОЧЕК С ЕДИНЫМ GAP-2.5 ─── */}
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 border-none shadow-none relative group overflow-hidden"
                >
                  {service.popular && (
                    <div 
                      style={{ backgroundColor: accentColor || '#CCFF00' }}
                      className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-[20px] text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles size={11} className="stroke-[2.5]" />
                      <span>Хит продаж</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start pr-12">
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white">
                        {service.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-bold tracking-wide">
                    {service.freezeDays ? (
                      <span className="flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-full uppercase">
                        <Snowflake size={11} /> Заморозка: {service.freezeDays} дн.
                      </span>
                    ) : null}
                    
                    {service.linkedDirections && (
                      <span className="flex items-center gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full uppercase truncate max-w-[160px]">
                        <MapPin size={11} /> {service.linkedDirections}
                      </span>
                    )}

                    {service.linkedTrainers && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase truncate max-w-[160px]">
                        <Users size={11} /> {service.linkedTrainers}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3.5 mt-3 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-zinc-400">
                      {service.visitsCount && (
                        <span className="flex items-center gap-1">
                          <ListOrdered size={13} className="text-slate-400" />
                          <span className="font-mono">{service.visitsCount >= 999 ? '∞' : service.visitsCount}</span> зан.
                        </span>
                      )}
                      {service.durationDays && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          <span className="font-mono">{service.durationDays}</span> дн.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-950 dark:text-white font-mono">
                        ₽{service.price.toLocaleString('ru-RU')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(service)}
                          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">
                В этой категории пока нет добавленных предложений
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <FloatingActionButton
        onClick={handleOpenAddModal}
        ariaLabel="Добавить услугу"
        id="floating-add-service-btn"
      />

      {/* Модальное окно добавления / редактирования */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!rounded-[28px] !border-zinc-800 bg-[#161618] text-white p-7 max-w-md shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editingItem ? 'Редактировать позицию' : 'Новая позиция в прайсе'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-3">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Раздел</label>
                <select
                  value={formData.mainCategory}
                  onChange={e => {
                    const cat = e.target.value as MainCategory;
                    setFormData({ 
                      ...formData, 
                      mainCategory: cat, 
                      subCategory: cat === 'memberships' ? 'limited' : 'private' 
                    });
                  }}
                  className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-2xl px-3 h-11 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="memberships">Абонементы</option>
                  <option value="services">Услуги</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Категория</label>
                <select
                  value={formData.subCategory}
                  onChange={e => setFormData({ ...formData, subCategory: e.target.value as SubCategory })}
                  className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-2xl px-3 h-11 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  {formData.mainCategory === 'memberships' ? (
                    <>
                      <option value="unlimited">Безлимитные</option>
                      <option value="limited">С ограничением</option>
                      <option value="time_based">Временные</option>
                      <option value="single">Разовые визиты</option>
                    </>
                  ) : (
                    <>
                      <option value="private">Индивидуальные</option>
                      <option value="rent">Аренда залов</option>
                      <option value="choreography">Постановка</option>
                      <option value="additional">Доп. сервисы</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Название</label>
              <Input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Стандарт 8 занятий"
                className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Стоимость (₽)</label>
                <Input
                  required
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="4800"
                  className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Кол-во занятий</label>
                <Input
                  type="number"
                  value={formData.visitsCount}
                  onChange={e => setFormData({ ...formData, visitsCount: e.target.value })}
                  placeholder="Оставьте пустым если ∞"
                  className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Срок (дней)</label>
                <Input
                  type="number"
                  value={formData.durationDays}
                  onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                  placeholder="30"
                  className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Заморозка (дней)</label>
                <Input
                  type="number"
                  value={formData.freezeDays}
                  onChange={e => setFormData({ ...formData, freezeDays: e.target.value })}
                  placeholder="Например: 7"
                  className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Привязка к направлениям</label>
              <Input
                value={formData.linkedDirections}
                onChange={e => setFormData({ ...formData, linkedDirections: e.target.value })}
                placeholder="Например: Только K-Pop, High Heels"
                className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Привязка к тренерам</label>
              <Input
                value={formData.linkedTrainers}
                onChange={e => setFormData({ ...formData, linkedTrainers: e.target.value })}
                placeholder="Например: Топ-хореографы"
                className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Короткое описание</label>
              <Input
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Особенности тарифа..."
                className="rounded-2xl border-zinc-800 h-11 bg-[#1C1C1E] text-white text-xs font-medium px-4 focus-visible:border-[#CCFF00]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 cursor-pointer" onClick={() => setFormData({ ...formData, popular: !formData.popular })}>
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                className="w-4 h-4 rounded text-[#CCFF00] focus:ring-0"
              />
              <span className="text-xs font-bold text-stone-300">Пометить как «Хит продаж»</span>
            </div>

            <DialogFooter className="pt-3 pb-2">
              <Button
                type="submit"
                style={{ backgroundColor: accentColor || '#CCFF00', color: '#000000' }}
                className="w-full rounded-full h-12 font-black text-xs uppercase tracking-wider shadow-md border-none cursor-pointer hover:opacity-90"
              >
                Сохранить в каталог
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}