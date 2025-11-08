import React from 'react';
import { TILE_SIZE } from '@/lib/game/constants';
import { motion, Variants } from 'framer-motion';
const enemyVariants: Variants = {
  float: {
    y: ["-5%", "5%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};
interface EnemyProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
}
export const Enemy: React.FC<EnemyProps> = ({ x, y, direction }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
  };
  return (
    <motion.div
      style={style}
      className="flex items-center justify-center"
      variants={enemyVariants}
      animate="float"
    >
      <div className="relative w-full h-full">
        {/* Body */}
        <div className="w-full h-full bg-enemy rounded-full shadow-lg border-2 border-black/20" />
        {/* Eye */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white rounded-full border border-black/20 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-black rounded-full" />
        </div>
      </div>
    </motion.div>
  );
};