import type { MetadataRoute } from 'next';
import { portfolioUpdated, siteUrl } from '@/lib/portfolio';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, lastModified: portfolioUpdated },
    { url: `${siteUrl}/work`, lastModified: portfolioUpdated },
    { url: `${siteUrl}/about`, lastModified: portfolioUpdated },
  ];
}
