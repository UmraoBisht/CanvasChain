import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils';

export interface ToolbarProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const Toolbar = ({ className, children, ...props }: ToolbarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex items-center gap-1 rounded-xl border border-border/80 bg-background/80 p-1.5 shadow-lg backdrop-blur-md dark:bg-card/80',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

