import Image from 'next/image';
import styles from './CardSlider.module.css';

interface CardLogoProps {
  src: string;
  height?: number;
}

export default function CardLogo({ src, height = 32 }: CardLogoProps) {
  return (
    <Image
      className={styles.cardLogo}
      src={src}
      alt="Logo"
      width={120}
      height={height}
      style={{ height: height, width: 'auto' }}
    />
  );
}
