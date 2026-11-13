export const siteUrl = 'https://www.simonamor.design';
export const portfolioUpdated = '2026-11-13';
export const description = 'Simon Amor is a designer and co-founder of Morse, previously at Spotify and Monzo. Explore product design work and creative experiments.';

// Public profiles. Keep these in sync with the footer links and Person.sameAs so
// search engines can connect every profile to the same Simon Amor.
export const profiles = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/simon-amor-6b649895/' },
  { name: 'Twitter', url: 'https://twitter.com/simonramor' },
  { name: 'Instagram', url: 'https://www.instagram.com/simonramor/' },
  { name: 'GitHub', url: 'https://github.com/simonrramor' },
];

type WorkImage = { src: string; alt: string };
type WorkGroup = { id: string; name: string; description: string; projects: string[]; page?: { title: string; images: WorkImage[] } };

// Public project titles supplied by Simon. These summaries describe their subject,
// rather than claiming outcomes, metrics or responsibilities not documented here.
// Groups with a `page` get their own indexable page at /work/<id>.
export const workGroups: WorkGroup[] = [
  {
    id: 'morse', name: 'Morse',
    description: 'Simon is a co-founder of Avian Labs, the company behind Morse (formerly Sling Money). The portfolio covers everyday money features: cards, investments, savings, peer-to-peer payments, splitting bills, paying bills and growth. These projects sit together in the Work collection, with previews of the product interfaces.',
    projects: ['Card', 'Investments', 'Savings', 'P2P', 'Bill Splits', 'Bill Pay', 'Growth'],
    page: {
      title: 'Morse product design',
      images: [
        { src: '/images/morse-investments-screen-v3.png', alt: 'Morse Investments screen designed by Simon Amor' },
        { src: '/images/morse-savings-screen-v2.png', alt: 'Morse Savings screen designed by Simon Amor' },
        { src: '/images/morse-p2p-screen-v2.png', alt: 'Morse peer-to-peer payments screen designed by Simon Amor' },
        { src: '/images/morse-bill-splits-screen-v2.png', alt: 'Morse Bill Splits screen designed by Simon Amor' },
      ],
    },
  },
  {
    id: 'sling', name: 'Sling',
    description: 'Sling Money was the international payments app from Avian Labs, the company Simon co-founded, and was renamed Morse in 2026. The Sling project covers sending and receiving digital dollars and euros around the world, and sits alongside the Morse projects in the portfolio.',
    projects: ['International payments'],
    page: {
      title: 'Sling Money product design',
      images: [{ src: '/images/card_2_image.jpg', alt: 'Sling Money international payments app designed by Simon Amor' }],
    },
  },
  {
    id: 'spotify', name: 'Spotify',
    description: 'Simon previously worked at Spotify. The portfolio includes ways to listen together, discover music, manage privacy, and listen to local files offline. The short form video project shows a feed for discovering music through video.',
    projects: ['Group Sessions', 'Enhance', 'Global privacy controls', 'Local file upload and offline listening', 'Music discovery using short form video'],
    page: {
      title: 'Spotify product design',
      images: [
        { src: '/images/spotify-group-sessions.webp', alt: 'Spotify Group Sessions, product design by Simon Amor' },
        { src: '/images/spotify-privacy-screen-v3.png', alt: 'Spotify global privacy controls, product design by Simon Amor' },
        { src: '/images/spotify-local-files-screen-v2.png', alt: 'Spotify local file upload and offline listening, product design by Simon Amor' },
        { src: '/posters/spotify-short-form-video.jpg', alt: 'Spotify music discovery using short form video, product design by Simon Amor' },
      ],
    },
  },
  {
    id: 'monzo', name: 'Monzo',
    description: 'Simon previously worked at Monzo. The collection spans shared spending, invitations, managing salary, getting paid early, setting money aside for bills and paid accounts. Together, these project subjects show the range of personal banking features included in the portfolio.',
    projects: ['Shared Tabs', 'Golden Tickets', 'Salary Sorter', 'Get paid early', 'Bills Pots', 'Plus paid account'],
    page: {
      title: 'Monzo product design',
      images: [
        { src: '/images/monzo-shared-tabs.webp', alt: 'Monzo Shared Tabs, product design by Simon Amor' },
        { src: '/images/monzo-golden-tickets.webp', alt: 'Monzo Golden Tickets, product design by Simon Amor' },
        { src: '/images/monzo-get-paid-early-screen-v3.png', alt: 'Monzo Get paid early screen, product design by Simon Amor' },
        { src: '/images/monzo-bills-pots-photo-wider.jpg', alt: 'Monzo Bills Pots, product design by Simon Amor' },
      ],
    },
  },
  { id: 'client-projects', name: 'Client projects', description: 'Simon has also built products for clients including Google, Android, YouTube and NatWest. This selection includes event ticketing, Grow with Google, a developer portal, cyber security education and AI particle tracking for researchers. Some of these projects have locked, blurred previews; the public portfolio shares their titles without publishing private case study details.', projects: ['Google — Ticketing system for Google IO', 'Google — Grow with Google', 'Android — Developer portal', 'NatWest — Cyber security education', 'ATIS — High throughput AI particle tracking for researchers'] },
];

export const companyPages = workGroups.filter(group => group.page);

export const portfolioQuestions = [
  { question: 'Who is Simon Amor?', answer: 'Simon Amor is a designer and co-founder of Morse. He previously worked at Spotify and Monzo and has built products for clients including Google, Android, YouTube and NatWest.' },
  { question: 'What work is included in this portfolio?', answer: 'The Work collection includes Morse money features, Sling international payments, Spotify music and listening experiences, Monzo banking features, and selected client projects. The project index lists the public titles by company.' },
  { question: 'How can I explore the projects?', answer: 'Choose View work on the homepage, then switch between Work and Fun or between List and Card. Hovering a project in List shows its image, video or prototype. Items awaiting a preview show Coming soon; locked client previews remain blurred.' },
  { question: 'What is in the Fun collection?', answer: 'Fun brings together personal experiments, including interactive visual work, music and wine projects, face tracking, and interface concepts. It is a separate collection from the company and client work.' },
];

export const morse = {
  '@type': 'Organization', '@id': `${siteUrl}/#morse`, name: 'Morse', url: 'https://morsemoney.com',
  legalName: 'Avian Labs', alternateName: ['Avian Labs', 'Sling Money'],
};

export const person = {
  '@type': 'Person', '@id': `${siteUrl}/#simon-amor`, name: 'Simon Amor', url: siteUrl,
  jobTitle: 'Co-founder & Head of Design', description,
  worksFor: morse,
  alumniOf: [
    { '@type': 'Organization', name: 'Spotify', url: 'https://www.spotify.com' },
    { '@type': 'Organization', name: 'Monzo', url: 'https://monzo.com' },
  ],
  homeLocation: { '@type': 'Place', name: 'London, United Kingdom' },
  sameAs: profiles.map(profile => profile.url),
  knowsAbout: ['Product design', 'Interaction design', 'Financial products', 'Payments', 'Music discovery', 'Creative experiments'],
};
