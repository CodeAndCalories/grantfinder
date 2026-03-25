import React from 'react';
import AuthorBio from "@/components/AuthorBio";
export default function GrantScamsGuide() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12 prose prose-slate lg:prose-xl">
      <h1>How to Spot and Avoid Grant Scams: A Essential Safety Guide</h1>
      <p className="lead">
        While legitimate grants offer vital support, the landscape is unfortunately filled with scammers
        targeting individuals and small businesses. Protecting yourself begins with recognizing the red flags.
      </p>
      <h2>1. The "Up-Front Fee" Red Flag</h2>
      <p>
        <strong>The most important rule:</strong> Legitimate government and foundation grants never charge
        a "processing fee," "security deposit," or "grant tax" to receive your funds.
        Registration for official systems like Grants.gov is always free.
      </p>
      <h2>2. Recognize Common Scammer Tactics</h2>
      <ul>
        <li><strong>Unsolicited Offers:</strong> The government will not call, text, or message you on social media to tell you that you've "won" a grant you didn't apply for.</li>
        <li><strong>Pressure Tactics:</strong> Scammers often create a false sense of urgency, claiming the offer is "time-sensitive" to force a quick payment.</li>
        <li><strong>Requests for Personal Info:</strong> Be extremely wary if someone asks for your Social Security number or bank details over the phone to "verify eligibility".</li>
      </ul>
      <h2>3. How to Verify a Grant Opportunity</h2>
      <p>
        Always check the official website of the granting agency. Federal grant sites always end in <strong>.gov</strong>.
        Be cautious of lookalike domains ending in .org or .com that mimic official names.
      </p>
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3>What to Do If You've Been Targeted</h3>
        <p>
          If you suspect a scam, report it immediately to the Federal Trade Commission (FTC) at
          <strong> ReportFraud.ftc.gov</strong> or call 1-877-FTC-HELP.
        </p>
      </div>
      <AuthorBio />
    </article>
  );
}
