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
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';
import BottomNav from "../components/BottomNav";
import FloatingActionButton from "../components/FloatingActionButton";
import { motion, AnimatePresence } from 'framer-motion';

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
    color: '#F93380'
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
    color: '#8C0070'
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
    color: '#F93380'
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
    color: '#8C0070'
  },
  {
    id: '5',
    title: 'Аренда Зал 1 (Main Glass)',
    mainCategory: 'services',
    subCategory: 'rent',
    price: 1200,
    durationDays: 1,
    description: 'Большой зал с панорамными зеркалами (1 час)',
    color: '#F93380'
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
    color: '#8C0070'
  }
];

export default function AdminServices() {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [mainCategory, setMainCategory] = useState<MainCategory>('memberships');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedServiceForDrawer, setSelectedServiceForDrawer] = useState<ServiceItem | null>(null);
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
    setIsDrawerOpen(true);
  };

  const handleOpenEditModal = (item: ServiceItem) => {
    setSelectedServiceForDrawer(null);
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
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы действительно хотите удалить эту позицию?')) {
      setServices(prev => prev.filter(s => s.id !== id));
      setSelectedServiceForDrawer(null);
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
      toast({ title: 'Сохранено ✨', description: 'Изменения успешно обновлены' });
    } else {
      const newItem: ServiceItem = {
        id: Date.now().toString(),
        color: '#F93380',
        ...payload
      };
      setServices(prev => [newItem, ...prev]);
      toast({ title: 'Создано ✨', description: 'Новая позиция добавлена в каталог' });
    }

    setIsDrawerOpen(false);
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

  const filterPopupStyle: React.CSSProperties = {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 18, 20, 0.88)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
    borderRadius: '36px'
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>

      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: С баннером и боковой пилюлей ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом с симметричным скруглением [42px] */}
          <div className="flex-1 relative h-full">
            <AnimatePresence initial={false} mode="wait">
              {mainCategory === 'memberships' ? (
                /* СЛАЙД 1: АБОНЕМЕНТЫ (#8C0070 фон, #F93380 текст) */
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
                  style={{ backgroundColor: '#8C0070', color: '#F93380' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#F93380] leading-tight">
                      Абонементы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#F93380] font-mono tracking-tight leading-none">
                      {filteredServices.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#F93380]/80 uppercase tracking-wide leading-tight">
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
                        className="w-11 h-11 rounded-full bg-[#F93380]/20 hover:bg-[#F93380]/30 text-[#F93380] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#8C0070] rounded-full bg-[#F93380] shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-64 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Категория тарифов</label>
                            <select
                              value={membershipFilter}
                              onChange={(e) => setMembershipFilter(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="all">Все категории</option>
                              <option value="unlimited">Безлимитные</option>
                              <option value="limited">С ограничением</option>
                              <option value="time_based">Временные</option>
                              <option value="single">Разовые визиты</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              style={{ backgroundColor: '#F93380', color: '#8C0070' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setMembershipFilter('all');
                                setIsFilterOpen(false);
                              }} 
                              className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
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
                /* СЛАЙД 2: УСЛУГИ (#F93380 фон, #8C0070 текст) */
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
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: '#F93380', color: '#8C0070' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#8C0070] leading-tight">
                      Каталог услуг
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#8C0070] font-mono tracking-tight leading-none">
                      {filteredServices.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#8C0070]/80 uppercase tracking-wide leading-tight">
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
                        className="w-11 h-11 rounded-full bg-[#8C0070]/20 hover:bg-[#8C0070]/30 text-[#8C0070] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#F93380] rounded-full bg-[#8C0070] shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-64 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Категория услуг</label>
                            <select
                              value={serviceFilter}
                              onChange={(e) => setServiceFilter(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="all">Все услуги</option>
                              <option value="private">Индивидуальные</option>
                              <option value="rent">Аренда залов</option>
                              <option value="choreography">Постановка</option>
                              <option value="additional">Доп. сервисы</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              style={{ backgroundColor: '#8C0070', color: '#F93380' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setServiceFilter('all');
                                setIsFilterOpen(false);
                              }} 
                              className="px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-full border-none hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer outline-none"
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
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => { setIsFilterOpen(false); setMainCategory('memberships'); }}
              style={mainCategory === 'memberships' ? { backgroundColor: '#F93380', color: '#8C0070' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainCategory === 'memberships' 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Абонементы"
            >
              <Ticket size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setIsFilterOpen(false); setMainCategory('services'); }}
              style={mainCategory === 'services' ? { backgroundColor: '#8C0070', color: '#F93380' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainCategory === 'services' 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Услуги"
            >
              <Sparkles size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── СПИСОК КАРТОЧЕК С ФИРМЕННЫМ SHADOW-MD И GAP-2.5 ─── */}
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
                  onClick={() => setSelectedServiceForDrawer(service)}
                  className="w-full bg-white/40 dark:bg-black/35 backdrop-blur-md rounded-[42px] p-5 border-none shadow-md relative group overflow-hidden text-left cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 transition-all"
                >
                  {service.popular && (
                    <div 
                      style={{ backgroundColor: '#F93380', color: '#8C0070' }}
                      className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-[20px] text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles size={11} className="stroke-[2.5]" />
                      <span>Хит продаж</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start pr-12">
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-[#F93380] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-bold tracking-wide">
                    {service.freezeDays ? (
                      <span className="flex items-center gap-1 bg-[#F93380]/15 text-[#F93380] px-2.5 py-1 rounded-full uppercase">
                        <Snowflake size={11} /> Заморозка: {service.freezeDays} дн.
                      </span>
                    ) : null}
                    
                    {service.linkedDirections && (
                      <span className="flex items-center gap-1 bg-[#8C0070]/15 text-[#8C0070] dark:text-pink-300 px-2.5 py-1 rounded-full uppercase truncate max-w-[160px]">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(service);
                          }}
                          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                          title="Редактировать"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(service.id);
                          }}
                          className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors cursor-pointer border-none"
                          title="Удалить"
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
        style={{ backgroundColor: '#8C0070', color: '#F93380' }}
        className="!bg-[#8C0070] !text-[#F93380] shadow-lg shadow-[#8C0070]/30 hover:opacity-95"
      />

      {/* ─── ШТОРКА 1: ДЕТАЛИ АБОНЕМЕНТА / УСЛУГИ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedServiceForDrawer && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedServiceForDrawer(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t border-x border-zinc-800 rounded-t-[42px] p-6 pt-7 pb-8 shadow-2xl flex flex-col text-white max-h-[85dvh]"
            >
              <button
                onClick={() => setSelectedServiceForDrawer(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-start justify-between pb-3 border-b border-zinc-800/60 pr-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                    {selectedServiceForDrawer.mainCategory === 'memberships' ? 'Тариф абонемента' : 'Услуга студии'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedServiceForDrawer.title}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-4 pb-6 space-y-4">
                <div className="bg-[#1C1C1E] border border-zinc-800 p-5 rounded-[28px] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Стоимость</span>
                  <span className="text-3xl font-black font-mono text-[#F93380] mt-1">
                    ₽{selectedServiceForDrawer.price.toLocaleString('ru-RU')}
                  </span>
                  <p className="text-xs text-zinc-300 font-medium mt-2 max-w-xs">
                    {selectedServiceForDrawer.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Количество занятий</span>
                    <span className="text-base font-black font-mono text-white">
                      {selectedServiceForDrawer.visitsCount ? (selectedServiceForDrawer.visitsCount >= 999 ? 'Безлимит (∞)' : `${selectedServiceForDrawer.visitsCount} зан.`) : 'По часам'}
                    </span>
                  </div>

                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Срок действия</span>
                    <span className="text-base font-black font-mono text-white">
                      {selectedServiceForDrawer.durationDays ? `${selectedServiceForDrawer.durationDays} дней` : 'Разово'}
                    </span>
                  </div>
                </div>

                {selectedServiceForDrawer.freezeDays ? (
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Snowflake size={18} className="text-[#F93380]" />
                      <span className="text-xs font-bold text-white">Доступная заморозка</span>
                    </div>
                    <span className="text-xs font-black font-mono text-white">
                      {selectedServiceForDrawer.freezeDays} дней
                    </span>
                  </div>
                ) : null}

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => handleOpenEditModal(selectedServiceForDrawer)}
                    style={{ backgroundColor: '#F93380', color: '#8C0070' }}
                    className="flex-1 h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    <Pencil size={15} className="mr-1.5" />
                    Редактировать
                  </Button>

                  <Button
                    onClick={() => handleDelete(selectedServiceForDrawer.id)}
                    className="h-14 px-5 rounded-full bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs uppercase transition-all border-none cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 2: СОЗДАНИЕ / РЕДАКТИРОВАНИЕ ПОЗИЦИИ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative z-10 w-full max-w-lg bg-[#18181b] border-t border-x border-zinc-800 rounded-t-[42px] p-6 pt-7 pb-8 shadow-2xl flex flex-col text-white max-h-[88dvh]"
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60 pr-8">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    {editingItem ? 'Редактировать позицию' : 'Новая позиция в прайсе'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                    {editingItem ? 'Измените параметры тарифа' : 'Заполните параметры тарифа или услуги'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 pt-4 flex-1 overflow-y-auto scrollbar-none pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Раздел</label>
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
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#F93380]"
                    >
                      <option value="memberships">Абонементы</option>
                      <option value="services">Услуги</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Категория</label>
                    <select
                      value={formData.subCategory}
                      onChange={e => setFormData({ ...formData, subCategory: e.target.value as SubCategory })}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-3 h-12 text-xs font-bold text-white focus:outline-none focus:border-[#F93380]"
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Название</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Стандарт 8 занятий"
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-sm font-bold px-4 focus-visible:border-[#F93380]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Стоимость (₽)</label>
                    <Input
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="4800"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-sm font-bold px-4 focus-visible:border-[#F93380]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Кол-во занятий</label>
                    <Input
                      type="number"
                      value={formData.visitsCount}
                      onChange={e => setFormData({ ...formData, visitsCount: e.target.value })}
                      placeholder="Оставьте пустым если ∞"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-sm font-bold px-4 focus-visible:border-[#F93380]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Срок (дней)</label>
                    <Input
                      type="number"
                      value={formData.durationDays}
                      onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                      placeholder="30"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-sm font-bold px-4 focus-visible:border-[#F93380]"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Заморозка (дней)</label>
                    <Input
                      type="number"
                      value={formData.freezeDays}
                      onChange={e => setFormData({ ...formData, freezeDays: e.target.value })}
                      placeholder="7"
                      className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white font-mono text-sm font-bold px-4 focus-visible:border-[#F93380]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Привязка к направлениям</label>
                  <Input
                    value={formData.linkedDirections}
                    onChange={e => setFormData({ ...formData, linkedDirections: e.target.value })}
                    placeholder="Например: K-Pop, High Heels"
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-xs font-bold px-4 focus-visible:border-[#F93380]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Короткое описание</label>
                  <Input
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Особенности тарифа..."
                    className="rounded-2xl border-zinc-800 h-12 bg-black/40 text-white text-xs font-medium px-4 focus-visible:border-[#F93380]"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1 cursor-pointer select-none" onClick={() => setFormData({ ...formData, popular: !formData.popular })}>
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F93380] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-zinc-300">Пометить как «Хит продаж»</span>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#8C0070', color: '#F93380' }}
                    className="w-full rounded-full h-14 font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    Сохранить в каталог
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}