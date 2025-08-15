import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <motion.div 
        className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.1,
          type: 'spring',
          stiffness: 200,
          damping: 20
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -2, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Icon className="w-12 h-12 text-white/60" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
      </motion.div>
      
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 hover:scale-[1.02] rounded-lg transition-all duration-200 hover:shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );
}