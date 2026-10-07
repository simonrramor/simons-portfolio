import type { Metadata } from 'next';

export const metadata: Metadata = {
  twitter: { card: 'summary_large_image', title: 'Terminal animation experiment | Simon Amor', description: 'An interactive terminal animation experiment by Simon Amor.', images: ['/social-card.png'] },
  title: 'Terminal animation experiment', description: 'An interactive terminal animation experiment by Simon Amor. Explore tiled terminal panes and adjust the timing and motion.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'Terminal animation experiment | Simon Amor', description: 'An interactive terminal animation experiment by Simon Amor.', url: '/about', images: ['/social-card.png'] },
};
export default function AboutLayout({ children }: { children: React.ReactNode }) { return children; }
