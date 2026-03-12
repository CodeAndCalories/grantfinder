import type { MetadataRoute } from "next";
import { getAllGrants, getUniqueIndustries, getUniqueLocations } from "@/lib/grants";

const BASE_URL = "https://grantlocate.com";
const LAST_MODIFIED = new Date();

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const grants = getAllGrants();
  const industries = getUniqueIndustries();
  const locations = getUniqueLocations();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/grants`,                          lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/saved`,                           lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/student-grants`,                  lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/financial-help`,                  lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/debt-relief-programs`,            lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/housing-assistance-programs`,     lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/small-business-grants`,           lastModified: LAST_MODIFIED },
    { url: `${BASE_URL}/financial-assistance-programs`,   lastModified: LAST_MODIFIED },
  ];

  // Industry pages — /grants/[industry]
  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${BASE_URL}/grants/${toSlug(industry)}`,
    lastModified: LAST_MODIFIED,
  }));

  // State pages — /grants/state/[state]
  const statePages: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${BASE_URL}/grants/state/${toSlug(location)}`,
    lastModified: LAST_MODIFIED,
  }));

  // State + industry combo pages — /grants/state/[state]/[industry]
  const seen = new Set<string>();
  const comboPages: MetadataRoute.Sitemap = [];
  for (const grant of grants) {
    const stateSlug = toSlug(grant.location);
    for (const tag of grant.industry_tags) {
      const industrySlug = toSlug(tag);
      const key = `${stateSlug}__${industrySlug}`;
      if (!seen.has(key)) {
        seen.add(key);
        comboPages.push({
          url: `${BASE_URL}/grants/state/${stateSlug}/${industrySlug}`,
          lastModified: LAST_MODIFIED,
        });
      }
    }
  }

  // Individual grant pages — /grants/[id]
  const grantPages: MetadataRoute.Sitemap = grants.map((grant) => ({
    url: `${BASE_URL}/grants/${grant.id}`,
    lastModified: LAST_MODIFIED,
  }));

  return [...staticPages, ...industryPages, ...statePages, ...comboPages, ...grantPages];
}
