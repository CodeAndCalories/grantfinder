"use client";
import React, { useState } from 'react';
import GrantCard from '@/components/GrantCard';
import type { Grant } from '@/lib/grants';
const CATEGORIES = [
  { id: 'student', label: '🎓 Student', keywords: ['student', 'education', 'college', 'university', 'scholarship', 'academic', 'fellowship'] },
  { id: 'small-business', label: '💼 Small Business', keywords: ['small business', 'entrepreneur', 'startup', 'business', 'commerce', 'economic development'] },
  { id: 'nonprofit', label: '🤝 Nonprofit', keywords: ['nonprofit', 'non-profit', 'community', 'organization', 'charity', 'public'] },
  { id: 'researcher', label: '🔬 Researcher', keywords: ['research', 'study', 'investigation', 'science', 'academic', 'clinical', 'trial'] },
  { id: 'farmer', label: '🌾 Farmer', keywords: ['farmer', 'agriculture', 'rural', 'farm', 'crop', 'livestock', 'usda', 'food'] },
  { id: 'individual', label: '👤 Individual', keywords: ['individual', 'person', 'citizen', 'public', 'household', 'workforce'] },
];
const INDUSTRIES = [
  { id: 'Education', label: '📚 Education' },
  { id: 'Agriculture', label: '🌱 Agriculture' },
  { id: 'Healthcare', label: '🏥 Healthcare' },
  { id: 'Technology', label: '💻 Technology' },
  { id: 'Research', label: '🔬 Research' },
  { id: 'Environment', label: '🌿 Environment' },
  { id: 'Energy', label: '⚡ Energy' },
  { id: 'Small Business', label: '💼 Small Business' },
  { id: 'Community', label: '🏘️ Community Development' },
];
const FUNDING_RANGES = [
  { id: 'any', label: 'Any Amount', min: 0, max: Infinity },
  { id: 'small', label: 'Under $50,000', min: 0, max: 50000 },
  { id: 'medium', label: '$50,000 – $250,000', min: 50000, max: 250000 },
  { id: 'large', label: '$250,000+', min: 250000, max: Infinity },
];
interface Props {
  grants: Grant[];
  initialCategory?: string;
}
export default function GrantMatchWizard({ grants, initialCategory }: Props) {
  const [step, setStep] = useState(initialCategory ? 2 : 1);
  const [category, setCategory] = useState(initialCategory || '');
  const [industry, setIndustry] = useState('');
  const [results, setResults] = useState<Grant[]>([]);
  const handleMatch = (funding: string) => {
    const range = FUNDING_RANGES.find(r => r.id === funding) || FUNDING_RANGES[0];
    const catKeywords = CATEGORIES.find(c => c.id === category)?.keywords || [];
    const filtered = grants.filter(g => {
      // Primary: match industry_tags (derived from agencyName)
      const tagMatch = g.industry_tags?.includes(industry);
      // Fallback: keyword match on title + description
      const text = `${g.title} ${g.description}`.toLowerCase();
      const keywordMatch = catKeywords.some(kw => text.includes(kw));
      // Funding match
      const amt = g.funding_amount ?? 0;
      const fundingMatch = range.id === 'any' || (amt >= range.min && amt <= range.max);
      return (tagMatch || keywordMatch) && fundingMatch;
    });
    // If < 3 results, broaden — drop funding filter
    const finalResults = filtered.length >= 3 ? filtered : grants.filter(g => {
      const tagMatch = g.industry_tags?.includes(industry);
      const text = `${g.title} ${g.description}`.toLowerCase();
      const keywordMatch = catKeywords.some(kw => text.includes(kw));
      return tagMatch || keywordMatch;
    });
    setResults(finalResults.slice(0, 12));
    setStep(4);
  };
  const reset = () => {
    setStep(initialCategory ? 2 : 1);
    setCategory(initialCategory || '');
    setIndustry('');
    setResults([]);
  };
  return (
    <div className="max-w-2xl mx-auto">
      {step < 4 && (
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Who are you applying as?</h2>
            <p className="text-gray-500 text-sm">Select the option that best describes you</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setStep(2); }}
                className="p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all font-medium"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">What is your focus area?</h2>
            <p className="text-gray-500 text-sm">Choose your primary industry or interest</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {INDUSTRIES.map(ind => (
              <button
                key={ind.id}
                onClick={() => { setIndustry(ind.id); setStep(3); }}
                className="p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all font-medium"
              >
                {ind.label}
              </button>
            ))}
          </div>
          {!initialCategory && (
            <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">How much funding do you need?</h2>
            <p className="text-gray-500 text-sm">Select your target funding range</p>
          </div>
          <div className="space-y-3">
            {FUNDING_RANGES.map(range => (
              <button
                key={range.id}
                onClick={() => handleMatch(range.id)}
                className="w-full p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-left transition-all font-medium"
              >
                {range.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {results.length > 0 ? `${results.length} Grants Found` : 'No Exact Matches'}
              </h2>
              <p className="text-sm text-gray-500 italic">
                Results are suggestions only. Always verify eligibility on Grants.gov.
              </p>
            </div>
            <button onClick={reset} className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap ml-4">← Start Over</button>
          </div>
          {results.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border">
              <p className="text-gray-600 mb-4">No grants matched your criteria right now.</p>
              <a href="/grants" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Browse All Grants
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(grant => <GrantCard key={grant.id} grant={grant} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
