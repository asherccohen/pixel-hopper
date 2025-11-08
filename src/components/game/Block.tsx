import React from 'react';
import { TILE_SIZE } from '@/lib/game/constants';
import { LevelBlock } from '@/lib/game/types';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
interface BlockProps {
  block: LevelBlock;
}
export const Block: React.FC<BlockProps> = React.memo(({ block }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${block.x}px`,
    top: `${block.y}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
  };
  const baseClasses = 'absolute rounded-md border-2 border-black/20';
  const renderBlock = () => {
    switch (block.type) {
      case 'ground':
        return <div style={style} className={cn(baseClasses, 'bg-ground')} />;
      case 'coin-block':
        return (
          <div style={style} className={cn(baseClasses, 'bg-coin-block flex items-center justify-center text-yellow-800 font-bold text-2xl', block.isCollected && 'bg-yellow-800')}>
            {!block.isCollected && '?'}
          </div>
        );
      case 'goal':
        return (
            <div style={style} className="flex flex-col items-center justify-end">
                <div className="w-2 h-full bg-gray-600" />
                <div className="absolute top-0 right-0 w-8 h-6 bg-green-500 triangle-flag" />
                 <style>{`.triangle-flag { clip-path: polygon(0 0, 100% 50%, 0 100%); }`}</style>
            </div>
        );
      default:
        return null;
    }
  };
  return renderBlock();
});