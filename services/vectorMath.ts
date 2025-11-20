import { Vector } from '../types';

export const createVector = (x: number, y: number): Vector => ({ x, y });

export const add = (v1: Vector, v2: Vector): Vector => ({ x: v1.x + v2.x, y: v1.y + v2.y });

export const sub = (v1: Vector, v2: Vector): Vector => ({ x: v1.x - v2.x, y: v1.y - v2.y });

export const mult = (v: Vector, n: number): Vector => ({ x: v.x * n, y: v.y * n });

export const div = (v: Vector, n: number): Vector => ({ x: v.x / n, y: v.y / n });

export const mag = (v: Vector): number => Math.sqrt(v.x * v.x + v.y * v.y);

export const normalize = (v: Vector): Vector => {
  const m = mag(v);
  if (m !== 0) {
    return div(v, m);
  }
  return v;
};

export const limit = (v: Vector, max: number): Vector => {
  const mSq = v.x * v.x + v.y * v.y;
  if (mSq > max * max) {
    return mult(normalize(v), max);
  }
  return v;
};

export const dist = (v1: Vector, v2: Vector): number => {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const setMag = (v: Vector, n: number): Vector => {
  return mult(normalize(v), n);
};