import React from 'react';
import AuthorBio from "@/components/AuthorBio";
export default function GrantMistakesGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 prose prose-slate lg:prose-xl">
      <h1>5 Common Grant Application Mistakes (And How to Avoid Them)</h1>
      <p className="lead">
        Even the best projects can be rejected due to simple administrative errors. Understanding these
        frequent pitfalls will help you submit a more competitive proposal.
      </p>
      <h2>1. Not Following the Guidelines Exactly</h2>
      <p>
        Failing to adhere to font sizes, page limits, or required attachments can result in immediate
        disqualification. Treat every instruction—no matter how small—as a non-negotiable requirement.
      </p>
      <h2>2. Vague Goals and Objectives</h2>
      <p>
        Reviewers look for measurable outcomes. Instead of saying you want to "improve the community,"
        state that you aim to "provide vocational training for 50 local residents over 12 months".
      </p>
      <h2>3. Ignoring the Funder's Mission</h2>
      <p>
        A "one-size-fits-all" proposal rarely works. You must research the funder's strategic goals and
        past recipients to ensure your project aligns with their specific grantmaking strategy.
      </p>
      <h2>4. Unrealistic Budgets</h2>
      <p>
        Your budget must align perfectly with your project description. Overestimating costs or failing
        to justify large expenses signals a lack of capacity to manage funds responsibly.
      </p>
      <h2>5. Submitting at the Last Minute</h2>
      <p>
        Technical glitches are common. Aim to submit your application at least 48 hours before the
        official deadline to ensure your materials are received without issue.
      </p>
      <AuthorBio />
    </article>
  );
}
