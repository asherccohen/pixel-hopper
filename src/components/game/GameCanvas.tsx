import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game/store';
import { Player } from './Player';
import { Block } from './Block';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '@/lib/game/constants';
import { Heart, Star, Clock, Pause, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileControls } from './MobileControls';
import { Button } from '@/components/ui/button';
export const GameCanvas: React.FC = () => {
  const { update, togglePause } = useGameStore.getState();
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
      if (e.key === 'Escape' || e.key === 'p') {
        e.preventDefault();
        togglePause();
      }
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
  }, [togglePause]);
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
  const cloudStyle1: React.CSSProperties = {
    transform: `translateX(-${cameraX * 0.5}px)`,
  };
  const cloudStyle2: React.CSSProperties = {
    transform: `translateX(-${cameraX * 0.2}px)`,
  };
  return (
    <div className="relative w-full h-full overflow-hidden bg-sky">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center text-white font-bold font-display text-2xl">
        <div className="flex items-center gap-6">
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
        <Button onClick={togglePause} size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
          {status === 'playing' ? <Pause /> : <Play />}
        </Button>
      </div>
      {/* Parallax Background */}
      <div className="absolute inset-0 w-full h-full" style={cloudStyle2}>
        <div className="absolute top-[20%] left-[10%] w-48 h-24 bg-white/50 rounded-full opacity-50" />
        <div className="absolute top-[30%] left-[70%] w-64 h-32 bg-white/50 rounded-full opacity-50" />
      </div>
      <div className="absolute inset-0 w-full h-full" style={cloudStyle1}>
        <div className="absolute top-[15%] left-[40%] w-56 h-28 bg-white/70 rounded-full opacity-70" />
        <div className="absolute top-[25%] left-[90%] w-40 h-20 bg-white/70 rounded-full opacity-70" />
      </div>
      {/* Game World */}
      <div style={gameWorldStyle} className="relative transition-transform duration-100 ease-linear">
        {level.flat().map((block) => block.type !== 'air' && <Block key={block.id} block={block} />)}
        <Player />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} />)}
      </div>
      {isMobile && <MobileControls inputRef={inputRef} />}
    </div>
  );
};