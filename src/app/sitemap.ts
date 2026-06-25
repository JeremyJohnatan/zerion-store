import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zerionstore.com';

  // Fetch all services to generate dynamic sitemap entries
  let servicesSitemap: MetadataRoute.Sitemap = [];
  try {
    const services = await prisma.service.findMany({
      select: { id: true, type: true, updatedAt: true }
    });

    servicesSitemap = services.map((service) => ({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: service.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.warn("Could not fetch services for sitemap");
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...servicesSitemap
  ];
}
