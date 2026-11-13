import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/StructuredData';
import ProfileLinks from '@/components/ProfileLinks';
import { companyPages, person, portfolioUpdated, siteUrl } from '@/lib/portfolio';
import styles from '../page.module.css';

type Params = { params: Promise<{ company: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return companyPages.map(group => ({ company: group.id }));
}

function findGroup(id: string) {
  return companyPages.find(group => group.id === id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const group = findGroup((await params).company);
  if (!group?.page) return {};
  const title = group.page.title;
  const description = `${title} by Simon Amor: ${group.projects.join(', ')}.`;
  const image = group.page.images[0]?.src ?? '/social-card.png';
  return {
    title, description, alternates: { canonical: `/work/${group.id}` },
    openGraph: { title: `${title} | Simon Amor`, description, url: `/work/${group.id}`, type: 'website', images: [image] },
    twitter: { card: 'summary_large_image', title: `${title} | Simon Amor`, description, images: [image] },
  };
}

export default async function CompanyWork({ params }: Params) {
  const group = findGroup((await params).company);
  if (!group?.page) notFound();
  const url = `${siteUrl}/work/${group.id}`;
  const others = companyPages.filter(other => other.id !== group.id);

  const schemas = [
    person,
    {
      '@type': 'CollectionPage', '@id': `${url}#page`, url,
      name: `${group.page.title} by Simon Amor`, description: group.description,
      dateModified: portfolioUpdated, inLanguage: 'en',
      author: { '@id': person['@id'] }, about: { '@type': 'Organization', name: group.name },
      isPartOf: { '@id': `${siteUrl}/#website` },
      breadcrumb: { '@id': `${url}#breadcrumbs` },
      image: group.page.images.map(image => `${siteUrl}${image.src}`),
      hasPart: group.projects.map(project => ({
        '@type': 'CreativeWork', name: `${group.name} — ${project}`, creator: { '@id': person['@id'] },
      })),
    },
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Portfolio', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Product design projects', item: `${siteUrl}/work` },
        { '@type': 'ListItem', position: 3, name: group.page.title, item: url },
      ],
    },
  ];

  return <main className={styles.page}>
    <StructuredData schemas={schemas} />
    <Link href="/work" className={styles.back}>Simon Amor / Product design projects</Link>
    <h1>{group.page.title} by Simon Amor</h1>
    <p>{group.description}</p>
    <section>
      <h2>Projects</h2>
      <ul>{group.projects.map(project => <li key={project}>{group.name} — {project}</li>)}</ul>
    </section>
    <div className={styles.gallery}>
      {group.page.images.map(image => (
        // Static export with unoptimized images, so a plain img keeps the markup simple.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />
      ))}
    </div>
    <section>
      <h2>More work</h2>
      <p>See images, videos and prototypes in the <Link href="/">interactive portfolio</Link>, or browse the <Link href="/work">full project index</Link>.</p>
      <nav aria-label="Other companies">{others.map(other => <Link key={other.id} href={`/work/${other.id}`}>{other.page?.title}</Link>)}</nav>
    </section>
    <section>
      <h2>About Simon Amor</h2>
      <p>Simon Amor is a designer and co-founder of Morse, previously at Spotify and Monzo. <Link href="/about">More about Simon</Link>.</p>
      <ProfileLinks />
    </section>
  </main>;
}
