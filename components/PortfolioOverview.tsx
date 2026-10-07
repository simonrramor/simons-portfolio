import Link from 'next/link';
import styles from './PortfolioOverview.module.css';

export default function PortfolioOverview() {
  return (
    <section className={styles.pane} aria-label="About Simon Amor">
      <div className={styles.session}>simon@portfolio:~ / about</div>
      <div className={styles.output}>
        <div className={styles.command}>$ whoami</div>
        <h1 id="profile">Simon Amor</h1>
        <p>Designer and co-founder of Morse.<br />Previously at Spotify and Monzo.</p>
        <p>I’ve built products for Google, Android, YouTube and NatWest.</p>

        <div className={styles.command}>$ ls work/</div>
        <h2>Product design</h2>
        <dl>
          <div><dt>Morse</dt><dd>Cards, investments, savings, bill splits, bill pay and growth.</dd></div>
          <div><dt>Sling</dt><dd>International payments.</dd></div>
          <div><dt>Spotify</dt><dd>Music discovery, shared listening, privacy controls and offline listening.</dd></div>
          <div><dt>Monzo</dt><dd>Everyday banking, shared tabs, salary sorting, bills pots and paid accounts.</dd></div>
        </dl>
        <div className={styles.command}>$ ls fun/</div>
        <h2>Personal experiments</h2>
        <p>Interactive visuals, music, wine, face tracking and interface concepts. This terminal is one of them.</p>

        <div className={styles.command}>$ help portfolio</div>
        <h2>Explore the work</h2>
        <p>Switch between Work / Fun and List / Card. Hover a list item to see its image, video or prototype. Locked previews stay blurred; missing previews show Coming soon.</p>
        <nav aria-label="Portfolio navigation">
          <Link href="/">cd ../portfolio ↗</Link>
          <Link href="/work">cat project-index ↗</Link>
        </nav>
        <span className={styles.prompt}>$ <span aria-hidden="true">▋</span></span>
      </div>
    </section>
  );
}
