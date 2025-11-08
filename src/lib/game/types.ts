export type BlockType = 'air' | 'ground' | 'coin-block' | 'goal';
export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  direction: 'left' | 'right';
  isInvincible: boolean;
}
export interface EnemyState {
  id: number;
  x: number;
  y: number;
  vx: number;
  initialX: number;
  direction: 'left' | 'right';
}
export type GameStatus = 'startScreen' | 'playing' | 'gameOver' | 'win';
export interface LevelBlock {
  type: BlockType;
  x: number;
  y: number;
  id: string;
  isCollected?: boolean;
}
export interface GameState {
  status: GameStatus;
  player: PlayerState;
  enemies: EnemyState[];
  level: LevelBlock[][];
  cameraX: number;
  score: number;
  lives: number;
  time: number;
  invincibilityTimer: number;
}
export interface GameActions {
  startGame: () => void;
  resetGame: () => void;
  update: (deltaTime: number, input: { left: boolean; right: boolean; jump: boolean }) => void;
}