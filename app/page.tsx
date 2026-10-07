import HomeGallery from '@/components/HomeGallery';
import PortfolioOverview from '@/components/PortfolioOverview';
import StructuredData from '@/components/StructuredData';
import { person, siteUrl, portfolioUpdated, portfolioQuestions, description } from '@/lib/portfolio';

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
      hasPart: [{ '@id': `${siteUrl}/#portfolio-questions` }, { '@id': `${siteUrl}/work#page` }],
    },
    {
      '@type': 'FAQPage', '@id': `${siteUrl}/#portfolio-questions`, url: `${siteUrl}/`,
      name: 'Questions about Simon Amor’s portfolio', inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#profile` },
      mainEntity: portfolioQuestions.map(({ question, answer }) => ({
        '@type': 'Question', name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];
  return <><StructuredData schemas={schemas} /><HomeGallery overview={<PortfolioOverview />} /></>;
}
