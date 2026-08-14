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
  Users
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

// Новая структура типов
type MainCategory = 'memberships' | 'services';

type SubCategory = 
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
  freezeDays?: number; // Правила заморозки
  linkedDirections?: string; // Привязка к направлениям
  linkedTrainers?: string; // Привязка к тренерам
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
  const [subCategory, setSubCategory] = useState<SubCategory>('limited');
  
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

  // Вкладки подкатегорий
  const subTabs = mainCategory === 'memberships' ? [
    { id: 'unlimited', label: 'Безлимитные', icon: InfinityIcon },
    { id: 'limited', label: 'С ограничением', icon: ListOrdered },
    { id: 'time_based', label: 'Временные', icon: CalendarDays },
    { id: 'single', label: 'Разовые визиты', icon: Ticket },
  ] : [
    { id: 'private', label: 'Индивидуальные', icon: UserCircle },
    { id: 'rent', label: 'Аренда залов', icon: Building2 },
    { id: 'choreography', label: 'Постановка', icon: Music },
    { id: 'additional', label: 'Доп. сервисы', icon: MoreHorizontal },
  ];

  const handleMainCategoryChange = (cat: MainCategory) => {
    setMainCategory(cat);
    setSubCategory(cat === 'memberships' ? 'limited' : 'private');
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      mainCategory: mainCategory,
      subCategory: subCategory,
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

  const filteredServices = services.filter(s => s.mainCategory === mainCategory && s.subCategory === subCategory);

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 ${
      theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'
    }`}>

      <div className="flex-1 px-4 pb-32 pt-4">
        {/* Фирменный баннер раздела */}
        <div 
          className="p-5 rounded-outer transition-all shadow-md flex flex-col gap-3 my-2"
          style={{ backgroundColor: accentColor || '#CCFF00' }}
        >
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/60">
                ПРАЙС-ЛИСТ СТУДИИ
              </span>
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 mt-0.5">
                Каталог
              </h2>
            </div>

            <div className="bg-black/10 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm">
              <span className="font-mono">{services.length}</span> поз.
            </div>
          </div>

          <div className="flex items-baseline gap-2 px-1">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {services.filter(s => s.mainCategory === mainCategory).length}
            </span>
            <span className="text-xs font-bold text-slate-900/70 uppercase tracking-wide">
              активных предложений в категории
            </span>
          </div>
        </div>

        {/* Двухуровневая навигация */}
        <div className="my-4 space-y-3">
          {/* Уровень 1: Главный переключатель */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
            <button
              onClick={() => handleMainCategoryChange('memberships')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mainCategory === 'memberships' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Абонементы и тарифы
            </button>
            <button
              onClick={() => handleMainCategoryChange('services')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mainCategory === 'services' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Каталог услуг
            </button>
          </div>

          {/* Уровень 2: Скроллируемые табы подкатегорий */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 [&::-webkit-scrollbar]:hidden">
            {subTabs.map(tab => {
              const isActive = subCategory === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubCategory(tab.id as SubCategory)}
                  style={isActive ? { backgroundColor: accentColor || '#CCFF00', color: '#000000' } : {}}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                    isActive 
                      ? 'shadow-md font-black border-transparent' 
                      : 'bg-white/40 dark:bg-zinc-900/60 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-white/80'
                  }`}
                >
                  <Icon size={14} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Список карточек услуг */}
        <div className="space-y-3 mt-4">
          <AnimatePresence mode="popLayout">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-outer p-5 border border-white/20 dark:border-white/10 shadow-sm relative group overflow-hidden"
                >
                  {service.popular && (
                    <div 
                      style={{ backgroundColor: accentColor || '#CCFF00' }}
                      className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles size={11} className="stroke-[2.5]" />
                      <span>Хит продаж</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start pr-12">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {service.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Блок с новыми параметрами (Заморозка, Направления, Тренеры) */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-bold tracking-wide">
                    {service.freezeDays ? (
                      <span className="flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md uppercase">
                        <Snowflake size={11} /> Заморозка: {service.freezeDays} дн.
                      </span>
                    ) : null}
                    
                    {service.linkedDirections && (
                      <span className="flex items-center gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md uppercase truncate max-w-[150px]">
                        <MapPin size={11} /> {service.linkedDirections}
                      </span>
                    )}

                    {service.linkedTrainers && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md uppercase truncate max-w-[150px]">
                        <Users size={11} /> {service.linkedTrainers}
                      </span>
                    )}
                  </div>

                  {/* Нижняя строка: характеристики + цена + кнопки управления */}
                  <div className="flex justify-between items-center pt-4 mt-3 border-t border-black/5 dark:border-white/10">
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
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        ₽{service.price.toLocaleString('ru-RU')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(service)}
                          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
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
                В этой категории пока нет добавленных услуг
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