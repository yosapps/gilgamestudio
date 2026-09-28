'use client';
import { motion, useReducedMotion } from 'motion/react';
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
      transition={{ duration: 0.65 }}
    >
      {children}
    </motion.div>
  );
}
