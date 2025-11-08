import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game/store';
import { Player } from './Player';
import { Block } from './Block';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '@/lib/game/constants';
import { Heart, Star, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileControls } from './MobileControls';
export const GameCanvas: React.FC = () => {
  const { update } = useGameStore.getState();
  const level = useGameStore((s) => s.level);
  const enemies = useGameStore((s) => s.enemies);
  const cameraX = useGameStore((s) => s.cameraX);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const time = useGameStore((s) => s.time);
  const status = useGameStore((s) => s.status);
  const isMobile = useIsMobile();
  const inputRef = useRef({ left: false, right: false, jump: false });
  const lastTimeRef = useRef(performance.now());
  const gameLoopRef = useRef<number>();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputRef.current.left = true;
      if (e.key === 'ArrowRight') inputRef.current.right = true;
      if (e.key === ' ') inputRef.current.jump = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputRef.current.left = false;
      if (e.key === 'ArrowRight') inputRef.current.right = false;
      if (e.key === ' ') inputRef.current.jump = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  useEffect(() => {
    const gameLoop = (now: number) => {
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      update(deltaTime, inputRef.current);
      if (useGameStore.getState().status === 'playing') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };
    if (status === 'playing') {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [status, update]);
  const gameWorldStyle: React.CSSProperties = {
    transform: `translateX(-${cameraX}px)`,
    width: `${level[0].length * TILE_SIZE}px`,
    height: `${level.length * TILE_SIZE}px`,
  };
  return (
    <div className="relative w-full h-full overflow-hidden bg-sky">
      <div className="absolute top-4 left-4 z-10 flex gap-6 text-white font-bold font-display text-2xl">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-300" />
          <span>{String(score).padStart(6, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          <span>x {lives}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <span>{Math.ceil(time)}</span>
        </div>
      </div>
      <div style={gameWorldStyle} className="relative transition-transform duration-100 ease-linear">
        {level.flat().map((block) => block.type !== 'air' && <Block key={block.id} block={block} />)}
        <Player />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} />)}
      </div>
      {isMobile && <MobileControls inputRef={inputRef} />}
    </div>
  );
};