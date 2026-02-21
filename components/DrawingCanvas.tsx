'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
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

  const getPointOpacity = useCallback((pointTime: number, now: number): number => {
    const age = now - pointTime;
    const visibleDuration = 5000;
    const fadeDuration = 1000;

    if (age < visibleDuration) {
      return 1;
    } else if (age < visibleDuration + fadeDuration) {
      const fadeProgress = (age - visibleDuration) / fadeDuration;
      return 1 - fadeProgress;
    }
    return 0;
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, points: Point[], now: number) => {
    if (points.length === 0) return;

    if (points.length === 1) {
      const opacity = getPointOpacity(points[0].time, now);
      if (opacity <= 0) return;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.arc(points[0].x, points[0].y, 4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Group points by opacity buckets (0.1 increments) and draw as continuous paths
    let currentOpacityBucket = -1;
    let pathStartIndex = 0;

    for (let i = 0; i < points.length; i++) {
      const opacity = getPointOpacity(points[i].time, now);
      const opacityBucket = Math.floor(opacity * 10);

      if (opacityBucket !== currentOpacityBucket) {
        // Draw previous batch if exists
        if (i > pathStartIndex && currentOpacityBucket > 0) {
          const batchOpacity = (currentOpacityBucket + 0.5) / 10;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 0, 0, ${batchOpacity})`;
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.moveTo(points[pathStartIndex].x, points[pathStartIndex].y);
          for (let j = pathStartIndex + 1; j <= i; j++) {
            ctx.lineTo(points[j].x, points[j].y);
          }
          ctx.stroke();
        }
        
        currentOpacityBucket = opacityBucket;
        pathStartIndex = i;
      }
    }

    // Draw final batch
    if (pathStartIndex < points.length - 1 && currentOpacityBucket > 0) {
      const batchOpacity = (currentOpacityBucket + 0.5) / 10;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 0, 0, ${batchOpacity})`;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(points[pathStartIndex].x, points[pathStartIndex].y);
      for (let j = pathStartIndex + 1; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }
      ctx.stroke();
    }
  }, [getPointOpacity]);

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

    // Filter out fully faded strokes
    strokesRef.current = strokesRef.current.filter(stroke => {
      if (stroke.points.length === 0) return false;
      const lastPointTime = stroke.points[stroke.points.length - 1].time;
      return now - lastPointTime < 6000;
    });

    // Draw completed strokes
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke.points, now);
    }

    // Draw current stroke
    if (currentStrokeRef.current.length >= 1) {
      drawStroke(ctx, currentStrokeRef.current, now);
    }

    animationIdRef.current = requestAnimationFrame(renderStrokes);
  }, [drawStroke]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animationIdRef.current = requestAnimationFrame(renderStrokes);

    const handleMouseDown = (e: MouseEvent) => {
      if (isOverInteractive(e.target)) return;
      isDrawingRef.current = true;
      currentStrokeRef.current = [{ x: e.clientX, y: e.clientY, time: Date.now() }];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      currentStrokeRef.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (currentStrokeRef.current.length >= 1) {
        strokesRef.current.push({
          points: [...currentStrokeRef.current],
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
