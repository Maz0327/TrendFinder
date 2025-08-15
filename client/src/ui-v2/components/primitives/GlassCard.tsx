import { motion } from 'framer-motion';
import { cn } from '@/ui-v2/../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      className={cn('glass', 
        'glass rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 transition-all duration-200 relative',
        hover && 'hover:scale-[1.01] hover:depth-2 cursor-pointer hover:bg-white/[0.06] hover:shadow-xl',
        onClick && 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900',
        'group', // Add group class for hover states
        className
      )}
      onClick={onClick}
      whileHover={hover && window.innerWidth >= 768 ? { y: -2, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
}