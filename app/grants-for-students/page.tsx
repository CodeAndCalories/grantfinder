export const dynamic = "force-dynamic";
export const runtime = "edge";
import { getLiveGrantsPage } from "@/lib/fetchLiveGrants";
import GrantMatchWizard from "@/components/GrantMatchWizard";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Grants for Students (2026) | GrantLocate",
  description: "Find federal grants for students in 2026. Browse active funding for college, university, and academic programs.",
};
export default async function GrantsForStudentsPage() {
  const pages = await Promise.all([1,2,3,4,5].map(p => getLiveGrantsPage(p)));
  const grants = pages.flatMap(p => p.grants);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-10 text-white">
        <h1 className="text-3xl font-bold mb-2">Grants for Students (2026)</h1>
        <p className="text-lg opacity-90">Federal grant opportunities for students and academic programs. Use the matcher below to find relevant funding.</p>
      </div>
      <GrantMatchWizard grants={grants} initialCategory="student" />
    </div>
  );
}
