import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grant Guides & Resources | GrantLocate',
  description: 'Free guides on grant writing, avoiding scams, federal funding for students and small businesses, micro-grants, and more.',
};

const guides = [
  {
    href: '/guides/avoid-grant-scams-2026',
    title: 'How to Identify and Avoid Government Grant Scams in 2026',
    description: 'Spot AI deepfake scams, social media fraud, and processing fee schemes targeting grant seekers.',
  },
  {
    href: '/guides/small-business-grant-roadmap-2026',
    title: 'Small Business Grant Roadmap: Navigating the FY2026 Federal Budget',
    description: 'Where the big money is in FY2026 — SBIR/STTR, apprenticeship grants, and priority funding sectors.',
  },
  {
    href: '/guides/federal-grants-for-students-2026',
    title: 'Beyond FAFSA: Top Federal Grant Programs for Students in 2026',
    description: 'TRIO, GEAR UP, veterans education benefits, HBCU funding, and compliance requirements.',
  },
  {
    href: '/guides/grant-writing-plain-language-2026',
    title: 'Grant Writing 101: Meeting 2026 Federal Plain Language Standards',
    description: 'Master NOFO structure, SAM.gov registration, project narratives, and plain language scoring.',
  },
  {
    href: '/guides/micro-grants-for-startups-2026',
    title: 'The Rise of Micro-Grants: How to Secure $2,500–$5,000 for Your Startup in 2026',
    description: 'Find and win micro-grants through PRIME programs, CDFIs, and state economic development agencies.',
  },
  {
    href: '/guides/grant-writing-101',
    title: 'Grant Writing 101: A Beginner\'s Guide to Securing Funding',
    description: 'Essential steps to crafting a winning proposal, from understanding the landscape to budgeting.',
  },
  {
    href: '/guides/avoiding-grant-scams',
    title: 'How to Spot and Avoid Grant Scams: A Safety Guide',
    description: 'Recognize red flags, common scammer tactics, and how to verify legitimate opportunities.',
  },
  {
    href: '/guides/grant-application-mistakes',
    title: '5 Common Grant Application Mistakes (And How to Avoid Them)',
    description: 'Avoid disqualification from vague goals, unrealistic budgets, and last-minute submissions.',
  },
];

export default function GuidesIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Grant Guides & Resources</h1>
      <p className="text-lg text-gray-600 mb-10">
        Free, expert guides to help you find, apply for, and win grant funding. Updated for 2026.
      </p>
      <div className="grid gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all no-underline"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-700">{guide.title}</h2>
            <p className="text-gray-600 m-0">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
