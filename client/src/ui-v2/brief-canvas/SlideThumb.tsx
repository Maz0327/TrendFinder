import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Slide } from '../types';

interface SlideThumbProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function SlideThumb({ 
  slide, 
  index, 
  isActive, 
  onClick, 
  onDragStart,
  onDragOver,
  onDrop 
}: SlideThumbProps) {
  return (
    <motion.div
      className={cn(
        'group relative cursor-pointer rounded border md:rounded-lg border-2 transition-all duration-200 touch-target',
        isActive 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-white/10 hover:border-white/30'
      )}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Slide Preview */}
      <div className="aspect-[4/3] p-0.5 md:p-1 lg:p-3">
        <div className="w-full h-full bg-white/5 rounded border border-white/10 relative overflow-hidden min-h-[40px] md:min-h-[60px]">
          {/* Render simplified version of blocks */}
          {slide.blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                'absolute rounded-sm',
                block.type === 'text' && 'bg-white/20',
                block.type === 'image' && 'bg-blue-500/20',
                block.type === 'note' && 'bg-yellow-500/20'
              )}
              style={{
                left: `${(block.x / 800) * 100}%`,
                top: `${(block.y / 600) * 100}%`,
                width: `${(block.w / 800) * 100}%`,
                height: `${(block.h / 600) * 100}%`,
                transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Slide Info */}
      <div className="px-1 md:px-2 lg:px-3 pb-1 md:pb-2 lg:pb-3 hidden lg:block">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">
            {index + 1}
          </span>
          <span className="text-xs text-white/50">
            {slide.blocks.length} blocks
          </span>
        </div>
        
        {slide.title && (
          <div className="text-xs text-white/80 mt-1 truncate">
            {slide.title}
          </div>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
          layoutId="activeSlide"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.div>
  );
}