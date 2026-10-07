import Link from 'next/link';
import styles from './PortfolioOverview.module.css';

const sections: Record<number, { command: string; title: string; text: string }> = {
  2: { command: 'ls work/morse', title: 'Morse / Sling', text: 'Cards, investments, savings, bill splits, bill pay and growth at Morse. International payments at Sling.' },
  3: { command: 'ls work/spotify', title: 'Spotify', text: 'Music discovery using short form video, Group Sessions, Enhance, global privacy controls, local files and offline listening.' },
  5: { command: 'ls work/monzo', title: 'Monzo', text: 'Shared Tabs, Golden Tickets, Salary Sorter, Get paid early, Bills Pots and premium paid accounts.' },
  6: { command: 'ls work/clients', title: 'Client projects', text: 'Google IO ticketing, Grow with Google, Android developer portal, NatWest cyber security education and AI particle tracking for researchers.' },
  7: { command: 'ls fun/', title: 'Personal experiments', text: 'Interactive visuals, music, wine, face tracking and interface concepts. This terminal is one of them.' },
  8: { command: 'help portfolio', title: 'Explore the work', text: 'Work / Fun. List / Card. Hover a list item to see an image, video or prototype. Locked previews stay blurred; missing previews show Coming soon.' },
};

export default function PortfolioOverview({ id }: { id: number }) {
  const section = sections[id];
  return (
    <section className={styles.pane} aria-label={id === 0 ? 'About Simon Amor' : section.title} data-info-pane={id}>
      <div className={styles.command}>$ {id === 0 ? 'whoami' : section.command}</div>
      {id === 0 ? <>
        <h1 id="profile">Simon Amor</h1>
        <p>Designer and co-founder of Morse.</p>
        <p>Previously at Spotify and Monzo.</p>
        <p>I’ve built products for Google, Android, YouTube and NatWest.</p>
        <Link href="/">cd ../portfolio ↗</Link>
      </> : <>
        <h2>{section.title}</h2>
        <p>{section.text}</p>
        {id === 8 && <nav aria-label="Portfolio navigation"><Link href="/">cd ../portfolio ↗</Link><Link href="/work">cat project-index ↗</Link></nav>}
      </>}
      <span className={styles.prompt} aria-hidden="true">$ ▋</span>
    </section>
  );
}
