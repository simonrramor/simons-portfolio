'use client';

import styles from './Header.module.css';

interface HeaderProps {
  showWork: boolean;
  onViewWork: () => void;
}

export default function Header({ showWork, onViewWork }: HeaderProps) {
  return (
    <header className={`${styles.header} ${showWork ? styles.headerTop : styles.headerCentered}`}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          Simon Amor
        </div>

        {!showWork && (
          <button className={styles.viewWorkButton} onClick={onViewWork}>
            View Work
          </button>
        )}
        
        <div className={styles.bio}>
          <p className={styles.bioText}>
            London based designer and Co-Founder of{' '}
            <a href="https://slingmoney.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Sling Money
            </a>
            . Previously building at{' '}
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Spotify
            </a>
            ,{' '}
            <a href="https://monzo.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Monzo
            </a>
            ,{' '}
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
              Google
            </a>
            {' '}and more. This isn&apos;t a portfolio. It&apos;s a personal playground. A space to test ideas and build without an outcome in mind.
          </p>
        </div>
      </div>
    </header>
  );
}
