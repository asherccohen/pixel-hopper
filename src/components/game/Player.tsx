import React from 'react';
import { useGameStore } from '@/lib/game/store';
import { TILE_SIZE } from '@/lib/game/constants';
import { cn } from '@/lib/utils';
export const Player: React.FC = () => {
  const playerX = useGameStore((s) => s.player.x);
  const playerY = useGameStore((s) => s.player.y);
  const direction = useGameStore((s) => s.player.direction);
  const isInvincible = useGameStore((s) => s.player.isInvincible);
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${playerX}px`,
    top: `${playerY}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    transition: 'opacity 0.1s ease-in-out',
  };
  return (
    <div style={style} className={cn('flex items-center justify-center', isInvincible && 'opacity-50 animate-pulse')}>
      <div className="bg-player w-[80%] h-[80%] rounded-md shadow-lg border-2 border-black/20" />
    </div>
  );
};