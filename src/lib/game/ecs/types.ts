import { BlockType } from '@/lib/game/types';
export type Entity = number;
// COMPONENTS
export interface PositionComponent {
  x: number;
  y: number;
}
export interface VelocityComponent {
  vx: number;
  vy: number;
}
export type RenderableType = 'player' | 'enemy' | BlockType;
export interface RenderableComponent {
  type: RenderableType;
}
export interface PlayerControlledComponent {
  // Marker component
}
export interface PhysicsComponent {
  onGround: boolean;
}
export interface AIControlledComponent {
  initialX: number;
  direction: 'left' | 'right';
}
export interface CollisionComponent {
  width: number;
  height: number;
}
export interface StateComponent {
  direction?: 'left' | 'right';
  isInvincible?: boolean;
  isJumping?: boolean;
  isCollected?: boolean;
}
export interface ScoreValueComponent {
  value: number;
}
export interface GoalComponent {
  // Marker component
}
// WORLD
export interface World {
  entities: Set<Entity>;
  nextEntityId: number;
  components: {
    position: Map<Entity, PositionComponent>;
    velocity: Map<Entity, VelocityComponent>;
    renderable: Map<Entity, RenderableComponent>;
    playerControlled: Map<Entity, PlayerControlledComponent>;
    physics: Map<Entity, PhysicsComponent>;
    aiControlled: Map<Entity, AIControlledComponent>;
    collision: Map<Entity, CollisionComponent>;
    state: Map<Entity, StateComponent>;
    scoreValue: Map<Entity, ScoreValueComponent>;
    goal: Map<Entity, GoalComponent>;
  };
}