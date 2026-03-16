export const dynamic = "force-dynamic";
export const runtime = "edge";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantCard from "@/components/GrantCard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Grants Closing Soon (2026) | GrantLocate",
  description: "Federal grant opportunities with deadlines in the next 30 days. Don't miss these closing grant opportunities — apply before it's too late.",
};
export default async function ClosingSoonPage() {
  const data = await getLiveGrantsPage(1);
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);
  const grants = data.grants.filter(g => {
    if (!g.deadline) return false;
    const deadline = new Date(g.deadline);
    return deadline >= now && deadline <= in30Days;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">⏰ Grants Closing Soon</h1>
        <p className="text-lg opacity-90">
          These federal grant opportunities have deadlines within the next 30 days.
          Act fast — once the deadline passes, applications are no longer accepted.
        </p>
        <p className="text-sm opacity-75 mt-2">{grants.length} grants closing within 30 days</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Always verify deadlines on the official Grants.gov listing before applying.
          Deadlines can be extended or changed by the granting agency.
        </p>
      </div>
      {grants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No grants closing in the next 30 days found. Check back soon.</p>
      ) : (
        <div className="space-y-4">
          {grants.map(grant => <GrantCard key={grant.id} grant={grant} />)}
        </div>
      )}
    </div>
  );
}
