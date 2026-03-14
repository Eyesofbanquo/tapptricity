"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExpenseComparison } from "@/hooks/useExpenseComparison";
import { YearSelector } from "@/components/expense-comparison/YearSelector";

function generateDefaultName(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${mm}-${dd}-${yyyy}-Expense-Sheet`;
}

function deduplicateName(baseName: string): string {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("expense-sheet:") && key !== "expense-sheet:current") {
      keys.push(key);
    }
  }

  const existingNames = new Set<string>();
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "");
      if (data?.name) existingNames.add(data.name);
    } catch { /* ignore */ }
  }

  if (!existingNames.has(baseName)) return baseName;

  let counter = 2;
  while (existingNames.has(`${baseName}-draft-${counter}`)) {
    counter++;
  }
  return `${baseName}-draft-${counter}`;
}

export default function ExpenseComparisonPage() {
  const router = useRouter();
  const { createSheet } = useExpenseComparison(null);
  const [name, setName] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setPlaceholder(deduplicateName(generateDefaultName()));
  }, []);

  async function handleSetYears(year1: number, year2: number) {
    const sheetName = name.trim() || placeholder;
    const code = await createSheet(year1, year2, sheetName);
    router.push(`/expense-comparison/${code}`);
  }

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-crimson">Create Expense Sheet</h1>
          <p className="text-gray-600 mt-2">
            Name your sheet and select two fiscal years to compare.
          </p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <label htmlFor="sheet-name" className="block text-sm font-medium text-gray-700 mb-1">
            Sheet Name
          </label>
          <input
            id="sheet-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            className="w-full max-w-md px-3 py-2 border border-silver rounded focus:outline-none focus:border-steel"
          />
        </div>
        <YearSelector onSetYears={handleSetYears} />
      </main>
    </div>
  );
}
