import HomeGallery from '@/components/HomeGallery';
import StructuredData from '@/components/StructuredData';
import { person, siteUrl, portfolioUpdated, description } from '@/lib/portfolio';

export default function Home() {
  const schemas = [
    person,
    {
      '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`,
      name: 'Simon Amor — Design & experiments', description, inLanguage: 'en',
      publisher: { '@id': person['@id'] },
    },
    {
      '@type': 'ProfilePage', '@id': `${siteUrl}/#profile`, url: `${siteUrl}/`,
      name: 'Simon Amor — Product designer and co-founder of Morse', description,
      dateModified: portfolioUpdated, inLanguage: 'en',
      mainEntity: { '@id': person['@id'] }, author: { '@id': person['@id'] },
      isPartOf: { '@id': `${siteUrl}/#website` },
      image: `${siteUrl}/social-card.png`,
      hasPart: [{ '@id': `${siteUrl}/about#page` }, { '@id': `${siteUrl}/work#page` }],
    },
  ];
  return <><StructuredData schemas={schemas} /><HomeGallery /></>;
}
