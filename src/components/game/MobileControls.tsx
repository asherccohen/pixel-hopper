import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
interface MobileControlsProps {
  inputRef: React.MutableRefObject<{ left: boolean; right: boolean; jump: boolean }>;
}
export const MobileControls: React.FC<MobileControlsProps> = ({ inputRef }) => {
  const handleTouchStart = (action: 'left' | 'right' | 'jump') => (e: React.TouchEvent) => {
    e.preventDefault();
    inputRef.current[action] = true;
  };
  const handleTouchEnd = (action: 'left' | 'right' | 'jump') => (e: React.TouchEvent) => {
    e.preventDefault();
    inputRef.current[action] = false;
  };
  return (
    <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-between px-8 pointer-events-none">
      {/* Left/Right Controls */}
      <div className="flex gap-4 pointer-events-auto">
        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={() => inputRef.current.left = true}
          onMouseUp={() => inputRef.current.left = false}
          onMouseLeave={() => inputRef.current.left = false}
          className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center text-white active:bg-black/60 select-none"
        >
          <ArrowLeft size={32} />
        </button>
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={() => inputRef.current.right = true}
          onMouseUp={() => inputRef.current.right = false}
          onMouseLeave={() => inputRef.current.right = false}
          className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center text-white active:bg-black/60 select-none"
        >
          <ArrowRight size={32} />
        </button>
      </div>
      {/* Jump Control */}
      <div className="pointer-events-auto">
        <button
          onTouchStart={handleTouchStart('jump')}
          onTouchEnd={handleTouchEnd('jump')}
          onMouseDown={() => inputRef.current.jump = true}
          onMouseUp={() => inputRef.current.jump = false}
          onMouseLeave={() => inputRef.current.jump = false}
          className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center text-white active:bg-black/60 select-none"
        >
          <ArrowUp size={40} />
        </button>
      </div>
    </div>
  );
};