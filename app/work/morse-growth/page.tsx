import type { Metadata } from 'next';
import GrowthCaseStudy from './GrowthCaseStudy';

export const metadata: Metadata = {
  title: 'Morse — Growth case study',
  description: 'A password-protected case study for Morse Growth.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/work/morse-growth' },
};

export default function MorseGrowthPage() {
  return <GrowthCaseStudy />;
}
