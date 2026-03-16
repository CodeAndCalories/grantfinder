export const dynamic = "force-dynamic";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantCard from "@/components/GrantCard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Grants Due This Month (2026) | GrantLocate",
  description: "Federal grant deadlines this month. Browse all grant opportunities closing in March 2026 and plan your applications.",
};
export default async function DueThisMonthPage() {
  const data = await getLiveGrantsPage(1);
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const grants = data.grants.filter(g => {
    if (!g.deadline) return false;
    const deadline = new Date(g.deadline);
    return deadline >= now && deadline <= endOfMonth;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📅 Grants Due This Month</h1>
        <p className="text-lg opacity-90">
          Federal grant opportunities with deadlines in {monthName}.
          Plan ahead and submit your applications before these funding opportunities close.
        </p>
        <p className="text-sm opacity-75 mt-2">{grants.length} grants due this month</p>
      </div>
      {grants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No grants due this month found. Browse all grants for upcoming opportunities.</p>
      ) : (
        <div className="space-y-4">
          {grants.map(grant => <GrantCard key={grant.id} grant={grant} />)}
        </div>
      )}
    </div>
  );
}
