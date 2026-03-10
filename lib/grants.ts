import grantsData from "@/data/grants.json";

export interface Grant {
  id: string;
  title: string;
  funding_amount: number;
  deadline: string;
  eligibility: string;
  industry_tags: string[];
  location: string;
  description: string;
  source_url: string;
}

export type SortOption = "newest" | "deadline" | "highest_funding";

export interface GrantFilters {
  industry?: string;
  location?: string;
  minFunding?: number;
  maxFunding?: number;
  deadlineBefore?: string;
  sort?: SortOption;
  search?: string;
}

const grants: Grant[] = grantsData as Grant[];

export function getAllGrants(): Grant[] {
  return grants;
}

export function getGrantById(id: string): Grant | undefined {
  return grants.find((g) => g.id === id);
}

export function getUniqueIndustries(): string[] {
  const all = grants.flatMap((g) => g.industry_tags);
  return Array.from(new Set(all)).sort();
}

export function getUniqueLocations(): string[] {
  return Array.from(new Set(grants.map((g) => g.location))).sort();
}

export function filterAndSortGrants(filters: GrantFilters): Grant[] {
  let result = [...grants];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.eligibility.toLowerCase().includes(q)
    );
  }

  if (filters.industry) {
    result = result.filter((g) =>
      g.industry_tags.includes(filters.industry!)
    );
  }

  if (filters.location) {
    result = result.filter((g) => g.location === filters.location);
  }

  if (filters.minFunding !== undefined) {
    result = result.filter((g) => g.funding_amount >= filters.minFunding!);
  }

  if (filters.maxFunding !== undefined) {
    result = result.filter((g) => g.funding_amount <= filters.maxFunding!);
  }

  if (filters.deadlineBefore) {
    result = result.filter((g) => g.deadline <= filters.deadlineBefore!);
  }

  switch (filters.sort) {
    case "deadline":
      result.sort((a, b) => a.deadline.localeCompare(b.deadline));
      break;
    case "highest_funding":
      result.sort((a, b) => b.funding_amount - a.funding_amount);
      break;
    case "newest":
    default:
      result.sort((a, b) => Number(b.id) - Number(a.id));
      break;
  }

  return result;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
