import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Block } from '../types';
import { useCanvasStore } from './useCanvasStore';
import clsx from 'clsx';

interface BlockNoteProps {
  block: Block & { type: 'note' };
}

export function BlockNote({ block }: BlockNoteProps) {
  const { updateBlock, selectedBlockIds } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(block.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSelected = selectedBlockIds.includes(block.id);

  useEffect(() => {
    setText(block.text);
  }, [block.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== block.text) {
      updateBlock(block.id, { text });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(block.text);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full h-full bg-yellow-200 border border-yellow-300 rounded p-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-800 text-sm"
          placeholder="Add your note..."
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'w-full h-full bg-yellow-200 border border-yellow-300 rounded p-2 cursor-text',
        'shadow-sm hover:shadow-md transition-shadow',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-full h-full text-gray-800 text-sm break-words overflow-hidden">
        {block.text || 'Add your note...'}
      </div>
      
      {/* Note indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-500 opacity-70" />
    </div>
  );
}