'use client';

import { useCallback, useEffect, useRef } from 'react';

// Card 6's digital pip, shared by every card without audio downloads.
const HOVER_SOUND = { frequency: 650, end: 650, duration: .045, type: 'triangle' as OscillatorType };

export function useCardHoverSound(showWork = false) {
  const previousShowWork = useRef(showWork);
  const context = useRef<AudioContext | null>(null);
  const lastPlayed = useRef(-Infinity);

  useEffect(() => {
    const unlock = () => {
      try {
        context.current ??= new AudioContext();
        if (context.current.state === 'suspended') void context.current.resume().catch(() => {});
      } catch { /* Audio is optional when unavailable or blocked. */ }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      void context.current?.close().catch(() => {});
      context.current = null;
    };
  }, []);

  const playSound = useCallback((reveal = false) => {
    const audio = context.current;
    if (!audio || audio.state !== 'running' || document.hidden) return;
    const now = audio.currentTime;
    if (now - lastPlayed.current < .08) return;
    lastPlayed.current = now;
    const sound = reveal ? { ...HOVER_SOUND, duration: .18 } : HOVER_SOUND;
    const voice = (multiple: number, volume: number) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency * multiple, now);
      oscillator.frequency.exponentialRampToValueAtTime(sound.end * multiple, now + sound.duration);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + (reveal ? .012 : .004));
      gain.gain.exponentialRampToValueAtTime(.0001, now + sound.duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + sound.duration + .01);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    };
    voice(1, reveal ? .04 : .055);
  }, []);

  useEffect(() => {
    const justOpened = showWork && !previousShowWork.current;
    previousShowWork.current = showWork;
    if (!justOpened) return;
    const audio = context.current;
    if (!audio) return;
    // Wait for the initiating click to unlock audio, without delaying the visuals.
    if (audio.state === 'suspended') {
      void audio.resume().then(() => playSound(true)).catch(() => {});
    } else {
      playSound(true);
    }
  }, [showWork, playSound]);

  return useCallback(() => playSound(), [playSound]);
}
