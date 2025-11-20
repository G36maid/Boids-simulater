export interface Vector {
  x: number;
  y: number;
}

export interface Boid {
  id: number;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  color: string;
}

export interface SimulationConfig {
  boidCount: number;
  perceptionRadius: number; // 感知半徑
  maxSpeed: number; // 最大速度
  maxForce: number; // 最大轉向力
  separationWeight: number; // 分離權重
  alignmentWeight: number; // 對齊權重
  cohesionWeight: number; // 凝聚權重
  targetWeight: number; // 目標跟隨權重
  showPerception: boolean; // 顯示感知範圍
}

export enum InteractionMode {
  NONE = 'NONE',
  SEEK = 'SEEK',   // 像 RTS 一樣移動到點
  SCATTER = 'SCATTER' // 驅散
}