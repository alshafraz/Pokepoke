'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function WeatherOverlay({ type }: { type: 'Rain' | 'Snow' | 'Sand' | 'Clear' }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (type === 'Clear') {
      setParticles([]);
      return;
    }
    const count = type === 'Rain' ? 50 : 30;
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: type === 'Rain' ? 0.5 + Math.random() * 0.5 : 2 + Math.random() * 3,
      size: type === 'Snow' ? 2 + Math.random() * 4 : 1
    }));
    setParticles(newParticles);
  }, [type]);

  if (type === 'Clear') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 800, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{ 
            left: `${p.left}%`, 
            width: type === 'Rain' ? '1px' : `${p.size}px`,
            height: type === 'Rain' ? '20px' : `${p.size}px`,
            backgroundColor: type === 'Snow' ? 'white' : type === 'Rain' ? '#38bdf8' : '#fbbf24',
            filter: 'blur(1px)',
            borderRadius: '50%'
          }}
          className="absolute"
        />
      ))}
      {type === 'Sand' && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-amber-900/10" 
        />
      )}
    </div>
  );
}
