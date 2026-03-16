export const dynamic = "force-dynamic";
export const runtime = "edge";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantMatchWizard from "@/components/GrantMatchWizard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Grant Match — Find Grants You Qualify For | GrantLocate",
  description: "Answer 3 quick questions and find federal grants you may qualify for. Our Grant Match tool filters 100+ active opportunities to show the most relevant funding.",
};
export default async function GrantMatchPage() {
  const pages = await Promise.all([1,2,3,4,5].map(p => getLiveGrantsPage(p)));
  const grants = pages.flatMap(p => p.grants);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Find Grants You Qualify For</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Answer 3 quick questions and we will match you with active federal grant opportunities most relevant to your situation.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          ✓ {grants.length} live grants analyzed in real time
        </div>
      </div>
      <GrantMatchWizard grants={grants} />
      <p className="text-center text-xs text-gray-400 mt-8">
        GrantLocate is not a government agency and does not guarantee funding. All grant eligibility is determined by the granting organization.
      </p>
    </div>
  );
}
