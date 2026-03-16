"use client";
import React, { useState } from 'react';
const checklistItems = [
  { id: 1, text: "Do you have a clear project budget?" },
  { id: 2, text: "Is your organization/business legally registered?" },
  { id: 3, text: "Do you have a specific problem or 'Need Statement'?" },
  { id: 4, text: "Have you checked the funder's geographic requirements?" },
  { id: 5, text: "Do you have the staff/time to manage reporting requirements?" },
];
export default function EligibilityChecklist() {
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (id: number) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  return (
    <div className="p-6 bg-slate-50 border rounded-xl shadow-sm my-8">
      <h3 className="text-xl font-bold mb-4">Quick Readiness Checklist</h3>
      <p className="text-sm text-gray-600 mb-6">Before applying for a grant, ensure you have these basics covered:</p>
      <div className="space-y-4">
        {checklistItems.map(item => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={() => toggle(item.id)}
            />
            <span className={`text-sm lg:text-base ${checked.includes(item.id) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
      {checked.length === checklistItems.length && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-sm font-medium animate-bounce">
          🎉 You look ready to start searching! Check our category pages below.
        </div>
      )}
    </div>
  );
}
