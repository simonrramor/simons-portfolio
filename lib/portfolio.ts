export const siteUrl = 'https://www.simonamor.design';
export const portfolioUpdated = '2026-10-07';
export const description = 'Simon Amor is a designer and co-founder of Morse, previously at Spotify and Monzo. Explore product design work and creative experiments.';

// Public project titles supplied by Simon. These summaries describe their subject,
// rather than claiming outcomes, metrics or responsibilities not documented here.
export const workGroups = [
  { id: 'morse', name: 'Morse', description: 'Simon is a co-founder of Morse. The portfolio covers everyday money features: cards, investments, savings, splitting bills, paying bills and growth. These projects sit together in the Work collection, with previews of the product interfaces.', projects: ['Card', 'Investments', 'Savings', 'Bill Splits', 'Bill Pay', 'Growth'] },
  { id: 'sling', name: 'Sling', description: 'The Sling project focuses on international payments. It appears alongside the Morse projects in the portfolio, bringing the payments work into one place.', projects: ['International payments'] },
  { id: 'spotify', name: 'Spotify', description: 'Simon previously worked at Spotify. The portfolio includes ways to listen together, discover music, manage privacy, and listen to local files offline. The short form video project includes an individual song feed prototype that can be previewed in the interactive gallery.', projects: ['Group Sessions', 'Enhance', 'Global privacy controls', 'Local file upload and offline listening', 'Music discovery using short form video'] },
  { id: 'monzo', name: 'Monzo', description: 'Simon previously worked at Monzo. The collection spans shared spending, invitations, managing salary, getting paid early, setting money aside for bills and paid accounts. Together, these project subjects show the range of personal banking features included in the portfolio.', projects: ['Shared Tabs', 'Golden Tickets', 'Salary Sorter', 'Get paid early', 'Bills Pots', 'Premium paid account'] },
  { id: 'client-projects', name: 'Client projects', description: 'Simon has also built products for clients including Google, Android, YouTube and NatWest. This selection includes event ticketing, Grow with Google, a developer portal, cyber security education and AI particle tracking for researchers. Some of these projects have locked, blurred previews; the public portfolio shares their titles without publishing private case study details.', projects: ['Google — Ticketing system for Google IO', 'Google — Grow with Google', 'Android — Developer portal', 'NatWest — Cyber security education', 'ATIS — High throughput AI particle tracking for researchers'] },
];

export const portfolioQuestions = [
  { question: 'Who is Simon Amor?', answer: 'Simon Amor is a designer and co-founder of Morse. He previously worked at Spotify and Monzo and has built products for clients including Google, Android, YouTube and NatWest.' },
  { question: 'What work is included in this portfolio?', answer: 'The Work collection includes Morse money features, Sling international payments, Spotify music and listening experiences, Monzo banking features, and selected client projects. The project index lists the public titles by company.' },
  { question: 'How can I explore the projects?', answer: 'Choose View work on the homepage, then switch between Work and Fun or between List and Card. Hovering a project in List shows its image, video or prototype. Items awaiting a preview show Coming soon; locked client previews remain blurred.' },
  { question: 'What is in the Fun collection?', answer: 'Fun brings together personal experiments, including interactive visual work, music and wine projects, face tracking, and interface concepts. It is a separate collection from the company and client work.' },
];

export const person = {
  '@type': 'Person', '@id': `${siteUrl}/#simon-amor`, name: 'Simon Amor', url: siteUrl,
  jobTitle: 'Designer', description,
  sameAs: ['https://github.com/simonrramor'],
  knowsAbout: ['Product design', 'Interaction design', 'Financial products', 'Music discovery', 'Creative experiments'],
};
