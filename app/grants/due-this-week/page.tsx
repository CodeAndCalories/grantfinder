export const dynamic = "force-dynamic";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantCard from "@/components/GrantCard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Grants Due This Week (2026) | GrantLocate",
  description: "Federal grants with deadlines this week. These grant opportunities are closing in 7 days or less — apply now.",
};
export default async function DueThisWeekPage() {
  const data = await getLiveGrantsPage(1);
  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);
  const grants = data.grants.filter(g => {
    if (!g.deadline) return false;
    const deadline = new Date(g.deadline);
    return deadline >= now && deadline <= in7Days;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-red-700 to-red-500 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🚨 Grants Due This Week</h1>
        <p className="text-lg opacity-90">
          These federal grant opportunities close within the next 7 days.
          If you are eligible, begin your application immediately.
        </p>
        <p className="text-sm opacity-75 mt-2">{grants.length} grants due this week</p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800">
          <strong>Urgent:</strong> Grants due this week require immediate action.
          Visit the official grant listing to confirm eligibility before applying.
        </p>
      </div>
      {grants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No grants due this week found. Check grants closing soon for upcoming deadlines.</p>
      ) : (
        <div className="space-y-4">
          {grants.map(grant => <GrantCard key={grant.id} grant={grant} />)}
        </div>
      )}
    </div>
  );
}
