import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface BannerProps extends HTMLMotionProps<'div'> {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export default function Banner({ onClick, className = '', children, ...props }: BannerProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`w-full rounded-outer px-4 py-3.5 select-none shadow-xl cursor-pointer transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

