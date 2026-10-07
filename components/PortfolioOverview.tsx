import Link from 'next/link';
import { portfolioQuestions } from '@/lib/portfolio';
import styles from './PortfolioOverview.module.css';

export default function PortfolioOverview() {
  return (
    <details className={styles.overview}>
      <summary>About the work</summary>
      <div className={styles.content}>
        <h2>Product design and creative experiments</h2>
        <p>Simon Amor is a designer and co-founder of Morse. This portfolio brings together his company work, client projects and personal experiments. He previously worked at Spotify and Monzo and has built products for clients including Google, Android, YouTube and NatWest. The collection is organised into Work and Fun, so you can explore product design alongside independent visual and interactive ideas.</p>
        <h3>Money, payments and banking</h3>
        <p>The <Link href="/work#morse">Morse collection</Link> includes cards, investments, savings, bill splits, bill pay and growth. Sling covers international payments. The <Link href="/work#monzo">Monzo projects</Link> include Shared Tabs, Golden Tickets, Salary Sorter, Get paid early, Bills Pots and a premium paid account. These titles bring together the everyday money features represented in the portfolio.</p>
        <h3>Music, listening and discovery</h3>
        <p>The <Link href="/work#spotify">Spotify collection</Link> includes Group Sessions, Enhance, global privacy controls, local file upload and offline listening, and music discovery using short form video. The video discovery preview presents an individual song feed prototype. In the interactive list, hovering a row brings its associated image, video or prototype into view.</p>
        <h3>Client projects and independent ideas</h3>
        <p>The <Link href="/work#client-projects">client project index</Link> includes a ticketing system for Google IO, Grow with Google, an Android developer portal, NatWest cyber security education and AI particle tracking for researchers. Locked previews stay blurred, and projects without an image display Coming soon. The Fun collection offers a different side of the portfolio, with personal projects and experiments in interfaces, motion and visual interaction.</p>
        <h2>Questions about the portfolio</h2>
        {portfolioQuestions.map(({ question, answer }) => <section key={question}><h3>{question}</h3><p>{answer}</p></section>)}
        <p><Link href="/work">Browse the full project index</Link> for the public project titles grouped by company.</p>
      </div>
    </details>
  );
}
