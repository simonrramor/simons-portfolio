import { profiles } from '@/lib/portfolio';

// Server-rendered profile links for the static index pages. rel="me" tells
// crawlers these profiles belong to the same person as this site.
export default function ProfileLinks() {
  return (
    <nav aria-label="Simon Amor elsewhere">
      {profiles.map(profile => (
        <a key={profile.url} href={profile.url} rel="me noopener noreferrer" target="_blank">{profile.name}</a>
      ))}
    </nav>
  );
}
