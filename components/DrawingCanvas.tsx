'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import styles from './DrawingCanvas.module.css';

const COLORS = [
  '#0055FF', // Blue
  '#CCFF00', // Lime
  '#FF0080', // Pink
  '#FF6600', // Orange
];

interface Point {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  time: number;
  grounded: boolean;
}

interface Stroke {
  points: Point[];
  isPhysicsActive: boolean;
  settledTime: number | null;
  restLengths: number[];
  color: string;
}

const GRAVITY = 0.4;
const CONSTRAINT_ITERATIONS = 2;
const DAMPING = 0.98;
const SUB_STEPS = 2;
const SETTLED_VISIBLE_DURATION = 10000;
const FADE_DURATION = 2000;

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const animationIdRef = useRef<number>(0);
  const dprRef = useRef(1);
  const floorHeightmapRef = useRef<number[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const currentColorRef = useRef(COLORS[0]);
  const HEIGHTMAP_COLUMNS = 200;

  const initFloorHeightmap = useCallback(() => {
    const floorY = window.innerHeight;
    floorHeightmapRef.current = new Array(HEIGHTMAP_COLUMNS).fill(floorY);
  }, []);

  const getHeightmapIndex = useCallback((x: number): number => {
    const index = Math.floor((x / window.innerWidth) * HEIGHTMAP_COLUMNS);
    return Math.max(0, Math.min(HEIGHTMAP_COLUMNS - 1, index));
  }, []);

  const applyPhysics = useCallback((stroke: Stroke) => {
    if (!stroke.isPhysicsActive) return;

    for (const point of stroke.points) {
      if (point.grounded) continue;

      const vx = (point.x - point.prevX) * DAMPING;
      const vy = (point.y - point.prevY) * DAMPING;

      point.prevX = point.x;
      point.prevY = point.y;

      point.x += vx;
      point.y += vy + GRAVITY;
    }
  }, []);

  const applyConstraints = useCallback((stroke: Stroke) => {
    if (!stroke.isPhysicsActive) return;

    for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration++) {
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        const restLength = stroke.restLengths[i];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const currentLength = Math.sqrt(dx * dx + dy * dy);

        if (currentLength < 0.001) continue;

        const diff = (currentLength - restLength) / currentLength;
        const offsetX = dx * diff * 0.3;
        const offsetY = dy * diff * 0.3;

        if (!p1.grounded) {
          p1.x += offsetX;
          p1.y += offsetY;
        }
        if (!p2.grounded) {
          p2.x -= offsetX;
          p2.y -= offsetY;
        }
      }
    }
  }, []);

  const checkCollisions = useCallback((stroke: Stroke) => {
    if (!stroke.isPhysicsActive) return;

    for (const point of stroke.points) {
      if (point.grounded) continue;

      const heightmapIndex = getHeightmapIndex(point.x);
      const floorY = floorHeightmapRef.current[heightmapIndex];

      if (point.y >= floorY) {
        point.y = floorY;
        point.grounded = true;
        floorHeightmapRef.current[heightmapIndex] = floorY - 4;
      }
    }
  }, [getHeightmapIndex]);

  const checkIfSettled = useCallback((stroke: Stroke): boolean => {
    return stroke.points.every(point => point.grounded);
  }, []);

  const isOverInteractive = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest('a, button, [role="button"]');
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  const getStrokeOpacity = useCallback((stroke: Stroke, now: number): number => {
    if (!stroke.settledTime) {
      return 1;
    }
    
    const age = now - stroke.settledTime;
    
    if (age < SETTLED_VISIBLE_DURATION) {
      return 1;
    } else if (age < SETTLED_VISIBLE_DURATION + FADE_DURATION) {
      const fadeProgress = (age - SETTLED_VISIBLE_DURATION) / FADE_DURATION;
      return 1 - fadeProgress;
    }
    return 0;
  }, []);

  const hexToRgba = useCallback((hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);

  const drawStrokeWithOpacity = useCallback((ctx: CanvasRenderingContext2D, points: Point[], opacity: number, color: string) => {
    if (points.length === 0 || opacity <= 0) return;

    const rgbaColor = hexToRgba(color, opacity);

    if (points.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = rgbaColor;
      ctx.arc(points[0].x, points[0].y, 4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = rgbaColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }, [hexToRgba]);

  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const now = Date.now();

    // Apply physics with sub-stepping for smoother simulation
    for (let step = 0; step < SUB_STEPS; step++) {
      for (const stroke of strokesRef.current) {
        if (stroke.isPhysicsActive && !stroke.settledTime) {
          applyPhysics(stroke);
          applyConstraints(stroke);
          checkCollisions(stroke);
          
          if (checkIfSettled(stroke)) {
            stroke.settledTime = now;
          }
        }
      }
    }

    // Filter out fully faded strokes
    strokesRef.current = strokesRef.current.filter(stroke => {
      if (stroke.points.length === 0) return false;
      const opacity = getStrokeOpacity(stroke, now);
      return opacity > 0;
    });

    // Draw completed strokes
    for (const stroke of strokesRef.current) {
      const opacity = getStrokeOpacity(stroke, now);
      drawStrokeWithOpacity(ctx, stroke.points, opacity, stroke.color);
    }

    // Draw current stroke (while drawing)
    if (currentStrokeRef.current.length >= 1) {
      drawStrokeWithOpacity(ctx, currentStrokeRef.current, 1, currentColorRef.current);
    }

    animationIdRef.current = requestAnimationFrame(renderStrokes);
  }, [drawStrokeWithOpacity, applyPhysics, applyConstraints, checkCollisions, checkIfSettled, getStrokeOpacity]);

  useEffect(() => {
    resizeCanvas();
    initFloorHeightmap();
    
    const handleResize = () => {
      resizeCanvas();
      initFloorHeightmap();
    };
    
    window.addEventListener('resize', handleResize);

    animationIdRef.current = requestAnimationFrame(renderStrokes);

    const handleMouseDown = (e: MouseEvent) => {
      if (isOverInteractive(e.target)) return;
      isDrawingRef.current = true;
      currentStrokeRef.current = [{ 
        x: e.clientX, 
        y: e.clientY, 
        prevX: e.clientX,
        prevY: e.clientY,
        time: Date.now(),
        grounded: false
      }];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      
      const lastPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Only add point if moved at least 8px from last point
      if (dist >= 8) {
        currentStrokeRef.current.push({ 
          x: e.clientX, 
          y: e.clientY,
          prevX: e.clientX,
          prevY: e.clientY,
          time: Date.now(),
          grounded: false
        });
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (currentStrokeRef.current.length >= 1) {
        const points = [...currentStrokeRef.current];
        const restLengths: number[] = [];
        
        for (let i = 0; i < points.length - 1; i++) {
          const dx = points[i + 1].x - points[i].x;
          const dy = points[i + 1].y - points[i].y;
          restLengths.push(Math.sqrt(dx * dx + dy * dy));
        }

        strokesRef.current.push({
          points,
          isPhysicsActive: true,
          settledTime: null,
          restLengths,
          color: currentColorRef.current,
        });
      }
      currentStrokeRef.current = [];
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [resizeCanvas, renderStrokes, isOverInteractive, initFloorHeightmap]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    currentColorRef.current = color;
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
    />
  );
}
