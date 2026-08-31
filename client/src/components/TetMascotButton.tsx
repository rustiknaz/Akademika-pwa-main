import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TetMascotButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function TetMascotButton({ onClick, className = '' }: TetMascotButtonProps) {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!buttonRef.current) return;

      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

      if (clientX === undefined || clientY === undefined) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - btnCenterX;
      const deltaY = clientY - btnCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(4, Math.hypot(deltaX, deltaY) / 30);

      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);
    };
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* 1. Эфирное мягкое свечение (Deep Violet & Cyan Nebula Glow) */}
      <motion.div
        animate={{
          scale: [1, 1.25, 0.95, 1.2, 1],
          opacity: [0.55, 0.85, 0.45, 0.8, 0.55],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -inset-4 rounded-full blur-xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, rgba(59, 130, 246, 0.45) 40%, rgba(34, 211, 238, 0.3) 70%, transparent 100%)',
        }}
      />

      {/* 2. Мерцающие точечные микро-частицы вокруг сферы */}
      <motion.div
        animate={{ opacity: [0.2, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1.5 right-1 w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.8, 0.2, 0.9], scale: [1.2, 0.7, 1.2] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_#a5b4fc] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.9, 0.2], scale: [0.6, 1.1, 0.6] }}
        transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-4 -left-2 w-1 h-1 rounded-full bg-fuchsia-300 shadow-[0_0_6px_#f0abfc] pointer-events-none"
      />

      {/* 3. Основная сфера Тет (Компактный размер 56x56px, точь-в-точь по референсу) */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-none outline-none z-10 p-0 shadow-2xl"
        style={{
          background: 'radial-gradient(circle at 65% 60%, rgba(168, 85, 247, 0.45) 0%, rgba(15, 23, 42, 0.95) 60%, #030712 100%)',
          boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.18), inset 0 0 12px rgba(168, 85, 247, 0.35), 0 8px 24px rgba(0, 0, 0, 0.8)'
        }}
        aria-label="ИИ Ассистент Тет"
      >
        {/* Верхний стеклянный серповидный ореол / блик (Glass Arc) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 65%)',
          }}
        />

        {/* Фиолетово-пурпурная внутренняя дымка справа */}
        <div 
          className="absolute -right-1 -bottom-1 w-10 h-10 rounded-full blur-md pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(217, 70, 239, 0.55) 0%, rgba(147, 51, 234, 0.3) 60%, transparent 100%)'
          }}
        />

        {/* 4. Глаза-капсулы (интерактивно поворачиваются и следят за пальцем) */}
        <motion.div 
          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          className="relative flex items-center justify-center gap-2 z-20 pointer-events-none"
        >
          {/* Левый глаз-капсула */}
          <div 
            className="w-2.5 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9),0_0_20px_rgba(168,85,247,0.5)]"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 60%, #CBD5E1 100%)'
            }}
          />

          {/* Правый глаз-капсула */}
          <div 
            className="w-2.5 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9),0_0_20px_rgba(168,85,247,0.5)]"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 60%, #CBD5E1 100%)'
            }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}