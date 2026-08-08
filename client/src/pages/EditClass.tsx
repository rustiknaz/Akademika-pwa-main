import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, LogOut, Upload, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function EditClass() {
  const [, setLocation] = useLocation();
  const { theme, accentColor, accentConfig } = useTheme();
  const activeTextColor = accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff';
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setIsAdmin(true);

      if (params.id) {
        const { data: cls, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          toast({ variant: "destructive", title: "Ошибка", description: "Занятие не найдено" });
          setLocation('/Admin');
          return;
        }

        if (cls) {
          setFormData({
            title: cls.title || '',
            teacher_name: cls.teacher_name || '',
            start_time: cls.start_time ? new Date(cls.start_time).toISOString().slice(0, 16) : '',
            duration_min: cls.duration_min || 60,
            max_students: cls.max_students || 15,
            image_url: cls.image_url || ''
          });
          setIsRecurring(!!cls.is_recurring);
        }
      }
      setLoading(false);
    }
    checkAdminAndFetch();
  }, [params.id, setLocation, toast]);

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

    setSaving(true);

    try {
      const { error } = await supabase
        .from('classes')
        .update({
          title: formData.title,
          teacher_name: formData.teacher_name,
          start_time: new Date(formData.start_time).toISOString(),
          duration_min: formData.duration_min,
          max_students: formData.max_students,
          image_url: formData.image_url,
          is_recurring: isRecurring
        })
        .eq('id', params.id);

      if (error) throw error;

      toast({ title: "Успешно!", description: "Изменения сохранены!" });
      setLocation('/Admin');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className={`min-h-screen page-root flex items-center justify-center transition-colors duration-300 bg-transparent ${
        theme === 'light' ? 'text-slate-900' : 'text-white'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-root p-6 pb-28 font-sans transition-colors duration-300 bg-transparent text-slate-900 dark:text-white">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Редактирование занятия</h1>
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

      <div className="max-w-md mx-auto bg-[#1C1C1E] rounded-[24px] border border-zinc-800 p-6 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Название</label>
            <Input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Например: High Heels"
              className="rounded-xl bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-stone-600 text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Преподаватель</label>
            <Input 
              required
              value={formData.teacher_name}
              onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
              placeholder="Имя преподавателя"
              className="rounded-xl bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-stone-600 text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
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
              <div className="relative rounded-xl overflow-hidden border border-zinc-700/60 bg-[#2C2C2E] h-40 group">
                <img 
                  src={formData.image_url} 
                  alt="Превью" 
                  className="w-full h-full object-cover grayscale contrast-125 transition-all group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="bg-[#CCFF00] text-black font-bold text-xs px-3.5 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-all mr-2"
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
                className="w-full h-24 border border-dashed border-zinc-700 hover:border-[#CCFF00] rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-[#CCFF00] bg-[#2C2C2E] transition-all"
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
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              className="rounded-xl bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
            />
          </div>

          {/* Repeating weekly settings */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between p-3.5 bg-[#2C2C2E] rounded-xl border border-zinc-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Повторять каждую неделю</span>
                <span className="text-[11px] text-stone-400">Сделать занятие регулярным</span>
              </div>
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 accent-[#CCFF00] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Длительность (мин)</label>
              <Input 
                required
                type="number"
                value={formData.duration_min}
                onChange={(e) => setFormData({...formData, duration_min: parseInt(e.target.value)})}
                className="rounded-xl bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Количество мест</label>
              <Input 
                required
                type="number"
                value={formData.max_students}
                onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                className="rounded-xl bg-[#2C2C2E] border-zinc-700 text-white text-sm font-medium px-4 focus-visible:ring-1 focus-visible:ring-[#CCFF00]/30 focus-visible:border-[#CCFF00]"
              />
            </div>
          </div>

          <motion.div
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full mt-4"
          >
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#CCFF00] text-black font-bold hover:bg-[#B5E600] rounded-full h-12 shadow-md shadow-[#CCFF00]/10 transition-colors"
            >
              {saving ? "Сохранение..." : <><Save className="mr-2 h-4 w-4" /> Сохранить изменения</>}
            </Button>
          </motion.div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

