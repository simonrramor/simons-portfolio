import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Simon Amor
      </div>
      
      <div className={styles.bio}>
        <p className={styles.bioText}>
          London based designer and Co-Founder of{' '}
          <a href="https://slingmoney.com" target="_blank" rel="noopener noreferrer" className={styles.bioLink}>
            Sling Money
          </a>
          . I was previously building at{' '}
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
          {' '}and more.
        </p>
      </div>
    </header>
  );
}
