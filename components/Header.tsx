import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Simon Amor
      </div>
      
      <div className={styles.bio}>
        <p className={styles.bioText}>
          London based designer and Co-Founder of Sling Money
        </p>
      </div>
    </header>
  );
}
