import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import { person, siteUrl } from '@/lib/portfolio';

export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', title: 'Terminal animation experiment | Simon Amor', description: 'An interactive terminal animation experiment by Simon Amor.', images: ['/social-card.png'] },
  title: 'Terminal animation experiment', description: 'An interactive terminal animation experiment by Simon Amor. Explore tiled terminal panes and adjust the timing and motion.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'Terminal animation experiment | Simon Amor', description: 'An interactive terminal animation experiment by Simon Amor.', url: '/about', images: ['/social-card.png'] },
};
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <><StructuredData schemas={[person, {
    '@type': 'WebPage', '@id': `${siteUrl}/about#page`, url: `${siteUrl}/about`,
    name: 'Terminal animation experiment', description: 'An interactive terminal animation experiment by Simon Amor.',
    inLanguage: 'en', author: { '@id': person['@id'] }, isPartOf: { '@id': `${siteUrl}/#website` },
  }]} />{children}</>;
}
