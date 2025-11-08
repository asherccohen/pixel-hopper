import React from 'react';
import { TILE_SIZE } from '@/lib/game/constants';
import { cn } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';
const playerVariants: Variants = {
  idle: {
    scaleY: [1, 0.95, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  jump: {
    scaleY: 1.1,
    scaleX: 0.9,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  land: {
    scaleY: 0.8,
    scaleX: 1.2,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};
interface PlayerProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  isInvincible: boolean;
  isJumping: boolean;
  onGround: boolean;
}
export const Player: React.FC<PlayerProps> = ({ x, y, direction, isInvincible, isJumping, onGround }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    transition: 'opacity 0.1s ease-in-out',
    zIndex: 10,
  };
  const getAnimationState = () => {
    if (isJumping) return "jump";
    if (onGround) return "idle";
    return "jump"; // in-air state
  };
  return (
    <motion.div
      style={style}
      className={cn('flex items-center justify-center', isInvincible && 'opacity-50 animate-pulse')}
      variants={playerVariants}
      animate={getAnimationState()}
    >
      <div className="relative w-[80%] h-[80%]">
        {/* Body */}
        <div className="absolute bottom-0 w-full h-full bg-player rounded-t-lg rounded-b-md shadow-lg border-2 border-black/20" />
        {/* Eyes */}
        <div className="absolute top-1/4 left-1/4 w-1/4 h-1/3 bg-white rounded-full border border-black/20" />
        <div className="absolute top-1/4 right-1/4 w-1/4 h-1/3 bg-white rounded-full border border-black/20" />
        <div className="absolute top-[30%] left-[30%] w-[10%] h-[15%] bg-black rounded-full" />
        <div className="absolute top-[30%] right-[30%] w-[10%] h-[15%] bg-black rounded-full" />
      </div>
    </motion.div>
  );
};