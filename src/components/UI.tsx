'use client';

import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlassPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-panel rounded-2xl p-6", className)}>
    {children}
  </div>
);

export const NeonButton = ({ 
  children, 
  onClick, 
  className,
  color = 'blue'
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  className?: string,
  color?: 'blue' | 'yellow' | 'purple'
}) => {
  const colorMap = {
    blue: 'border-sky-400 text-sky-400 hover:bg-sky-400/10 shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    yellow: 'border-amber-400 text-amber-400 hover:bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
    purple: 'border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 shadow-[0_0_15px_rgba(129,140,248,0.4)]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-6 py-2 border rounded-full font-bold transition-all duration-300 uppercase tracking-widest text-sm",
        colorMap[color],
        className
      )}
    >
      {children}
    </motion.button>
  );
};
