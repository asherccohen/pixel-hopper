import { World, Entity } from './types';
import {
  GRAVITY,
  PLAYER_SPEED,
  JUMP_FORCE,
  MAX_FALL_SPEED,
  ENEMY_SPEED,
  ENEMY_PATROL_RANGE,
  TILE_SIZE,
} from '@/lib/game/constants';
// Input System: Handles player input
export function inputSystem(world: World, input: { left: boolean; right: boolean; jump: boolean }): void {
  for (const entity of world.components.playerControlled.keys()) {
    const velocity = world.components.velocity.get(entity);
    const physics = world.components.physics.get(entity);
    const state = world.components.state.get(entity);
    if (velocity && state) {
      velocity.vx = 0;
      if (input.left) {
        velocity.vx = -PLAYER_SPEED;
        state.direction = 'left';
      }
      if (input.right) {
        velocity.vx = PLAYER_SPEED;
        state.direction = 'right';
      }
    }
    if (velocity && physics && state && input.jump && physics.onGround) {
      velocity.vy = -JUMP_FORCE;
      physics.onGround = false;
      state.isJumping = true;
    }
  }
}
// AI System: Controls enemy movement
export function aiSystem(world: World): void {
  for (const [entity, ai] of world.components.aiControlled.entries()) {
    const position = world.components.position.get(entity);
    const velocity = world.components.velocity.get(entity);
    if (position && velocity) {
      if (position.x < ai.initialX - ENEMY_PATROL_RANGE) {
        velocity.vx = ENEMY_SPEED;
        ai.direction = 'right';
      } else if (position.x > ai.initialX + ENEMY_PATROL_RANGE) {
        velocity.vx = -ENEMY_SPEED;
        ai.direction = 'left';
      }
    }
  }
}
// Physics System: Applies gravity and updates positions
export function physicsSystem(world: World, deltaTime: number): void {
  for (const entity of world.entities) {
    const velocity = world.components.velocity.get(entity);
    const position = world.components.position.get(entity);
    if (velocity && position) {
      // Apply gravity
      velocity.vy += GRAVITY * deltaTime;
      if (velocity.vy > MAX_FALL_SPEED) {
        velocity.vy = MAX_FALL_SPEED;
      }
      // Update position
      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;
    }
  }
}
// Collision System: Handles interactions between entities
export function collisionSystem(world: World, onPlayerHit: () => void, onEnemyStomp: (enemy: Entity) => void, onCoinCollect: (coin: Entity) => void, onGoalReached: () => void): void {
  const playerEntities = Array.from(world.components.playerControlled.keys());
  if (playerEntities.length === 0) return;
  const player = playerEntities[0];
  const playerPos = world.components.position.get(player);
  const playerVel = world.components.velocity.get(player);
  const playerCol = world.components.collision.get(player);
  const playerState = world.components.state.get(player);
  const playerPhysics = world.components.physics.get(player);
  if (!playerPos || !playerVel || !playerCol || !playerState || !playerPhysics) return;
  const playerBounds = {
    left: playerPos.x + (TILE_SIZE - playerCol.width) / 2,
    right: playerPos.x + (TILE_SIZE - playerCol.width) / 2 + playerCol.width,
    top: playerPos.y,
    bottom: playerPos.y + playerCol.height,
  };
  let onGround = false;
  // Player vs. Static Colliders (ground, blocks)
  for (const [entity, collision] of world.components.collision.entries()) {
    if (entity === player) continue;
    if (world.components.aiControlled.has(entity)) continue; // Skip enemies for now
    const blockPos = world.components.position.get(entity);
    const blockRenderable = world.components.renderable.get(entity);
    if (!blockPos || !blockRenderable) continue;
    const blockBounds = {
      left: blockPos.x,
      right: blockPos.x + collision.width,
      top: blockPos.y,
      bottom: blockPos.y + collision.height,
    };
    if (
      playerBounds.right > blockBounds.left &&
      playerBounds.left < blockBounds.right &&
      playerBounds.bottom > blockBounds.top &&
      playerBounds.top < blockBounds.bottom
    ) {
      if (world.components.goal.has(entity)) {
        onGoalReached();
        return;
      }
      const blockState = world.components.state.get(entity);
      if (blockRenderable.type === 'coin-block' && blockState && !blockState.isCollected) {
        if (playerVel.vy < 0 && playerBounds.top < blockBounds.bottom && playerPos.y + playerCol.height > blockBounds.bottom) {
          onCoinCollect(entity);
          playerVel.vy = 0;
          playerPos.y = blockBounds.bottom;
        }
      }
      if (blockRenderable.type === 'ground' || (blockRenderable.type === 'coin-block' && blockState?.isCollected)) {
        const prevPlayerBottom = playerBounds.bottom - playerVel.vy * 0.016; // Approx last frame
        if (playerVel.vy >= 0 && prevPlayerBottom <= blockBounds.top) {
          playerPos.y = blockBounds.top - playerCol.height;
          playerVel.vy = 0;
          onGround = true;
          if (playerState.isJumping) playerState.isJumping = false;
        } else if (playerVel.vy < 0 && playerPos.y >= blockBounds.bottom) {
          playerPos.y = blockBounds.bottom;
          playerVel.vy = 0;
        } else if (playerVel.vx > 0 && playerBounds.right > blockBounds.left) {
          playerPos.x = blockBounds.left - playerCol.width - (TILE_SIZE - playerCol.width) / 2;
          playerVel.vx = 0;
        } else if (playerVel.vx < 0 && playerBounds.left < blockBounds.right) {
          playerPos.x = blockBounds.right - (TILE_SIZE - playerCol.width) / 2;
          playerVel.vx = 0;
        }
      }
    }
  }
  playerPhysics.onGround = onGround;
  // Player vs. Enemy Collision
  if (!playerState.isInvincible) {
    for (const [enemy, ai] of world.components.aiControlled.entries()) {
      const enemyPos = world.components.position.get(enemy);
      const enemyCol = world.components.collision.get(enemy);
      if (!enemyPos || !enemyCol) continue;
      const enemyBounds = {
        left: enemyPos.x,
        right: enemyPos.x + enemyCol.width,
        top: enemyPos.y,
        bottom: enemyPos.y + enemyCol.height,
      };
      if (
        playerBounds.right > enemyBounds.left &&
        playerBounds.left < enemyBounds.right &&
        playerBounds.bottom > enemyBounds.top &&
        playerBounds.top < enemyBounds.bottom
      ) {
        if (playerVel.vy > 0 && playerBounds.bottom < enemyBounds.top + TILE_SIZE / 2) {
          onEnemyStomp(enemy);
          playerVel.vy = -JUMP_FORCE / 2; // Bounce
        } else {
          onPlayerHit();
        }
      }
    }
  }
}