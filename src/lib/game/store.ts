import { create } from 'zustand';
import { GameState, GameActions, BlockType } from './types';
import { World, Entity } from './ecs/types';
import * as systems from './ecs/systems';
import {
  TILE_SIZE,
  INITIAL_LIVES,
  INITIAL_TIME,
  INVINCIBILITY_DURATION,
  LEVEL_HEIGHT,
  ENEMY_SPEED,
} from './constants';
import { level1Data } from './levels';
const createInitialWorld = (): World => {
  const world: World = {
    entities: new Set(),
    nextEntityId: 0,
    components: {
      position: new Map(),
      velocity: new Map(),
      renderable: new Map(),
      playerControlled: new Map(),
      physics: new Map(),
      aiControlled: new Map(),
      collision: new Map(),
      state: new Map(),
      scoreValue: new Map(),
      goal: new Map(),
    },
  };
  const createEntity = (): Entity => {
    const entity = world.nextEntityId++;
    world.entities.add(entity);
    return entity;
  };
  level1Data.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === 0) return; // Skip air blocks
      const entity = createEntity();
      world.components.position.set(entity, { x: x * TILE_SIZE, y: y * TILE_SIZE });
      world.components.collision.set(entity, { width: TILE_SIZE, height: TILE_SIZE });
      let type: BlockType = 'air';
      if (tile === 1) type = 'ground';
      if (tile === 2) {
        type = 'coin-block';
        world.components.state.set(entity, { isCollected: false });
        world.components.scoreValue.set(entity, { value: 100 });
      }
      if (tile === 9) {
        type = 'goal';
        world.components.goal.set(entity, {});
      }
      if (tile === 3) { // Enemy
        world.components.renderable.set(entity, { type: 'enemy' });
        world.components.velocity.set(entity, { vx: -ENEMY_SPEED, vy: 0 });
        world.components.aiControlled.set(entity, { initialX: x * TILE_SIZE, direction: 'left' });
        world.components.scoreValue.set(entity, { value: 200 });
        world.components.collision.set(entity, { width: TILE_SIZE, height: TILE_SIZE });
      } else {
        world.components.renderable.set(entity, { type });
      }
    });
  });
  // Create Player
  const player = createEntity();
  world.components.position.set(player, { x: TILE_SIZE * 2, y: TILE_SIZE * (LEVEL_HEIGHT - 4) });
  world.components.velocity.set(player, { vx: 0, vy: 0 });
  world.components.renderable.set(player, { type: 'player' });
  world.components.playerControlled.set(player, {});
  world.components.physics.set(player, { onGround: false });
  world.components.collision.set(player, { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 });
  world.components.state.set(player, { direction: 'right', isInvincible: false, isJumping: false });
  return world;
};
const getInitialState = (): GameState => ({
  status: 'startScreen',
  world: createInitialWorld(),
  cameraX: 0,
  score: 0,
  lives: INITIAL_LIVES,
  time: INITIAL_TIME,
  invincibilityTimer: 0,
});
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),
  startGame: () => set({ status: 'playing' }),
  resetGame: () => set(getInitialState()),
  togglePause: () => {
    const status = get().status;
    if (status === 'playing') set({ status: 'paused' });
    else if (status === 'paused') set({ status: 'playing' });
  },
  update: (deltaTime, input) => {
    set(state => {
      if (state.status !== 'playing') return state;

      const { world } = state;
      let { score, lives, time, invincibilityTimer } = state;

      // Timer
      time -= deltaTime;
      if (time <= 0) {
        return { ...state, status: 'gameOver', time: 0 };
      }

      // Invincibility
      const playerEntity = Array.from(world.components.playerControlled.keys())[0];
      const playerState = world.components.state.get(playerEntity);
      if (playerState?.isInvincible) {
        invincibilityTimer -= deltaTime;
        if (invincibilityTimer <= 0) {
          playerState.isInvincible = false;
          invincibilityTimer = 0;
        }
      }

      // Systems Execution
      systems.inputSystem(world, input);
      systems.aiSystem(world);
      systems.physicsSystem(world, deltaTime);

      let playerHit = false;
      let goalReached = false;
      let stompedEnemies: Entity[] = [];
      let collectedCoins: Entity[] = [];

      systems.collisionSystem(
        world,
        () => { playerHit = true; },
        (enemy) => { stompedEnemies.push(enemy); },
        (coin) => { collectedCoins.push(coin); },
        () => { goalReached = true; }
      );

      if (playerHit) {
        lives -= 1;
        if (playerState) playerState.isInvincible = true;
        invincibilityTimer = INVINCIBILITY_DURATION;
        if (lives <= 0) {
          return { ...state, status: 'gameOver', lives: 0 };
        }
      }

      stompedEnemies.forEach(enemy => {
        world.entities.delete(enemy);
        const scoreVal = world.components.scoreValue.get(enemy);
        if (scoreVal) score += scoreVal.value;
      });

      collectedCoins.forEach(coin => {
        const coinState = world.components.state.get(coin);
        if (coinState) coinState.isCollected = true;
        const scoreVal = world.components.scoreValue.get(coin);
        if (scoreVal) score += scoreVal.value;
      });

      if (goalReached) {
        return { ...state, status: 'win' };
      }

      // Player fall off map
      const playerPos = world.components.position.get(playerEntity);
      if (playerPos && playerPos.y > LEVEL_HEIGHT * TILE_SIZE) {
        lives -= 1;
        if (lives <= 0) {
          return { ...state, status: 'gameOver', lives: 0 };
        }
        // Reset player position
        world.components.position.set(playerEntity, { x: TILE_SIZE * 2, y: TILE_SIZE * (LEVEL_HEIGHT - 4) });
        world.components.velocity.set(playerEntity, { vx: 0, vy: 0 });
      }

      // Camera
      const cameraX = playerPos ? Math.max(0, playerPos.x - window.innerWidth / 2) : state.cameraX;

      return { ...state, world, score, lives, time, invincibilityTimer, cameraX };
    });
  },
}));