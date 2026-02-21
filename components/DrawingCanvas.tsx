'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  createdAt: number;
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const animationIdRef = useRef<number>(0);
  const dprRef = useRef(1);

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

  const getOpacity = useCallback((createdAt: number, now: number): number => {
    const age = now - createdAt;
    const visibleDuration = 10000;
    const fadeDuration = 5000;

    if (age < visibleDuration) {
      return 1;
    } else if (age < visibleDuration + fadeDuration) {
      const fadeProgress = (age - visibleDuration) / fadeDuration;
      return 1 - fadeProgress;
    }
    return 0;
  }, []);

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

    strokesRef.current = strokesRef.current.filter(stroke => {
      const age = now - stroke.createdAt;
      return age < 15000;
    });

    for (const stroke of strokesRef.current) {
      const opacity = getOpacity(stroke.createdAt, now);
      if (opacity <= 0 || stroke.points.length < 1) continue;

      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.arc(stroke.points[0].x, stroke.points[0].y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    }

    if (currentStrokeRef.current.length >= 1) {
      if (currentStrokeRef.current.length === 1) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.arc(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y);
        for (let i = 1; i < currentStrokeRef.current.length; i++) {
          ctx.lineTo(currentStrokeRef.current[i].x, currentStrokeRef.current[i].y);
        }
        ctx.stroke();
      }
    }

    animationIdRef.current = requestAnimationFrame(renderStrokes);
  }, [getOpacity]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animationIdRef.current = requestAnimationFrame(renderStrokes);

    const handleMouseDown = (e: MouseEvent) => {
      if (isOverInteractive(e.target)) return;
      isDrawingRef.current = true;
      currentStrokeRef.current = [{ x: e.clientX, y: e.clientY }];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      currentStrokeRef.current.push({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (currentStrokeRef.current.length >= 1) {
        strokesRef.current.push({
          points: [...currentStrokeRef.current],
          createdAt: Date.now(),
        });
      }
      currentStrokeRef.current = [];
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [resizeCanvas, renderStrokes, isOverInteractive]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
    />
  );
}
