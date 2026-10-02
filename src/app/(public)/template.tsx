'use client';
import { motion, useReducedMotion } from 'motion/react';
import { useHydrated } from '@/components/use-hydrated';
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return (
    <motion.div
      initial={false}
      animate={hydrated && !reduced ? { y: [6, 0] } : { y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  );
}
