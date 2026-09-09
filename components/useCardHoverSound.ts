'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

// Card 6's digital pip, shared by every card without audio downloads.
const HOVER_SOUND = { frequency: 650, end: 650, duration: .045, type: 'triangle' as OscillatorType };

const subscribe = (callback: () => void) => {
  window.addEventListener('portfolio-sound', callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener('portfolio-sound', callback); window.removeEventListener('storage', callback); };
};
const readMuted = () => { try { return localStorage.getItem('portfolio-muted') === 'true'; } catch { return false; } };
export function useCardHoverSound() {
  const muted = useSyncExternalStore(subscribe, readMuted, () => false);
  const toggleMuted = () => {
    try { localStorage.setItem('portfolio-muted', String(!readMuted())); } catch {}
    window.dispatchEvent(new Event('portfolio-sound'));
  };
  const context = useRef<AudioContext | null>(null);
  const lastPlayed = useRef(-Infinity);

  useEffect(() => {
    // Prepare the audio engine before the first interaction; playback still waits for a gesture.
    try { context.current = new AudioContext({ latencyHint: 'interactive' }); } catch {}
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

  const playSound = useCallback(() => {
    if (readMuted()) return true;
    const audio = context.current;
    if (!audio || audio.state !== 'running' || document.hidden) return false;
    const now = audio.currentTime;
    if (now - lastPlayed.current < .08) return false;
    lastPlayed.current = now;
    const sound = HOVER_SOUND;
    const voice = (multiple: number, volume: number) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency * multiple, now);
      oscillator.frequency.exponentialRampToValueAtTime(sound.end * multiple, now + sound.duration);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, now + sound.duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + sound.duration + .01);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    };
    voice(1, .055);
    return true;
  }, []);

  return { playSound, muted, toggleMuted };
}
