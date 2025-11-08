import { create } from 'zustand';
import { GameState, GameActions, BlockType, LevelBlock, EnemyState } from './types';
import {
  TILE_SIZE,
  GRAVITY,
  PLAYER_SPEED,
  JUMP_FORCE,
  MAX_FALL_SPEED,
  ENEMY_SPEED,
  ENEMY_PATROL_RANGE,
  INITIAL_LIVES,
  INITIAL_TIME,
  INVINCIBILITY_DURATION,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
} from './constants';
import { level1Data } from './levels';
const getInitialState = (): GameState => {
  const level: LevelBlock[][] = [];
  const enemies: EnemyState[] = [];
  let enemyIdCounter = 0;
  level1Data.forEach((row, y) => {
    const newRow: LevelBlock[] = [];
    row.forEach((tile, x) => {
      let type: BlockType = 'air';
      if (tile === 1) type = 'ground';
      if (tile === 2) type = 'coin-block';
      if (tile === 9) type = 'goal';
      if (tile === 3) {
        enemies.push({
          id: enemyIdCounter++,
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
          vx: -ENEMY_SPEED,
          initialX: x * TILE_SIZE,
          direction: 'left',
        });
      }
      newRow.push({ type, x: x * TILE_SIZE, y: y * TILE_SIZE, id: `${x}-${y}` });
    });
    level.push(newRow);
  });
  return {
    status: 'startScreen',
    player: {
      x: TILE_SIZE * 2,
      y: TILE_SIZE * (LEVEL_HEIGHT - 4),
      vx: 0,
      vy: 0,
      onGround: false,
      direction: 'right',
      isInvincible: false,
      isJumping: false,
    },
    enemies,
    level,
    cameraX: 0,
    score: 0,
    lives: INITIAL_LIVES,
    time: INITIAL_TIME,
    invincibilityTimer: 0,
  };
};
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),
  startGame: () => {
    set({ status: 'playing' });
  },
  resetGame: () => {
    set(getInitialState());
  },
  togglePause: () => {
    const status = get().status;
    if (status === 'playing') {
      set({ status: 'paused' });
    } else if (status === 'paused') {
      set({ status: 'playing' });
    }
  },
  update: (deltaTime, input) => {
    const state = get();
    if (state.status !== 'playing') return;
    let { player, enemies, score, lives, level, invincibilityTimer, time } = state;
    // -- TIMER --
    time -= deltaTime;
    if (time <= 0) {
      set({ status: 'gameOver', time: 0 });
      return;
    }
    // -- INVINCIBILITY --
    if (player.isInvincible) {
      invincibilityTimer -= deltaTime;
      if (invincibilityTimer <= 0) {
        player = { ...player, isInvincible: false };
      }
    }
    // -- PLAYER MOVEMENT --
    player.vx = 0;
    if (input.left) {
      player.vx = -PLAYER_SPEED;
      player.direction = 'left';
    }
    if (input.right) {
      player.vx = PLAYER_SPEED;
      player.direction = 'right';
    }
    // -- PLAYER JUMP --
    if (input.jump && player.onGround) {
      player.vy = -JUMP_FORCE;
      player.onGround = false;
      player.isJumping = true;
    }
    // -- APPLY GRAVITY --
    player.vy += GRAVITY * deltaTime;
    if (player.vy > MAX_FALL_SPEED) {
      player.vy = MAX_FALL_SPEED;
    }
    // -- CALCULATE NEW POSITIONS --
    const newPlayerX = player.x + player.vx * deltaTime;
    const newPlayerY = player.y + player.vy * deltaTime;
    // -- COLLISION DETECTION --
    const playerSize = TILE_SIZE * 0.8;
    const playerBounds = {
      top: newPlayerY,
      bottom: newPlayerY + playerSize,
      left: newPlayerX + (TILE_SIZE - playerSize) / 2,
      right: newPlayerX + (TILE_SIZE - playerSize) / 2 + playerSize,
    };
    let onGround = false;
    let correctedX = newPlayerX;
    let correctedY = newPlayerY;
    const startCol = Math.max(0, Math.floor(playerBounds.left / TILE_SIZE) - 1);
    const endCol = Math.min(LEVEL_WIDTH - 1, Math.ceil(playerBounds.right / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(playerBounds.top / TILE_SIZE) - 1);
    const endRow = Math.min(LEVEL_HEIGHT - 1, Math.ceil(playerBounds.bottom / TILE_SIZE) + 1);
    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const block = level[y]?.[x];
        if (!block || block.type === 'air') continue;
        const blockBounds = {
          top: block.y,
          bottom: block.y + TILE_SIZE,
          left: block.x,
          right: block.x + TILE_SIZE,
        };
        if (
          playerBounds.right > blockBounds.left &&
          playerBounds.left < blockBounds.right &&
          playerBounds.bottom > blockBounds.top &&
          playerBounds.top < blockBounds.bottom
        ) {
          if (block.type === 'goal') {
            set({ status: 'win' });
            return;
          }
          if (block.type === 'coin-block' && !block.isCollected) {
            // Head-bonk coin block
            if (player.vy < 0 && playerBounds.top < blockBounds.bottom && player.y + playerSize > blockBounds.bottom) {
               level[y][x] = { ...block, isCollected: true };
               score += 100;
               player.vy = 0;
               correctedY = blockBounds.bottom;
            }
          }
          if (block.type === 'ground' || (block.type === 'coin-block' && block.isCollected)) {
            // Vertical collision
            if (player.vy > 0 && player.y + playerSize <= blockBounds.top) {
              correctedY = blockBounds.top - playerSize;
              player.vy = 0;
              onGround = true;
              player.isJumping = false;
            } else if (player.vy < 0 && player.y >= blockBounds.bottom) {
              correctedY = blockBounds.bottom;
              player.vy = 0;
            }
            // Horizontal collision
            const tempPlayerBounds = { ...playerBounds, top: correctedY, bottom: correctedY + playerSize };
             if (
                tempPlayerBounds.right > blockBounds.left &&
                tempPlayerBounds.left < blockBounds.right &&
                tempPlayerBounds.bottom > blockBounds.top &&
                tempPlayerBounds.top < blockBounds.bottom
            ) {
                if (player.vx > 0 && player.x + playerSize <= blockBounds.left) {
                    correctedX = blockBounds.left - playerSize - (TILE_SIZE - playerSize) / 2;
                    player.vx = 0;
                } else if (player.vx < 0 && player.x >= blockBounds.right) {
                    correctedX = blockBounds.right - (TILE_SIZE - playerSize) / 2;
                    player.vx = 0;
                }
            }
          }
        }
      }
    }
    player.x = correctedX;
    player.y = correctedY;
    player.onGround = onGround;
    if (onGround) {
      player.isJumping = false;
    }
    // Fall off map
    if (player.y > LEVEL_HEIGHT * TILE_SIZE) {
      lives -= 1;
      if (lives <= 0) {
        set({ status: 'gameOver', lives: 0 });
        return;
      }
      const newInitialState = getInitialState();
      player = newInitialState.player;
    }
    // -- ENEMY LOGIC --
    const newEnemies = enemies.map(enemy => {
      // Apply gravity to enemies
      enemy.y += (GRAVITY / 4) * deltaTime;
      // Simple patrol AI
      if (enemy.x < enemy.initialX - ENEMY_PATROL_RANGE) {
        enemy.vx = ENEMY_SPEED;
        enemy.direction = 'right';
      } else if (enemy.x > enemy.initialX + ENEMY_PATROL_RANGE) {
        enemy.vx = -ENEMY_SPEED;
        enemy.direction = 'left';
      }
      const newEnemyX = enemy.x + enemy.vx * deltaTime;
      let newEnemyY = enemy.y;
      // Enemy collision with ground
      const enemyTileX = Math.floor((newEnemyX + TILE_SIZE / 2) / TILE_SIZE);
      const enemyTileY = Math.floor((newEnemyY + TILE_SIZE) / TILE_SIZE);
      if (level[enemyTileY]?.[enemyTileX]?.type === 'ground') {
        newEnemyY = enemyTileY * TILE_SIZE - TILE_SIZE;
      }
      return { ...enemy, x: newEnemyX, y: newEnemyY };
    }).filter(Boolean) as EnemyState[];
    // -- PLAYER-ENEMY COLLISION --
    let enemiesAfterCollision = [...newEnemies];
    if (!player.isInvincible) {
      for (const enemy of newEnemies) {
        const enemyBounds = {
          left: enemy.x,
          right: enemy.x + TILE_SIZE,
          top: enemy.y,
          bottom: enemy.y + TILE_SIZE,
        };
        if (
          playerBounds.right > enemyBounds.left &&
          playerBounds.left < enemyBounds.right &&
          playerBounds.bottom > enemyBounds.top &&
          playerBounds.top < enemyBounds.bottom
        ) {
          // Stomp
          if (player.vy > 0 && playerBounds.bottom < enemyBounds.top + TILE_SIZE / 2) {
            enemiesAfterCollision = enemiesAfterCollision.filter(e => e.id !== enemy.id);
            score += 200;
            player.vy = -JUMP_FORCE / 2; // small bounce
          } else {
            // Hit
            lives -= 1;
            player.isInvincible = true;
            invincibilityTimer = INVINCIBILITY_DURATION;
            if (lives <= 0) {
              set({ status: 'gameOver', lives: 0 });
              return;
            }
          }
        }
      }
    }
    // -- CAMERA --
    const cameraX = Math.max(0, player.x - window.innerWidth / 2);
    set({
      player,
      enemies: enemiesAfterCollision,
      score,
      lives,
      level,
      cameraX,
      invincibilityTimer,
      time,
    });
  },
}));