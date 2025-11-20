import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Boid, InteractionMode, SimulationConfig, Vector } from '../types';
import * as VectorMath from '../services/vectorMath';

interface GameCanvasProps {
  config: SimulationConfig;
  mode: InteractionMode;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ config, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boidsRef = useRef<Boid[]>([]);
  const animationFrameRef = useRef<number>(0);
  const targetRef = useRef<Vector | null>(null);
  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  
  // Initialize Boids
  useEffect(() => {
    const count = config.boidCount;
    const currentBoids = boidsRef.current;
    
    if (currentBoids.length < count) {
      // Add more boids
      for (let i = currentBoids.length; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const vx = (Math.random() * 2 - 1) * config.maxSpeed;
        const vy = (Math.random() * 2 - 1) * config.maxSpeed;
        
        boidsRef.current.push({
          id: i,
          position: { x, y },
          velocity: { x: vx, y: vy },
          acceleration: { x: 0, y: 0 },
          color: `hsl(${Math.random() * 60 + 180}, 80%, 60%)` // Cyan/Blue range
        });
      }
    } else if (currentBoids.length > count) {
      // Remove boids
      boidsRef.current = currentBoids.slice(0, count);
    }
  }, [config.boidCount, config.maxSpeed]);

  // Main Physics & Render Loop
  const updateAndDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a'; // Slate 900
    ctx.fillRect(0, 0, width, height);

    // Draw grid (RTS style background)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Target Marker
    if (mode === InteractionMode.SEEK && targetRef.current) {
      const { x, y } = targetRef.current;
      
      // Pulse effect
      const time = Date.now() / 200;
      const radius = 10 + Math.sin(time) * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)'; // Emerald
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();
      
      // Draw line to ground if simulating 3D look, but here 2D top down
    }

    // Draw Predator/Scatter Marker
    if (mode === InteractionMode.SCATTER) {
        const { x, y } = mouseRef.current;
        ctx.beginPath();
        ctx.arc(x, y, config.perceptionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.2)'; // Rose
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Update and Draw Boids
    const snapshot = boidsRef.current; // Reference to mutable array for speed
    
    for (let i = 0; i < snapshot.length; i++) {
      const boid = snapshot[i];
      
      // 1. Reset Acceleration
      boid.acceleration = VectorMath.createVector(0, 0);

      // 2. Calculate Flocking Forces
      let steeringSeparation = VectorMath.createVector(0, 0);
      let steeringAlignment = VectorMath.createVector(0, 0);
      let steeringCohesion = VectorMath.createVector(0, 0);
      let totalLocal = 0;

      for (let j = 0; j < snapshot.length; j++) {
        if (i === j) continue;
        const other = snapshot[j];
        const d = VectorMath.dist(boid.position, other.position);

        if (d < config.perceptionRadius && d > 0) {
          // Separation
          let diff = VectorMath.sub(boid.position, other.position);
          diff = VectorMath.normalize(diff);
          diff = VectorMath.div(diff, d); // Weight by distance
          steeringSeparation = VectorMath.add(steeringSeparation, diff);

          // Alignment
          steeringAlignment = VectorMath.add(steeringAlignment, other.velocity);

          // Cohesion
          steeringCohesion = VectorMath.add(steeringCohesion, other.position);

          totalLocal++;
        }
      }

      if (totalLocal > 0) {
        // Finish Separation
        steeringSeparation = VectorMath.div(steeringSeparation, totalLocal);
        if (VectorMath.mag(steeringSeparation) > 0) {
           steeringSeparation = VectorMath.setMag(steeringSeparation, config.maxSpeed);
           steeringSeparation = VectorMath.sub(steeringSeparation, boid.velocity);
           steeringSeparation = VectorMath.limit(steeringSeparation, config.maxForce);
        }

        // Finish Alignment
        steeringAlignment = VectorMath.div(steeringAlignment, totalLocal);
        steeringAlignment = VectorMath.setMag(steeringAlignment, config.maxSpeed);
        steeringAlignment = VectorMath.sub(steeringAlignment, boid.velocity);
        steeringAlignment = VectorMath.limit(steeringAlignment, config.maxForce);

        // Finish Cohesion
        steeringCohesion = VectorMath.div(steeringCohesion, totalLocal);
        steeringCohesion = VectorMath.sub(steeringCohesion, boid.position);
        steeringCohesion = VectorMath.setMag(steeringCohesion, config.maxSpeed);
        steeringCohesion = VectorMath.sub(steeringCohesion, boid.velocity);
        steeringCohesion = VectorMath.limit(steeringCohesion, config.maxForce);
      }

      // Apply Weights
      const sepForce = VectorMath.mult(steeringSeparation, config.separationWeight);
      const aliForce = VectorMath.mult(steeringAlignment, config.alignmentWeight);
      const cohForce = VectorMath.mult(steeringCohesion, config.cohesionWeight);

      boid.acceleration = VectorMath.add(boid.acceleration, sepForce);
      boid.acceleration = VectorMath.add(boid.acceleration, aliForce);
      boid.acceleration = VectorMath.add(boid.acceleration, cohForce);

      // 3. Interactive Forces
      if (mode === InteractionMode.SEEK && targetRef.current) {
        const targetVec = VectorMath.sub(targetRef.current, boid.position);
        // Simple seek
        const distToTarget = VectorMath.mag(targetVec);
        
        // Arrive behavior (slow down when close)
        let desiredSpeed = config.maxSpeed;
        if (distToTarget < 100) {
            desiredSpeed = (distToTarget / 100) * config.maxSpeed;
        }
        
        let steerTarget = VectorMath.setMag(targetVec, desiredSpeed);
        steerTarget = VectorMath.sub(steerTarget, boid.velocity);
        steerTarget = VectorMath.limit(steerTarget, config.maxForce * 2); // Stronger seek
        
        boid.acceleration = VectorMath.add(boid.acceleration, VectorMath.mult(steerTarget, config.targetWeight));
      } else if (mode === InteractionMode.SCATTER) {
         const mouseVec = VectorMath.sub(boid.position, mouseRef.current);
         const d = VectorMath.mag(mouseVec);
         if (d < config.perceptionRadius * 1.5) {
             let steerScatter = VectorMath.setMag(mouseVec, config.maxSpeed);
             steerScatter = VectorMath.sub(steerScatter, boid.velocity);
             steerScatter = VectorMath.limit(steerScatter, config.maxForce * 3);
             boid.acceleration = VectorMath.add(boid.acceleration, steerScatter);
         }
      }

      // 4. Update Physics
      boid.velocity = VectorMath.add(boid.velocity, boid.acceleration);
      boid.velocity = VectorMath.limit(boid.velocity, config.maxSpeed);
      boid.position = VectorMath.add(boid.position, boid.velocity);

      // 5. Boundary Wrapping
      if (boid.position.x < -10) boid.position.x = width + 10;
      if (boid.position.x > width + 10) boid.position.x = -10;
      if (boid.position.y < -10) boid.position.y = height + 10;
      if (boid.position.y > height + 10) boid.position.y = -10;

      // 6. Draw Boid
      const theta = Math.atan2(boid.velocity.y, boid.velocity.x) + Math.PI / 2;
      
      ctx.save();
      ctx.translate(boid.position.x, boid.position.y);
      ctx.rotate(theta);
      
      // Boid Shape
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-3, 6);
      ctx.lineTo(0, 4); // notch
      ctx.lineTo(3, 6);
      ctx.closePath();
      
      ctx.fillStyle = boid.color;
      ctx.fill();
      
      // Optional Perception Circle (Debug)
      if (config.showPerception && i === 0) { // Only draw for one to save performance
         ctx.beginPath();
         ctx.arc(0, 0, config.perceptionRadius, 0, Math.PI * 2);
         ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
         ctx.stroke();
      }

      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);
  }, [config, mode]); // Re-create loop if config changes drastically or mode changes

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [updateAndDraw]);


  // Window Resize Handling
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Input Handling
  const handleMouseDown = (e: React.MouseEvent) => {
     if (mode === InteractionMode.SEEK) {
         const rect = canvasRef.current?.getBoundingClientRect();
         if (!rect) return;
         targetRef.current = {
             x: e.clientX - rect.left,
             y: e.clientY - rect.top
         };
     }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
      
      // For Scatter mode, we update continuously. 
      // For Seek, we support dragging too if mouse is down
      if (mode === InteractionMode.SEEK && e.buttons === 1) {
           targetRef.current = mouseRef.current;
      }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full cursor-crosshair touch-none ${mode === InteractionMode.SCATTER ? 'cursor-not-allowed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      // Mobile touch support could be added here
    />
  );
};

export default GameCanvas;