import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllGrants, getUniqueIndustries, formatCurrency } from "@/lib/grants";
import GrantCard from "@/components/GrantCard";

// Slug helpers
function toSlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fromSlug(slug: string): string | undefined {
  return getUniqueIndustries().find((i) => toSlug(i) === slug);
}

// Industry descriptions for SEO + UX
const INDUSTRY_DESCRIPTIONS: Record<string, string> = {
  Agriculture: "Grants supporting farmers, cooperatives, agribusinesses, and rural food systems. Funding covers innovation, sustainability, market access, and producer income programs.",
  Aerospace: "Federal and state grants for aerospace research, manufacturing, and workforce development. Ideal for companies and universities advancing aviation and space technologies.",
  Arts: "Funding for nonprofits, artists, and cultural institutions preserving and promoting the arts. Covers performances, public art, heritage programs, and community engagement.",
  Biotechnology: "Grants for biotech startups and research institutions developing life-science breakthroughs in medicine, agriculture, and industrial applications.",
  Broadband: "Programs expanding high-speed internet access to unserved and underserved communities, supporting digital inclusion and rural economic opportunity.",
  "Childcare": "Grants to expand affordable, high-quality childcare and early childhood education, helping families access care while supporting child development outcomes.",
  "Clean Energy": "Funding for solar, wind, and other renewable energy projects aimed at reducing carbon emissions and transitioning businesses and communities to clean power.",
  Community: "Broad community development grants supporting neighborhood revitalization, social services, civic infrastructure, and quality-of-life improvements.",
  Construction: "Grants supporting construction businesses, infrastructure projects, and workforce training in the building trades.",
  Culture: "Programs preserving cultural heritage, supporting cultural tourism, and funding institutions that strengthen community identity.",
  Cybersecurity: "Federal and state grants for cybersecurity research, workforce development, and protecting critical infrastructure against digital threats.",
  "Disability Services": "Funding for organizations providing services, employment support, and accessibility improvements for individuals with disabilities.",
  "Economic Development": "Grants to attract investment, create jobs, and build economic resilience in communities through business attraction, retention, and expansion programs.",
  Education: "Funding for K–12 schools, community colleges, universities, and education nonprofits improving student outcomes and expanding access.",
  Energy: "Grants spanning renewable energy, energy efficiency, and energy infrastructure development for businesses, municipalities, and utilities.",
  Entrepreneurship: "Programs that fuel new business formation through incubators, accelerators, seed funding, and technical assistance for startups.",
  Environment: "Grants for conservation, pollution cleanup, ecological restoration, and environmental research to protect natural resources and public health.",
  Finance: "Grants and programs supporting access to capital, financial literacy, and small business lending in underserved communities.",
  "Fisheries": "Funding for sustainable fisheries management, aquaculture development, and coastal fishing community support programs.",
  Food: "Grants covering local food systems, food access, hunger relief, food safety research, and farm-to-table supply chain development.",
  Forestry: "Programs supporting sustainable forest management, timber industry development, wildfire prevention, and rural forest community economies.",
  Healthcare: "Grants for hospitals, clinics, nonprofits, and researchers improving access to care, advancing medical research, and addressing health disparities.",
  "Historic Preservation": "Funding to rehabilitate, restore, and protect historic buildings, landscapes, and cultural sites for future generations.",
  Housing: "Grants for affordable housing development, home repair programs, homelessness prevention, and community land trusts.",
  Infrastructure: "Capital funding for transportation, water, broadband, and public facilities that underpin safe and functioning communities.",
  Innovation: "Cross-sector grants rewarding novel approaches to longstanding challenges in technology, science, business, and public service.",
  "Manufacturing": "Grants helping manufacturers modernize operations, adopt advanced technologies, grow exports, and train a skilled workforce.",
  "Marine": "Funding for ocean research, coastal ecosystem protection, marine transportation, and blue economy business development.",
  "Mental Health": "Grants expanding mental health services, crisis response capacity, substance abuse treatment, and behavioral health workforce.",
  Nonprofit: "General operating and project support grants for 501(c)(3) organizations delivering social services and community programs.",
  "Research": "Grants funding basic and applied research across scientific disciplines at universities, national labs, and research institutions.",
  "Rural Development": "Programs strengthening rural economies through business development, infrastructure investment, and community facility support.",
  Science: "Funding for scientific inquiry, laboratory infrastructure, and science communication across disciplines.",
  "Small Business": "Grants helping small businesses launch, grow, and compete through direct funding, technical assistance, and market access programs.",
  Sustainability: "Grants for projects reducing environmental impact, promoting circular economies, and integrating sustainability into business and government operations.",
  Technology: "Grants for tech startups, R&D projects, digital infrastructure, and technology adoption across industries.",
  Tourism: "Funding to develop tourism assets, market destinations, and support hospitality businesses that drive regional visitor economies.",
  Transportation: "Grants for road, rail, transit, port, and active transportation projects improving mobility and reducing congestion.",
  "Veterans": "Programs supporting veterans in business ownership, employment, housing, and healthcare as they transition to civilian life.",
  "Water": "Grants for drinking water systems, wastewater treatment, stormwater management, and watershed protection projects.",
  "Workforce Development": "Funding for job training, apprenticeship programs, sector partnerships, and career pathways connecting workers to quality employment.",
};

function getDescription(industry: string): string {
  return (
    INDUSTRY_DESCRIPTIONS[industry] ??
    `Browse grants available for the ${industry} sector. Funding opportunities span federal, state, and local programs supporting organizations and businesses in this industry.`
  );
}

// Static params for all known industries
export function generateStaticParams() {
  return getUniqueIndustries().map((industry) => ({ industry: toSlug(industry) }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = fromSlug(slug);
  if (!industry) return { title: "Industry Not Found" };
  return {
    title: `${industry} Grants | GrantLocate`,
    description: getDescription(industry),
  };
}

export default async function IndustryGrantsPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = fromSlug(slug);

  if (!industry) notFound();

  const grants = getAllGrants().filter((g) => g.industry_tags.includes(industry));
  const totalFunding = grants.reduce((sum, g) => sum + g.funding_amount, 0);
  const avgFunding = grants.length > 0 ? Math.round(totalFunding / grants.length) : 0;

  const allIndustries = getUniqueIndustries();

  return (
    <>
      {/* Back link */}
      <Link href="/grants" className="detail-back">
        ← Back to all grants
      </Link>

      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">{industry} Grants</h1>
        <p className="page-subtitle">{getDescription(industry)}</p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginTop: "1rem",
            padding: "1rem 1.25rem",
            background: "var(--surface, #f8fafc)",
            borderRadius: "0.5rem",
            border: "1px solid var(--border, #e2e8f0)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{grants.length}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grants Available</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{formatCurrency(avgFunding)}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg. Award</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{formatCurrency(totalFunding)}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Funding</div>
          </div>
        </div>
      </div>

      {/* Grant cards */}
      {grants.length === 0 ? (
        <div className="empty-state">
          <h2>No grants found</h2>
          <p>There are currently no grants tagged with {industry}.</p>
        </div>
      ) : (
        <div className="grants-list">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Browse other industries */}
      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border, #e2e8f0)" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Browse Other Industries</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {allIndustries
            .filter((i) => i !== industry)
            .map((i) => (
              <Link
                key={i}
                href={`/grants/${toSlug(i)}`}
                className="tag"
                style={{ textDecoration: "none" }}
              >
                {i}
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
