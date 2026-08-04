import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Очистка номера телефона от лишних символов (только цифры)
  const cleanPhone = (val: string) => val.replace(/\D/g, '');

  const handleAuth = async (type: 'login' | 'signup') => {
    const cleanedPhone = cleanPhone(phone);
    if (!cleanedPhone) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите номер телефона",
      });
      return;
    }

    setLoading(true);
    try {
      // Формируем fake-email: НОМЕР@dance.local
      const email = `${cleanedPhone}@dance.local`;
      
      const { error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      toast({
        title: type === 'login' ? "Вход выполнен" : "Регистрация успешна",
        description: "Добро пожаловать в нашу студию!",
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-6 selection:bg-accent-primary/10 selection:text-accent-primary text-primary-custom">
      <Card className="w-full max-w-md border border-custom shadow-[0_10px_35px_rgba(0,0,0,0.08)] bg-card-custom rounded-outer overflow-hidden">
        <CardHeader className="bg-main pb-8 pt-10 px-8 relative overflow-hidden border-b border-custom">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary rounded-full blur-[60px] opacity-15 -mr-8 -mt-8"></div>
          <CardTitle className="text-3xl font-bold text-center font-sans text-primary-custom">Studio Dance</CardTitle>
          <p className="text-accent-primary text-center text-sm font-medium mt-1.5 opacity-80">Танцуй вместе с нами</p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8 bg-card-custom">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-main rounded-control p-1 border border-custom">
              <TabsTrigger value="login" className="rounded-control text-xs font-medium py-2 text-secondary-custom data-[state=active]:bg-accent-primary data-[state=active]:text-accent-text data-[state=active]:shadow-sm transition-all">ВХОД</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-control text-xs font-medium py-2 text-secondary-custom data-[state=active]:bg-accent-primary data-[state=active]:text-accent-text data-[state=active]:shadow-sm transition-all">РЕГИСТРАЦИЯ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 outline-none">
              <div className="space-y-3">
                <Input 
                  type="tel" 
                  placeholder="Номер телефона" 
                  value={phone}
                  onChange={(e) => setPhone(cleanPhone(e.target.value))}
                  className="rounded-control border-custom h-11 focus-visible:ring-1 focus-visible:ring-accent-primary/30 bg-main text-primary-custom placeholder:text-secondary-custom/40 text-sm font-medium focus-visible:border-accent-primary"
                />
              </div>
              <div className="space-y-3">
                <Input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-control border-custom h-11 focus-visible:ring-1 focus-visible:ring-accent-primary/30 bg-main text-primary-custom placeholder:text-secondary-custom/40 text-sm font-medium focus-visible:border-accent-primary"
                />
              </div>
              <Button 
                onClick={() => handleAuth('login')} 
                disabled={loading}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-accent-text rounded-control h-12 font-bold text-sm tracking-wide mt-2 shadow-sm transition-colors"
              >
                {loading ? "Загрузка..." : <><LogIn className="mr-2 h-4 w-4" /> Войти</>}
              </Button>
            </TabsContent>
 
            <TabsContent value="signup" className="space-y-4 outline-none">
              <div className="space-y-3">
                <Input 
                  type="tel" 
                  placeholder="Номер телефона" 
                  value={phone}
                  onChange={(e) => setPhone(cleanPhone(e.target.value))}
                  className="rounded-control border-custom h-11 focus-visible:ring-1 focus-visible:ring-accent-primary/30 bg-main text-primary-custom placeholder:text-secondary-custom/40 text-sm font-medium focus-visible:border-accent-primary"
                />
              </div>
              <div className="space-y-3">
                <Input 
                  type="password" 
                  placeholder="Пароль" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-control border-custom h-11 focus-visible:ring-1 focus-visible:ring-accent-primary/30 bg-main text-primary-custom placeholder:text-secondary-custom/40 text-sm font-medium focus-visible:border-accent-primary"
                />
              </div>
              <Button 
                onClick={() => handleAuth('signup')} 
                disabled={loading}
                className="w-full bg-main hover:bg-card-custom text-accent-primary border border-accent-primary/20 rounded-control h-12 font-bold text-sm tracking-wide mt-2 shadow-md transition-colors"
              >
                {loading ? "Загрузка..." : <><UserPlus className="mr-2 h-4 w-4" /> Создать аккаунт</>}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
