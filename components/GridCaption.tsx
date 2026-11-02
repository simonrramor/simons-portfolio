'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ProjectGrid.module.css';

// Compare black and white against the pixels directly behind the title.
export default function GridCaption({ title }: { title: string }) {
  const label = useRef<HTMLSpanElement>(null);
  const [color, setColor] = useState<'#000' | '#fff'>('#fff');

  useEffect(() => {
    const text = label.current;
    const tile = text?.closest('button, a');
    const media = tile?.querySelector<HTMLElement>(`.${styles.media}`);
    const asset = media?.querySelector<HTMLVideoElement>('video') || media?.querySelector<HTMLImageElement>('img');
    if (!text || !media) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    let visible = false;

    const sample = () => {
      if (!visible) return;
      const bounds = media.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const scale = 192 / bounds.width;
      canvas.width = 192;
      canvas.height = Math.ceil(bounds.height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const background = getComputedStyle(media);
      ctx.fillStyle = background.backgroundColor;
      ctx.fillRect(0, 0, bounds.width, bounds.height);
      const colors = background.backgroundImage.match(/rgba?\([^)]+\)/g);
      if (colors?.length) {
        const gradient = ctx.createLinearGradient(0, 0, bounds.width, bounds.height);
        colors.forEach((value, index) => gradient.addColorStop(index / Math.max(1, colors.length - 1), value));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, bounds.width, bounds.height);
      }
      const width = asset instanceof HTMLVideoElement ? asset.videoWidth : asset?.naturalWidth;
      const height = asset instanceof HTMLVideoElement ? asset.videoHeight : asset?.naturalHeight;
      if (asset && width && height) {
        const style = getComputedStyle(asset);
        const boxWidth = bounds.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const boxHeight = bounds.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const ratio = style.objectFit === 'contain' ? Math.min(boxWidth / width, boxHeight / height) : Math.max(boxWidth / width, boxHeight / height);
        const [px, py] = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
        const x = parseFloat(style.paddingLeft) + (boxWidth - width * ratio) * (px || 0);
        const y = parseFloat(style.paddingTop) + (boxHeight - height * ratio) * (py || 0);
        try {
          if (asset.dataset.atlas === 'heat-map') ctx.drawImage(asset, width / 2, 0, width / 2, height / 2, 0, 0, bounds.width, bounds.height);
          else ctx.drawImage(asset, x, y, width * ratio, height * ratio);
        } catch { return; }
      }
      const area = text.getBoundingClientRect();
      const x = Math.max(0, Math.floor((area.left - bounds.left) * scale));
      const y = Math.max(0, Math.floor((area.top - bounds.top) * scale));
      const w = Math.min(canvas.width - x, Math.max(1, Math.ceil(area.width * scale)));
      const h = Math.min(canvas.height - y, Math.max(1, Math.ceil(area.height * scale)));
      if (w <= 0 || h <= 0) return;
      try {
        const { data } = ctx.getImageData(x, y, w, h);
        let luminance = 0;
        const linear = (channel: number) => { const s = channel / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        for (let i = 0; i < data.length; i += 4) luminance += 0.2126 * linear(data[i]) + 0.7152 * linear(data[i + 1]) + 0.0722 * linear(data[i + 2]);
        luminance /= data.length / 4;
        const blackContrast = (luminance + 0.05) / 0.05;
        const whiteContrast = 1.05 / (luminance + 0.05);
        setColor(blackContrast >= whiteContrast ? '#000' : '#fff');
      } catch { /* Keep the initial colour if a media source cannot be sampled. */ }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sample(); });
    observer.observe(media);
    const resize = new ResizeObserver(sample);
    resize.observe(media);
    asset?.addEventListener('load', sample);
    asset?.addEventListener('loadeddata', sample);
    const timer = window.setInterval(sample, 1500);
    return () => {
      observer.disconnect(); resize.disconnect(); window.clearInterval(timer);
      asset?.removeEventListener('load', sample); asset?.removeEventListener('loadeddata', sample);
    };
  }, [title]);

  return <span className={styles.caption} style={{ color }}><span ref={label}>{title}</span></span>;
}
