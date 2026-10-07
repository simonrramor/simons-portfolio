import HomeGallery from '@/components/HomeGallery';
import PortfolioOverview from '@/components/PortfolioOverview';
import { person, siteUrl, portfolioUpdated } from '@/lib/portfolio';

export default function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: 'Simon Amor — Design & experiments', publisher: { '@id': person['@id'] } },
      { '@type': 'ProfilePage', '@id': `${siteUrl}/#profile`, url: siteUrl, name: 'Simon Amor — Product designer and co-founder of Morse', dateModified: portfolioUpdated, mainEntity: { '@id': person['@id'] }, isPartOf: { '@id': `${siteUrl}/#website` } },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><HomeGallery overview={<PortfolioOverview />} /></>;
}
