'use client';

import { useEffect, useRef } from 'react';

export interface SynchronizedVideo {
  video: string;
  poster?: string;
  title?: string;
  backgroundColor?: string;
}

interface Props {
  videos: SynchronizedVideo[];
  activeIndex: number;
  initialTime: number;
  className: string;
}

export default function SynchronizedVideoGallery({ videos, activeIndex, initialTime, className }: Props) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const players = refs.current.filter((video): video is HTMLVideoElement => video !== null);
    if (players.length !== videos.length) return;
    const leader = players[0];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let disposed = false;
    let initialized = false;
    let playRejected = false;
    let phase: 'loading' | 'aligning' | 'playing' = 'loading';
    let lastSync = 0;

    const pause = () => {
      players.forEach(video => { video.pause(); video.playbackRate = 1; });
    };
    const play = () => {
      phase = 'playing';
      void Promise.all(players.map(video => video.play())).catch(() => {
        if (disposed || phase !== 'playing' || document.hidden || reduced.matches) return;
        playRejected = true;
        pause();
      });
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(tick);
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (document.hidden || reduced.matches || playRejected) {
        pause();
        phase = 'loading';
        return;
      }
      const ready = players.every(video => video.readyState >= 3 && !video.seeking && Number.isFinite(video.duration));
      if (!ready) {
        // A buffering player holds the pair; an intentional seek must finish
        // before another alignment is attempted.
        if (phase === 'playing') { pause(); phase = 'loading'; }
        schedule();
        return;
      }
      if (phase === 'loading') {
        const time = (initialized ? leader.currentTime : initialTime) % leader.duration;
        players.forEach(video => { video.currentTime = time; });
        initialized = true;
        phase = 'aligning';
      } else if (phase === 'aligning') {
        play();
      } else if (now - lastSync >= 125) {
        lastSync = now;
        for (const follower of players.slice(1)) {
          const duration = leader.duration;
          // Compare across the native loop boundary without treating 5.99/0.01
          // as a six-second drift. Small rate adjustments avoid repeated seeks.
          const delta = ((follower.currentTime - leader.currentTime + duration * 1.5) % duration) - duration / 2;
          if (Math.abs(delta) > 0.08) {
            pause();
            phase = 'loading';
            break;
          }
          follower.playbackRate = Math.abs(delta) < 0.008 ? 1 : delta > 0 ? 0.98 : 1.02;
        }
      }
      schedule();
    };
    const resume = () => {
      playRejected = false;
      if (document.hidden || reduced.matches) {
        // Hidden tabs suspend animation callbacks, so pause synchronously.
        cancelAnimationFrame(frame);
        frame = 0;
        pause();
        phase = 'loading';
      } else schedule();
    };
    const retryPlayback = () => {
      if (!playRejected || document.hidden || reduced.matches) return;
      playRejected = false;
      // Retry inside the gesture itself for browsers that deny autoplay.
      play();
      schedule();
    };
    players.forEach(video => { video.muted = true; });
    document.addEventListener('visibilitychange', resume);
    reduced.addEventListener('change', resume);
    document.addEventListener('pointerdown', retryPlayback);
    document.addEventListener('keydown', retryPlayback);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      pause();
      document.removeEventListener('visibilitychange', resume);
      reduced.removeEventListener('change', resume);
      document.removeEventListener('pointerdown', retryPlayback);
      document.removeEventListener('keydown', retryPlayback);
    };
  }, [videos, initialTime]);

  return videos.map((video, index) => (
    <video
      key={video.video}
      ref={element => { refs.current[index] = element; }}
      className={className}
      src={video.video}
      poster={video.poster}
      aria-label={video.title}
      aria-hidden={index !== activeIndex}
      preload="auto"
      muted
      playsInline
      loop
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
        backgroundColor: video.backgroundColor,
        opacity: index === activeIndex ? 1 : 0,
        pointerEvents: 'none',
      }}
    />
  ));
}
