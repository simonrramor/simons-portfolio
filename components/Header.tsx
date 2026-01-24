import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Simon Amor
      </div>
      
      <div className={styles.bio}>
        <p className={styles.bioText}>
          In Framer, this effect is achieved by{' '}
          <strong>mapping vertical scroll input to horizontal translation</strong>.
          There are two practical ways to do it, depending on whether you want a 
          no-code setup or a more precise, code-driven one.
        </p>
      </div>
    </header>
  );
}
