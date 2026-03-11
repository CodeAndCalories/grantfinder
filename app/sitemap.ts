import type { MetadataRoute } from "next";
import { getAllGrants, getUniqueIndustries } from "@/lib/grants";

const BASE_URL = "https://grantlocate.com";
const LAST_MODIFIED = new Date();

function toSlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const grants = getAllGrants();
  const industries = getUniqueIndustries();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/grants`,
      lastModified: LAST_MODIFIED,
    },
    {
      url: `${BASE_URL}/saved`,
      lastModified: LAST_MODIFIED,
    },
  ];

  // Industry pages — /grants/[industry]
  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${BASE_URL}/grants/${toSlug(industry)}`,
    lastModified: LAST_MODIFIED,
  }));

  // Individual grant pages — /grants/[id]
  const grantPages: MetadataRoute.Sitemap = grants.map((grant) => ({
    url: `${BASE_URL}/grants/${grant.id}`,
    lastModified: LAST_MODIFIED,
  }));

  return [...staticPages, ...industryPages, ...grantPages];
}
