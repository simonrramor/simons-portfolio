import styles from './ProjectFooter.module.css';

export default function ProjectFooter({ inset = false }: { inset?: boolean }) {
  return (
    <footer className={`${styles.footer} ${inset ? styles.inset : ''}`} aria-label="Contact">
      <div>
        <p className={styles.invitation}>Reach out to connect<br />or collaborate</p>
        <a className={styles.email} href="mailto:hello@simonamor.design">hello@simonamor.design</a>
      </div>
      <nav className={styles.socials} aria-label="Social links">
        <a href="https://twitter.com/simonramor" target="_blank" rel="me noopener noreferrer">Twitter</a>
        <a href="https://www.instagram.com/simonramor/" target="_blank" rel="me noopener noreferrer">Instagram</a>
        <a href="https://www.linkedin.com/in/simon-amor/" target="_blank" rel="me noopener noreferrer">LinkedIn</a>
      </nav>
    </footer>
  );
}
