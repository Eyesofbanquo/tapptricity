"use client";

import { useState } from "react";

interface YearSelectorProps {
  onSetYears: (year1: number, year2: number) => void;
  defaultYear1?: number;
  defaultYear2?: number;
}

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => 2020 + i);

export function YearSelector({ onSetYears, defaultYear1 = 2025, defaultYear2 = 2026 }: YearSelectorProps) {
  const [year1, setYear1] = useState(defaultYear1);
  const [year2, setYear2] = useState(defaultYear2);

  return (
    <div className="flex items-end gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year 1</label>
        <select
          value={year1}
          onChange={(e) => setYear1(Number(e.target.value))}
          className="border border-silver rounded px-3 py-2 focus:outline-none focus:border-steel"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year 2</label>
        <select
          value={year2}
          onChange={(e) => setYear2(Number(e.target.value))}
          className="border border-silver rounded px-3 py-2 focus:outline-none focus:border-steel"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onSetYears(year1, year2)}
        className="px-4 py-2 bg-crimson text-white rounded hover:bg-crimson/90 transition-colors"
      >
        Set Years
      </button>
    </div>
  );
}
