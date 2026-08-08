import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Send, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen page-root bg-transparent text-white selection:bg-rose-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold mb-6 animate-fade-in">
            <Zap size={14} />
            <span>Первая CRM, созданная хореографом</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Танцуйте больше, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              администрируйте меньше
            </span>
          </h1>
          <p className="text-stone-400 text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed">
            Простое и мощное решение для вашей студии без лишней бюрократии. 
            Создано теми, кто знает ритм вашего бизнеса.
          </p>
          <Link href="/Login">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-full h-16 px-10 text-lg font-bold shadow-2xl shadow-rose-500/20 group">
              Посмотреть демо
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Ваши преимущества</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Smartphone className="text-rose-500" size={32} />}
              title="Управление со смартфона"
              description="Весь ваш бизнес в кармане. Контролируйте расписание, записи и оплаты прямо с телефона в любое время."
            />
            <BenefitCard 
              icon={<Send className="text-rose-500" size={32} />}
              title="Telegram-уведомления"
              description="Мгновенно узнавайте о новых записях и отменах. Будьте в курсе событий без лишних звонков и чатов."
            />
            <BenefitCard 
              icon={<ShieldCheck className="text-rose-500" size={32} />}
              title="Прозрачный баланс"
              description="Ученики сами видят остаток занятий в личном кабинете и записываются в один клик. Минимум вопросов — максимум танцев."
            />
          </div>
        </div>
      </section>

      {/* Speed Section */}
      <section className="px-6 py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        <div className="max-w-4xl mx-auto bg-stone-900 border border-stone-800 rounded-[40px] p-10 md:p-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Автоматизация за 24 часа</h2>
              <p className="text-stone-400 text-lg mb-8">
                Внедрение системы происходит мгновенно. Мы настроим ваше расписание и поможем перенести базу учеников. Начните работать по-новому уже завтра.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-stone-300">
                  <CheckCircle2 className="text-rose-500" size={20} />
                  <span>Без сложных настроек</span>
                </li>
                <li className="flex items-center gap-3 text-stone-300">
                  <CheckCircle2 className="text-rose-500" size={20} />
                  <span>Понятный интерфейс</span>
                </li>
                <li className="flex items-center gap-3 text-stone-300">
                  <CheckCircle2 className="text-rose-500" size={20} />
                  <span>Техническая поддержка</span>
                </li>
              </ul>
            </div>
            <div className="bg-stone-800/50 rounded-3xl p-6 border border-stone-700/50 flex flex-col items-center justify-center text-center">
              <Clock size={64} className="text-rose-500 mb-6 animate-pulse" />
              <div className="text-5xl font-bold mb-2">24ч</div>
              <div className="text-stone-500 uppercase tracking-widest text-sm">До запуска системы</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-stone-800 text-center">
        <p className="text-stone-500 mb-6">Готовы масштабировать свою студию?</p>
        <Link href="/Login">
          <Button variant="outline" className="border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full px-8">
            Начать работу
          </Button>
        </Link>
        <div className="mt-12 text-stone-600 text-sm">
          © 2026 Akademika CRM. Создано для хореографов.
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-stone-900/40 border border-stone-800/50 p-8 rounded-[30px] hover:border-rose-500/30 transition-all group">
      <div className="mb-6 p-4 bg-stone-800 rounded-2xl w-fit group-hover:bg-rose-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-stone-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
