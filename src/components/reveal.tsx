'use client';
import { motion, useReducedMotion } from 'motion/react';
import { useHydrated } from '@/components/use-hydrated';
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={hydrated && !reduced ? { y: [14, 0] } : { y: 0 }}
      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
      transition={{ duration: 0.65 }}
    >
      {children}
    </motion.div>
  );
}
