import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/lib/game/store';
import { Player } from './Player';
import { Block } from './Block';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '@/lib/game/constants';
import { Heart, Star, Clock, Pause, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileControls } from './MobileControls';
import { Button } from '@/components/ui/button';
import { level1Data as level1 } from '@/lib/game/levels';
import { Entity, RenderableType } from '@/lib/game/ecs/types';interface RenderableEntity {id: Entity;type: RenderableType;x: number;y: number;direction?: 'left' | 'right';isInvincible?: boolean;isJumping?: boolean;onGround?: boolean;isCollected?: boolean;}
const selectRenderableEntities = (state: ReturnType<typeof useGameStore.getState>): RenderableEntity[] => {
  const { world } = state;
  const entities: RenderableEntity[] = [];
  for (const [entity, renderable] of world.components.renderable.entries()) {
    const position = world.components.position.get(entity);
    if (!position) continue;
    const baseEntity: RenderableEntity = {
      id: entity,
      type: renderable.type,
      x: position.x,
      y: position.y
    };
    if (renderable.type === 'player') {
      const stateComp = world.components.state.get(entity);
      const physicsComp = world.components.physics.get(entity);
      Object.assign(baseEntity, {
        direction: stateComp?.direction || 'right',
        isInvincible: stateComp?.isInvincible || false,
        isJumping: stateComp?.isJumping || false,
        onGround: physicsComp?.onGround || false
      });
    } else if (renderable.type === 'enemy') {
      const aiComp = world.components.aiControlled.get(entity);
      Object.assign(baseEntity, {
        direction: aiComp?.direction || 'left'
      });
    } else if (renderable.type === 'coin-block') {
      const stateComp = world.components.state.get(entity);
      Object.assign(baseEntity, {
        isCollected: stateComp?.isCollected || false
      });
    }
    entities.push(baseEntity);
  }
  return entities;
};
export const GameCanvas: React.FC = () => {
  const { update, togglePause } = useGameStore.getState();
  const cameraX = useGameStore((s) => s.cameraX);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const time = useGameStore((s) => s.time);
  const status = useGameStore((s) => s.status);
  const world = useGameStore((s) => s.world);
  const renderableEntities = useMemo(() => selectRenderableEntities({ world } as any), [world]);
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
    width: `${level1[0].length * TILE_SIZE}px`,
    height: `${level1.length * TILE_SIZE}px`
  };
  const cloudStyle1: React.CSSProperties = {
    transform: `translateX(-${cameraX * 0.5}px)`
  };
  const cloudStyle2: React.CSSProperties = {
    transform: `translateX(-${cameraX * 0.2}px)`
  };
  return (
    <div className="relative w-full h-full overflow-hidden bg-sky">
      {}
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
      {}
      <div className="absolute inset-0 w-full h-full" style={cloudStyle2}>
        <div className="absolute top-[20%] left-[10%] w-48 h-24 bg-white/50 rounded-full opacity-50" />
        <div className="absolute top-[30%] left-[70%] w-64 h-32 bg-white/50 rounded-full opacity-50" />
      </div>
      <div className="absolute inset-0 w-full h-full" style={cloudStyle1}>
        <div className="absolute top-[15%] left-[40%] w-56 h-28 bg-white/70 rounded-full opacity-70" />
        <div className="absolute top-[25%] left-[90%] w-40 h-20 bg-white/70 rounded-full opacity-70" />
      </div>
      {}
      <div style={gameWorldStyle} className="relative transition-transform duration-100 ease-linear">
        {renderableEntities.map((entity) => {
          switch (entity.type) {
            case 'player':
              return <Player key={entity.id} {...entity} direction={entity.direction!} isInvincible={entity.isInvincible!} isJumping={entity.isJumping!} onGround={entity.onGround!} />;
            case 'enemy':
              return <Enemy key={entity.id} x={entity.x} y={entity.y} direction={entity.direction!} />;
            case 'ground':
            case 'coin-block':
            case 'goal':
              return <Block key={entity.id} block={{ type: entity.type, x: entity.x, y: entity.y, id: entity.id, isCollected: entity.isCollected }} />;
            default:
              return null;
          }
        })}
      </div>
      {isMobile && <MobileControls inputRef={inputRef} />}
    </div>);

};