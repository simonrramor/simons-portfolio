'use client';
import { useEffect, useRef, useState, type ComponentProps } from 'react';

export default function CardVideo({ enabled, src, ...props }: ComponentProps<'video'> & { enabled: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (enabled && visible && !document.hidden && !reduced.matches) void video.play().catch(() => {});
      else video.pause();
    };
    const nearby = new IntersectionObserver(([entry]) => {
      if (enabled && entry.isIntersecting) setLoaded(true);
    }, { rootMargin: '300px' });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    nearby.observe(video);
    observer.observe(video);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    video.addEventListener('loadeddata', update);
    return () => {
      nearby.disconnect(); observer.disconnect(); video.pause();
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
      video.removeEventListener('loadeddata', update);
    };
  }, [enabled]);
  return <video {...props} ref={ref} src={loaded ? src : undefined} preload="metadata" />;
}
