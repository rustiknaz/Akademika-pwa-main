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
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FloatingActionButton from "../components/FloatingActionButton";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';

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
  const { theme, accentColor, accentConfig } = useTheme();
  const { currentRole } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
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

  // Edit & delete confirm states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    type: 'direction' | 'group' | 'age' | 'level';
    item: any;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'direction' | 'group' | 'age' | 'level';
    id: number;
    name: string;
  } | null>(null);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, id, name } = deleteConfirm;
    if (type === 'direction') {
      setDirections(directions.filter(d => d.id !== id));
      toast({
        title: "Направление удалено",
        description: `Направление «${name}» успешно удалено из справочника.`
      });
    } else if (type === 'group') {
      setGroups(groups.filter(g => g.id !== id));
      toast({
        title: "Группа удалена",
        description: `Группа «${name}» успешно удалена из расписания.`
      });
    } else if (type === 'age') {
      setAges(ages.filter(a => a.id !== id));
      toast({
        title: "Возрастная категория удалена",
        description: `Категория «${name}» успешно удалена.`
      });
    } else if (type === 'level') {
      setLevels(levels.filter(l => l.id !== id));
      toast({
        title: "Уровень подготовки удален",
        description: `Уровень «${name}» успешно удален.`
      });
    }
    setDeleteConfirm(null);
  };

  // State data
  const [directions, setDirections] = useState<DirectionItem[]>(DEFAULT_DIRECTIONS);
  const [groups, setGroups] = useState<GroupItem[]>(DEFAULT_GROUPS);
  const [ages, setAges] = useState<AgeCategoryItem[]>(DEFAULT_AGES);
  const [levels, setLevels] = useState<LevelItem[]>(DEFAULT_LEVELS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: GroupItem) => {
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
    setIsModalOpen(true);
  };

  const handleEditAge = (age: AgeCategoryItem) => {
    setMainView('settings');
    setActiveTab('ages');
    setEditingId(age.id);
    setFormName(age.name);
    setFormRange(age.range);
    setFormDescription(age.description);
    setIsModalOpen(true);
  };

  const handleEditLevel = (lvl: LevelItem) => {
    setMainView('settings');
    setActiveTab('levels');
    setEditingId(lvl.id);
    setFormName(lvl.name);
    setFormLevel(lvl.tag);
    setFormDescription(lvl.description);
    setIsModalOpen(true);
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
        .single();

      if (profile?.role !== 'admin') {
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
          colorTag: accentColor,
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
          title: "Группа создана и добавлена в расписание!",
          description: `Группа «${newGroup.name}» (${formattedSchedule}) успешно внесена в календарь.`
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
          title: "Возрастная категория обновлена!",
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
          title: "Возрастная категория добавлена!",
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
          title: "Уровень подготовки обновлен!",
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
          title: "Уровень подготовки добавлен!",
          description: `Уровень «${newLevel.name}» успешно внесен в справочник.`
        });
      }
    }

    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setIsModalOpen(false);
  };

  const filteredGroups = groups.filter((g) => {
    if (selectedHall !== 'Все залы' && g.hall !== selectedHall) return false;
    if (selectedDirection !== 'Все направления' && g.direction !== selectedDirection) return false;
    if (selectedAge !== 'Все возраста' && g.age && !g.age.includes(selectedAge.split(' ')[0])) return false;
    if (selectedCoach !== 'Все педагоги' && g.coach !== selectedCoach) return false;
    return true;
  });

  const isFilterActive = selectedBranch !== 'Все филиалы' || selectedHall !== 'Все залы' || selectedDirection !== 'Все направления' || selectedAge !== 'Все возраста' || selectedCoach !== 'Все педагоги';

  if (loading) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent text-slate-900`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] page-root flex flex-col font-sans relative transition-colors duration-300 bg-transparent ${
      theme === 'light' ? 'text-black' : 'text-white'
    }`}>
      
      {/* ─── ЕДИНЫЙ КОНТЕЙНЕР: PX-3, PT-3 И GAP-2.5 ─── */}
      <div className="flex-1 px-3 pt-3 pb-32 flex flex-col gap-2.5">
        
        {/* ─── ВЕРХНИЙ БЛОК: Матовый слайдер, уходящий наверх + Пилюля ─── */}
        <div className="flex gap-2.5 h-[184px] w-full select-none z-30">
          
          {/* Левый баннер со свайпом (уходит за верхний край экрана) */}
          <div className="flex-1 relative h-[calc(100%+12px)] -mt-3">
            <AnimatePresence initial={false} mode="wait">
              {mainView === 'groups' ? (
                /* СЛАЙД 1: ГРУППЫ */
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Группы
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950 dark:text-white font-mono tracking-tight leading-none">
                      {filteredGroups.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide leading-tight">
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
                        className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-slate-950 dark:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border-none shadow-none relative"
                      >
                        <SlidersHorizontal size={20} className="stroke-[2.5]" />
                        {isFilterActive && <span className="absolute top-0 right-0 w-3 h-3 border-2 border-[#CCFF00] rounded-full bg-slate-900 shrink-0" />}
                      </button>

                      {isFilterOpen && (
                        <div 
                          onPointerDown={(e) => e.stopPropagation()} 
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-[110%] left-0 z-[200] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 rounded-[24px] p-4 flex flex-col gap-3 shadow-2xl w-72 origin-top-left"
                        >
                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Филиал</label>
                            <select
                              value={selectedBranch}
                              onChange={(e) => setSelectedBranch(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none"
                            >
                              <option value="Все филиалы">Все филиалы</option>
                              {branchesList.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Зал</label>
                            <select
                              value={selectedHall}
                              onChange={(e) => setSelectedHall(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none"
                            >
                              <option value="Все залы">Все залы</option>
                              {HALLS_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Направление</label>
                            <select
                              value={selectedDirection}
                              onChange={(e) => setSelectedDirection(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none"
                            >
                              <option value="Все направления">Все направления</option>
                              {directions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Возраст</label>
                            <select
                              value={selectedAge}
                              onChange={(e) => setSelectedAge(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none"
                            >
                              <option value="Все возраста">Все возраста</option>
                              {ages.map(a => <option key={a.id} value={a.name}>{a.name} ({a.range})</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 block">Педагог</label>
                            <select
                              value={selectedCoach}
                              onChange={(e) => setSelectedCoach(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white border-none outline-none"
                            >
                              <option value="Все педагоги">Все педагоги</option>
                              {COACHES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
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
                                setSelectedBranch('Все филиалы'); 
                                setSelectedHall('Все залы'); 
                                setSelectedDirection('Все направления'); 
                                setSelectedAge('Все возраста'); 
                                setSelectedCoach('Все педагоги'); 
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
                /* СЛАЙД 2: НАСТРОЙКИ */
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
                  className="absolute inset-0 p-5 pt-7 rounded-b-[42px] rounded-t-none bg-white/40 dark:bg-black/35 backdrop-blur-md shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing !overflow-visible select-none border-none"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                      Настройки
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 rounded-2xl p-3 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">
                        {directions.length}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mt-1 leading-tight">
                        Направлений
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">
                        {ages.length}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mt-1 leading-tight">
                        Возрастов
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">
                        {levels.length}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mt-1 leading-tight">
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
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainView === 'groups' 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Группы"
            >
              <Calendar size={20} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => { setMainView('settings'); setActiveTab('directions'); }}
              className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer border-none outline-none ${
                mainView === 'settings' 
                  ? 'bg-[#CCFF00] text-black shadow-md scale-100' 
                  : 'bg-transparent text-slate-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
              }`}
              title="Настройки"
            >
              <Settings size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ─── ВНУТРЕННИЕ ТАБЫ НАСТРОЕК ─── */}
        {mainView === 'settings' && (
          <div className="bg-white/40 dark:bg-black/35 backdrop-blur-md border-none rounded-full h-12 p-1 flex items-center justify-between w-full shadow-none shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  className={`font-bold text-xs uppercase tracking-wider rounded-full px-3 transition-all border-none outline-none cursor-pointer flex-1 text-center h-full flex items-center justify-center ${
                    isActive
                      ? 'bg-[#CCFF00] text-black shadow-sm'
                      : 'bg-transparent text-slate-700 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ─── СПИСКИ КАРТОЧЕК С ЕДИНЫМ GAP-2.5 ─── */}
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
                  onClick={() => setSelectedDetail({ type: 'direction', item: dir })}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-none transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: dir.colorTag }} 
                        />
                        <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-lime-600 dark:group-hover:text-[#CCFF00] transition-colors">{dir.name}</h3>
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
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'direction', id: dir.id, name: dir.name }); }}
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

                    <span className="text-xs font-bold uppercase text-slate-900 dark:text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-1 rounded-full tracking-wide">
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
                    onClick={() => setSelectedDetail({ type: 'group', item: group })}
                    className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-none transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {(() => {
                            const dirObj = directions.find(d => d.name === group.direction);
                            const bgCol = dirObj?.colorTag || accentColor || '#CCFF00';
                            const isLime = bgCol.toLowerCase() === '#ccff00';
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
                          <Calendar size={13} style={{ color: accentColor }} />
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
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'group', id: group.id, name: group.name }); }}
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
                        <span style={{ color: accentColor }}>{group.enrolled}</span> / {group.capacity} мест
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
                  onClick={() => setSelectedDetail({ type: 'age', item: age })}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-none transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
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
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'age', id: age.id, name: age.name }); }}
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
                  onClick={() => setSelectedDetail({ type: 'level', item: lvl })}
                  className="w-full text-left bg-white/40 dark:bg-black/35 backdrop-blur-md border-none p-5 flex flex-col gap-3 rounded-[42px] shadow-none transition-all duration-200 cursor-pointer hover:bg-white/60 dark:hover:bg-black/50 overflow-hidden group"
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
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'level', id: lvl.id, name: lvl.name }); }}
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
        />
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-10 w-full max-w-md p-6 rounded-[28px] border shadow-2xl backdrop-blur-xl bg-[#18181b] border-zinc-800 text-white max-h-[90dvh] overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold uppercase">
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
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingId !== null ? 'Отредактируйте параметры записи' : 'Заполните параметры для внесения в систему'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border-none outline-none text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {activeTab !== 'groups' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      1. Название {
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
                      className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 transition-colors"
                    />
                  </div>
                )}

                {activeTab === 'directions' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        2. Выбор категории / Дисциплины
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {CATEGORIES_LIST.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        3. Назначенный тренер
                      </label>
                      <select
                        value={formCoach}
                        onChange={(e) => setFormCoach(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
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
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        1. Направление
                      </label>
                      <select
                        value={formDirection}
                        onChange={(e) => setFormDirection(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {directions.map((dir) => (
                          <option key={dir.id} value={dir.name} className="bg-zinc-900 text-white">{dir.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        2. Уровень подготовки
                      </label>
                      <select
                        value={formLevel}
                        onChange={(e) => setFormLevel(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={lvl.tag || lvl.name} className="bg-zinc-900 text-white">
                            {lvl.name} ({lvl.tag})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        3. Возрастная категория
                      </label>
                      <select
                        value={formAge}
                        onChange={(e) => setFormAge(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {ages.map((a) => (
                          <option key={a.id} value={a.range || a.name} className="bg-zinc-900 text-white">
                            {a.name} ({a.range})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        4. Назначенный тренер
                      </label>
                      <select
                        value={formCoach}
                        onChange={(e) => setFormCoach(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {COACHES_LIST.map((coach) => (
                          <option key={coach} value={coach} className="bg-zinc-900 text-white">{coach}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 p-3.5 rounded-[20px] bg-zinc-800/50 border border-zinc-700/60">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                          5. Расписание
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 font-medium select-none">
                          <input
                            type="checkbox"
                            checked={isCustomTimes}
                            onChange={(e) => setIsCustomTimes(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#CCFF00] relative" />
                          <span className="text-[11px]">Разное время по дням</span>
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
                              style={selected ? { backgroundColor: accentColor, color: activeTextColor } : {}}
                              className={`flex-1 min-w-[36px] h-10 rounded-full font-bold text-xs transition-all border-none outline-none cursor-pointer flex items-center justify-center ${
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
                            placeholder="Время по умолчанию (например: 19:00)"
                            className="w-full h-11 rounded-[14px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 transition-colors"
                          />
                          <Clock size={16} className="absolute right-4 top-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {formDays.map((day) => (
                            <div key={day} className="flex items-center gap-3 p-2 rounded-[14px] bg-zinc-900/90 border border-zinc-700/60">
                              <span className="w-10 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-700">
                                {day}
                              </span>
                              <input
                                type="text"
                                value={formDayTimes[day] || formTime || '19:00'}
                                onChange={(e) => setFormDayTimes({ ...formDayTimes, [day]: e.target.value })}
                                placeholder="Время (например: 19:00)"
                                className="flex-1 h-8 rounded-[10px] px-3 font-medium focus:outline-none focus:ring-1 focus:ring-[#CCFF00] text-xs bg-zinc-800/90 border border-white/10 text-white transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        6. Зал проведения
                      </label>
                      <select
                        value={formHall}
                        onChange={(e) => setFormHall(e.target.value)}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors cursor-pointer"
                      >
                        {HALLS_LIST.map((h) => (
                          <option key={h} value={h} className="bg-zinc-900 text-white">{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        7. Максимальное количество мест в группе
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={formCapacity}
                        onChange={(e) => setFormCapacity(Number(e.target.value))}
                        className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white transition-colors"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'ages' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Возрастной диапазон
                    </label>
                    <input
                      type="text"
                      value={formRange}
                      onChange={(e) => setFormRange(e.target.value)}
                      placeholder="Например: 12-16 лет"
                      className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 transition-colors"
                    />
                  </div>
                )}

                {activeTab === 'levels' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Метка / Краткое обозначение
                    </label>
                    <input
                      type="text"
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      placeholder="Например: Продвинутые / PRO"
                      className="w-full h-12 rounded-[16px] px-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 transition-colors"
                    />
                  </div>
                )}

                {activeTab !== 'groups' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Описание / Примечание
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Короткое описание для базы и мобильного приложения..."
                      className="w-full rounded-[16px] p-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500 transition-colors resize-none"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    style={{ backgroundColor: accentColor, color: activeTextColor }}
                    className="w-full h-14 font-black text-sm uppercase rounded-full flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none outline-none"
                  >
                    <Check size={18} strokeWidth={3} />
                    {editingId !== null
                      ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ'
                      : (activeTab === 'directions' 
                          ? 'СОХРАНИТЬ НАПРАВЛЕНИЕ'
                          : activeTab === 'groups'
                            ? 'СОХРАНИТЬ И ДОБАВИТЬ В РАСПИСАНИЕ'
                            : activeTab === 'ages'
                              ? 'СОХРАНИТЬ ВОЗРАСТНУЮ КАТЕГОРИЮ'
                              : 'СОХРАНИТЬ УРОВЕНЬ ПОДГОТОВКИ')}
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