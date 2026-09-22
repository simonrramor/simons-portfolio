'use client';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { isConstrainedConnection } from './network';

export default function CardVideo({
  enabled,
  forceLoad = false,
  src,
  ...props
}: ComponentProps<'video'> & { enabled: boolean; forceLoad?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(forceLoad);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const constrained = isConstrainedConnection();
    let visible = false;

    const update = () => {
      if (enabled && visible && !document.hidden && !reduced.matches) void video.play().catch(() => {});
      else video.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (enabled && visible && (!constrained || forceLoad)) setLoaded(true);
      update();
    }, { threshold: 0.05 });

    observer.observe(video);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    video.addEventListener('loadeddata', update);

    return () => {
      observer.disconnect();
      video.pause();
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
      video.removeEventListener('loadeddata', update);
    };
  }, [enabled, forceLoad]);

  const shouldLoad = loaded || forceLoad;
  return <video {...props} ref={ref} src={shouldLoad ? src : undefined} preload={shouldLoad ? 'metadata' : 'none'} />;
}
