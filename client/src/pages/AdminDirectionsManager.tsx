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
  Baby
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
  const [location, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const { currentRole } = useRole();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Active Tab: 'groups' | 'directions' | 'ages' | 'levels'
  const [activeTab, setActiveTab] = useState<'directions' | 'groups' | 'ages' | 'levels'>('groups');

  // Edit item ID state & delete confirm state & detail viewer state
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
    setActiveTab('ages');
    setEditingId(age.id);
    setFormName(age.name);
    setFormRange(age.range);
    setFormDescription(age.description);
    setIsModalOpen(true);
  };

  const handleEditLevel = (lvl: LevelItem) => {
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

    // Reset and close
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className={`h-[100dvh] flex items-center justify-center transition-colors duration-300 ${
        theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col p-6 pb-28 font-sans relative bg-transparent ${
      theme === 'light' ? 'text-slate-900' : 'text-white'
    }`}>
      {/* Header */}
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-900 uppercase">
            ГРУППЫ
          </h1>
        </div>
      </header>

      {/* Stats Summary Cards (Пилюли быстрых действий c эталонным стилем с главной) */}
      <div className="grid grid-cols-2 gap-3 mb-2 shrink-0">
        {/* Directions summary pill (эталонный стиль) */}
        <button
          type="button"
          onClick={() => setActiveTab('directions')}
          className="w-full bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 pr-5 flex items-center gap-3.5 transition-all cursor-pointer group text-left outline-none select-none border-none"
        >
          <span className="w-12 h-12 rounded-full flex items-center justify-center text-black group-hover:scale-105 transition-transform shrink-0 bg-[#CCFF00]">
            <Layers size={22} strokeWidth={2.2} />
          </span>
          <div>
            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider block">
              Направления
            </span>
            <span className="text-sm font-medium text-black dark:text-white">{directions.length} дисциплин</span>
          </div>
        </button>

        {/* Groups summary pill (эталонный стиль) */}
        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className="w-full bg-[#DDE2E5] dark:bg-[#161618] hover:bg-[#d0d6da] dark:hover:bg-[#1F1F22] rounded-full p-2 pr-5 flex items-center gap-3.5 transition-all cursor-pointer group text-left outline-none select-none border-none"
        >
          <span className="w-12 h-12 rounded-full flex items-center justify-center text-black group-hover:scale-105 transition-transform shrink-0 bg-[#CCFF00]">
            <Calendar size={22} strokeWidth={2.2} />
          </span>
          <div>
            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider block">
              Группы
            </span>
            <span className="text-sm font-medium text-black dark:text-white">{groups.length} активных</span>
          </div>
        </button>
      </div>

      {/* Верхний переключатель-капсула (Urban Glass v2.4 4 Segments) */}
      <div className="ui-tab-container bg-[#CDD2D7] dark:bg-[#18181b]/80 backdrop-blur-md border border-black/10 dark:border-white/10 !rounded-full p-1.5 flex items-center justify-between w-full my-4 shadow-md shrink-0">
        {[
          { id: 'groups', label: 'ГРУППЫ' },
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
              style={isActive ? { backgroundColor: accentColor, color: activeTextColor === 'text-black' || activeTextColor === '#000000' ? '#000000' : '#000000' } : {}}
              className={
                isActive
? "ui-tab-item bg-[#CCFF00] text-black font-bold text-xs sm:text-xs uppercase tracking-wider rounded-full px-3 py-2.5 transition-all shadow-md border-none outline-none cursor-pointer flex-1 text-center"
: "ui-tab-item text-slate-800 dark:text-zinc-300 hover:text-black dark:hover:text-white font-bold text-xs sm:text-xs uppercase tracking-wider px-2 py-2.5 transition-colors cursor-pointer border-none outline-none bg-transparent flex-1 text-center"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Floating Action Button (+) */}
      {currentRole !== 'trainer' && (
        <FloatingActionButton
          onClick={handleOpenAddModal}
          ariaLabel="Добавить"
        />
      )}

      {/* List Content */}
      <div className="flex-1 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'directions' && (
            <motion.div
              key="directions-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {directions.map((dir) => (
                <div
                  key={dir.id}
                  onClick={() => setSelectedDetail({ type: 'direction', item: dir })}
                  style={{ borderRadius: '42px' }}
                  className="w-full text-left !bg-[#18181b] border !border-zinc-800 p-4 flex flex-col gap-3 relative shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.01] !rounded-[42px] overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: dir.colorTag }} 
                        />
                        <h3 className="text-base font-medium text-white">{dir.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">{dir.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="ui-tag text-xs px-2.5 py-1 font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 !rounded-full">
                        {dir.category}
                      </span>
                      {currentRole !== 'trainer' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditDirection(dir); }}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {currentRole === 'owner' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'direction', id: dir.id, name: dir.name }); }}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1.5 border-none outline-none"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800/80 w-full" />

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users size={14} className="text-zinc-500" />
                      <span>Преподаватели:</span>
                      <span className="font-medium text-white">{dir.coaches.join(', ')}</span>
                    </div>

                    <span className="ui-tag text-xs font-bold uppercase text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 border border-[#CCFF00]/20 !rounded-full tracking-wide">
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
              className="space-y-3"
            >
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedDetail({ type: 'group', item: group })}
                  style={{ borderRadius: '42px' }}
                  className="w-full text-left !bg-[#18181b] border !border-zinc-800 p-4 flex flex-col gap-3 relative shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.01] !rounded-[42px] overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1.5">
                      {/* Иерархические пилюли (Направление, Уровень, Возраст) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Пилюля Направления (Primary Tag) */}
                        {(() => {
                          const dirObj = directions.find(d => d.name === group.direction);
                          const bgCol = dirObj?.colorTag || accentColor || '#CCFF00';
                          const isLime = bgCol.toLowerCase() === '#ccff00';
                          return (
                            <span
                              style={{ backgroundColor: bgCol, color: isLime ? '#000000' : '#ffffff' }}
                              className="ui-tag font-bold text-xs px-3.5 py-1 uppercase tracking-wide shadow-sm !rounded-full"
                            >
                              {group.direction}
                            </span>
                          );
                        })()}

                        {/* 2. Пилюля Уровня (Secondary Tag) */}
                        <span className="ui-tag bg-white/10 text-zinc-200 border border-white/10 font-bold text-xs px-2.5 py-1 uppercase tracking-wide !rounded-full">
                          {group.level || 'Beginners Pro'}
                        </span>

                        {/* 3. Пилюля Возраста (Tertiary Tag) */}
                        <span className="ui-tag bg-white/5 text-zinc-400 font-bold text-xs px-2.5 py-1 border border-white/5 uppercase !rounded-full">
                          {group.age || '16+ Лет'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                        <Calendar size={13} style={{ color: accentColor }} />
                        <span>{group.schedule}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {currentRole !== 'trainer' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#CDD2D7] dark:text-zinc-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {currentRole === 'owner' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'group', id: group.id, name: group.name }); }}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1.5 border-none outline-none"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800/80 w-full" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users size={14} className="text-zinc-500" />
                      <span className="truncate">Тренер: <strong className="text-white">{group.coach}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 justify-end">
                      <Building2 size={14} className="text-zinc-500" />
                      <span className="truncate">{group.hall}</span>
                    </div>
                  </div>

                  <div className="ui-strip flex items-center justify-between bg-zinc-950/60 p-2.5 border border-zinc-800/60 mt-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Вместимость зала:</span>
                    <span className="text-xs font-medium text-white">
                      <span style={{ color: accentColor }}>{group.enrolled}</span> / {group.capacity} мест
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'ages' && (
            <motion.div
              key="ages-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {ages.map((age) => (
                <div
                  key={age.id}
                  onClick={() => setSelectedDetail({ type: 'age', item: age })}
                  style={{ borderRadius: '42px' }}
                  className="w-full text-left !bg-[#18181b] border !border-zinc-800 p-4 flex flex-col gap-3 relative shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.01] !rounded-[42px] overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Baby size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">{age.name}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{age.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span style={{ borderRadius: '10px' }} className="text-xs font-bold px-2.5 py-1 uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {age.range}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEditAge(age); }}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'age', id: age.id, name: age.name }); }}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1.5 border-none outline-none"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800/80 w-full" />

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Связанных групп в расписании:</span>
                    <span style={{ borderRadius: '10px' }} className="font-medium text-white bg-zinc-800 px-2.5 py-0.5 border border-zinc-700">
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
              className="space-y-3"
            >
              {levels.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setSelectedDetail({ type: 'level', item: lvl })}
                  style={{ borderRadius: '42px' }}
                  className="w-full text-left !bg-[#18181b] border !border-zinc-800 p-4 flex flex-col gap-3 relative shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.01] !rounded-[42px] overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">{lvl.name}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{lvl.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span style={{ borderRadius: '10px' }} className="text-xs font-bold px-2.5 py-1 uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {lvl.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEditLevel(lvl); }}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'level', id: lvl.id, name: lvl.name }); }}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1.5 border-none outline-none"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800/80 w-full" />

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Связанных дисциплин и групп:</span>
                    <span style={{ borderRadius: '10px' }} className="font-medium text-white bg-zinc-800 px-2.5 py-0.5 border border-zinc-700">
                      {lvl.count} групп
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Urban Glass Center Modal Dialog Template */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Glass Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-10 w-full max-w-md p-6 rounded-[28px] border shadow-2xl backdrop-blur-xl bg-zinc-900/95 border-zinc-800 text-white max-h-[90dvh] overflow-y-auto scrollbar-none"
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
                {/* 1. Название (только для направлений, категорий и уровней) */}
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

                {/* Specific Fields for Directions */}
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

                {/* Specific Order for Groups */}
                {activeTab === 'groups' && (
                  <>
                    {/* 1. НАПРАВЛЕНИЕ */}
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

                    {/* 2. УРОВЕНЬ */}
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

                    {/* 3. ВОЗРАСТНАЯ КАТЕГОРИЯ */}
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

                    {/* 4. НАЗНАЧЕННЫЙ ТРЕНЕР */}
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

                    {/* 5. РАСПИСАНИЕ И ВРЕМЯ (ГИБКИЙ КОНСТРУКТОР) */}
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
                              className={`flex-1 min-w-[36px] h-10 rounded-full font-bold text-xs transition-all border-none outline-none cursor-pointer flex items-center justify-center${
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

                    {/* 6. ЗАЛ */}
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

                    {/* 7. МАКСИМАЛЬНОЕ КОЛИЧЕСТВО МЕСТ */}
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

                {/* Specific Fields for Ages */}
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

                {/* Specific Fields for Levels */}
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

                {/* Description input for non-group items */}
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

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    style={{ backgroundColor: accentColor, color: activeTextColor }}
                    className="w-full h-14 font-bold text-sm uppercase rounded-full flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none outline-none"
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

      {/* Delete Confirmation Modal */}
      {/* ... unchanged ... */}
      {/* Detail View Modal */}
      {/* ... unchanged ... */}

      <BottomNav />
    </div>
  );
}

export const AdminDirectionsManager = DirectionsAndGroupsManager;
export const GroupsManager = DirectionsAndGroupsManager;
export default DirectionsAndGroupsManager;