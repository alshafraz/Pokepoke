'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypeBackgroundProps {
  type: string;
}

const TYPE_PARTICLES: Record<string, { color: string; count: number; shape: string }> = {
  fire: { color: 'bg-orange-500', count: 30, shape: 'rounded-full' },
  water: { color: 'bg-blue-400', count: 25, shape: 'rounded-full' },
  grass: { color: 'bg-emerald-500', count: 20, shape: 'rounded-lg' },
  electric: { color: 'bg-yellow-400', count: 40, shape: 'w-1 h-4 rotate-45' },
  psychic: { color: 'bg-pink-400', count: 35, shape: 'rounded-full blur-sm' },
  dragon: { color: 'bg-indigo-500', count: 20, shape: 'rounded-full' },
  ghost: { color: 'bg-purple-600', count: 15, shape: 'rounded-full blur-md' },
  default: { color: 'bg-sky-400', count: 20, shape: 'rounded-full' },
};

export default function TypeBackground({ type }: TypeBackgroundProps) {
  const [particles, setParticles] = useState<any[]>([]);
  const config = TYPE_PARTICLES[type.toLowerCase()] || TYPE_PARTICLES.default;

  useEffect(() => {
    const newParticles = Array.from({ length: config.count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [type, config.count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Type Specific Glow */}
      <motion.div
        key={type}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
        className={`absolute inset-0 bg-gradient-to-t from-${config.color.split('-')[1]}-500/10 to-transparent`}
      />
      
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: '110vh', x: `${p.x}vw` }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: '-10vh',
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{ width: p.size, height: p.size }}
          className={`${config.color} absolute ${config.shape}`}
        />
      ))}
    </div>
  );
}
