import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PopoverMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function PopoverMenu({ 
  trigger, 
  children, 
  align = 'left',
  className 
}: PopoverMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'absolute top-full mt-2 z-50 glass rounded-lg md:rounded-xl p-2 min-w-[200px] md:min-w-56 depth-2 border border-white/20',
              align === 'right' && 'right-0',
              align === 'center' && 'left-1/2 -translate-x-1/2',
              align === 'left' && 'left-0',
              'max-w-[90vw]', // Prevent overflow on mobile
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PopoverMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export function PopoverMenuItem({ 
  children, 
  onClick, 
  icon, 
  destructive = false 
}: PopoverMenuItemProps) {
  return (
    <motion.button
      className={cn(
        'w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-left transition-all duration-200 touch-target min-w-0 leading-relaxed',
        'hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50',
        destructive && 'text-red-400 hover:bg-red-500/10'
      )}
      onClick={onClick}
      whileHover={{ x: 2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span className="text-xs md:text-sm truncate">{children}</span>
    </motion.button>
  );
}