import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import { description, person, siteUrl } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'About Simon Amor', description, alternates: { canonical: '/about' },
  openGraph: { title: 'About Simon Amor', description, url: '/about', type: 'profile', images: ['/social-card.png'] },
  twitter: { card: 'summary_large_image', title: 'About Simon Amor', description, images: ['/social-card.png'] },
};
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <><StructuredData schemas={[person, {
    '@type': 'ProfilePage', '@id': `${siteUrl}/about#page`, url: `${siteUrl}/about`,
    name: 'About Simon Amor', description,
    mainEntity: { '@id': person['@id'] }, isPartOf: { '@id': `${siteUrl}/#website` },
  }]} />{children}</>;
}
