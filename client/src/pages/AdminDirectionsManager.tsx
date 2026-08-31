import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Layers, 
  Calendar, 
  Users, 
  Clock, 
  X, 
  Check, 
  Sparkles, 
  Building2, 
  Tag, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  ShieldAlert, 
  GraduationCap, 
  Baby, 
  SlidersHorizontal, 
  Settings,
  CalendarPlus,
  Ticket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FloatingActionButton from "../components/FloatingActionButton";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import { Button } from "@/components/ui/button";

export interface DirectionItem {
  id: number;
  name: string;
  category: string;
  colorTag: string;
  coaches: string[];
  level: string;
  description: string;
}

export interface GroupItem {
  id: number;
  name: string;
  direction: string;
  schedule: string;
  days: string[];
  time: string;
  coach: string;
  capacity: number;
  enrolled: number;
  hall: string;
  level?: string;
  age?: string;
  dayTimes?: Record<string, string>;
  isCustomTimes?: boolean;
}

export interface AgeCategoryItem {
  id: number;
  name: string;
  range: string;
  description: string;
  count: number;
}

export interface LevelItem {
  id: number;
  name: string;
  tag: string;
  description: string;
  count: number;
}

const DEFAULT_DIRECTIONS: DirectionItem[] = [
  {
    id: 1,
    name: 'High Heels',
    category: 'Женские стили',
    colorTag: '#FF4500',
    coaches: ['Мария Ковалева', 'Ирина Волк'],
    level: 'Все уровни',
    description: 'Техника танца на каблуках, баланс, пластика и хореография.'
  },
  {
    id: 2,
    name: 'Contemporary',
    category: 'Современная хореография',
    colorTag: '#6B52E1',
    coaches: ['Алексей Петров'],
    level: 'Middle / Pro',
    description: 'Работа с весом, импровизация, партерная техника и экспрессия.'
  },
  {
    id: 3,
    name: 'Hip-Hop Choreo',
    category: 'Уличные танцы',
    colorTag: '#CCFF00',
    coaches: ['Дарья Смирнова'],
    level: 'Начинающие',
    description: 'Базовые качи, изоляция, ритмика и современные хореографии.'
  },
  {
    id: 4,
    name: 'Twerk & Booty Dance',
    category: 'Женские стили',
    colorTag: '#EC4899',
    coaches: ['Ирина Волк'],
    level: 'Все уровни',
    description: 'Интенсивная физическая нагрузка, тряски, вращения бедрами.'
  },
  {
    id: 5,
    name: 'Stretching & Aero',
    category: 'Фитнес & Растяжка',
    colorTag: '#10B981',
    coaches: ['Дарья Смирнова'],
    level: 'Все уровни',
    description: 'Глубокая растяжка всех групп мышц, шпагаты и гибкость спины.'
  }
];

const DEFAULT_GROUPS: GroupItem[] = [
  {
    id: 101,
    name: 'High Heels Beginners Pro',
    direction: 'High Heels',
    level: 'Beginners Pro',
    age: '16+ Лет',
    schedule: 'ПН / СР / ПТ — 19:00',
    days: ['ПН', 'СР', 'ПТ'],
    time: '19:00',
    coach: 'Мария Ковалева',
    capacity: 15,
    enrolled: 12,
    hall: 'Зал 1 (Main Glass)'
  },
  {
    id: 102,
    name: 'Contemporary Evening Group',
    direction: 'Contemporary',
    level: 'Middle / Pro',
    age: '18+ Лет',
    schedule: 'ВТ / ЧТ — 20:00',
    days: ['ВТ', 'ЧТ'],
    time: '20:00',
    coach: 'Алексей Петров',
    capacity: 12,
    enrolled: 10,
    hall: 'Зал 2 (Light Studio)'
  },
  {
    id: 103,
    name: 'Hip-Hop Choreo Crew',
    direction: 'Hip-Hop Choreo',
    level: 'Начинающие',
    age: '12-16 Лет',
    schedule: 'СБ / ВС — 16:00',
    days: ['СБ', 'ВС'],
    time: '16:00',
    coach: 'Дарья Смирнова',
    capacity: 18,
    enrolled: 15,
    hall: 'Зал 1 (Main Glass)'
  },
  {
    id: 104,
    name: 'Twerk Intensive Night',
    direction: 'Twerk & Booty Dance',
    level: 'Все уровни',
    age: '18+ Лет',
    schedule: 'ВТ / ЧТ / СБ — 18:30',
    days: ['ВТ', 'ЧТ', 'СБ'],
    time: '18:30',
    coach: 'Ирина Волк',
    capacity: 14,
    enrolled: 14,
    hall: 'Зал 3 (VIP)'
  }
];

const DEFAULT_AGES: AgeCategoryItem[] = [
  {
    id: 201,
    name: 'Дети',
    range: '4-7 лет',
    description: 'Развитие координации, чувства ритма и пластики тела для самых маленьких.',
    count: 3
  },
  {
    id: 202,
    name: 'Подростки',
    range: '8-14 лет',
    description: 'Изучение базовых танцевальных техник, кача, постановка командных номеров.',
    count: 5
  },
  {
    id: 203,
    name: 'Взрослые',
    range: '18+ лет',
    description: 'Основная группа для взрослых участников всех уровней и танцевальных направлений.',
    count: 8
  },
  {
    id: 204,
    name: 'Без ограничений',
    range: 'Все возрасты',
    description: 'Универсальные общие группы, мастер-классы и растяжка без возрастных рамок.',
    count: 4
  }
];

const DEFAULT_LEVELS: LevelItem[] = [
  {
    id: 301,
    name: 'Beginners / С нуля',
    tag: 'Начинающие',
    description: 'Детальный разбор базовых элементов, медленный темп изучения хореографий.',
    count: 6
  },
  {
    id: 302,
    name: 'Intermediate / Продолжающие',
    tag: 'Средний уровень',
    description: 'Усложненная техника, акцент на эмоциональность, скорость и подачу.',
    count: 4
  },
  {
    id: 303,
    name: 'Pro / Продвинутые',
    tag: 'Продвинутые',
    description: 'Закрытый состав для профессионалов, подготовка к чемпионатам и видеосъемкам.',
    count: 2
  },
  {
    id: 304,
    name: 'All Levels / Все уровни',
    tag: 'Универсальный',
    description: 'Группа подходит как для новичков, так и для танцоров с опытом.',
    count: 5
  }
];

const COACHES_LIST = [
  'Мария Ковалева',
  'Алексей Петров',
  'Дарья Смирнова',
  'Ирина Волк',
  'Дмитрий Назаров'
];

const CATEGORIES_LIST = [
  'Женские стили',
  'Современная хореография',
  'Уличные танцы',
  'Фитнес & Растяжка',
  'Детские направления',
  'Парные танцы'
];

const ALL_DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const HALLS_LIST = [
  'Зал 1 (Main Glass)',
  'Зал 2 (Light Studio)',
  'Зал 3 (VIP Room)'
];

export function DirectionsAndGroupsManager() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const { currentRole } = useRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Main View: 'groups' | 'settings'
  const [mainView, setMainView] = useState<'groups' | 'settings'>('groups');

  // Active Tab inside settings: 'directions' | 'ages' | 'levels'
  const [activeTab, setActiveTab] = useState<'directions' | 'groups' | 'ages' | 'levels'>('groups');

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Все филиалы');
  const [selectedHall, setSelectedHall] = useState('Все залы');
  const [selectedDirection, setSelectedDirection] = useState('Все направления');
  const [selectedAge, setSelectedAge] = useState('Все возраста');
  const [selectedCoach, setSelectedCoach] = useState('Все педагоги');

  const branchesList = ['Филиал: Невский', 'Филиал: Центральный'];

  // State data
  const [directions, setDirections] = useState<DirectionItem[]>(DEFAULT_DIRECTIONS);
  const [groups, setGroups] = useState<GroupItem[]>(DEFAULT_GROUPS);
  const [ages, setAges] = useState<AgeCategoryItem[]>(DEFAULT_AGES);
  const [levels, setLevels] = useState<LevelItem[]>(DEFAULT_LEVELS);

  // Шторка просмотра существующей группы
  const [selectedGroupForDrawer, setSelectedGroupForDrawer] = useState<GroupItem | null>(null);

  // Шторка создания / редактирования
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Женские стили');
  const [formDirection, setFormDirection] = useState('High Heels');
  const [formAge, setFormAge] = useState('16+ Лет');
  const [formCoach, setFormCoach] = useState('Мария Ковалева');
  const [formDays, setFormDays] = useState<string[]>(['ПН', 'СР', 'ПТ']);
  const [formTime, setFormTime] = useState('19:00');
  const [isCustomTimes, setIsCustomTimes] = useState(false);
  const [formDayTimes, setFormDayTimes] = useState<Record<string, string>>({
    'ПН': '19:00',
    'СР': '19:00',
    'ПТ': '19:00'
  });
  const [formCapacity, setFormCapacity] = useState<number>(15);
  const [formHall, setFormHall] = useState('Зал 1 (Main Glass)');
  const [formLevel, setFormLevel] = useState('Beginners Pro');
  const [formRange, setFormRange] = useState('18+ лет');
  const [formDescription, setFormDescription] = useState('');

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('Женские стили');
    setFormDirection(directions[0]?.name || 'High Heels');
    setFormCoach(COACHES_LIST[0] || 'Мария Ковалева');
    setFormDays(['ПН', 'СР', 'ПТ']);
    setFormTime('19:00');
    setIsCustomTimes(false);
    setFormDayTimes({ 'ПН': '19:00', 'СР': '19:00', 'ПТ': '19:00' });
    setFormCapacity(15);
    setFormHall('Зал 1 (Main Glass)');
    setFormLevel(levels[0]?.tag || 'Beginners Pro');
    setFormAge(ages[0]?.range || '16+ Лет');
    setFormRange('18+ лет');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEditDirection = (dir: DirectionItem) => {
    setMainView('settings');
    setActiveTab('directions');
    setEditingId(dir.id);
    setFormName(dir.name);
    setFormCategory(dir.category);
    setFormCoach(dir.coaches[0] || 'Мария Ковалева');
    setFormLevel(dir.level || 'Все уровни');
    setFormDescription(dir.description || '');
    setIsDrawerOpen(true);
  };

  const handleEditGroup = (group: GroupItem) => {
    setSelectedGroupForDrawer(null);
    setMainView('groups');
    setActiveTab('groups');
    setEditingId(group.id);
    setFormName(group.name);
    setFormDirection(group.direction || 'High Heels');
    setFormCategory(group.direction || 'High Heels');
    setFormCoach(group.coach || 'Мария Ковалева');
    const initialDays = group.days || ['ПН', 'СР', 'ПТ'];
    setFormDays(initialDays);
    setFormTime(group.time || '19:00');
    setIsCustomTimes(!!group.isCustomTimes);
    setFormDayTimes(
      group.dayTimes ||
      initialDays.reduce((acc, d) => ({ ...acc, [d]: group.time || '19:00' }), {} as Record<string, string>)
    );
    setFormCapacity(group.capacity || 15);
    setFormHall(group.hall || 'Зал 1 (Main Glass)');
    setFormLevel(group.level || 'Beginners Pro');
    setFormAge(group.age || '16+ Лет');
    setIsDrawerOpen(true);
  };

  const handleDeleteGroup = (id: number, name: string) => {
    if (confirm(`Удалить группу «${name}»?`)) {
      setGroups(prev => prev.filter(g => g.id !== id));
      setSelectedGroupForDrawer(null);
      toast({ title: "Группа удалена", description: `Группа «${name}» удалена.` });
    }
  };

  const handleEditAge = (age: AgeCategoryItem) => {
    setMainView('settings');
    setActiveTab('ages');
    setEditingId(age.id);
    setFormName(age.name);
    setFormRange(age.range);
    setFormDescription(age.description);
    setIsDrawerOpen(true);
  };

  const handleEditLevel = (lvl: LevelItem) => {
    setMainView('settings');
    setActiveTab('levels');
    setEditingId(lvl.id);
    setFormName(lvl.name);
    setFormLevel(lvl.tag);
    setFormDescription(lvl.description);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/Login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile && profile.role !== 'admin' && profile.role !== 'owner') {
        setLocation('/');
        return;
      }

      setLoading(false);
    }
    checkAdmin();
  }, [setLocation]);

  const toggleDaySelect = (day: string) => {
    if (formDays.includes(day)) {
      if (formDays.length > 1) {
        setFormDays(formDays.filter(d => d !== day));
      }
    } else {
      setFormDays([...formDays, day]);
      if (!formDayTimes[day]) {
        setFormDayTimes(prev => ({ ...prev, [day]: formTime || '19:00' }));
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'groups' && !formName.trim()) {
      toast({
        title: "Ошибка ввода",
        description: "Пожалуйста, заполните название запрашиваемой записи.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'directions') {
      if (editingId !== null) {
        setDirections(directions.map(d => d.id === editingId ? {
          ...d,
          name: formName.trim(),
          category: formCategory,
          coaches: [formCoach],
          level: formLevel,
          description: formDescription.trim() || `Регулярная программа направления ${formCategory}.`
        } : d));
        toast({
          title: "Направление обновлено!",
          description: `Изменения в направлении «${formName.trim()}» успешно сохранены.`
        });
      } else {
        const newDir: DirectionItem = {
          id: Date.now(),
          name: formName.trim(),
          category: formCategory,
          colorTag: '#00E96E',
          coaches: [formCoach],
          level: formLevel,
          description: formDescription.trim() || `Регулярная программа направления ${formCategory}.`
        };
        setDirections([newDir, ...directions]);
        toast({
          title: "Направление создано!",
          description: `Направление «${newDir.name}» успешно добавлено в базу студии.`
        });
      }
    } else if (activeTab === 'groups') {
      const formattedSchedule = isCustomTimes
        ? formDays.map(d => `${d} — ${formDayTimes[d] || formTime || '19:00'}`).join(' / ')
        : `${formDays.join(' / ')} — ${formTime || '19:00'}`;

      const generatedGroupName = `${formDirection} ${formLevel}`;

      if (editingId !== null) {
        setGroups(groups.map(g => g.id === editingId ? {
          ...g,
          name: generatedGroupName,
          direction: formDirection,
          level: formLevel,
          age: formAge,
          schedule: formattedSchedule,
          days: formDays,
          time: formTime,
          isCustomTimes,
          dayTimes: formDayTimes,
          coach: formCoach,
          capacity: Number(formCapacity) || 15,
          hall: formHall
        } : g));
        toast({
          title: "Группа обновлена!",
          description: `Данные группы «${generatedGroupName}» успешно обновлены.`
        });
      } else {
        const newGroup: GroupItem = {
          id: Date.now(),
          name: generatedGroupName,
          direction: formDirection,
          level: formLevel,
          age: formAge,
          schedule: formattedSchedule,
          days: formDays,
          time: formTime,
          isCustomTimes,
          dayTimes: formDayTimes,
          coach: formCoach,
          capacity: Number(formCapacity) || 15,
          enrolled: 0,
          hall: formHall
        };
        setGroups([newGroup, ...groups]);
        toast({
          title: "Группа создана!",
          description: `Группа «${newGroup.name}» внесена в систему.`
        });
      }
    } else if (activeTab === 'ages') {
      if (editingId !== null) {
        setAges(ages.map(a => a.id === editingId ? {
          ...a,
          name: formName.trim(),
          range: formRange.trim() || 'Все возрасты',
          description: formDescription.trim() || 'Возрастная группа студии.'
        } : a));
        toast({
          title: "Категория обновлена!",
          description: `Категория «${formName.trim()}» успешно обновлена.`
        });
      } else {
        const newAge: AgeCategoryItem = {
          id: Date.now(),
          name: formName.trim(),
          range: formRange.trim() || 'Все возрасты',
          description: formDescription.trim() || 'Возрастная группа студии.',
          count: 0
        };
        setAges([newAge, ...ages]);
        toast({
          title: "Категория сохранена!",
          description: `Категория «${newAge.name}» (${newAge.range}) успешно сохранена.`
        });
      }
    } else if (activeTab === 'levels') {
      if (editingId !== null) {
        setLevels(levels.map(l => l.id === editingId ? {
          ...l,
          name: formName.trim(),
          tag: formLevel.trim() || 'Все уровни',
          description: formDescription.trim() || 'Уровень подготовки группы.'
        } : l));
        toast({
          title: "Уровень обновлен!",
          description: `Уровень «${formName.trim()}» успешно сохранен.`
        });
      } else {
        const newLevel: LevelItem = {
          id: Date.now(),
          name: formName.trim(),
          tag: formLevel.trim() || 'Все уровни',
          description: formDescription.trim() || 'Уровень подготовки группы.',
          count: 0
        };
        setLevels([newLevel, ...levels]);
        toast({
          title: "Уровень добавлен!",
          description: `Уровень «${newLevel.name}» успешно внесен в справочник.`
        });
      }
    }

    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setIsDrawerOpen(false);
  };

  const filteredGroups = groups.filter((g) => {
    if (selectedHall !== 'Все залы' && g.hall !== selectedHall) return false;
    if (selectedDirection !== 'Все направления' && g.direction !== selectedDirection) return false;
    if (selectedAge !== 'Все возраста' && g.age && !g.age.includes(selectedAge.split(' ')[0])) return false;
    if (selectedCoach !== 'Все педагоги' && g.coach !== selectedCoach) return false;
    return true;
  });

  const isFilterActive = selectedBranch !== 'Все филиалы' || selectedHall !== 'Все залы' || selectedDirection !== 'Все направления' || selectedAge !== 'Все возраста' || selectedCoach !== 'Все педагоги';

  const filterPopupStyle: React.CSSProperties = {
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 18, 20, 0.88)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
    borderRadius: '36px'
  };

  if (loading) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#00E96E]" />
      </div>
    );
  }

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
              {mainView === 'groups' ? (
                /* СЛАЙД 1: ГРУППЫ (#362486 фон, #00E96E текст) */
                <motion.div
                  key="groups-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) {
                      setIsFilterOpen(false);
                      setMainView('settings');
                      setActiveTab('directions');
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: '#362486', color: '#00E96E' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#00E96E] leading-tight">
                      Группы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#00E96E] font-mono tracking-tight leading-none">
                      {filteredGroups.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#00E96E]/80 uppercase tracking-wide leading-tight">
                      активных<br/>групп
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
                        className="w-11 h-11 rounded-full bg-[#00E96E]/20 hover:bg-[#00E96E]/30 text-[#00E96E] flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#362486] rounded-full bg-[#00E96E] shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          style={filterPopupStyle}
                          className="absolute top-[calc(100%+10px)] left-0 z-[200] border-none p-5 flex flex-col gap-3.5 w-72 origin-top-left pointer-events-auto select-none text-slate-900 dark:text-white"
                        >
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Филиал</label>
                            <select
                              value={selectedBranch}
                              onChange={(e) => setSelectedBranch(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все филиалы">Все филиалы</option>
                              {branchesList.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Зал</label>
                            <select
                              value={selectedHall}
                              onChange={(e) => setSelectedHall(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все залы">Все залы</option>
                              {HALLS_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Направление</label>
                            <select
                              value={selectedDirection}
                              onChange={(e) => setSelectedDirection(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все направления">Все направления</option>
                              {directions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Возраст</label>
                            <select
                              value={selectedAge}
                              onChange={(e) => setSelectedAge(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все возраста">Все возраста</option>
                              {ages.map(a => <option key={a.id} value={a.name}>{a.name} ({a.range})</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 block">Педагог</label>
                            <select
                              value={selectedCoach}
                              onChange={(e) => setSelectedCoach(e.target.value)}
                              className="w-full bg-black/5 dark:bg-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white border-none outline-none cursor-pointer"
                            >
                              <option value="Все педагоги">Все педагоги</option>
                              {COACHES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <button 
                              type="button" 
                              onClick={() => setIsFilterOpen(false)} 
                              style={{ backgroundColor: '#00E96E', color: '#362486' }}
                              className="flex-1 text-xs font-black py-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer border-none outline-none shadow-sm"
                            >
                              Применить
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { 
                                setSelectedBranch('Все филиалы'); 
                                setSelectedHall('Все залы'); 
                                setSelectedDirection('Все направления'); 
                                setSelectedAge('Все возраста'); 
                                setSelectedCoach('Все педагоги'); 
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
                /* СЛАЙД 2: НАСТРОЙКИ (#00E96E фон, #362486 текст) */
                <motion.div
                  key="settings-slide"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 40) {
                      setIsFilterOpen(false);
                      setMainView('groups');
                      setActiveTab('groups');
                    }
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  style={{ backgroundColor: '#00E96E', color: '#362486' }}
                  className="absolute inset-0 p-5 rounded-[42px] shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-[#362486] leading-tight">
                      Настройки
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#362486]/10 rounded-2xl p-3 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#362486] font-mono leading-none">
                        {directions.length}
                      </span>
                      <span className="text-[9px] font-bold text-[#362486]/80 uppercase tracking-wider mt-1 leading-tight">
                        Направлений
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#362486] font-mono leading-none">
                        {ages.length}
                      </span>
                      <span className="text-[9px] font-bold text-[#362486]/80 uppercase tracking-wider mt-1 leading-tight">
                        Возрастов
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#362486] font-mono leading-none">
                        {levels.length}
                      </span>
                      <span className="text-[9px] font-bold text-[#362486]/80 uppercase tracking-wider mt-1 leading-tight">
                        Уровней
                      </span>
                    </div>
                  </div>

                  <div className="h-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Правая вертикальная пилюля */}
          <div className="w-[64px] h-[184px] bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-[32px] flex flex-col justify-between items-center py-2.5 shadow-md shrink-0 select-none">
            <button 
              onClick={() => { setMainView('groups'); setActiveTab('groups'); }}
              style={mainView === 'groups' ? { backgroundColor: '#00E96E', color: '#362486' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainView === 'groups' 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Группы"
            >
              <Calendar size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setMainView('settings'); setActiveTab('directions'); }}
              style={mainView === 'settings' ? { backgroundColor: '#362486', color: '#00E96E' } : {}}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainView === 'settings' 
                  ? 'shadow-md scale-100' 
                  : 'bg-transparent text-slate-950 dark:text-white opacity-45 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95'
              }`}
              title="Настройки"
            >
              <Settings size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВНУТРЕННИЕ ТАБЫ НАСТРОЕК ─── */}
        {mainView === 'settings' && (
          <div className="bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-full h-12 p-1 flex items-center justify-between w-full shadow-md shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { id: 'directions', label: 'НАПРАВЛЕНИЯ' },
              { id: 'ages', label: 'ВОЗРАСТ' },
              { id: 'levels', label: 'УРОВНИ' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={isActive ? { backgroundColor: '#00E96E', color: '#362486' } : {}}
                  className={`font-bold text-xs uppercase tracking-wider rounded-full px-3 transition-all border-none outline-none cursor-pointer flex-1 text-center h-full flex items-center justify-center ${
                    isActive
                      ? 'shadow-sm'
                      : 'bg-transparent text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── СПИСКИ КАРТОЧЕК С GAP-2.5 ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'directions' && (
            <motion.div
              key="directions-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              {directions.map((dir) => (
                <div
                  key={dir.id}
                  onClick={() => handleEditDirection(dir)}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-md transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: dir.colorTag }} 
                        />
                        <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-[#00E96E] transition-colors">{dir.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{dir.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-slate-600 dark:text-zinc-300 rounded-full">
                        {dir.category}
                      </span>
                      {currentRole !== 'trainer' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditDirection(dir); }}
                          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-none outline-none"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {currentRole === 'owner' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Удалить направление «${dir.name}»?`)) {
                              setDirections(prev => prev.filter(d => d.id !== dir.id));
                              toast({ title: "Удалено", description: `Направление «${dir.name}» удалено.` });
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors cursor-pointer ml-1 border-none outline-none"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-black/5 dark:bg-white/5 w-full" />

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                      <Users size={14} className="text-slate-400 dark:text-zinc-500" />
                      <span>Преподаватели:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{dir.coaches.join(', ')}</span>
                    </div>

                    <span 
                      style={{ backgroundColor: 'rgba(0, 233, 110, 0.15)', color: '#00E96E' }}
                      className="text-xs font-bold uppercase px-2.5 py-1 rounded-full tracking-wide"
                    >
                      {dir.level}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupForDrawer(group)}
                    className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-md transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {(() => {
                            const dirObj = directions.find(d => d.name === group.direction);
                            const bgCol = dirObj?.colorTag || '#00E96E';
                            const isLime = bgCol.toLowerCase() === '#ccff00' || bgCol.toLowerCase() === '#00e96e';
                            return (
                              <span
                                style={{ backgroundColor: bgCol, color: isLime ? '#000000' : '#ffffff' }}
                                className="font-bold text-xs px-3.5 py-1 uppercase tracking-wide shadow-xs rounded-full"
                              >
                                {group.direction}
                              </span>
                            );
                          })()}

                          <span className="bg-black/5 dark:bg-white/10 text-slate-800 dark:text-zinc-200 font-bold text-xs px-2.5 py-1 uppercase tracking-wide rounded-full">
                            {group.level || 'Beginners Pro'}
                          </span>

                          <span className="bg-black/5 dark:bg-white/5 text-slate-500 dark:text-zinc-400 font-bold text-xs px-2.5 py-1 uppercase rounded-full">
                            {group.age || '16+ Лет'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-[#00E96E]" />
                          <span>{group.schedule}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {currentRole !== 'trainer' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }}
                            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-none outline-none"
                            title="Редактировать"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {currentRole === 'owner' && (
                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDeleteGroup(group.id, group.name);
                            }}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors cursor-pointer ml-1 border-none outline-none"
                            title="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-black/5 dark:bg-white/5 w-full" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                        <Users size={14} className="text-slate-400 dark:text-zinc-500" />
                        <span className="truncate">Тренер: <strong className="text-slate-900 dark:text-white">{group.coach}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 justify-end">
                        <Building2 size={14} className="text-slate-400 dark:text-zinc-500" />
                        <span className="truncate">{group.hall}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl mt-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Вместимость зала:</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        <span className="text-[#00E96E]">{group.enrolled}</span> / {group.capacity} мест
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Группы по выбранным фильтрам не найдены
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ages' && (
            <motion.div
              key="ages-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              {ages.map((age) => (
                <div
                  key={age.id}
                  onClick={() => handleEditAge(age)}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-md transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Baby size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-amber-500 transition-colors">{age.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{age.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold px-3 py-1 uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                        {age.range}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEditAge(age); }}
                        className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-none outline-none"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Удалить категорию «${age.name}»?`)) {
                            setAges(prev => prev.filter(a => a.id !== age.id));
                            toast({ title: "Удалено", description: `Категория «${age.name}» удалена.` });
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors cursor-pointer ml-1 border-none outline-none"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-black/5 dark:bg-white/5 w-full" />

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span>Связанных групп в расписании:</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                      {age.count} групп
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'levels' && (
            <motion.div
              key="levels-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2.5"
            >
              {levels.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => handleEditLevel(lvl)}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-md transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                        <GraduationCap size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-cyan-500 transition-colors">{lvl.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{lvl.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold px-3 py-1 uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full">
                        {lvl.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEditLevel(lvl); }}
                        className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer border-none outline-none"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Удалить уровень «${lvl.name}»?`)) {
                            setLevels(prev => prev.filter(l => l.id !== lvl.id));
                            toast({ title: "Удалено", description: `Уровень «${lvl.name}» удален.` });
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors cursor-pointer ml-1 border-none outline-none"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-black/5 dark:bg-white/5 w-full" />

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span>Связанных дисциплин и групп:</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                      {lvl.count} групп
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {currentRole !== 'trainer' && (
        <FloatingActionButton
          onClick={handleOpenAddModal}
          ariaLabel="Добавить"
          id="floating-add-group-btn"
          style={{ backgroundColor: '#362486', color: '#00E96E' }}
          className="!bg-[#362486] !text-[#00E96E] shadow-lg shadow-[#362486]/30 hover:opacity-95"
        />
      )}

      {/* ─── ШТОРКА 1: ДЕТАЛИ ГРУППЫ (BOTTOM SHEET DRAWER) ─── */}
      <AnimatePresence>
        {selectedGroupForDrawer && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGroupForDrawer(null)}
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
                onClick={() => setSelectedGroupForDrawer(null)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors z-10 border-none cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-start justify-between pb-3 border-b border-zinc-800/60 pr-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00E96E]/20 text-[#00E96E]">
                      {selectedGroupForDrawer.direction}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {selectedGroupForDrawer.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{selectedGroupForDrawer.name}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none pt-4 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Расписание</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Clock size={13} className="text-[#00E96E]" /> {selectedGroupForDrawer.schedule}
                    </span>
                  </div>

                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Зал</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Building2 size={13} className="text-[#00E96E]" /> {selectedGroupForDrawer.hall}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Преподаватель</span>
                    <span className="text-xs font-bold text-white">{selectedGroupForDrawer.coach}</span>
                  </div>

                  <div className="bg-[#1C1C1E] border border-zinc-800 p-4 rounded-[22px]">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Заполненность</span>
                    <span className="text-xs font-mono font-bold text-white">
                      <span className="text-[#00E96E] font-black">{selectedGroupForDrawer.enrolled}</span> из {selectedGroupForDrawer.capacity} мест
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => handleEditGroup(selectedGroupForDrawer)}
                    style={{ backgroundColor: '#00E96E', color: '#362486' }}
                    className="flex-1 h-14 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all border-none cursor-pointer"
                  >
                    <Pencil size={15} className="mr-1.5" />
                    Редактировать
                  </Button>

                  {currentRole === 'owner' && (
                    <Button
                      onClick={() => handleDeleteGroup(selectedGroupForDrawer.id, selectedGroupForDrawer.name)}
                      className="h-14 px-5 rounded-full bg-red-500/15 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs uppercase transition-all border-none cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ШТОРКА 2: СОЗДАНИЕ / РЕДАКТИРОВАНИЕ (BOTTOM SHEET DRAWER) ─── */}
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
                    {editingId !== null 
                      ? (activeTab === 'directions' 
                          ? 'Редактировать Направление' 
                          : activeTab === 'groups'
                            ? 'Редактировать Группу'
                            : activeTab === 'ages'
                              ? 'Редактировать Категорию'
                              : 'Редактировать Уровень')
                      : (activeTab === 'directions' 
                          ? 'Новое Направление' 
                          : activeTab === 'groups'
                            ? 'Новая Группа'
                            : activeTab === 'ages'
                              ? 'Новый Возрастной Диапазон'
                              : 'Новый Уровень Подготовки')}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                    {editingId !== null ? 'Отредактируйте параметры' : 'Заполните параметры записи'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-zinc-800 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 flex-1 overflow-y-auto scrollbar-none pr-1">
                {activeTab !== 'groups' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Название {
                        activeTab === 'directions' ? 'направления' : activeTab === 'ages' ? 'категории' : 'уровня'
                      }
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={
                        activeTab === 'directions' 
                          ? "Например: High Heels Pro" 
                          : activeTab === 'ages'
                            ? "Например: Дети (4-7 лет)"
                            : "Например: Pro / Продвинутые"
                      }
                      className="w-full h-12 rounded-2xl px-4 font-bold text-sm bg-black/40 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E96E] transition-colors"
                    />
                  </div>
                )}

                {activeTab === 'directions' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                        Выбор категории / Дисциплины
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                      >
                        {CATEGORIES_LIST.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                        Назначенный тренер
                      </label>
                      <select
                        value={formCoach}
                        onChange={(e) => setFormCoach(e.target.value)}
                        className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                      >
                        {COACHES_LIST.map((coach) => (
                          <option key={coach} value={coach} className="bg-zinc-900 text-white">{coach}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'groups' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                        Направление
                      </label>
                      <select
                        value={formDirection}
                        onChange={(e) => setFormDirection(e.target.value)}
                        className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                      >
                        {directions.map((dir) => (
                          <option key={dir.id} value={dir.name} className="bg-zinc-900 text-white">{dir.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          Уровень
                        </label>
                        <select
                          value={formLevel}
                          onChange={(e) => setFormLevel(e.target.value)}
                          className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                        >
                          {levels.map((lvl) => (
                            <option key={lvl.id} value={lvl.tag || lvl.name} className="bg-zinc-900 text-white">
                              {lvl.name} ({lvl.tag})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          Возраст
                        </label>
                        <select
                          value={formAge}
                          onChange={(e) => setFormAge(e.target.value)}
                          className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                        >
                          {ages.map((a) => (
                            <option key={a.id} value={a.range || a.name} className="bg-zinc-900 text-white">
                              {a.name} ({a.range})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                        Назначенный тренер
                      </label>
                      <select
                        value={formCoach}
                        onChange={(e) => setFormCoach(e.target.value)}
                        className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                      >
                        {COACHES_LIST.map((coach) => (
                          <option key={coach} value={coach} className="bg-zinc-900 text-white">{coach}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 p-4 rounded-[24px] bg-black/40 border border-zinc-800">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          Расписание
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 font-bold select-none">
                          <input
                            type="checkbox"
                            checked={isCustomTimes}
                            onChange={(e) => setIsCustomTimes(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00E96E] relative" />
                          <span className="text-[10px] uppercase">Разное время</span>
                        </label>
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {ALL_DAYS.map((day) => {
                          const selected = formDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDaySelect(day)}
                              style={selected ? { backgroundColor: '#00E96E', color: '#362486' } : {}}
                              className={`flex-1 min-w-[36px] h-10 rounded-full font-black text-xs transition-all border-none outline-none cursor-pointer flex items-center justify-center ${
                                selected ? 'shadow-md scale-105' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {!isCustomTimes ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            placeholder="Время (например: 19:00)"
                            className="w-full h-11 rounded-2xl px-4 font-bold text-xs bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E96E] transition-colors font-mono"
                          />
                          <Clock size={16} className="absolute right-4 top-3 text-zinc-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {formDays.map((day) => (
                            <div key={day} className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-900 border border-zinc-800">
                              <span className="w-10 h-8 rounded-full bg-zinc-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {day}
                              </span>
                              <input
                                type="text"
                                value={formDayTimes[day] || formTime || '19:00'}
                                onChange={(e) => setFormDayTimes({ ...formDayTimes, [day]: e.target.value })}
                                placeholder="19:00"
                                className="flex-1 h-8 rounded-xl px-3 font-mono font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E]"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          Зал
                        </label>
                        <select
                          value={formHall}
                          onChange={(e) => setFormHall(e.target.value)}
                          className="w-full h-12 rounded-2xl px-4 font-bold text-xs bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E] transition-colors cursor-pointer"
                        >
                          {HALLS_LIST.map((h) => (
                            <option key={h} value={h} className="bg-zinc-900 text-white">{h}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          Мест в группе
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={formCapacity}
                          onChange={(e) => setFormCapacity(Number(e.target.value))}
                          className="w-full h-12 rounded-2xl px-4 font-black font-mono text-sm bg-black/40 border border-zinc-800 text-white focus:outline-none focus:border-[#00E96E]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'ages' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Возрастной диапазон
                    </label>
                    <input
                      type="text"
                      value={formRange}
                      onChange={(e) => setFormRange(e.target.value)}
                      placeholder="Например: 12-16 лет"
                      className="w-full h-12 rounded-2xl px-4 font-bold text-sm bg-black/40 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E96E]"
                    />
                  </div>
                )}

                {activeTab === 'levels' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Метка / Обозначение
                    </label>
                    <input
                      type="text"
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      placeholder="Например: Продвинутые / PRO"
                      className="w-full h-12 rounded-2xl px-4 font-bold text-sm bg-black/40 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E96E]"
                    />
                  </div>
                )}

                {activeTab !== 'groups' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Описание / Примечание
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Короткое описание..."
                      className="w-full rounded-2xl p-4 font-medium text-xs bg-black/40 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E96E] resize-none"
                    />
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#00E96E', color: '#362486' }}
                    className="w-full h-14 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border-none outline-none"
                  >
                    <Check size={18} strokeWidth={3} />
                    {editingId !== null
                      ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ'
                      : (activeTab === 'directions' 
                          ? 'СОХРАНИТЬ НАПРАВЛЕНИЕ'
                          : activeTab === 'groups'
                            ? 'ДОБАВИТЬ В РАСПИСАНИЕ'
                            : activeTab === 'ages'
                              ? 'СОХРАНИТЬ КАТЕГОРИЮ'
                              : 'СОХРАНИТЬ УРОВЕНЬ')}
                  </button>
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

export const AdminDirectionsManager = DirectionsAndGroupsManager;
export const GroupsManager = DirectionsAndGroupsManager;
export default DirectionsAndGroupsManager;