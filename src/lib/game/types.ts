import { World } from './ecs/types';
export type BlockType = 'air' | 'ground' | 'coin-block' | 'goal';

export interface LevelBlock {
  id: number;
  type: BlockType;
  x: number;
  y: number;
  isCollected?: boolean;
}

export type GameStatus = 'startScreen' | 'playing' | 'gameOver' | 'win' | 'paused';
export interface GameState {
  status: GameStatus;
  world: World;
  cameraX: number;
  score: number;
  lives: number;
  time: number;
  invincibilityTimer: number;
}
export interface GameActions {
  startGame: () => void;
  resetGame: () => void;
  togglePause: () => void;
  update: (deltaTime: number, input: { left: boolean; right: boolean; jump: boolean }) => void;
}