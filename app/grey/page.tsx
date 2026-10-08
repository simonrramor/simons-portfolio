import type { Metadata } from 'next';
import HomeGallery from '@/components/HomeGallery';

export const metadata: Metadata = {
  title: 'Portfolio — soft grey background',
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
};

export default function GreyPortfolio() {
  return <HomeGallery background="soft-grey" />;
}
