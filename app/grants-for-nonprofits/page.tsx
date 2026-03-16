export const dynamic = "force-dynamic";
export const runtime = "edge";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantMatchWizard from "@/components/GrantMatchWizard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Nonprofit Grants (2026) | GrantLocate",
  description: "Find federal grants for nonprofits in 2026. Active funding for nonprofit organizations and community programs.",
};
export default async function GrantsForNonprofitsPage() {
  const pages = await Promise.all([1,2,3,4,5].map(p => getLiveGrantsPage(p)));
  const grants = pages.flatMap(p => p.grants);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-10 text-white">
        <h1 className="text-3xl font-bold mb-2">Nonprofit Grants (2026)</h1>
        <p className="text-lg opacity-90">Federal funding for nonprofit organizations and community programs. Find grants that align with your mission.</p>
      </div>
      <GrantMatchWizard grants={grants} initialCategory="nonprofit" />
    </div>
  );
}
