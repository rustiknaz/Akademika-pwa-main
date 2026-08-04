import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, LogOut, Upload, RefreshCw, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';

export default function AddClass() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    teacher_name: '',
    start_time: '',
    duration_min: 60,
    max_students: 15,
    image_url: ''
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

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
      setIsAdmin(true);
    }
    checkAdmin();
  }, [setLocation]);

  const handleStartTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, start_time: value }));
    if (value) {
      const d = new Date(value);
      const day = d.getDay(); // 0 is Sunday, 1 is Monday...
      setSelectedDays([day]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Изображение слишком большое. Выберите файл меньше 1.5 МБ.",
      });
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setFormData(prev => ({ ...prev, image_url: base64data }));
      setUploadingImage(false);
      toast({
        title: "Изображение готово!",
        description: "Изображение успешно обработано и добавлено.",
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_time) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Укажите дату и время начала",
      });
      return;
    }

    setLoading(true);

    try {
      const baseDate = new Date(formData.start_time);
      const classesToInsert: any[] = [];

      if (isRecurring && selectedDays.length > 0) {
        // Generate occurrences for 30 days ahead (4 weeks)
        for (let offset = 0; offset < 30; offset++) {
          const currentDate = new Date(baseDate.getTime());
          currentDate.setDate(baseDate.getDate() + offset);
          
          const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday...
          if (selectedDays.includes(dayOfWeek)) {
            classesToInsert.push({
              title: formData.title,
              teacher_name: formData.teacher_name,
              start_time: currentDate.toISOString(),
              duration_min: formData.duration_min,
              max_students: formData.max_students,
              image_url: formData.image_url,
              is_recurring: true
            });
          }
        }
      } else {
        // Single class creation
        classesToInsert.push({
          title: formData.title,
          teacher_name: formData.teacher_name,
          start_time: baseDate.toISOString(),
          duration_min: formData.duration_min,
          max_students: formData.max_students,
          image_url: formData.image_url,
          is_recurring: false
        });
      }

      if (classesToInsert.length === 0) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Выберите хотя бы один день недели для повторения",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('classes')
        .insert(classesToInsert);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: isRecurring 
          ? `Создано ${classesToInsert.length} регулярных занятий на месяц вперед!` 
          : "Занятие создано!",
      });
      setLocation('/Admin');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 pb-28 font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#DDE2E5] text-slate-900' : 'bg-black text-white'
    }`}>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Новое занятие</h1>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            setLocation('/Login');
          }}
          className="p-2.5 text-zinc-400 hover:text-[#CCFF00] transition-colors rounded-full hover:bg-neutral-800"
          title="Выйти"
        >
          <LogOut size={22} />
        </button>
      </header>

      <div className="max-w-md mx-auto bg-[#1C1C1E] rounded-[32px] border border-zinc-800 p-6 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Название</label>
            <Input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Например: High Heels"
              className="rounded-[16px] bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-stone-600 text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Преподаватель</label>
            <Input 
              required
              value={formData.teacher_name}
              onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
              placeholder="Имя преподавателя"
              className="rounded-[16px] bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-stone-600 text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={14} /> Фотография занятия
            </label>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {formData.image_url ? (
              <div className="relative rounded-[20px] overflow-hidden border border-zinc-700/60 bg-[#2C2C2E] h-40 group">
                <img 
                  src={formData.image_url} 
                  alt="Превью" 
                  className="w-full h-full object-cover grayscale contrast-125 transition-all group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="bg-[#CCFF00] text-black font-medium text-xs px-3.5 py-1.5 rounded-[16px] hover:scale-105 active:scale-95 transition-all mr-2"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="bg-red-600 text-white font-bold text-xs p-1.5 rounded-full hover:scale-105 active:scale-95 transition-all"
                    title="Удалить фото"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={uploadingImage}
                className="w-full h-24 border border-dashed border-zinc-700 hover:border-[#CCFF00] rounded-[20px] flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-[#CCFF00] bg-[#2C2C2E] transition-all"
              >
                {uploadingImage ? (
                  <Loader2 size={24} className="animate-spin text-[#CCFF00]" />
                ) : (
                  <>
                    <Upload size={24} />
                    <span className="text-xs font-medium">Загрузить фотографию</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Дата и время начала</label>
            <Input 
              required
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="rounded-[16px] bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
            />
          </div>

          {/* Repeating weekly settings */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between p-3.5 bg-[#2C2C2E] rounded-[20px] border border-zinc-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Повторять каждую неделю</span>
                <span className="text-[11px] text-stone-400">Сгенерировать занятия на месяц вперед</span>
              </div>
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 accent-[#CCFF00] rounded cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="space-y-2.5 p-3.5 bg-[#2C2C2E] rounded-[20px] border border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Дни недели расписания</label>
                <div className="flex flex-wrap gap-1.5 justify-between">
                  {[
                    { label: 'Пн', value: 1 },
                    { label: 'Вт', value: 2 },
                    { label: 'Ср', value: 3 },
                    { label: 'Чт', value: 4 },
                    { label: 'Пт', value: 5 },
                    { label: 'Сб', value: 6 },
                    { label: 'Вс', value: 0 }
                  ].map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                          } else {
                            setSelectedDays([...selectedDays, day.value]);
                          }
                        }}
                        className={`w-9 h-9 rounded-[12px] font-medium text-xs transition-all${
                          isSelected 
                            ? 'bg-[#CCFF00] text-black border-none scale-102 shadow-sm' 
                            : 'bg-[#1C1C1E] text-stone-400 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Длительность (мин)</label>
              <Input 
                required
                type="number"
                value={formData.duration_min}
                onChange={(e) => setFormData({...formData, duration_min: parseInt(e.target.value)})}
                className="rounded-[16px] bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Количество мест</label>
              <Input 
                required
                type="number"
                value={formData.max_students}
                onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                className="rounded-[16px] bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#CCFF00] text-black font-medium hover:bg-[#B5E600] rounded-[16px] h-12 mt-4 shadow-md shadow-[#CCFF00]/10 transition-colors"
          >
            {loading ? "Создание..." : <><Save className="mr-2 h-4 w-4" /> Создать</>}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
