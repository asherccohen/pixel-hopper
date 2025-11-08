import React from 'react';
import { TILE_SIZE } from '@/lib/game/constants';
import { EnemyState } from '@/lib/game/types';
interface EnemyProps {
  enemy: EnemyState;
}
export const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${enemy.x}px`,
    top: `${enemy.y}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
  };
  return (
    <div style={style} className="flex items-center justify-center">
      <div className="bg-enemy w-full h-full rounded-full shadow-lg border-2 border-black/20" />
    </div>
  );
};