import type { Metadata } from 'next';
import Link from 'next/link';
import { workGroups, siteUrl, person, portfolioUpdated } from '@/lib/portfolio';
import styles from './page.module.css';

const description = 'Explore Simon Amor’s product design projects for Morse, Sling, Spotify and Monzo, plus selected work for Google, Android, NatWest and researchers.';
export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', title: 'Product design projects | Simon Amor', description, images: ['/social-card.png'] },
  title: 'Product design projects', description, alternates: { canonical: '/work' },
  openGraph: { title: 'Product design projects | Simon Amor', description, url: '/work', type: 'website', images: [{ url: '/social-card.png', width: 1200, height: 630 }] },
};

export default function WorkIndex() {
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', url: `${siteUrl}/work`, name: 'Product design projects by Simon Amor', description, dateModified: portfolioUpdated, author: person,
    mainEntity: { '@type': 'ItemList', itemListElement: workGroups.flatMap(group => group.projects.map(project => ({ '@type': 'CreativeWork', name: group.id === 'client-projects' ? project : `${group.name} — ${project}` }))) } };
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\u003c') }} />
    <Link href="/" className={styles.back}>Simon Amor / Interactive portfolio</Link>
    <h1>Product design projects by Simon Amor</h1>
    <p>Simon Amor is a designer and co-founder of Morse, previously at Spotify and Monzo. This index lists the public project titles in his Work collection. For images, videos and prototypes, explore the <Link href="/">interactive portfolio</Link> in List or Card view.</p>
    <nav aria-label="Project companies">{workGroups.map(group => <a key={group.id} href={`#${group.id}`}>{group.name}</a>)}</nav>
    {workGroups.map(group => <section key={group.id} id={group.id}><h2>{group.name}</h2><p>{group.description}</p><ul>{group.projects.map(project => <li key={project}>{group.id === 'client-projects' ? project : `${group.name} — ${project}`}</li>)}</ul></section>)}
    <section><h2>What can I see in the interactive portfolio?</h2><p>The gallery offers company work and personal experiments, with separate Work and Fun collections. Use List to browse project titles and hover for a preview, or switch to Card to browse visually. Projects awaiting preview assets are marked Coming soon. Locked client previews remain blurred, so the public index does not disclose private project details.</p><p><Link href="/">Return to the portfolio</Link> to explore the previews.</p></section>
  </main>;
}
